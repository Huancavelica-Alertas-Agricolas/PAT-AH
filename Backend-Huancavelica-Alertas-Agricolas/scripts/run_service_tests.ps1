Param()
Set-StrictMode -Version Latest

Write-Host 'Running service smoke checks (PowerShell)'

$services = @(
    @{ name='rest-service'; pkg='services/rest-service/package.json'; type='http'; port=3003; path='/api/users' },
    @{ name='ai-service'; pkg='services/ai-service/package.json'; type='http'; port=3004; path='/api/ai/health' },
    @{ name='auth-service'; pkg='services/auth-service/package.json'; type='http'; port=3001; path='/' },
    @{ name='users-service'; pkg='services/users-service/package.json'; type='http'; port=3005; path='/' },
    @{ name='weather-service'; pkg='services/weather-service/package.json'; type='tcp'; port=3006; path='tcp' },
    @{ name='alert-service'; pkg='services/alert-service/package.json'; type='http'; port=3007; path='/' },
    @{ name='notification-service'; pkg='services/notification-service/package.json'; type='tcp'; port=3008; path='tcp' }
)

$results = @()

function Convert-PathForDocker([string]$p) {
    if ($p -match '^[A-Za-z]:\\') {
        $drive = $p.Substring(0,1).ToLower()
        $rest = $p.Substring(2) -replace '\\','/'
        return "/host_mnt/$drive$rest"
    }
    return $p -replace '\\','/'
}

$workdir = (Get-Location).Path
$mount = Convert-PathForDocker $workdir

# Generate a unique smoke email per run to avoid duplicate-key collisions
$runId = (Get-Date).ToString('yyyyMMddHHmmss')
$smokeEmail = "smoke_$runId@example.com"
Write-Host ("Smoke email for this run: " + $smokeEmail)

foreach ($s in $services) {
    $svcName = $s.name
    Write-Host ('--- Checking ' + $svcName + ' ---')

    # detect if this service has a package.json with a test script
    $pkgPath = Join-Path (Get-Location) $s.pkg
    $hasTest = $false
    if (Test-Path $pkgPath) {
        try {
            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
            if ($pkg.scripts -and $pkg.scripts.test) { $hasTest = $true }
        } catch { }
    }

    if ($hasTest) {
        Write-Host ('Found test script in ' + $pkgPath + ' - running tests in ephemeral container (may be slow)')
        try {
            $servicePath = '/work/services/' + $svcName
            $containerCmd = 'npm ci --legacy-peer-deps --no-audit --no-fund && npm test --silent'
            $dockerArgs = @('--rm','--workdir', $servicePath, '--mount', "type=bind,source=${mount},target=/work,consistency=delegated", 'node:18', 'sh', '-lc', $containerCmd)
            $cmd = @('docker','run') + $dockerArgs
            Write-Host ('Executing: ' + ($cmd -join ' '))
            $output = & $cmd[0] $cmd[1..($cmd.Length-1)] 2>&1
            $exit = $LASTEXITCODE
            $outText = if ($output) { ($output -join "`n") } else { '' }
            # If Jest reports "No tests found" treat as success for smoke checks
            if ($exit -ne 0 -and $outText -match 'No tests found') {
                $results += @{ service = $svcName; result = $true; detail = 'no tests found' }
            } else {
                $results += @{ service = $svcName; result = ($exit -eq 0); detail = ('npm test exit ' + $exit) }
            }
        } catch {
            $results += @{ service = $svcName; result = $false; detail = $_.Exception.Message }
        }
        continue
    }

    if ($s.type -eq 'http') {
        $url = "http://localhost:$($s.port)$($s.path)"
        Write-Host ('HTTP check: ' + $url)
        $status = $null; $errMsg = $null
        try {
            if ($s.path -eq '/api/users') {
                $body = @{ nombre='Smoke'; telefono='9999990'; password='secret'; email=$smokeEmail } | ConvertTo-Json
                $r = Invoke-WebRequest -UseBasicParsing -Uri $url -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 15
            } else {
                $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 10
            }
            if ($r) { $status = $r.StatusCode }
        } catch {
            if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
                try { $status = [int]$_.Exception.Response.StatusCode.value__ } catch { $status = $null }
            } else {
                $errMsg = $_.Exception.Message
            }
        }

        if ($status -ne $null -and $status -ge 200 -and $status -lt 300) {
            $results += @{ service = $svcName; result = $true; detail = ('HTTP ' + $status) }
        } elseif ($status -eq 409 -and $s.path -eq '/api/users') {
            # registration idempotent — user exists
            $results += @{ service = $svcName; result = $true; detail = 'HTTP 409 (already exists)' }
        } elseif ($status -eq 404) {
            Write-Host ('Received 404 — checking TCP port ' + $s.port)
            try {
                $t = Test-NetConnection -ComputerName localhost -Port $s.port
                if ($t.TcpTestSucceeded) {
                    $results += @{ service = $svcName; result = $true; detail = 'tcp open (http 404)' }
                } else {
                    $results += @{ service = $svcName; result = $false; detail = 'http 404 and port closed' }
                }
            } catch {
                $results += @{ service = $svcName; result = $false; detail = $_.Exception.Message }
            }
        } else {
            if ($status) { $detail = ('http fail or timeout (code:' + $status + ')') } else { $detail = ('http fail or timeout (' + $errMsg + ')') }
            $results += @{ service = $svcName; result = $false; detail = $detail }
        }

    } elseif ($s.type -eq 'tcp') {
        Write-Host ('TCP check: localhost:' + $s.port)
        try {
            $t = Test-NetConnection -ComputerName localhost -Port $s.port
            $results += @{ service = $svcName; result = $t.TcpTestSucceeded; detail = ($t | Out-String) }
        } catch {
            $results += @{ service = $svcName; result = $false; detail = $_.Exception.Message }
        }
    }
}

Write-Host ''; Write-Host '=== Summary ==='
foreach ($r in $results) {
    $status = if ($r.result) { 'OK' } else { 'FAIL' }
    Write-Host ($r.service + ': ' + $status + ' - ' + $r.detail)
}

if ($results | Where-Object { -not $_.result }) { exit 1 } else { exit 0 }
