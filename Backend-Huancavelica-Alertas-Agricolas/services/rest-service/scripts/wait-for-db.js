const net = require('net');
const { spawn } = require('child_process');

function usage() {
  console.log('Usage: node wait-for-db.js <host> <port> -- <command...>');
  process.exit(1);
}

if (process.argv.length < 6) usage();

const host = process.argv[2];
const port = parseInt(process.argv[3], 10);
let cmdIndex = process.argv.indexOf('--');
if (cmdIndex === -1) usage();
const cmd = process.argv[cmdIndex + 1];
const cmdArgs = process.argv.slice(cmdIndex + 2);

const timeoutSeconds = 60;
const retryIntervalMs = 2000;
let elapsed = 0;

function check() {
  const socket = new net.Socket();
  socket.setTimeout(2000);
  socket.on('connect', () => {
    socket.destroy();
    console.log(`DB is reachable at ${host}:${port}`);
    startCommand();
  }).on('timeout', () => {
    socket.destroy();
    retry();
  }).on('error', (err) => {
    socket.destroy();
    retry();
  }).connect(port, host);
}

function retry() {
  elapsed += retryIntervalMs / 1000;
  if (elapsed >= timeoutSeconds) {
    console.error(`Timed out waiting for ${host}:${port} after ${timeoutSeconds}s`);
    process.exit(1);
  }
  process.stdout.write('.');
  setTimeout(check, retryIntervalMs);
}

function startCommand() {
  console.log(`\nStarting command: ${cmd} ${cmdArgs.join(' ')}`);
  const child = spawn(cmd, cmdArgs, { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
}

console.log(`Waiting for DB at ${host}:${port} (timeout ${timeoutSeconds}s)`);
check();
