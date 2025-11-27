const http = require('http');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');
const { execSync } = require('child_process');
const net = require('net');

jest.setTimeout(300000);

function startMockWeatherServer(port) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/weather')) {
      const body = JSON.stringify({
        main: { temp: 25, humidity: 50, pressure: 1013 },
        wind: { speed: 3.5 },
        name: 'MockCity'
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
      return;
    }
    if (req.url.startsWith('/forecast')) {
      const body = JSON.stringify({ list: [], city: { name: 'MockCity' } });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
      return;
    }
    res.writeHead(404);
    res.end('not found');
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

function waitForUrl(url, timeout = 120000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (async function poll() {
      try {
        const r = await fetch(url, { timeout: 2000 });
        if (r.ok) return resolve();
      } catch (e) {}
      if (Date.now() - start > timeout) return reject(new Error('timeout waiting for ' + url));
      setTimeout(poll, 500);
    })();
  });
}

async function resolveHost() {
  // prefer host.docker.internal when available (useful when tests run inside container with docker.sock)
  const dns = require('dns').promises;
  try {
    await dns.lookup('host.docker.internal');
    return 'host.docker.internal';
  } catch (e) {
    return 'localhost';
  }
}

async function runContainer(absServicePath, hostPort, mockPort) {
  // Use the same runtime image as other services: node:18-slim
  // Build an image from the repository Dockerfile so it matches production image
  const { execSync } = require('child_process');
  const runId = Date.now();
  const imageTag = `ai-int-test-image:${runId}`;
  const repoRoot = path.resolve(absServicePath, '..', '..');
  // Build image using the ai-service folder as the docker build context so relative paths like ./trained-models resolve correctly
  const serviceDir = path.resolve(repoRoot, 'services', 'ai-service').replace(/\\/g, '/');
  const dockerfilePath = `${serviceDir}/Dockerfile`;
  execSync(`docker build -t ${imageTag} -f ${dockerfilePath} ${serviceDir}`, { stdio: 'inherit' });
  // Run container detached with random host port mapping and environment pointing to mock
  const runArgs = [
    'run', '-d', '--name', `ai-int-test-${runId}`,
    '-p', ':3003',
    '-e', `OPENWEATHER_API_KEY=mockkey`,
    '-e', `WEATHER_BASE_URL=http://host.docker.internal:${mockPort}`,
    imageTag
  ];
  const out = spawn('docker', runArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
  let containerId = '';
  out.stdout.on('data', d => { containerId += d.toString(); console.log('[ai-container]', d.toString()); });
  out.stderr.on('data', d => console.error('[ai-container-err]', d.toString()));
  return new Promise((resolve, reject) => {
    out.on('exit', (code) => {
      if (code === 0) return resolve({ containerId: containerId.trim(), imageTag, runId });
      return reject(new Error('docker run failed'));
    });
  });
}

describe('ai-service HTTP integration with mock weather', () => {
  let mockServer;
  let containerProc;
  const absServicePath = path.resolve(__dirname, '..', '..'); // services/ai-service
  let hostPort;
  const mockPort = 5005;

  beforeAll(async () => {
    mockServer = await startMockWeatherServer(mockPort);
    // Find a free host port to avoid collisions
    const findFreePort = (start) => new Promise((resolve) => {
      let p = start || 3004;
      const check = () => {
        const srv = net.createServer();
        srv.once('error', () => { p++; setImmediate(check); });
        srv.once('listening', () => { srv.close(() => resolve(p)); });
        srv.listen(p, '127.0.0.1');
      };
      check();
    });
    const runRes = await runContainer(absServicePath, null, mockPort);
    const containerId = runRes.containerId;
    // Query docker for assigned host port
    const portOut = execSync(`docker port ${containerId} 3003`).toString().trim();
    const hostPortMatch = portOut.match(/:(\d+)$/);
    hostPort = hostPortMatch ? parseInt(hostPortMatch[1], 10) : 3004;
    const hostName = await resolveHost();
    containerProc = { containerId, imageTag: runRes.imageTag, runId: runRes.runId };
    await waitForUrl(`http://${hostName}:${hostPort}/api/ai/health`, 120000);
  });

  afterAll(async () => {
    if (containerProc && containerProc.containerId) {
      // collect logs for debugging
      try {
        const logs = execSync(`docker logs ${containerProc.containerId} --tail 200`).toString();
        console.log('=== ai-int-test logs ===\n' + logs);
      } catch (e) { /* ignore */ }
      const stop = spawn('docker', ['rm', '-f', containerProc.containerId]);
      await new Promise(r => stop.on('exit', r));
      // remove built image
      try { execSync(`docker rmi ${containerProc.imageTag}`); } catch (e) { }
    }
    if (mockServer) await new Promise(r => mockServer.close(r));
  });

  test('GET /ai/weather/current uses mock server data', async () => {
    const hostName = await resolveHost();
    const res = await fetch(`http://${hostName}:${hostPort}/api/ai/weather/current?lat=-12&lon=-77`, { timeout: 5000 });
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json).toHaveProperty('temperature', 25);
    expect(json).toHaveProperty('location', 'MockCity');
  });
});
