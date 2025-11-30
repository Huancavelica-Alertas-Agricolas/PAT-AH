#!/usr/bin/env bash
set -euo pipefail

echo "Starting Postgres test container via docker-compose..."
docker-compose -f docker-compose.test.yml up -d

echo "Waiting for Postgres to accept connections..."
max_tries=40
i=0

until [ "$i" -ge "$max_tries" ]
do
  # Attempt to run prisma db push inside the runner container so it can reach the DB over the compose network
  if docker-compose -f docker-compose.test.yml run --rm -e RUN_INTEGRATION=1 runner sh -c 'npm ci --legacy-peer-deps >/dev/null 2>&1 || true; npx prisma generate >/dev/null 2>&1 || true; npx prisma db push >/dev/null 2>&1'; then
    echo "Postgres is ready and schema applied."
    break
  fi
  i=$((i+1))
  echo "Waiting... ($i/$max_tries)"
  sleep 3
done

if [ "$i" -ge "$max_tries" ]; then
  echo "Postgres did not become ready in time. Showing docker logs"
  docker-compose -f docker-compose.test.yml logs
  docker-compose -f docker-compose.test.yml down -v
  exit 1
fi

echo "Running integration tests inside runner container..."
docker-compose -f docker-compose.test.yml run --rm -e RUN_INTEGRATION=1 runner sh -c "npm ci --legacy-peer-deps; npm test -- test/integration/user.integration.spec.js --runInBand"
exit_code=$?

echo "Shutting down test containers..."
docker-compose -f docker-compose.test.yml down -v

exit $exit_code
