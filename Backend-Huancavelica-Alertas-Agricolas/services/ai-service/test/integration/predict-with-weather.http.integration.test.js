const http = require('http');
const { execSync, spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

jest.setTimeout(300000);

function startMockWeatherServer(port) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/weather')) {
      const body = JSON.stringify({
        main: { temp: 20, humidity: 60, pressure: 1010 },
        wind: { speed: 2 },
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

async function buildAndRunImage(absServicePath, mockPort) {
  const runId = Date.now();
  const imageTag = `ai-e2e:${runId}`;
  const repoRoot = path.resolve(absServicePath, '..', '..');
  execSync(`docker build -t ${imageTag} -f ${repoRoot.replace(/\\/g, '/')}/services/ai-service/Dockerfile ${repoRoot.replace(/\\/g, '/')}`, { stdio: 'inherit' });
  const out = spawn('docker', ['run', '-d', '--name', `ai-e2e-${runId}`, '-p', ':3003', '-e', `WEATHER_BASE_URL=http://host.docker.internal:${mockPort}`, imageTag], { stdio: ['ignore', 'pipe', 'pipe'] });
  let containerId = '';
  out.stdout.on('data', d => { containerId += d.toString(); });
  await new Promise((r, rej) => out.on('exit', code => code === 0 ? r() : rej(new Error('docker run failed'))));
  const id = containerId.trim();
  const portOut = execSync(`docker port ${id} 3003`).toString().trim();
  const hostPortMatch = portOut.match(/:(\d+)$/);
  const hostPort = hostPortMatch ? parseInt(hostPortMatch[1], 10) : 3003;
  return { id, hostPort, imageTag };
}

async function teardownContainer(containerInfo) {
  if (!containerInfo) return;
  try { console.log('=== ai-e2e logs ===\n' + execSync(`docker logs ${containerInfo.id} --tail 200`).toString()); } catch (e) {}
  try { execSync(`docker rm -f ${containerInfo.id}`); } catch (e) {}
  try { execSync(`docker rmi ${containerInfo.imageTag}`); } catch (e) {}
}

describe('ai-service E2E POST /api/ai/predict-with-weather', () => {
  let mockServer;
  let containerInfo;
  let hostName = 'localhost';
  const absServicePath = path.resolve(__dirname, '..', '..');
  const mockPort = 5055;

  beforeAll(async () => {
    mockServer = await startMockWeatherServer(mockPort);
    containerInfo = await buildAndRunImage(absServicePath, mockPort);
    // wait for health (prefer host.docker.internal when available)
    const dns = require('dns').promises;
    try { await dns.lookup('host.docker.internal'); hostName = 'host.docker.internal'; } catch (e) {}
    const start = Date.now();
    while (Date.now() - start < 120000) {
      try {
        const r = await fetch(`http://${hostName}:${containerInfo.hostPort}/api/ai/health`);
        if (r.ok) break;
      } catch (e) {}
      await new Promise(r => setTimeout(r, 500));
    }
  });

  afterAll(async () => {
    if (mockServer) await new Promise(r => mockServer.close(r));
    await teardownContainer(containerInfo);
  });

  test('POST predict-with-weather returns prediction object', async () => {
    const payload = {
      modelId: 'm1',
      inputData: { f1: 1, f2: 2 },
      includeWeather: true,
      location: { lat: -12.0, lon: -77.0 }
    };
    const res = await fetch(`http://${hostName}:${containerInfo.hostPort}/api/ai/predict-with-weather`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
    const json = await res.json();
    // basic shape checks
    expect(json).toBeDefined();
    expect(json).toHaveProperty('prediction');
  });
});
