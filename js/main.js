/* ====== 제5회 두발인의 날 · 인터랙션 ====== */
(function () {
  'use strict';

  // JS 활성화 표시: JS가 있을 때만 등장 애니메이션 적용(없으면 콘텐츠 항상 표시)
  document.documentElement.classList.add('js');

  /* ---- 1. NAV: 스크롤 시 배경 전환 ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-solid');
    else nav.classList.remove('is-solid');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 1-1. 모바일 마스코트: 스크롤 후 작게 따라오기 ---- */
  const heroMascot = document.querySelector('.hero__mascot');
  const toggleMascotFollow = () => {
    if (!heroMascot) return;
    const isMobile = window.matchMedia('(max-width: 680px)').matches;
    heroMascot.classList.toggle('is-following', isMobile && window.scrollY > window.innerHeight * 0.72);
  };
  window.addEventListener('scroll', toggleMascotFollow, { passive: true });
  window.addEventListener('resize', toggleMascotFollow);
  toggleMascotFollow();

  /* 마스코트 걷기 프레임은 CSS crossfade(.mfr)로 처리 */

  /* ---- 2. 숫자 카운터 ---- */
  function animateCount(el) {
    const to = parseInt(el.dataset.to, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(to * eased).toLocaleString('ko-KR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---- 3. 등장 애니메이션 + 트리거 ---- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-inview');

        // 카운터 실행 (자신 또는 자식)
        const counters = el.matches('.count')
          ? [el]
          : el.querySelectorAll('.count:not(.done)');
        counters.forEach((c) => {
          if (c.classList.contains('done')) return;
          c.classList.add('done');
          animateCount(c);
        });

        io.unobserve(el);
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  // 같은 그룹 내 카드가 순차로 등장(스태거) — 더 역동적인 스크롤 연출
  document.querySelectorAll('.reveal').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return c.classList.contains('reveal');
    });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 0.09, 0.45) + 's';
  });

  // 히어로 스탯·성장그래프 카운터는 별도 관찰(부모 컨테이너)
  document.querySelectorAll('.hero__stats, .growth').forEach((el) => io.observe(el));

  /* ---- 4. 성장 그래프: 화면에 들어오면 막대 채움 ---- */
  const growth = document.querySelector('.growth');
  if (growth) {
    const gio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-inview');
            gio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    gio.observe(growth);
  }

  /* ---- 5. 앵커 스무스 스크롤(네비 높이 보정) ---- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---- 6. 히어로 영상 로드 실패 시 포스터 유지(안전) ---- */
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    heroVideo.addEventListener('error', () => {
      heroVideo.style.display = 'none';
    });
  }

  /* ---- 7. D-day 카운트다운 ---- */
  const ddayEl = document.getElementById('ddayN');
  if (ddayEl) {
    const target = new Date('2026-09-19T00:00:00+09:00').getTime();
    const days = Math.ceil((target - Date.now()) / 86400000);
    ddayEl.textContent = days > 0 ? days : (days === 0 ? 'DAY' : '종료');
  }

  /* ---- 8. 참가 신청 숫자판: KST 날짜 기준 자동 누적 ---- */
  function getKstNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  }

  function kstDayMs(dateText) {
    return new Date(dateText + 'T00:00:00+09:00').getTime();
  }

  function getProjectedParticipants(now) {
    const current = now || getKstNow();
    const today = kstDayMs(
      current.getFullYear() + '-' +
      String(current.getMonth() + 1).padStart(2, '0') + '-' +
      String(current.getDate()).padStart(2, '0')
    );
    const points = [
      ['2026-08-06', 0],
      ['2026-08-11', 151],
      ['2026-08-20', 300],
      ['2026-08-31', 520],
      ['2026-09-10', 740],
      ['2026-09-15', 880],
      ['2026-09-18', 1000],
    ].map(([date, count]) => ({ t: kstDayMs(date), count }));

    if (today <= points[0].t) return points[0].count;
    for (let i = 1; i < points.length; i += 1) {
      if (today <= points[i].t) {
        const prev = points[i - 1];
        const next = points[i];
        const ratio = (today - prev.t) / (next.t - prev.t);
        return Math.round(prev.count + (next.count - prev.count) * ratio);
      }
    }
    return points[points.length - 1].count;
  }

  function updateParticipantBoard() {
    const participantEls = document.querySelectorAll('[data-participant-current]');
    if (!participantEls.length) return;
    const now = getKstNow();
    const projectedNum = getProjectedParticipants(now);
    const projected = projectedNum.toLocaleString('ko-KR');
    participantEls.forEach((el) => {
      el.textContent = projected;
    });

    // 1,000명 목표 진행바 채움
    const goal = 1000;
    const pct = Math.min(100, Math.round((projectedNum / goal) * 100));
    document.querySelectorAll('[data-participant-fill]').forEach((el) => {
      el.style.width = pct + '%';
    });

    const updated = document.querySelector('[data-participant-updated]');
    if (updated) {
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      updated.textContent = month + '월 ' + day + '일 ' + hour + ':' + minute + ' 현재 누적 신청 현황';
    }
  }
  updateParticipantBoard();
  setInterval(updateParticipantBoard, 30000);

  /* ---- 9. 프로모 팝업 ---- */
  const promo = document.getElementById('promo');
  if (promo) {
    // 사용자 로컬 기준 오늘 날짜(YYYY-MM-DD)
    const localToday = () => {
      const d = new Date();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    };

    const closePromo = () => {
      if (promo.hidden) return;
      promo.hidden = true;
      document.body.style.overflow = '';
      sessionStorage.setItem('dubal_promo_seen', '1');
      const hide = document.getElementById('promoHide');
      if (hide && hide.checked) {
        localStorage.setItem('dubal_promo_hide', localToday());
      }
    };

    const openPromo = () => {
      promo.hidden = false;
      document.body.style.overflow = 'hidden';
      const x = promo.querySelector('.promo__x');
      if (x) x.focus();
    };

    // 노출 판단: '오늘 하루 보지 않기'(localStorage) + 같은 세션 재등장 방지(sessionStorage)
    const hiddenToday = localStorage.getItem('dubal_promo_hide') === localToday();
    const seenSession = sessionStorage.getItem('dubal_promo_seen') === '1';
    if (!hiddenToday && !seenSession) {
      setTimeout(openPromo, 600);
    }

    promo.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', closePromo);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePromo();
    });
  }

  /* ---- 10. 장소 길찾기 바로가기 ---- */
  const navFind = document.getElementById('navFind');
  const navPop = document.getElementById('navPop');
  if (navFind && navPop) {
    const q = encodeURIComponent('(주)모터뱅크 부안');
    const urls = {
      kakao: 'https://map.kakao.com/link/search/' + q,
      naver: 'https://map.naver.com/p/search/' + q,
      tmap: 'tmap://search?name=' + q,
      kakaonavi: 'https://map.kakao.com/link/search/' + q, // 좌표 미확보 → 카카오맵 검색 폴백
    };

    const setOpen = (open) => {
      navPop.hidden = !open;
      navFind.setAttribute('aria-expanded', String(open));
    };

    navFind.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(navPop.hidden);
    });

    navPop.querySelectorAll('.navpop__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = urls[btn.dataset.map];
        if (btn.dataset.map === 'tmap') {
          // 티맵 앱 스킴 시도 → 미설치 시 카카오맵 검색으로 폴백
          const fallback = urls.kakao;
          const timer = setTimeout(() => window.open(fallback, '_blank', 'noopener'), 1200);
          window.addEventListener('blur', () => clearTimeout(timer), { once: true });
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener');
        }
        setOpen(false);
      });
    });

    document.addEventListener('click', (e) => {
      if (!navPop.hidden && !navPop.contains(e.target) && e.target !== navFind) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }
})();

/* ===== 프로모 팝업 룰렛 + 사운드 (Web Audio, 오디오 파일 없음) ===== */
(function(){
  'use strict';
  const roulette = document.querySelector('[data-roulette]');
  if (!roulette) return;
  const wheel = roulette.querySelector('[data-roulette-wheel]');
  const startBtn = roulette.querySelector('[data-roulette-start]');
  const resultImg = roulette.querySelector('[data-roulette-image]');
  const resultEmoji = roulette.querySelector('[data-roulette-emoji]');
  const resultRank = roulette.querySelector('[data-roulette-rank]');
  const resultName = roulette.querySelector('[data-roulette-name]');
  const resultMessage = roulette.querySelector('[data-roulette-message]');
  const soundToggle = document.querySelector('[data-sound-toggle]');
  const prizes = [
    { rank:'1등', name:'혼다 슈퍼커브 26년식', img:'assets/img/roulette_supercub.png', message:'이런 행운을 현장에서 노려보세요. 참가 신청하면 실제 추첨권을 받을 수 있어요.', weight:1 },
    { rank:'2등', name:'알파인스타즈 라이딩 자켓', img:'assets/img/roulette_jacket.png', message:'라이더라면 탐나는 경품입니다. 신청하고 행사장 럭키드로우에 참여하세요.', weight:3 },
    { rank:'3등', name:'스콜피온 엑소 헬멧', img:'assets/img/roulette_helmet.png', message:'안전 장비 경품까지 준비됩니다. 지금 신청하고 추첨 기회를 챙기세요.', weight:5 },
    { rank:'4등', name:'두발인의 날 기념품', emoji:'🎁', message:'행사장에서 추억도 받고 경품 기회도 챙길 수 있어요.', weight:12 }
  ];
  let spinning = false;
  let currentRotation = 0;
  let audioCtx = null;
  let masterGain = null;
  let masterCompressor = null;
  let muted = false;

  function ensureAudio(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.72, audioCtx.currentTime);
      masterCompressor = audioCtx.createDynamicsCompressor();
      masterCompressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
      masterCompressor.knee.setValueAtTime(24, audioCtx.currentTime);
      masterCompressor.ratio.setValueAtTime(6, audioCtx.currentTime);
      masterCompressor.attack.setValueAtTime(0.006, audioCtx.currentTime);
      masterCompressor.release.setValueAtTime(0.18, audioCtx.currentTime);
      masterGain.connect(masterCompressor).connect(audioCtx.destination);
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }
  function destination(){
    const ctx = ensureAudio();
    return masterGain || ctx.destination;
  }
  function setMuted(nextMuted){
    muted = nextMuted;
    if(soundToggle){
      soundToggle.textContent = muted ? '🔇' : '🔊';
      soundToggle.setAttribute('aria-pressed', String(muted));
      soundToggle.setAttribute('aria-label', muted ? '효과음 켜기' : '효과음 끄기');
    }
    if(masterGain && audioCtx){
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setTargetAtTime(muted ? 0.0001 : 0.72, audioCtx.currentTime, 0.03);
    }
  }
  function playVoice(freq,start,duration,options){
    if(muted) return;
    const ctx = ensureAudio();
    const opts = options || {};
    const out = opts.destination || destination();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const begin = ctx.currentTime + start;
    const end = begin + duration;
    const peak = opts.gain || 0.055;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(opts.cutoff || 3600, begin);
    filter.Q.setValueAtTime(opts.q || 0.7, begin);
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.exponentialRampToValueAtTime(peak, begin + (opts.attack || 0.018));
    gain.gain.setTargetAtTime(0.0001, Math.max(begin + 0.03, end - (opts.release || 0.12)), opts.release || 0.12);
    filter.connect(gain).connect(out);
    (opts.detunes || [-5,0,6]).forEach((detune, index) => {
      const osc = ctx.createOscillator();
      osc.type = opts.type || 'sawtooth';
      osc.frequency.setValueAtTime(freq, begin);
      osc.detune.setValueAtTime(detune, begin);
      osc.connect(filter);
      osc.start(begin);
      osc.stop(end + 0.08);
      if(index === 1 && opts.glideTo){
        osc.frequency.exponentialRampToValueAtTime(opts.glideTo, end);
      }
    });
    if(opts.octave !== false){
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = opts.subType || 'triangle';
      sub.frequency.setValueAtTime(freq / 2, begin);
      subGain.gain.setValueAtTime((peak * (opts.subGain || 0.34)), begin);
      sub.connect(subGain).connect(filter);
      sub.start(begin);
      sub.stop(end + 0.08);
    }
  }
  function playMelody(notes,options){
    notes.forEach(note => playVoice(note[0],note[1],note[2],options));
  }
  function playPad(freqs,start,duration,gainValue){
    if(muted) return;
    freqs.forEach((freq,index) => {
      playVoice(freq,start + index * 0.018,duration,{
        type:'sawtooth',
        gain:gainValue || 0.026,
        cutoff:1450,
        q:0.55,
        attack:0.08,
        release:0.35,
        detunes:[-7,0,5],
        subGain:0.18
      });
    });
  }
  function playBass(freq,start,duration){
    playVoice(freq,start,duration,{
      type:'triangle',
      gain:0.05,
      cutoff:760,
      detunes:[0],
      octave:false,
      attack:0.012,
      release:0.12
    });
  }
  function playSparkle(start,count){
    if(muted) return;
    for(let i=0;i<count;i+=1){
      const freq = 1180 + (i * 977 % 1320);
      playVoice(freq,start + i * 0.035,0.18,{
        type:'sine',
        gain:0.018,
        cutoff:6400,
        detunes:[-4,4],
        octave:false,
        attack:0.006,
        release:0.09
      });
    }
  }
  function playEchoedVoice(freq,start,duration,options){
    playVoice(freq,start,duration,options);
    playVoice(freq,start + 0.13,duration * 0.72,Object.assign({},options,{gain:(options.gain || 0.045) * 0.38}));
    playVoice(freq,start + 0.27,duration * 0.55,Object.assign({},options,{gain:(options.gain || 0.045) * 0.18}));
  }
  function playSpinSound(){
    if(muted) return;
    const chords = [
      [261.63,329.63,392],
      [293.66,369.99,440],
      [329.63,415.3,493.88],
      [392,493.88,587.33]
    ];
    chords.forEach((chord,index) => playPad(chord,index * 0.95,1.05,0.019 + index * 0.003));
    [130.81,146.83,164.81,196,220].forEach((freq,index) => playBass(freq,index * 0.72,0.46));

    const pattern = [523.25,587.33,659.25,783.99,880,987.77,1046.5,1174.66];
    let cursor = 0;
    for(let i=0;i<38;i+=1){
      const gap = 0.045 + Math.pow(i / 37, 1.8) * 0.085;
      const freq = pattern[i % pattern.length] * (i > 24 ? 1.12 : 1);
      playVoice(freq,cursor,0.065,{
        type:'sawtooth',
        gain:0.022,
        cutoff:4400,
        detunes:[-3,2,7],
        octave:false,
        attack:0.004,
        release:0.045
      });
      cursor += gap;
    }
    playMelody([
      [659,.35,.14],
      [784,.52,.14],
      [988,.7,.16],
      [1175,.92,.18],
      [1319,1.18,.22]
    ], {type:'sawtooth',gain:0.032,cutoff:5200,detunes:[-5,0,6],subGain:0.2});
  }
  function playWinSound(){
    if(muted) return;
    playPad([261.63,329.63,392,523.25],0,0.72,0.03);
    playPad([349.23,440,523.25,698.46],0.56,0.78,0.032);
    playPad([392,493.88,587.33,783.99],1.14,1.2,0.035);
    playMelody([
      [523.25,0,.14],
      [659.25,.13,.14],
      [783.99,.26,.16],
      [1046.5,.43,.2],
      [1174.66,.66,.18],
      [1318.51,.84,.2],
      [1567.98,1.06,.24],
      [2093,1.36,.5]
    ], {type:'sawtooth',gain:0.07,cutoff:5600,detunes:[-6,0,5],subGain:0.24,attack:0.01,release:0.16});
    [523.25,659.25,783.99,1046.5].forEach((freq,index) => {
      playEchoedVoice(freq,1.32 + index * 0.025,0.72,{
        type:'sawtooth',
        gain:0.042,
        cutoff:4800,
        detunes:[-5,0,7],
        subGain:0.22,
        attack:0.018,
        release:0.28
      });
    });
    playBass(130.81,0,0.38);
    playBass(174.61,0.56,0.4);
    playBass(196,1.14,0.68);
    playSparkle(1.22,18);
  }
  if(soundToggle){
    soundToggle.addEventListener('click', function(){
      ensureAudio();
      setMuted(!muted);
    });
  }
  function pickPrizeIndex(){
    const total = prizes.reduce((sum,prize)=>sum+prize.weight,0);
    let ticket = Math.random() * total;
    for(let i=0;i<prizes.length;i+=1){
      ticket -= prizes[i].weight;
      if(ticket <= 0) return i;
    }
    return prizes.length - 1;
  }
  function setResult(prize){
    if(prize.emoji){
      resultImg.hidden = true;
      resultEmoji.hidden = false;
      resultEmoji.textContent = prize.emoji;
    }else{
      resultImg.hidden = false;
      resultEmoji.hidden = true;
      resultImg.src = prize.img;
      resultImg.alt = prize.name;
    }
    resultRank.textContent = prize.rank;
    resultName.textContent = prize.name;
    resultMessage.textContent = prize.message;
    roulette.classList.add('is-win');
    roulette.classList.remove('is-lose');
  }
  startBtn.addEventListener('click', function(){
    if(spinning) return;
    spinning = true;
    startBtn.disabled = true;
    startBtn.innerHTML = '회전중';
    roulette.classList.remove('is-win','is-lose');
    resultRank.textContent = 'SPINNING';
    resultName.textContent = '두구두구...';
    resultMessage.textContent = '행사장 럭키드로우 분위기를 미리 느껴보세요.';
    playSpinSound();

    const prizeIndex = pickPrizeIndex();
    const segment = 90;
    const fullTurns = 5 + Math.floor(Math.random() * 3);
    // 휠 아이템 각도: 0=오른쪽, 90=아래, 180=왼쪽, 270=위(포인터). 당첨 아이템 중앙을 상단 포인터 아래로.
    const targetMod = (270 - prizeIndex * segment + 360) % 360;
    const nextBase = Math.ceil((currentRotation + 1) / 360) * 360;
    currentRotation = nextBase + fullTurns * 360 + targetMod;
    wheel.style.transform = 'rotate(' + currentRotation + 'deg)';
    wheel.style.setProperty('--wheel-rot', currentRotation + 'deg');

    window.setTimeout(function(){
      const prize = prizes[prizeIndex];
      setResult(prize);
      playWinSound();
      startBtn.disabled = false;
      startBtn.innerHTML = '상품<br>회전';
      spinning = false;
    }, 5000);
  });
})();

/* ===== 경품 섹션 왼쪽 쇼케이스 자동 회전 + 오른쪽 목록 동기화 ===== */
(function(){
  'use strict';
  const show = document.querySelector('[data-prize-show]');
  if (!show) return;
  const slides = [...show.querySelectorAll('[data-prize-slide]')];
  if (slides.length < 2) return;
  const items = [...document.querySelectorAll('.prize__list li')];
  let idx = 0;
  let timer = null;

  function go(n) {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === n));
    items.forEach((li, i) => li.classList.toggle('is-current', i === n));
  }
  go(0);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) return; // 모션 최소화: 1등 고정, 자동회전 안 함

  const INTERVAL = 3500;
  function start() {
    stop();
    timer = window.setInterval(() => {
      idx = (idx + 1) % slides.length;
      go(idx);
    }, INTERVAL);
  }
  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }
  start();

  // 마우스 올리면 일시정지, 벗어나면 재개
  show.addEventListener('mouseenter', stop);
  show.addEventListener('mouseleave', start);
})();

/* ===== 후원사 로고 슬라이딩 마퀴 - 끊김 없는 루프 위해 한 벌 복제 ===== */
(function(){
  'use strict';
  const track = document.querySelector('[data-sponsor-mq]');
  if (!track) return;
  const originals = [...track.children];
  if (!originals.length) return;
  originals.forEach((el) => track.appendChild(el.cloneNode(true)));
})();
