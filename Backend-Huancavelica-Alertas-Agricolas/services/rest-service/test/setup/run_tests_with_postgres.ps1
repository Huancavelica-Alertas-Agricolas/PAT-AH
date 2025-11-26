Param()
Set-StrictMode -Version Latest

Write-Host "Starting Postgres test container via docker-compose..."
docker-compose -f docker-compose.test.yml up -d

Write-Host "Waiting for Postgres to accept connections..."
$maxTries = 40
$i = 0
while ($i -lt $maxTries) {
    # Try to run prisma db push inside a temporary runner container. The runner runs in the compose network and can reach the DB.
    try {
        docker-compose -f docker-compose.test.yml run --rm -e RUN_INTEGRATION=1 runner sh -c 'npm ci --legacy-peer-deps >/dev/null 2>&1 || true; npx prisma generate >/dev/null 2>&1 || true; npx prisma db push >/dev/null 2>&1'
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Postgres is ready and schema applied."
            break
        }
    }
    catch {
        # ignore and retry
    }
    Start-Sleep -Seconds 3
    $i++
    Write-Host "Waiting... ($i/$maxTries)"
}

if ($i -ge $maxTries) {
    Write-Error "Postgres did not become ready in time. See docker logs."
    docker-compose -f docker-compose.test.yml logs
    docker-compose -f docker-compose.test.yml down -v
    exit 1
}

$
Write-Host "Running integration tests inside runner container..."
docker-compose -f docker-compose.test.yml run --rm -e RUN_INTEGRATION=1 runner sh -c "npm ci --legacy-peer-deps; npm test -- test/integration/user.integration.spec.js --runInBand"
$exitCode = $LASTEXITCODE

Write-Host "Shutting down test containers..."
docker-compose -f docker-compose.test.yml down -v

exit $exitCode
