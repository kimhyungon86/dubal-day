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
})();
