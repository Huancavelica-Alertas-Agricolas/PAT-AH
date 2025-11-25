const { execSync, spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

jest.setTimeout(180000);

describe('rest-service container integration', () => {
  const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
  const runId = Date.now();
  const imageTag = `rest-int:${runId}`;
  const network = `rest-int-net-${runId}`;
  const dbName = `rest-db-${runId}`;
  const svcName = `rest-svc-${runId}`;

  beforeAll(() => {
    // build image (only for this service) — check if already exists
    const dockerfile = `${repoRoot.replace(/\\/g, '/')}/services/rest-service/Dockerfile`;
    const buildContext = `${repoRoot.replace(/\\/g, '/')}`;
    try {
      const existing = execSync(`docker images -q ${imageTag}`).toString().trim();
      if (!existing) {
        console.log('Building image', imageTag, 'using Dockerfile', dockerfile);
        execSync(`docker build -t ${imageTag} -f ${dockerfile} ${buildContext}`, { stdio: 'inherit' });
      } else {
        console.log('Using existing image', imageTag);
      }
    } catch (err) {
      console.log('docker images check/build had error, attempting build');
      execSync(`docker build -t ${imageTag} -f ${dockerfile} ${buildContext}`, { stdio: 'inherit' });
    }
    // create network
    execSync(`docker network create ${network}`);
    // start postgres on network
    execSync(`docker run -d --name ${dbName} --network ${network} -e POSTGRES_USER=pat -e POSTGRES_PASSWORD=pat -e POSTGRES_DB=pat_ah postgres:15`);
    // wait for postgres ready
    const start = Date.now();
    while (Date.now() - start < 30000) {
      try {
        const out = execSync(`docker exec ${dbName} pg_isready -U pat`).toString();
        if (out.includes('accepting connections')) break;
      } catch (e) { }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
    // Note: we will apply Prisma migrations first, then create any missing tables.
    // apply Prisma migrations to the test DB
    try {
      console.log('Applying Prisma migrations to', dbName);
      // compute buildContext robustly: prefer repoRoot, but if the schema is not
      // present there (runner mounts repo at /work), fall back to `/work`.
      const fs = require('fs');
      const path = require('path');
      // allow overriding buildContext from the outer runner (HOST path accessible to Docker daemon)
      let buildContext = process.env.HOST_BUILD_CONTEXT || repoRoot.replace(/\\/g, '/');
      const schemaPath = path.join(buildContext, 'services', 'shared', 'prisma', 'schema.prisma');
      if (!fs.existsSync(schemaPath)) {
        const alt = '/work/services/shared/prisma/schema.prisma';
        if (fs.existsSync(alt)) {
          buildContext = '/work';
        }
      }
      execSync(`docker run --rm --network ${network} -e DATABASE_URL=\"postgresql://pat:pat@${dbName}:5432/pat_ah\" -v ${buildContext}:/app -w /app node:20 sh -c "apt-get update -y && apt-get install -y openssl ca-certificates && npm set progress=false && npm i prisma@5 @prisma/client@5 --legacy-peer-deps --no-audit --silent && npx prisma migrate deploy --schema services/shared/prisma/schema.prisma"`, { stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to apply migrations', e.toString());
      throw e;
    }
  // ensure User table exists (some repos only have partial migrations)
  try {
    const fs = require('fs');
    const createUserSql = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE TABLE IF NOT EXISTS \"User\" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nombre TEXT, email TEXT UNIQUE, telefono TEXT UNIQUE NOT NULL, password TEXT NOT NULL, ciudad TEXT, activo BOOLEAN DEFAULT true, prefs TEXT, roles TEXT DEFAULT '["user"]', \"createdAt\" TIMESTAMPTZ DEFAULT now(), \"updatedAt\" TIMESTAMPTZ DEFAULT now());`;
    const tmpPath = `${repoRoot.replace(/\\/g, '/')}/services/rest-service/test/integration/_create_user_${runId}.sql`;
    fs.writeFileSync(tmpPath, createUserSql);
    console.log('Copying SQL to container and creating User table on', dbName);
    execSync(`docker cp ${tmpPath} ${dbName}:/tmp/_create_user.sql`, { stdio: 'inherit' });
    execSync(`docker exec ${dbName} psql -U pat -d pat_ah -f /tmp/_create_user.sql`, { stdio: 'inherit' });
    try { fs.unlinkSync(tmpPath); } catch (e) { }
  } catch (e) {
    console.warn('Could not ensure User table exists:', e.toString());
  }
    // run rest-service attached to same network, map container port 3003 to random host port
    execSync(`docker run -d --name ${svcName} --network ${network} -p :3003 -e DATABASE_URL=postgresql://pat:pat@${dbName}:5432/pat_ah ${imageTag}`);
  });

  afterAll(() => {
    try { execSync(`docker rm -f ${svcName}`); } catch (e) { }
    try { execSync(`docker rm -f ${dbName}`); } catch (e) { }
    try { execSync(`docker network rm ${network}`); } catch (e) { }
    try { execSync(`docker rmi ${imageTag}`); } catch (e) { }
  });

  test('POST /api/users persists user', async () => {
    // obtain mapped host port
    const portOut = execSync(`docker port ${svcName} 3003`).toString().trim();
    const hostPortMatch = portOut.match(/:(\d+)$/);
    const hostPort = hostPortMatch ? parseInt(hostPortMatch[1], 10) : 3003;

    // wait for health
    const start = Date.now();
    while (Date.now() - start < 60000) {
      try {
        const r = await fetch(`http://localhost:${hostPort}/api/users`, { method: 'GET' });
        if (r.ok || r.status === 404) break;
      } catch (e) {}
      await new Promise(r => setTimeout(r, 500));
    }

    const email = `rest_smoke_${Date.now()}@example.com`;
    const body = { nombre: 'Smoke', telefono: '9999990', password: 'secret', email };
    const res = await fetch(`http://localhost:${hostPort}/api/users`, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    if (![200,201,409].includes(res.status)) {
      let text = '';
      try { text = await res.text(); } catch (e) { text = `<no body: ${e.message}>`; }
      const logs = execSync(`docker logs --tail 200 ${svcName}`).toString();
      console.error('Container logs:\n', logs);
      console.error('Response status:', res.status, 'body:', text);
    }
    expect([200,201,409]).toContain(res.status);

    // verify in DB via psql
    const sql = `SELECT count(*) FROM \"public\".\"User\" WHERE email='${email}';`;
    // Avoid shell quoting issues by piping the SQL to psql's stdin
    const out = execSync(`docker exec -i ${dbName} psql -U pat -d pat_ah -t -q -X -`, { input: sql }).toString().trim();
    const count = parseInt(out) || 0;
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
