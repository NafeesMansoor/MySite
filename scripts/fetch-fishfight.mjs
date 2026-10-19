// Downloads Fish Fight from its own repository, builds it, and puts the built game in
// public/apps/pwa/FishFight, so it is served at https://www.nafees.info/apps/pwa/FishFight/.
// Runs as part of `npm run build`. Fish Fight's build uses relative paths (Vite base './'),
// so its service worker, manifest and assets all work from this sub-folder.
//
//   node scripts/fetch-fishfight.mjs              fail if it cannot be downloaded or built
//   node scripts/fetch-fishfight.mjs --optional   keep going with the last build (for `npm run dev`)
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const REPOSITORY = 'NafeesMansoor/fish-fight';
// A branch, tag or commit. Change this (e.g. to 'v1.0.3') to pin the site to a release.
const REF = 'main';
const TARGET = path.resolve(process.cwd(), 'public/apps/pwa/FishFight');

const optional = process.argv.includes('--optional');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'fishfight-'));

try {
  const response = await fetch(`https://codeload.github.com/${REPOSITORY}/tar.gz/${REF}`);
  if (!response.ok) throw new Error(`GitHub answered ${response.status} for ${REPOSITORY}@${REF}`);
  const archive = path.join(work, 'fishfight.tar.gz');
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  const source = path.join(work, 'source');
  fs.mkdirSync(source);
  execFileSync('tar', ['-xzf', archive, '-C', source, '--strip-components=1']);

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const run = (args) => execFileSync(npm, args, { cwd: source, stdio: 'inherit', shell: process.platform === 'win32' });
  run(['ci', '--no-audit', '--no-fund']);
  run(['run', 'build']);

  const dist = path.join(source, 'dist');
  for (const file of ['index.html', 'sw.js', 'manifest.webmanifest']) {
    if (!fs.existsSync(path.join(dist, file))) throw new Error(`the build of ${REPOSITORY}@${REF} has no ${file}`);
  }

  fs.rmSync(TARGET, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  fs.cpSync(dist, TARGET, { recursive: true });
  console.log(`Fish Fight built from github.com/${REPOSITORY} (${REF}) into public/apps/pwa/FishFight`);
} catch (error) {
  const message = `Could not fetch Fish Fight: ${error.message}`;
  if (optional && fs.existsSync(path.join(TARGET, 'index.html'))) {
    console.warn(`${message}. Using the copy built earlier.`);
  } else if (optional) {
    console.warn(`${message}. /apps/pwa/FishFight will be empty until this succeeds.`);
  } else {
    console.error(message);
    process.exitCode = 1;
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
