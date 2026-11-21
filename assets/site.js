/* 13jvv.github.io 공통 동작: 언어 전환, 스크롤 등장, 사진 확대, 호버 미리보기 */
(function () {
  var d = document.documentElement;

  // ---- 언어 전환 (메인 페이지에만 버튼이 있습니다) ----
  var langButtons = document.querySelectorAll('[data-set-lang]');
  if (langButtons.length) {
    var titles = { ko: d.getAttribute('data-title-ko') || document.title, en: d.getAttribute('data-title-en') || document.title };
    var apply = function (lang, save) {
      d.setAttribute('data-lang', lang);
      d.lang = lang;
      document.title = titles[lang];
      langButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang)); });
      if (save) { try { localStorage.setItem('portfolio-lang', lang); } catch (e) {} }
    };
    langButtons.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-set-lang'), true); }); });
    apply(d.getAttribute('data-lang') === 'en' ? 'en' : 'ko', false);
  }

  // ---- 사진 확대 ----
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="lb-close" type="button" aria-label="닫기">✕</button><img alt="" />';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img');
  var closeLb = function () { lb.classList.remove('open'); lbImg.removeAttribute('src'); };
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-zoom]');
    if (!t) return;
    e.preventDefault();
    var src = t.getAttribute('data-zoom') || t.getAttribute('src') || (t.querySelector('img') && t.querySelector('img').getAttribute('src'));
    if (!src) return;
    lbImg.src = src;
    lbImg.alt = t.getAttribute('alt') || t.getAttribute('aria-label') || '';
    lb.classList.add('open');
  });

  // ---- 호버 미리보기: 마우스를 올리면 화면 가운데 대표 이미지, 떼면 사라짐 ----
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var peekTargets = document.querySelectorAll('[data-peek]');
  if (canHover && peekTargets.length) {
    var peek = document.createElement('div');
    peek.className = 'peek';
    peek.setAttribute('aria-hidden', 'true');
    document.body.appendChild(peek);
    var hideTimer = null;
    var show = function (el) {
      clearTimeout(hideTimer);
      var list = el.getAttribute('data-peek').split('|').filter(Boolean);
      var kind = el.getAttribute('data-peek-kind') || 'wide';
      peek.className = 'peek ' + kind;
      // 이미지 개수에 맞춰 한 장의 최대 너비를 나눕니다. 너무 크지 않게 가운데에만 띄웁니다.
      var room = Math.min(window.innerWidth * 0.88, kind === 'doc' ? 560 : 940) - 32 - 14 * (list.length - 1);
      var each = Math.floor(room / list.length);
      peek.innerHTML = list.map(function (src) { return '<img src="' + src + '" alt="" style="max-width:' + each + 'px" />'; }).join('');
      requestAnimationFrame(function () { peek.classList.add('show'); });
    };
    var hide = function () {
      peek.classList.remove('show');
      hideTimer = setTimeout(function () { if (!peek.classList.contains('show')) peek.innerHTML = ''; }, 200);
    };
    peekTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { show(el); });
      el.addEventListener('mouseleave', hide);
    });
    window.addEventListener('scroll', function () { if (peek.classList.contains('show')) hide(); }, { passive: true });
  }

  // ---- 스크롤하면 부드럽게 등장 ----
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
