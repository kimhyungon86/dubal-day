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

  /* ---- 1-2. 마스코트 걷기 프레임 순환(발 번갈아 딛기) ---- */
  if (heroMascot) {
    const walkFrames = [
      'assets/3d/walk_side_1.png',
      'assets/3d/walk_side_2.png',
    ];
    walkFrames.forEach((s) => { const im = new Image(); im.src = s; }); // 프리로드
    let wf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) {
      setInterval(() => {
        wf = (wf + 1) % walkFrames.length;
        heroMascot.src = walkFrames[wf];
      }, 260);
    }
  }

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
      ['2026-07-09', 12],
      ['2026-07-31', 200],
      ['2026-08-31', 590],
      ['2026-09-19', 1100],
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
    const projected = getProjectedParticipants(now).toLocaleString('ko-KR');
    participantEls.forEach((el) => {
      el.textContent = projected;
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
