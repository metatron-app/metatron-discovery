#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vars = require('./build.env').vars;

const env_vars = {};

vars.forEach(x => {
  if (vars.indexOf(x) !== -1) {
  env_vars[x] = process.env[x];
}
});


const buildinfo_path = path.join(__dirname, 'src', 'environments', 'build.env.ts');
const buildinfo = JSON.stringify(env_vars, null, ' ');

fs.writeFileSync(buildinfo_path, `export const BuildInfo = ${buildinfo};`);

process.exit(0);
