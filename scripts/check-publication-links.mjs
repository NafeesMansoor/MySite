// Checks that every published DOI is registered at doi.org. Needs network access,
// so it is run on demand (npm run pubs:check-links) rather than during the build.
import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/data/publications/publications.json');
const { records } = JSON.parse(fs.readFileSync(file, 'utf8'));
const withDoi = records.filter((record) => record.doi);
const failures = [];

for (const record of withDoi) {
  try {
    const response = await fetch(`https://doi.org/api/handles/${encodeURI(record.doi)}`);
    if (!response.ok) failures.push(`${record.id}: ${record.doi} -> HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${record.id}: ${record.doi} -> ${error.message}`);
  }
}

if (failures.length) {
  console.error(`${failures.length} of ${withDoi.length} DOIs did not resolve:`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}
console.log(`All ${withDoi.length} DOIs are registered at doi.org.`);
