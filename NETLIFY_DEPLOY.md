Netlify deployment (updated)

This repository uses a GitHub Actions workflow to build and deploy a combined static site to Netlify. The workflow:

- Uses Node 20 to build modern frontend code.
- Builds `site-react` (if present) with `npm ci` + `npm run build`.
- Copies the static `site/` folder into a temporary `publish_tmp` directory and overlays `site-react/dist/` (if present).
- Deploys `publish_tmp` to Netlify using the Netlify CLI.

Required GitHub secrets (set these in your repository Settings → Secrets → Actions):

- `NETLIFY_AUTH_TOKEN` — create a Personal Access Token in Netlify: User settings → Applications → Personal access tokens → New access token.
- `NETLIFY_SITE_ID` — Netlify site ID (from Site settings → Site information).

CI / deploy notes

1. The GitHub Action runs automatically on push to `main`/`master`. It will build `site-react` (if present) and deploy the combined output.

2. If you prefer Netlify to run the build itself, set the site's build command in Netlify to match (for example, `cd site-react && npm ci && npm run build && cd ..`) and set the publish directory to `site` or the appropriate folder.

Local deploy (if you want to test a manual deploy from this machine)

1. Set environment variables for the session (PowerShell):

```powershell
$env:NETLIFY_AUTH_TOKEN = 'your_token_here'
$env:NETLIFY_SITE_ID = 'your_site_id_here'
```

2. Build and assemble the publish directory, then deploy:

```powershell
# build site-react (if present)
cd "C:\new language\site-react"
npm ci
npm run build

# assemble publish_tmp
cd "C:\new language"
Remove-Item -Recurse -Force publish_tmp -ErrorAction SilentlyContinue
New-Item -ItemType Directory publish_tmp
Copy-Item -Recurse -Force site\* publish_tmp\
if (Test-Path site-react\dist) { Copy-Item -Recurse -Force site-react\dist\* publish_tmp\ }

# deploy with Netlify CLI (npx will use local install if available)
npx netlify-cli deploy --dir=publish_tmp --prod --site=$env:NETLIFY_SITE_ID
```

If you cannot set env vars globally, prefix the `npx` command with the appropriate environment variables in the same shell.

Custom domain

- To add a custom domain, create a `CNAME` file under `site/` containing the domain name (one line). Example (PowerShell):

```powershell
'colorlang.example.com' | Out-File -Encoding utf8 site\CNAME
```

Security / Privacy

- I previously sanitized obvious author names in `site/docs/docs/`. Please audit the generated site for any remaining sensitive information before publishing.

What I can do for you

- Add a `CNAME` file now if you provide the hostname.
- Trigger a local test deploy once you set `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in this session.
- Open or prepare a PR for the Netlify workflow changes.
