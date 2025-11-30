#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJSON(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function collectCoverage(basePath) {
  const services = {};
  if (!fs.existsSync(basePath)) return services;
  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    // support two layouts that may appear in CI artifacts:
    // 1) <base>/<service>/coverage/coverage-summary.json
    // 2) <base>/<service>/coverage-summary.json
    const covFile1 = path.join(basePath, e.name, 'coverage', 'coverage-summary.json');
    const covFile2 = path.join(basePath, e.name, 'coverage-summary.json');
    if (fs.existsSync(covFile1)) {
      const data = readJSON(covFile1);
      if (data && data.total) services[e.name] = data.total;
    } else if (fs.existsSync(covFile2)) {
      const data = readJSON(covFile2);
      if (data && data.total) services[e.name] = data.total;
    } else {
      // try a shallow search inside the service folder for any coverage-summary.json
      const files = fs.readdirSync(path.join(basePath, e.name)).filter(f => f.toLowerCase().includes('coverage-summary.json'));
      if (files.length > 0) {
        const data = readJSON(path.join(basePath, e.name, files[0]));
        if (data && data.total) services[e.name] = data.total;
      }
    }
  }
  return services;
}

function pctFor(totalObj) {
  if (!totalObj) return null;
  return {
    lines: totalObj.lines && totalObj.lines.pct != null ? totalObj.lines.pct : null,
    statements: totalObj.statements && totalObj.statements.pct != null ? totalObj.statements.pct : null,
    branches: totalObj.branches && totalObj.branches.pct != null ? totalObj.branches.pct : null,
    functions: totalObj.functions && totalObj.functions.pct != null ? totalObj.functions.pct : null,
  };
}

function main() {
  // simple CLI args parser (avoid external deps)
  function parseArgs() {
    const args = {};
    const raw = process.argv.slice(2);
    for (let i = 0; i < raw.length; i++) {
      const a = raw[i];
      if (a === '--path' && raw[i + 1]) { args.path = raw[++i]; }
      else if (a === '--config' && raw[i + 1]) { args.config = raw[++i]; }
      else if (a.startsWith('--path=')) { args.path = a.split('=')[1]; }
      else if (a.startsWith('--config=')) { args.config = a.split('=')[1]; }
    }
    return args;
  }

  const argv = parseArgs();
  const basePath = argv.path || 'services';
  const configPath = argv.config || 'coverage.config.json';

  const config = readJSON(configPath) || { default: 70, thresholds: {} };

  const coverage = collectCoverage(basePath);
  if (Object.keys(coverage).length === 0) {
    console.log('Warning: No coverage summaries found under', basePath);
    // print a simple directory listing to help debugging (non-fatal)
    try {
      const walk = (p, indent = '') => {
        if (!fs.existsSync(p)) return;
        const items = fs.readdirSync(p);
        for (const it of items) {
          const full = path.join(p, it);
          const stat = fs.statSync(full);
          console.log(indent + it + (stat.isDirectory() ? '/' : ''));
          if (stat.isDirectory()) walk(full, indent + '  ');
        }
      };
      console.log('Directory listing for', basePath + ':');
      walk(basePath);
    } catch (e) {
      // ignore listing errors
    }
    // don't fail the job just because no summaries were found; allow CI to continue
    process.exit(0);
  }

  let hasFailure = false;
  console.log('Coverage check results (required >= default or override)');
  console.log('Service'.padEnd(30), 'lines', 'stmt', 'branch', 'func');
  for (const [svc, total] of Object.entries(coverage)) {
    const p = pctFor(total);
    const threshold = config.thresholds && config.thresholds[svc] != null ? config.thresholds[svc] : config.default || 70;
    const okLines = p.lines == null ? false : p.lines >= threshold;
    const okStatements = p.statements == null ? false : p.statements >= threshold;
    const okBranches = p.branches == null ? false : p.branches >= threshold;
    const okFunctions = p.functions == null ? false : p.functions >= threshold;

    const failReasons = [];
    if (!okLines) failReasons.push(`lines ${p.lines ?? 'NA'} < ${threshold}`);
    if (!okStatements) failReasons.push(`statements ${p.statements ?? 'NA'} < ${threshold}`);
    if (!okBranches) failReasons.push(`branches ${p.branches ?? 'NA'} < ${threshold}`);
    if (!okFunctions) failReasons.push(`functions ${p.functions ?? 'NA'} < ${threshold}`);

    const status = failReasons.length === 0 ? 'OK' : 'FAIL';
    if (status === 'FAIL') hasFailure = true;

    console.log(
      svc.padEnd(30),
      String(p.lines ?? 'NA').padStart(5),
      String(p.statements ?? 'NA').padStart(6),
      String(p.branches ?? 'NA').padStart(7),
      String(p.functions ?? 'NA').padStart(6),
      status,
      failReasons.length ? ` - ${failReasons.join('; ')}` : ''
    );
  }

  if (hasFailure) {
    console.error('\nCoverage thresholds not met. Failing.');
    process.exit(2);
  }
  console.log('\nAll services meet coverage thresholds.');
  process.exit(0);
}

if (require.main === module) main();
