import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const files = {
  index: read('index.html'),
  css: read('css/style.css'),
  poster: read('poster/poster.html'),
  catalog: read('catalog/catalog.html'),
};

const sponsorNames = [
  '알파인스타즈',
  '허스크바나',
  '리퀴몰리',
  '레인조아카데미',
  '혼다',
  '야마하',
  '바이크#',
  '올인원골드',
  '모터뱅크',
  '그랜드운전학원',
  '윤팩토리',
  '하스이퀍먼트',
  '데칼팩토리',
  '알파카라이프',
  '양푼리',
  '바이크마트',
];

const mainSponsorLabels = ['Alpinestars', 'Husqvarna', 'LIQUI MOLY', 'Honda', 'Yamaha', 'Royal Enfield', 'JPX', 'KTM'];

const localPartnerLabels = [
  '레인조아카데미',
  '바이크#',
  '올인원골드',
  '모터뱅크',
  '그랜드운전학원',
  '윤팩토리',
  '하스이퀍먼트',
  '데칼팩토리',
  '알파카라이프',
  '양푼리',
  '바이크마트',
];

const requiredInfo = ['2026', '9', '19', '토', '10', '16', '모터뱅크', '20,000', 'naver.me/x2YoYt5K'];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const [name, html] of Object.entries({ index: files.index, poster: files.poster, catalog: files.catalog })) {
  for (const token of requiredInfo) {
    assert(html.includes(token), `${name}: missing required event/application token "${token}"`);
  }
}

for (const [name, html] of Object.entries({ poster: files.poster, catalog: files.catalog })) {
  for (const sponsor of sponsorNames) {
    assert(html.includes(sponsor), `${name}: missing sponsor/placeholder "${sponsor}"`);
  }
}

assert((files.index.match(/<li>/g) || []).length >= 17, 'index: sponsor wall should expose at least 17 sponsor slots');
assert(files.index.includes('sponsor-logo-grid'), 'index: main sponsor logo grid is required');
assert(files.index.includes('local-partner-list'), 'index: local partner chip list is required');
for (const label of mainSponsorLabels) {
  assert(files.index.includes(label), `index: missing main sponsor "${label}"`);
}
for (const label of localPartnerLabels) {
  assert(files.index.includes(label), `index: missing local partner "${label}"`);
}
assert(files.css.includes('.sponsor-logo-grid'), 'css: missing main sponsor logo grid styles');
assert(files.css.includes('.local-partner-list'), 'css: missing local partner list styles');
for (const file of ['husqvarna.svg', 'liquimoly.svg', 'honda.svg', 'yamaha.svg', 'royalenfield.svg', 'ktm.svg']) {
  assert(fs.existsSync(path.join(root, 'assets/logo', file)), `logo asset missing: ${file}`);
}
assert(!/\.reveal\s*\{[^}]*opacity\s*:\s*0/.test(files.css), 'css: reveal content must not be hidden by default');
assert(files.css.includes('.js .reveal'), 'css: reveal animation should be gated behind .js');
assert(files.css.includes(':focus-visible'), 'css: keyboard focus-visible styles are required');

for (const [name, html] of Object.entries({ poster: files.poster, catalog: files.catalog })) {
  assert(/<title>.+<\/title>/.test(html), `${name}: missing document title`);
  assert(html.includes('name="viewport"'), `${name}: missing viewport meta`);
  assert(/width:\s*min\(100vw,\s*1000px\)/.test(html), `${name}: fixed canvas should be scaled for mobile preview`);
}

console.log('quality checks passed');
