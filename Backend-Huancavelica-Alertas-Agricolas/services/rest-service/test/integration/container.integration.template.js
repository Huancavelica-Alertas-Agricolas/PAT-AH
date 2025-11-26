/*
Template: run a container-based integration test for `rest-service`.
- Builds the image from `services/rest-service/Dockerfile` so the test uses the same image as runtime.
- Starts a Postgres docker container (or uses a test compose) and then runs the rest-service container with env pointing to the DB.
- Probes /api/users and can run in CI.

Note: copy this file to `.../rest-service/test/integration/run_container_integration.test.js` and adapt paths/ports.
*/

const { execSync, spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

jest.setTimeout(180000);

describe('rest-service container integration (template)', () => {
  test('template - build image and run with a DB', async () => {
    const repoRoot = path.resolve(__dirname, '..', '..', '..');
    const imageTag = 'rest-int-test:latest';
    // Build image
    execSync(`docker build -t ${imageTag} -f ${repoRoot.replace(/\\/g, '/')}/services/rest-service/Dockerfile ${repoRoot.replace(/\\/g, '/')}`, { stdio: 'inherit' });
    // Start a Postgres container
    const dbId = execSync(`docker run -d -e POSTGRES_USER=pat -e POSTGRES_PASSWORD=pat -e POSTGRES_DB=pat_ah postgres:15`).toString().trim();
    // Run rest-service container pointing to db
    const svcId = execSync(`docker run -d -e DATABASE_URL=postgresql://pat:pat@${dbId}:5432/pat_ah -p :3003 ${imageTag}`).toString().trim();
    // (In CI you might prefer docker-compose instead of ad-hoc containers)
    // Cleanup
    execSync(`docker rm -f ${svcId}`);
    execSync(`docker rm -f ${dbId}`);
    execSync(`docker rmi ${imageTag}`);
  });
});
