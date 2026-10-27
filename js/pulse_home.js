/* PULSE 컴백 메인 (히어로 / 멤버 / 하이라이트 메들리) */
(function () {
    var RELEASE = new Date('2026-11-03T18:00:00+09:00'); // 컴백(발매) 일시 — 시간 변경 시 여기만 수정
    var GROUP_SLIDES = [
        'images/pulse/group1.webp',
        'images/pulse/group2.webp',
        'images/pulse/group3.webp',
        'images/pulse/group4.webp'
    ];
    /* 멤버별 사진 (key는 member_data.js의 key와 동일). 사진이 잘못 매칭됐다면 여기만 고치면 됨 */
    var PULSE_PHOTOS = {
        woni: ['images/pulse/woni1.webp', 'images/pulse/woni2.webp'],
        liv: ['images/pulse/liv1.webp'],
        minami: ['images/pulse/minami1.webp'],
        may: ['images/pulse/may1.webp'],
        zena: ['images/pulse/zena1.webp', 'images/pulse/zena2.webp']
    };
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

    /* ---------- ② 멤버 ---------- */
    var activeKey = null, activePhoto = 0;
    function members() { return (typeof MEMBER_DATA !== 'undefined') ? MEMBER_DATA : []; }
    function buildMembers() {
        var strip = $('pmStrip'); if (!strip) return;
        strip.innerHTML = members().map(function (m, i) {
            var ph = (PULSE_PHOTOS[m.key] || [])[0] || '';
            return '<button type="button" class="pm-card" data-key="' + m.key + '" style="--mc:' + m.color + ';--i:' + i + '">' +
                '<img src="' + ph + '" alt="' + m.nameKo + '" loading="lazy">' +
                '<span class="pm-card-name"><em>' + m.nameEn + '</em><b>' + m.nameKo + '</b></span></button>';
        }).join('');
        strip.addEventListener('click', function (e) {
            var c = e.target.closest('.pm-card'); if (!c) return;
            selectMember(c.dataset.key, true);
        });
        if (members()[0]) selectMember(members()[0].key, false);
    }
    function selectMember(key, scroll) {
        var m = members().find(function (x) { return x.key === key; }); if (!m) return;
        activeKey = key; activePhoto = 0;
        document.querySelectorAll('.pm-card').forEach(function (c) { c.classList.toggle('active', c.dataset.key === key); });
        var det = $('pmDetail'); det.style.setProperty('--mc', m.color);
        det.classList.remove('swap'); void det.offsetWidth; det.classList.add('swap');
        showPhoto(0);
        var rows = [['BIRTHDAY', m.birthday], ['POSITION', m.position], ['MBTI', m.mbti], ['NICKNAME', m.nickname]];
        $('pmInfo').innerHTML =
            '<div class="pm-en">' + m.nameEn + '</div><div class="pm-ko">' + m.nameKo + '</div>' +
            (m.intro ? '<p class="pm-intro">“' + m.intro + '”</p>' : '') +
            '<dl class="pm-stats">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + (r[1] || '-') + '</dd></div>'; }).join('') + '</dl>' +
            '<a class="pm-more" href="member/member.html">PHOTO ARCHIVE →</a>';
        if (scroll && det.getBoundingClientRect().top > window.innerHeight * 0.6) det.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    function showPhoto(i) {
        var list = PULSE_PHOTOS[activeKey] || [], img = $('pmPhoto');
        activePhoto = i; img.src = list[i] || '';
        var th = $('pmThumbs');
        th.innerHTML = list.length > 1 ? list.map(function (s, k) { return '<button type="button" class="' + (k === i ? 'on' : '') + '" data-i="' + k + '"><img src="' + s + '" alt=""></button>'; }).join('') : '';
    }

    /* ---------- ③ 메들리 ---------- */
    function buildMedley() {
        var ol = $('pvTracks'); if (!ol) return;
        ol.innerHTML = TRACKS.map(function (t, i) { return '<li style="--i:' + i + '"><span>' + pad(i + 1) + '</span><b>' + t.t + '</b><i>' + t.d + '</i></li>'; }).join('');
        var f = $('pvFrame');
        if ('IntersectionObserver' in window && f) {
            new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { f.src = f.dataset.src; o.disconnect(); } }, { rootMargin: '200px' }).observe(f);
        } else if (f) f.src = f.dataset.src;
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
        buildMembers(); buildMedley(); observeReveal();
        var th = $('pmThumbs');
        if (th) th.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { showPhoto(+b.dataset.i); th.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); } });
        document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else restart(); });
    });
})();
