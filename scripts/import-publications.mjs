// Merges the hand-curated publication list with metadata from a Scopus export.
//
//   src/data/publications/curated.json        hand-maintained records (never overwritten)
//   src/data/publications/import-config.json  workbook path and manual match decisions
//   -> src/data/publications/publications.json  merged data used by the website
//   -> docs/publication-match-report.md         audit report of the matching
//
// Curated fields (title, authors, venue, year, type, indexing) always win; the
// workbook only adds metadata. Nothing is fetched from the network.
import fs from 'fs';
import path from 'path';
import readXlsxFile from 'read-excel-file/node';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src/data/publications');
const config = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'import-config.json'), 'utf8'));
const curated = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'curated.json'), 'utf8'));
// Web of Science records transcribed from the researcher CV (covers the last five years only).
const wos = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'wos.json'), 'utf8'));

const unresolvedDois = new Set((config.unresolvedDois ?? []).map((doi) => doi.toLowerCase()));

const TYPE_BY_DOCUMENT_TYPE = {
  'Article': 'journal',
  'Review': 'journal',
  'Data paper': 'journal',
  'Conference paper': 'conference',
  'Book chapter': 'book-chapter',
};

export const normalizeTitle = (title) =>
  String(title)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const normalizeDoi = (doi) =>
  String(doi)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .toLowerCase();

// Scopus exports occasionally replace typographic apostrophes with U+FFFD.
const clean = (value) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).replace(/(\p{L})�(\p{L})/gu, '$1’$2').replace(/\s+/g, ' ').trim();
  return text === '' ? undefined : text;
};

const splitList = (value) => {
  const text = clean(value);
  if (!text) return undefined;
  const seen = new Set();
  const items = [];
  for (const item of text.split(';').map((part) => part.trim()).filter(Boolean)) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      items.push(item);
    }
  }
  return items.length ? items : undefined;
};

// "Mansoor, Nafees (24780011400); ..." -> ["Nafees Mansoor", ...]
const parseAuthorNames = (value) =>
  splitList(value)?.map((entry) => {
    const [family, given] = entry.replace(/\s*\(\d+\)\s*$/, '').split(/,\s*/);
    return given ? `${given} ${family}` : family;
  });

const tokenSimilarity = (a, b) => {
  const left = new Set(a.split(' '));
  const right = new Set(b.split(' '));
  const shared = [...left].filter((token) => right.has(token)).length;
  return shared / (left.size + right.size - shared);
};

const toScopusRecord = (row) => {
  const pageStart = clean(row['Page start']);
  const pageEnd = clean(row['Page end']);
  const citedBy = Number(row['Cited by']);
  // DOIs listed in "unresolvedDois" appear in Scopus but are not registered at doi.org, so no link is published.
  const rawDoi = clean(row['DOI']);
  const doi = rawDoi && !unresolvedDois.has(normalizeDoi(rawDoi)) ? rawDoi : undefined;
  return {
    eid: clean(row['EID']),
    title: clean(row['Title']),
    year: Number(row['Year']),
    documentType: clean(row['Document Type']),
    metadata: {
      doi: doi ? normalizeDoi(doi) : undefined,
      scopusEid: clean(row['EID']),
      scopusUrl: clean(row['Link'])?.replace(/\?.*$/, ''),
      abstract: clean(row['Abstract']),
      authorNames: parseAuthorNames(row['Author full names']),
      authorKeywords: splitList(row['Author Keywords']),
      indexKeywords: splitList(row['Index Keywords']),
      sourceTitle: clean(row['Source title']),
      publisher: clean(row['Publisher']),
      volume: clean(row['Volume']),
      issue: clean(row['Issue']),
      articleNumber: clean(row['Art. No.']),
      pages: pageStart ? (pageEnd && pageEnd !== pageStart ? `${pageStart}–${pageEnd}` : pageStart) : undefined,
      conferenceName: clean(row['Conference name']),
      conferenceDate: clean(row['Conference date']),
      conferenceLocation: clean(row['Conference location']),
      issn: clean(row['ISSN']),
      isbn: splitList(row['ISBN']),
      documentType: clean(row['Document Type']),
      scopusYear: Number(row['Year']),
      openAccess: /\b(Gold|Hybrid Gold) Open Access\b/.test(String(row['Open Access'] ?? '')) || undefined,
      citedBy: Number.isFinite(citedBy) ? citedBy : undefined,
    },
    authors: clean(row['Authors'])?.replace(/;\s*/g, ', '),
  };
};

const [{ data: sheet }] = await readXlsxFile(path.join(ROOT, config.workbook));
const [header, ...rows] = sheet;
const scopus = rows
  .filter((row) => row.some((cell) => cell !== null && cell !== ''))
  .map((row) => toScopusRecord(Object.fromEntries(header.map((name, index) => [name, row[index]]))));

const byEid = new Map(scopus.map((record) => [record.eid, record]));
const byDoi = new Map(scopus.filter((r) => r.metadata.doi).map((record) => [record.metadata.doi, record]));
const byTitle = new Map();
for (const record of scopus) {
  const key = normalizeTitle(record.title);
  byTitle.set(key, [...(byTitle.get(key) ?? []), record]);
}

const claimed = new Map(); // eid -> curated id
const assigned = new Map(); // curated id -> { record, method }
const review = []; // { id, reason }
const assign = (pub, record, method) => {
  claimed.set(record.eid, pub.id);
  assigned.set(pub.id, { record, method });
};

// Pass 1: explicit decisions and DOIs recorded on the curated record.
for (const pub of curated) {
  if (pub.id in config.matches) {
    const eid = config.matches[pub.id];
    if (eid === null) continue;
    const record = byEid.get(eid);
    if (!record) throw new Error(`import-config.json: ${pub.id} points to unknown EID ${eid}`);
    if (claimed.has(eid)) throw new Error(`import-config.json: EID ${eid} is assigned twice`);
    assign(pub, record, 'manual');
  } else if (pub.doi && byDoi.has(normalizeDoi(pub.doi))) {
    assign(pub, byDoi.get(normalizeDoi(pub.doi)), 'doi');
  }
}

// Pass 2: identical normalized title and compatible publication type.
// Pass 3: identical normalized title, any type, if the row is still unclaimed.
const pending = () => curated.filter((pub) => !assigned.has(pub.id) && !(pub.id in config.matches));
for (const requireSameType of [true, false]) {
  for (const pub of pending()) {
    const candidates = (byTitle.get(normalizeTitle(pub.title)) ?? []).filter(
      (record) =>
        !claimed.has(record.eid) && (!requireSameType || TYPE_BY_DOCUMENT_TYPE[record.documentType] === pub.type),
    );
    if (candidates.length === 1) assign(pub, candidates[0], requireSameType ? 'title+type' : 'title');
    else if (candidates.length > 1 && !requireSameType)
      review.push({ id: pub.id, reason: `${candidates.length} workbook rows share this title` });
  }
}

// Anything left is reported, never guessed.
for (const pub of pending()) {
  if (review.some((entry) => entry.id === pub.id)) continue;
  const key = normalizeTitle(pub.title);
  const sameTitle = byTitle.get(key) ?? [];
  if (sameTitle.length) {
    review.push({
      id: pub.id,
      reason: `title is identical to a workbook row already matched to ${sameTitle.map((r) => claimed.get(r.eid)).join(', ')}`,
    });
    continue;
  }
  const [best] = scopus
    .filter((record) => !claimed.has(record.eid))
    .map((record) => ({ record, score: tokenSimilarity(key, normalizeTitle(record.title)) }))
    .sort((a, b) => b.score - a.score);
  if (best && best.score >= 0.6)
    review.push({
      id: pub.id,
      reason: `possible match (${best.score.toFixed(2)}): "${best.record.title}" — ${best.record.eid}`,
    });
}

const prune = (object) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

const records = curated.map((pub) => {
  const match = assigned.get(pub.id);
  if (!match) return { ...pub, origin: 'curated' };
  return prune({ ...match.record.metadata, ...pub, origin: 'curated', matchMethod: match.method });
});

const scopusOnly = scopus.filter((record) => !claimed.has(record.eid));
if (config.includeScopusOnly) {
  for (const record of scopusOnly) {
    const { volume, issue, pages, articleNumber, sourceTitle } = record.metadata;
    const venue = [
      sourceTitle,
      volume && `vol. ${volume}`,
      issue && `no. ${issue}`,
      pages ? `pp. ${pages}` : articleNumber && `art. ${articleNumber}`,
    ].filter(Boolean).join(', ');
    records.push(
      prune({
        ...record.metadata,
        id: `scopus-${record.eid.replace(/^2-s2\.0-/, '')}`,
        title: record.title,
        authors: record.authors,
        venue,
        year: record.year,
        type: TYPE_BY_DOCUMENT_TYPE[record.documentType] ?? 'conference',
        indexed: 'Scopus Indexed',
        origin: 'scopus',
      }),
    );
  }
}

// Attach Web of Science data by DOI, then by identical normalized title. A paper can have
// several Web of Science entries; a Core Collection entry (accession "WOS:…") takes precedence.
const isCore = (entry) => entry.accessionNumber?.startsWith('WOS:') ?? false;
const wosUnmatched = [];
const wosDoiAdded = [];
for (const entry of [...wos.records].sort((a, b) => Number(isCore(a)) - Number(isCore(b)))) {
  const record =
    (entry.doi && records.find((candidate) => candidate.doi === entry.doi)) ||
    records.find((candidate) => normalizeTitle(candidate.title) === normalizeTitle(entry.title));
  if (!record) {
    wosUnmatched.push(entry);
    continue;
  }
  if (entry.doi && !record.doi && !unresolvedDois.has(entry.doi)) {
    record.doi = entry.doi;
    wosDoiAdded.push(record.id);
  }
  if (entry.accessionNumber) record.wosAccession = entry.accessionNumber;
  if (entry.timesCited !== undefined) record.wosTimesCited = entry.timesCited;
  record.wosCoreCollection = isCore(entry);
}

const output = {
  source: path.basename(config.workbook),
  scopusExportLabel: config.scopusExportLabel,
  records,
};
fs.writeFileSync(path.join(DATA_DIR, 'publications.json'), JSON.stringify(output, null, 2) + '\n');

const curatedById = new Map(curated.map((pub) => [pub.id, pub]));
const unmatched = curated.filter((pub) => !assigned.has(pub.id));
const yearDiffers = [...assigned].filter(([id, { record }]) => curatedById.get(id).year !== record.year);
const methods = {};
for (const { method } of assigned.values()) methods[method] = (methods[method] ?? 0) + 1;
const line = (pub) => `| ${pub.id} | ${pub.type} | ${pub.year} | ${pub.title} |`;
const report = `# Publication match report

Generated by \`npm run pubs:import\` from \`${config.workbook}\` (Scopus export, ${config.scopusExportLabel}).
Do not edit by hand.

| | Count |
| --- | --- |
| Curated website records | ${curated.length} |
| Workbook rows | ${scopus.length} |
| Curated records matched to a workbook row | ${assigned.size} (${Object.entries(methods).map(([k, v]) => `${k}: ${v}`).join(', ')}) |
| Curated records without workbook metadata | ${unmatched.length} |
| Curated records needing review | ${review.length} |
| Workbook rows not on the curated list | ${scopusOnly.length} (${config.includeScopusOnly ? 'added to the site as Scopus-sourced records' : 'not published'}) |

## Needs review

To resolve an entry, add \`"<id>": "<EID>"\` (or \`null\` for "no Scopus record") to \`matches\` in
\`src/data/publications/import-config.json\` and re-run the import.

${review.length ? review.map((entry) => `- **${entry.id}** — ${curatedById.get(entry.id).title}\n  - ${entry.reason}`).join('\n') : '_None._'}

## Curated records without workbook metadata

| ID | Type | Year | Title |
| --- | --- | --- | --- |
${unmatched.map(line).join('\n')}

## Workbook rows not on the curated list

| EID | Scopus type | Year | Title |
| --- | --- | --- | --- |
${scopusOnly.map((r) => `| ${r.eid} | ${r.documentType} | ${r.year} | ${r.title} |`).join('\n')}

## Web of Science

From \`${wos.source}\` (prepared ${wos.preparedLabel}; lists publications from ${wos.recordsRange} only).

| | Count |
| --- | --- |
| Web of Science entries | ${wos.records.length} |
| Website records with Web of Science data | ${records.filter((r) => r.wosCoreCollection !== undefined).length} |
| …of which in the Core Collection | ${records.filter((r) => r.wosCoreCollection).length} |
| Entries not found on the website | ${wosUnmatched.length} |
| DOIs taken from Web of Science | ${wosDoiAdded.length}${wosDoiAdded.length ? ` (${wosDoiAdded.join(', ')})` : ''} |

${wosUnmatched.map((entry) => `- Not on the website: ${entry.title} (${entry.published})`).join('\n')}

Marked "ISI Indexed" on the website, published ${wos.records.reduce((min, e) => Math.min(min, e.year), 9999) + 1} or later, but without a Core Collection entry in this CV:

${records.filter((r) => r.indexed === 'ISI Indexed' && !r.wosCoreCollection && r.year > wos.records.reduce((min, e) => Math.min(min, e.year), 9999)).map((r) => `- **${r.id}** (${r.year}) ${r.title}${r.wosCoreCollection === false ? ' — listed, not in Core Collection' : ' — not listed'}`).join('\n') || '_None._'}

## DOIs withheld

Listed in Scopus but not registered at doi.org (see \`unresolvedDois\` in the import config), so no link is shown.

${[...unresolvedDois].map((doi) => `- ${doi}`).join('\n') || '_None._'}

## Matched records where the website year differs from the Scopus year

The website year is kept. Differences are usually conference year versus proceedings publication year.

| ID | Website | Scopus | Title |
| --- | --- | --- | --- |
${yearDiffers.map(([id, { record }]) => `| ${id} | ${curatedById.get(id).year} | ${record.year} | ${curatedById.get(id).title} |`).join('\n')}
`;
fs.writeFileSync(path.join(ROOT, 'docs/publication-match-report.md'), report);

console.log(
  `Publications: ${records.length} records written (${assigned.size}/${curated.length} curated matched, ` +
    `${scopusOnly.length} workbook-only, ${review.length} need review).`,
);
