#!/usr/bin/env node
(async () => {
  try {
    // Ensure module resolution can find the app's node_modules when
    // this script is executed from /tmp inside containers.
    const extraPaths = ['/usr/src/app/node_modules', '/app/node_modules'];
    for (const p of extraPaths) {
      if (!module.paths.includes(p)) module.paths.unshift(p);
    }

    const {PrismaClient} = require('@prisma/client');
    const p = new PrismaClient();
    await p.$connect();
    console.log('DB_CONNECT_OK');
    await p.$disconnect();
  } catch (e) {
    console.error('DB_CONNECT_ERR', e.message);
    process.exit(1);
  }
})();
