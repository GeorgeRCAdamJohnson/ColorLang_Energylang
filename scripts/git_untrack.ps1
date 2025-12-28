Set-Location -Path 'C:\new language'
$paths = @(
    'colorlang/demos/platformer/output',
    'uprofile_output',
    'uprofile_output/',
    'uprofile-output',
    'uprofile-output/',
    '.netlify',
    'node_modules',
    '.ipynb_checkpoints',
    '.pytest_cache',
    '.mypy_cache',
    '.cache',
    'dist',
    'build'
)
foreach($p in $paths){
    if(Test-Path $p){
        Write-Host "Removing from git (cached): $p"
        git rm -r --cached --ignore-unmatch $p
    } else {
        Write-Host "Not present: $p"
    }
}

# Stage .gitignore and commit if there are changes
git add .gitignore
if((git status --porcelain) -ne ''){
    git commit -m 'Stop tracking generated outputs and caches; update .gitignore'
    git push
} else {
    Write-Host 'No staged changes to commit'
}
