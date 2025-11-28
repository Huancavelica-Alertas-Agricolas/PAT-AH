$services = @('auth-service','users-service','rest-service','ai-service','notification-service','alert-service','weather-service')
foreach($s in $services){
    $id = (docker compose ps -q $s).Trim()
    if(-not $id){ Write-Output "$s not running"; continue }
    Write-Output "=== $s ($id) ==="
    docker exec $id sh -c "cp /tmp/prisma_check.js /usr/src/app/prisma_check.js 2>/dev/null || true"
    docker exec $id sh -c "cp /tmp/schema.prisma /usr/src/app/schema.prisma 2>/dev/null || true"
    docker exec $id sh -c "cd /usr/src/app || cd /app || true; npm install @prisma/client@5.22.0 --no-audit --no-fund --silent || true"
    docker exec $id sh -c "cd /usr/src/app || cd /app || true; npx prisma generate --schema=./schema.prisma > /tmp/prisma_generate.out 2>/tmp/prisma_generate.err || true"
    docker exec $id sh -c "cd /usr/src/app || cd /app || true; node prisma_check.js > /tmp/prisma_check.out 2>/tmp/prisma_check.err || true"
    Start-Sleep -Seconds 2
}
