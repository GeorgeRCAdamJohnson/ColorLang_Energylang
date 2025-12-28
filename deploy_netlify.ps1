Set-Location 'C:\new language'
$m = Select-String -Path .env -Pattern 'NetlifyAuthToken=(.+)'
if (-not $m) { Write-Error 'Netlify token not found in .env'; exit 1 }
$token = $m.Matches[0].Groups[1].Value
$env:NETLIFY_AUTH_TOKEN = $token
Write-Output 'Deploying site/ to Netlify site ID 0d7e570c-d680-42b0-ae2c-b4df3df20e5d'

# Use npx to run netlify-cli if not installed globally
if (Get-Command npx -ErrorAction SilentlyContinue) {
  npx --yes netlify-cli deploy --dir=site --prod --site 0d7e570c-d680-42b0-ae2c-b4df3df20e5d
} else {
  Write-Error 'npx not found; install Node.js or netlify-cli to proceed.'
  exit 1
}
