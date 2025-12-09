// Robust include loader with fallback and sweep behavior.
// Behavior:
// 1) Replace elements with `data-include` attribute by fetching the URL.
// 2) If no placeholders are present, perform a sweep: replace existing <header> and <footer> elements with the centralized fragments.
// 3) On fetch failure, try the relative path fallback (strip leading '/') before giving up. If still failing, leave original nodes in place.

// Set an initial header reserve so pages don't jump while header is fetched.
// This sets a CSS variable `--header-reserve` (default 72px) and applies it
// to the document body. After the header fragment is injected we measure the
// real header height and update the padding accordingly.
try{
  if (typeof document !== 'undefined' && document.documentElement) {
    // smaller initial reserve to avoid a large gap before header measures
    document.documentElement.style.setProperty('--header-reserve','16px');
    if (document.body) document.body.style.paddingTop = 'var(--header-reserve)';
  }
}catch(e){/* ignore */}

// Determine base path for fragments relative to this script's location.
// This makes the loader work whether the site is served as the server root
// or nested under a path (e.g., /site/). We look for the script tag
// that loaded this file and compute its directory.
// Compute a local `scriptBase` and only set a global `window.SCRIPT_BASE` if
// one does not already exist. Avoid introducing a top-level identifier named
// `SCRIPT_BASE` so other scripts can't cause redeclare SyntaxErrors.
var scriptBase = (typeof window !== 'undefined' && window.SCRIPT_BASE) ? window.SCRIPT_BASE : '/';
try{
  if (typeof document !== 'undefined'){
    const scripts = Array.from(document.getElementsByTagName('script'));
    // Try document.currentScript first
    let scriptEl = document.currentScript || scripts.reverse().find(s => s.src && s.src.indexOf('include-fragment.js') !== -1);
    if (scriptEl && scriptEl.src){
      try{
        const url = new URL(scriptEl.src, location.href);
        // keep the path up to the directory containing the script
        scriptBase = url.pathname.replace(/[^\/]*include-fragment\.js$/,'');
        if (!scriptBase.endsWith('/')) scriptBase += '/';
      }catch(e){
        // fallback to '/'
        scriptBase = '/';
      }
    }
  }
}catch(e){/* ignore */}
if (typeof window !== 'undefined' && !window.SCRIPT_BASE) window.SCRIPT_BASE = scriptBase;

function fetchWithFallback(urls) {
  // urls: array of candidate URLs in order
  return urls.reduce((prev, u) => {
    return prev.catch(() => fetch(u, { credentials: 'same-origin' }).then(r => {
      if (!r.ok) throw new Error('Failed ' + u + ' (' + r.status + ')');
      return r.text();
    }));
  }, Promise.reject());
}

function makeCandidates(url) {
  if (!url) return [];
  const candidates = [];
  // Try the URL as given
  candidates.push(url);
  // If it starts with '/', try without leading slash
  if (url.startsWith('/')) candidates.push(url.slice(1));
  // Also try relative to current directory
  const rel = url.replace(/^\/*/, '');
  if (!candidates.includes(rel)) candidates.push(rel);
  // Also try resolving relative to the script base (handles different server roots)
    try{
    const normalized = url.replace(/^\//, '');
    const basePref = (scriptBase || '/') + normalized;
    if (!candidates.includes(basePref)) candidates.push(basePref);
  }catch(e){/* ignore */}
  return candidates;
}

function injectHTMLInto(el, html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const parent = el.parentNode;
  while (wrapper.firstChild) parent.insertBefore(wrapper.firstChild, el);
  parent.removeChild(el);
}

// Execute any script tags that were injected via HTML (src or inline).
function executeInjectedScripts(container) {
  const scripts = Array.from(container.querySelectorAll('script'));
  scripts.forEach(s => {
    try {
      const newS = document.createElement('script');
      if (s.src) {
        newS.src = s.src;
        newS.async = false;
      } else {
        newS.textContent = s.textContent;
      }
      document.head.appendChild(newS);
      // remove the original to avoid duplicate nodes
      s.parentNode && s.parentNode.removeChild(s);
    } catch (e) {
      console.warn('Error executing injected script', e);
    }
  });
}

function initIncludeFragments(){
  const placeholders = Array.from(document.querySelectorAll('[data-include]'));
  const tasks = [];

  placeholders.forEach(el => {
    const url = el.getAttribute('data-include');
    const candidates = makeCandidates(url);
    tasks.push(
      fetchWithFallback(candidates).then(html => {
        injectHTMLInto(el, html);
        try { executeInjectedScripts(document); } catch(e) { /* ignore */ }
        // If a site header is present, measure and update body padding to match its height
        try{
          const hdr = document.querySelector('.site-header');
          if(hdr && document.body) {
            const h = hdr.offsetHeight;
            document.documentElement.style.setProperty('--header-reserve', h + 'px');
            document.body.style.paddingTop = h + 'px';
          }
        }catch(e){/* ignore measurement errors */}
      }).catch(err => {
        console.error('include-fragment error for', url, err);
      })
    );
  });

  // If there were no placeholders, perform a sweep replacement of existing header/footer elements
  Promise.all(tasks).finally(() => {
    if (placeholders.length === 0) {
      // Replace <header>
      const headerEl = document.querySelector('header');
      if (headerEl) {
        const candidates = makeCandidates('/_header.html');
        fetchWithFallback(candidates).then(html => {
          try {
            injectHTMLInto(headerEl, html);
            // execute any <script> tags added by the fragment
            executeInjectedScripts(document);
            // measure header and update reserved padding
            try{
              const hdr = document.querySelector('.site-header');
              if(hdr && document.body){
                const h = hdr.offsetHeight;
                document.documentElement.style.setProperty('--header-reserve', h + 'px');
                document.body.style.paddingTop = h + 'px';
              }
            }catch(e){/* ignore */}
          }
          catch (e) { console.error('Failed to inject header fragment:', e); }
        }).catch(err => {
          console.warn('Header fragment fetch failed, leaving existing header in place:', err);
        });
      }

      // Replace <footer>
      const footerEl = document.querySelector('footer');
      if (footerEl) {
        const candidates = makeCandidates('/_footer.html');
        fetchWithFallback(candidates).then(html => {
          try {
            injectHTMLInto(footerEl, html);
            executeInjectedScripts(document);
          }
          catch (e) { console.error('Failed to inject footer fragment:', e); }
        }).catch(err => {
          console.warn('Footer fragment fetch failed, leaving existing footer in place:', err);
        });
      }
    }
  });
}

// Initialize immediately if the document is already loaded, otherwise wait for DOMContentLoaded.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIncludeFragments);
  } else {
    try { initIncludeFragments(); } catch(e) { console.error('include-fragment init error', e); }
  }
}
