Set-Location -Path 'C:\new language'
$raw = Get-Content -Raw -Path '.\.env'
$token = $raw -split '\r?\n' | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^NetlifyAuthToken=' } | ForEach-Object { $_ -replace '^NetlifyAuthToken=','' }
if([string]::IsNullOrEmpty($token)){
    Write-Error 'Netlify token not found in .env'
    exit 1
}
$env:NETLIFY_AUTH_TOKEN = $token
Write-Host "Deploying site/ to Netlify (site id: 0d7e570c-d680-42b0-ae2c-b4df3df20e5d)..."
echo y | npx netlify deploy --prod --dir=site --site=0d7e570c-d680-42b0-ae2c-b4df3df20e5d --auth $env:NETLIFY_AUTH_TOKEN
