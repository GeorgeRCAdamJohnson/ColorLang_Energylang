Set-Location -Path 'C:\new language'
Write-Host 'Checking listeners on port 8000...'
try {
    $pids = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
} catch {
    $pids = @()
}
if ($pids -and $pids.Count -gt 0) {
    foreach ($killPid in $pids) {
        Write-Host "Stopping PID: $killPid"
        Stop-Process -Id $killPid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host 'No process listening on port 8000'
}

Write-Host 'Looking for python http.server processes by command line...'
try {
    $procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and ($_.CommandLine -match 'http.server' -or $_.CommandLine -match 'SimpleHTTPServer') }
} catch {
    $procs = @()
}
if ($procs -and $procs.Count -gt 0) {
    foreach ($p in $procs) {
        Write-Host "Killing process $($p.ProcessId) $($p.CommandLine)"
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host 'No python http.server processes found'
}

Write-Host 'Done.'
