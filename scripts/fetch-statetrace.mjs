// Downloads StateTrace from its own repository into public/tools/statetrace, so the site
// serves the project's code rather than a copy kept here. Runs as part of `npm run build`.
//
//   node scripts/fetch-statetrace.mjs              fail if it cannot be downloaded
//   node scripts/fetch-statetrace.mjs --optional   keep going with the last download (for `npm run dev`)
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const REPOSITORY = 'NafeesMansoor/StateTrace';
// A branch, tag or commit. Change this to pin the site to a release.
const REF = 'main';
const TARGET = path.resolve(process.cwd(), 'public/tools/statetrace');
// Only what the app needs to run; tests, scripts and documentation stay in the repository.
const FILES = ['index.html', 'styles.css', 'export-protection.js', 'fsm.js', 'simulator.js', 'simulator-ui.js', 'workspace.js', 'favicon.svg', 'LICENSE', 'fonts'];

const optional = process.argv.includes('--optional');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'statetrace-'));

try {
  const response = await fetch(`https://codeload.github.com/${REPOSITORY}/tar.gz/${REF}`);
  if (!response.ok) throw new Error(`GitHub answered ${response.status} for ${REPOSITORY}@${REF}`);
  const archive = path.join(work, 'statetrace.tar.gz');
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  const source = path.join(work, 'source');
  fs.mkdirSync(source);
  execFileSync('tar', ['-xzf', archive, '-C', source, '--strip-components=1']);

  const missing = FILES.filter((file) => !fs.existsSync(path.join(source, file)));
  if (missing.length) throw new Error(`${REPOSITORY}@${REF} has no ${missing.join(', ')}`);

  fs.rmSync(TARGET, { recursive: true, force: true });
  fs.mkdirSync(TARGET, { recursive: true });
  for (const file of FILES) fs.cpSync(path.join(source, file), path.join(TARGET, file), { recursive: true });
  console.log(`StateTrace fetched from github.com/${REPOSITORY} (${REF}) into public/tools/statetrace`);
} catch (error) {
  const message = `Could not fetch StateTrace: ${error.message}`;
  if (optional && fs.existsSync(path.join(TARGET, 'index.html'))) {
    console.warn(`${message}. Using the copy downloaded earlier.`);
  } else if (optional) {
    console.warn(`${message}. The StateTrace page will be empty until this succeeds.`);
  } else {
    console.error(message);
    process.exitCode = 1;
  }
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
