// Tells IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver and others) which pages
// to (re)crawl. Run after a deployment: npm run seo:submit
// The key file public/<key>.txt proves ownership of the site and must already be live.
import { SITE_URL, INDEXNOW_KEY, allPaths, absoluteUrl } from './seo-config.mjs';

const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const keyCheck = await fetch(keyLocation);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== INDEXNOW_KEY) {
  console.error(`IndexNow key file is not live at ${keyLocation} (HTTP ${keyCheck.status}). Deploy first.`);
  process.exit(1);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: allPaths.map(absoluteUrl),
  }),
});

// 200 and 202 both mean the submission was accepted.
if (response.status !== 200 && response.status !== 202) {
  console.error(`IndexNow rejected the submission: HTTP ${response.status} ${await response.text()}`);
  process.exit(1);
}
console.log(`IndexNow accepted ${allPaths.length} URLs (HTTP ${response.status}).`);
