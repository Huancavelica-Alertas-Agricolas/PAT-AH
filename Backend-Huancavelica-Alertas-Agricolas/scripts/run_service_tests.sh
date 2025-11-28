#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"

services=(
  "rest-service:3003:/api/users"
  "ai-service:3004:/api/ai/health"
  "auth-service:3001:/"
  "users-service:3005:/"
  "weather-service:3006:tcp"
  "alert-service:3007:/"
  "notification-service:3008:tcp"
)

echo "Running service tests/checks using docker compose"
results=()

# Determine host to use for service checks. When running inside WSL, use host.docker.internal
# so we can reach services bound to Windows/Docker Desktop. Otherwise use localhost.
HOST=localhost
if grep -qi microsoft /proc/version 2>/dev/null || [ -n "$WSL_DISTRO_NAME" ]; then
  HOST=host.docker.internal
fi
for s in "${services[@]}"; do
  IFS=':' read -r name port path <<< "$s"
  echo "\n--- Checking $name ---"
  pkg="services/$name/package.json"
  has_test=false
  if [ -f "$pkg" ]; then
    if jq -e '.scripts.test' "$pkg" >/dev/null 2>&1; then
      has_test=true
    fi
  fi

    if [ "$has_test" = true ]; then
    echo "Found test script in $pkg - running fresh node container to run tests"
    if docker run --rm -v "$(pwd)":/work -w /work/services/$name node:18 sh -c "npm ci --legacy-peer-deps --no-audit --no-fund && npm test --silent"; then
      results+=("$name:OK:npm test passed")
    else
      results+=("$name:FAIL:npm test failed")
    fi
  else
    if [ "$path" = "tcp" ]; then
      echo "TCP check localhost:$port"
      if nc -z localhost $port; then
        results+=("$name:OK:tcp ok")
      else
        results+=("$name:FAIL:tcp fail")
      fi
    else
      url="http://$HOST:$port$path"
      echo "HTTP check $url"
      if [ "$path" = "/api/users" ]; then
        # POST a small payload to /api/users (registration) for smoke
        http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{"nombre":"Smoke","telefono":"9999990","password":"secret","email":"smoke@example.com"}' "$url" || true)
      else
        http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" || true)
      fi
      if echo "$http_code" | grep -E "^[23]..$" >/dev/null; then
        results+=("$name:OK:http ok")
      elif [ "$http_code" = "409" ] && [ "$path" = "/api/users" ]; then
        # user already exists — treat as OK for smoke tests
        results+=("$name:OK:http 409 (already exists)")
      elif [ "$http_code" = "404" ]; then
        # Treat 404 as OK if the port is open (service reachable but no root handler)
        if nc -z $HOST $port; then
          results+=("$name:OK:tcp open (http 404)")
        else
          results+=("$name:FAIL:http 404 and port closed")
        fi
      else
        results+=("$name:FAIL:http fail or timeout (code:$http_code)")
      fi
    fi
  fi
done

echo "\n=== Summary ==="
exit_code=0
for r in "${results[@]}"; do
  echo "$r"
  if echo "$r" | grep -q "FAIL"; then exit_code=1; fi
done
exit $exit_code
