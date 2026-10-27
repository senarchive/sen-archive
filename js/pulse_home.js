/* PULSE 컴백 메인 (히어로 / 멤버 / 하이라이트 메들리) */
(function () {
    var RELEASE = new Date('2026-11-03T18:00:00+09:00'); // 컴백(발매) 일시 — 시간 변경 시 여기만 수정
    var GROUP_SLIDES = [
        'images/pulse/group1.webp',
        'images/pulse/group2.webp',
        'images/pulse/group3.webp',
        'images/pulse/group4.webp'
    ];
    var YT_ID = 'kmDGZd1mv7I';
    var TRACKS = [
        { t: 'Finest Thing', d: '02:20' },
        { t: 'With', d: '03:11' },
        { t: 'Inside Out', d: '03:31' },
        { t: 'MEME', d: '03:01' },
        { t: 'Dragon', d: '03:40' }
    ];

    function $(id) { return document.getElementById(id); }
    function pad(n) { return String(n).padStart(2, '0'); }

    /* ---------- ① 슬라이드 (3초 자동) ---------- */
    var cur = 0, timer = null;
    function buildSlides() {
        var wrap = $('phSlides'), dots = $('phDots');
        if (!wrap) return;
        wrap.innerHTML = GROUP_SLIDES.map(function (src, i) {
            return '<div class="ph-slide' + (i === 0 ? ' on' : '') + '"><img src="' + src + '" alt="RESCENE PULSE group photo ' + (i + 1) + '"' + (i > 0 ? ' loading="lazy"' : '') + '></div>';
        }).join('');
        dots.innerHTML = GROUP_SLIDES.map(function (_, i) {
            return '<button type="button" class="' + (i === 0 ? 'on' : '') + '" aria-label="' + (i + 1) + '번 사진" data-i="' + i + '"></button>';
        }).join('');
        dots.addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            go(+b.dataset.i); restart();
        });
    }
    function go(i) {
        var s = document.querySelectorAll('#phSlides .ph-slide'), d = document.querySelectorAll('#phDots button');
        cur = (i + s.length) % s.length;
        s.forEach(function (el, k) { el.classList.toggle('on', k === cur); });
        d.forEach(function (el, k) { el.classList.toggle('on', k === cur); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 3000); }

    /* ---------- 카운트다운 ---------- */
    function tick() {
        var diff = RELEASE - new Date();
        var cd = $('phCount'), rel = $('phReleased');
        if (diff <= 0) {
            if (cd) cd.style.display = 'none';
            if (rel) rel.style.display = '';
            return;
        }
        var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
        setNum('cdD', pad(d)); setNum('cdH', pad(h)); setNum('cdM', pad(m)); setNum('cdS', pad(s));
    }
    function setNum(id, v) {
        var el = $(id); if (!el || el.textContent === v) return;
        el.textContent = v; el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
    }

    /* ---------- ② 개인 포토 (가로 2줄) ---------- */
    var SOLO_COUNT = 20;
    function buildGallery() {
        var g = $('pmGallery'); if (!g) return;
        var h = '';
        for (var i = 1; i <= SOLO_COUNT; i++) {
            h += '<div class="pm-item" data-n="' + i + '" style="--i:' + i + '"><img src="images/pulse/solo' + pad(i) + '.webp" alt="RESCENE PULSE photo ' + i + '" loading="lazy"></div>';
        }
        g.innerHTML = h;
        g.addEventListener('click', function (e) {
            var it = e.target.closest('.pm-item'); if (it) openPhoto(+it.dataset.n);
        });
        /* 마우스 휠 → 가로 스크롤 */
        g.addEventListener('wheel', function (e) {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && g.scrollWidth > g.clientWidth) {
                var atStart = g.scrollLeft <= 0 && e.deltaY < 0, atEnd = g.scrollLeft + g.clientWidth >= g.scrollWidth - 1 && e.deltaY > 0;
                if (!atStart && !atEnd) { e.preventDefault(); g.scrollLeft += e.deltaY; }
            }
        }, { passive: false });
    }

    /* 개인 사진 모달 */
    var curPhoto = 0;
    function openPhoto(n) {
        curPhoto = n;
        $('pmModalImg').src = 'images/pulse/solo' + pad(n) + '.webp';
        $('pmModal').classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closePhoto() {
        $('pmModal').classList.remove('open');
        document.body.style.overflow = '';
    }
    function stepPhoto(d) { openPhoto(((curPhoto - 1 + d + SOLO_COUNT) % SOLO_COUNT) + 1); }
    function initModal() {
        var m = $('pmModal'); if (!m) return;
        m.addEventListener('click', function (e) {
            if (e.target.closest('#pmModalClose')) return closePhoto();
            if (e.target.closest('.pm-modal-nav')) return stepPhoto(e.target.closest('.pm-modal-nav').dataset.d === 'prev' ? -1 : 1);
            if (!e.target.closest('#pmModalImg')) closePhoto();
        });
        document.addEventListener('keydown', function (e) {
            if (!m.classList.contains('open')) return;
            if (e.key === 'Escape') closePhoto();
            else if (e.key === 'ArrowLeft') stepPhoto(-1);
            else if (e.key === 'ArrowRight') stepPhoto(1);
        });
    }

    /* ---------- ③ 메들리 ---------- */
    function buildMedley() {
        var ol = $('pvTracks'); if (!ol) return;
        ol.innerHTML = TRACKS.map(function (t, i) { return '<li style="--i:' + i + '"><span>' + pad(i + 1) + '</span><b>' + t.t + '</b><i>' + t.d + '</i></li>'; }).join('');
        var box = $('pvVideo');
        if (box) box.addEventListener('click', function () {
            if (box.classList.contains('playing')) return;
            box.classList.add('playing');
            box.insertAdjacentHTML('beforeend', '<iframe src="https://www.youtube.com/embed/' + YT_ID + '?autoplay=1&rel=0" title="PULSE Highlight Medley" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>');
        });
    }

    /* 섹션 진입 애니메이션 */
    function observeReveal() {
        var els = document.querySelectorAll('#pulseMembers, #pulseMedley');
        if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
        var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.25 });
        els.forEach(function (e) { io.observe(e); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        buildSlides(); restart(); tick(); setInterval(tick, 1000);
        buildGallery(); initModal(); buildMedley(); observeReveal();
        document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else restart(); });
    });
})();
