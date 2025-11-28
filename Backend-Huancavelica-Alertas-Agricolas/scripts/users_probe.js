#!/usr/bin/env node
const http = require('http');
const fs = require('fs');

function probe() {
  const data = JSON.stringify({ query: 'query { helloUsers }' });
  const opts = {
    hostname: '127.0.0.1',
    port: 3002,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(opts, (res) => {
    let s = '';
    res.on('data', (c) => (s += c));
    res.on('end', () => {
      try {
        fs.appendFileSync('/tmp/users_graphql.log', new Date().toISOString() + ' HTTP ' + res.statusCode + '\n' + s + '\n---\n');
      }
      catch (e) {
        // ignore
      }
    });
  });

  req.on('error', (e) => {
    try {
      fs.appendFileSync('/tmp/users_graphql.log', new Date().toISOString() + ' ERR ' + e.message + '\n---\n');
    }
    catch (e) {
      // ignore
    }
  });

  req.write(data);
  req.end();
}

probe();
setInterval(probe, 10 * 1000);
