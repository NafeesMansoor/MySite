// Validates src/data/publications/publications.json. Exits non-zero on any error
// so that a broken data file cannot reach a production build.
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data/publications');
const { records } = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'publications.json'), 'utf8'));
const curated = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'curated.json'), 'utf8'));

const TYPES = ['journal', 'conference', 'book-chapter', 'patent', 'edited-book'];
const REQUIRED = ['id', 'title', 'authors', 'venue', 'year', 'type'];
const URL_FIELDS = ['link', 'scopusUrl'];
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/;
const errors = [];
const seen = { id: new Map(), doi: new Map(), scopusEid: new Map() };

for (const record of records) {
  const label = record.id ?? JSON.stringify(record).slice(0, 60);
  const fail = (message) => errors.push(`${label}: ${message}`);

  for (const field of REQUIRED) {
    if (record[field] === undefined || record[field] === '') fail(`missing required field "${field}"`);
  }
  if (!TYPES.includes(record.type)) fail(`unknown type "${record.type}"`);
  if (!Number.isInteger(record.year) || record.year < 1990 || record.year > new Date().getFullYear() + 1)
    fail(`implausible year "${record.year}"`);
  if (record.doi !== undefined && !DOI_PATTERN.test(record.doi)) fail(`malformed DOI "${record.doi}"`);
  if (record.doi !== undefined && record.doi !== record.doi.toLowerCase()) fail('DOI must be stored in lower case');
  for (const field of URL_FIELDS) {
    if (record[field] !== undefined && !/^https:\/\/\S+$/.test(record[field])) fail(`"${field}" is not an https URL`);
  }
  for (const field of Object.keys(seen)) {
    if (record[field] === undefined) continue;
    if (seen[field].has(record[field])) fail(`duplicate ${field} "${record[field]}" (also on ${seen[field].get(record[field])})`);
    seen[field].set(record[field], label);
  }
  for (const [field, value] of Object.entries(record)) {
    if (JSON.stringify(value).includes('�')) fail(`"${field}" contains a replacement character (encoding damage)`);
  }
}

// The generated file must reflect curated.json exactly: nothing dropped, nothing overwritten.
const byId = new Map(records.map((record) => [record.id, record]));
for (const pub of curated) {
  const record = byId.get(pub.id);
  if (!record) {
    errors.push(`${pub.id}: curated record is missing from publications.json — run "npm run pubs:import"`);
    continue;
  }
  for (const [field, value] of Object.entries(pub)) {
    if (JSON.stringify(record[field]) !== JSON.stringify(value))
      errors.push(`${pub.id}: "${field}" differs from curated.json — run "npm run pubs:import"`);
  }
}

if (errors.length) {
  console.error(`Publication data is invalid (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
  errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}
console.log(`Publication data is valid: ${records.length} records, ${seen.doi.size} DOIs.`);
