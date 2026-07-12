import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const files = {
  index: read('index.html'),
  css: read('css/style.css'),
  js: read('js/main.js'),
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
  '유로그립 코리아',
  'WP서스펜션 코리아',
  '패스트하우스',
  '바이크마트',
  '바이크 팩토리',
  '윤 팩토리',
  '(주)모터뱅크',
  '바이크 #',
  '그랜드운전학원',
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
assert(files.css.includes('html.js [class~="reveal"]'), 'css: reveal animation should be gated behind .js');
assert(files.css.includes(':focus-visible'), 'css: keyboard focus-visible styles are required');
assert(files.index.includes('hero__joinflow'), 'index: hero should include participant application momentum block');
assert(files.index.includes('이미 신청이 이어지고 있어요'), 'index: hero momentum copy should frame social proof');
assert(files.index.includes('data-participant-current'), 'index: hero should expose current participant count target');
assert(files.index.includes('data-participant-updated'), 'index: hero should expose participant status timestamp');
assert(!files.index.includes('목표 1100명'), 'index: participant target copy should not be visible in hero');
assert(!files.index.includes('joinflow__milestones'), 'index: participant milestone schedule should not be shown in hero');
assert(files.index.includes('hero__mascot--roamer'), 'index: hero mascot should be configured as a roaming mascot');
assert(files.index.includes('assets/video/mascot-walk-cutout.webp'), 'index: mascot should use transparent walking animation asset');
assert(fs.existsSync(path.join(root, 'assets/video/mascot-walk.mp4')), 'video asset missing: mascot-walk.mp4');
assert(fs.existsSync(path.join(root, 'assets/video/mascot-walk-cutout.webp')), 'animation asset missing: mascot-walk-cutout.webp');
assert(files.css.includes('.hero__joinflow'), 'css: missing hero participant momentum styles');
assert(files.css.includes('@keyframes mascotWalk'), 'css: missing roaming mascot animation');
assert(!/max-width:680px\)\{[^}]*\.hero__mascot\{display:none/.test(files.css), 'css: mobile mascot should remain visible');
assert(files.css.includes('@keyframes mascotMobileRoam'), 'css: missing mobile roaming mascot animation');
assert(files.css.includes('hero__mascot.is-following'), 'css: mobile mascot should have sticky follow state');
assert(files.js.includes('toggleMascotFollow'), 'js: missing mobile mascot follow-on-scroll behavior');
assert(files.js.includes('getProjectedParticipants'), 'js: missing date-based participant projection');
assert(files.js.includes('data-participant-current'), 'js: projected participant count should update hero momentum block');
assert(files.js.includes('data-participant-updated'), 'js: participant momentum block should show timestamp');
assert(files.js.includes('setInterval(updateParticipantBoard'), 'js: participant status timestamp should update live');

for (const [name, html] of Object.entries({ poster: files.poster, catalog: files.catalog })) {
  assert(/<title>.+<\/title>/.test(html), `${name}: missing document title`);
  assert(html.includes('name="viewport"'), `${name}: missing viewport meta`);
  assert(/width:\s*min\(100vw,\s*1000px\)/.test(html), `${name}: fixed canvas should be scaled for mobile preview`);
}

console.log('quality checks passed');
