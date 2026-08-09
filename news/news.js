/* 기사 썸네일: image 필드가 있으면 그대로, 없거나 로드 실패하면 로고 이미지로 대체 (항상 "사진"으로만 노출, 글자 X) */
function nwLogoSrc() {
    return (typeof SITE_ROOT !== 'undefined' ? SITE_ROOT : '../') + 'images/logo.png';
}
function nwThumbHtml(n) {
    const hasImg = !!n.image;
    const src = hasImg ? n.image : nwLogoSrc();
    return `<img src="${escapeHtml(src)}" alt="" loading="lazy" class="${hasImg ? '' : 'news-thumb-fallback-img'}" onerror="nwThumbError(this)">`;
}
/* 원본 썸네일 로드가 실패하면 로고로 한 번만 대체 (무한 루프 방지) */
function nwThumbError(imgEl) {
    if (!imgEl) return;
    if (!imgEl.dataset.fallbackApplied) {
        imgEl.dataset.fallbackApplied = '1';
        imgEl.src = nwLogoSrc();
        imgEl.classList.add('news-thumb-fallback-img');
    } else {
        imgEl.onerror = null;
    }
}

function renderNewsGrid() {
    const list = document.getElementById('newsGrid');
    const empty = document.getElementById('newsEmpty');
    if (!list || typeof NEWS_DATA === 'undefined') return;

    if (!NEWS_DATA.length) {
        list.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    // 최신 기사가 위로 오도록 날짜 내림차순 정렬
    const sorted = [...NEWS_DATA].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    list.innerHTML = sorted.map((n, idx) => `
        <a class="news-item" href="${escapeHtml(n.url)}" data-news-idx="${idx}" onclick="return nwHandleClick(event, this)">
            <div class="news-item-thumb">${nwThumbHtml(n)}</div>
            <div class="news-item-body">
                <div class="news-item-meta">
                    <span class="news-item-source">${escapeHtml(n.source || '')}</span>
                    <span class="news-item-dot"></span>
                    <span>${escapeHtml(n.date || '')}</span>
                </div>
                <h3 class="news-item-title">${escapeHtml(n.title || '')}</h3>
                ${n.summary ? `<p class="news-item-summary">${escapeHtml(n.summary)}</p>` : ''}
                <span class="news-item-link">기사 보러가기 →</span>
            </div>
        </a>
    `).join('');

    // 클릭 시 모달에서 참조할 수 있도록 정렬된 데이터를 보관
    window.__NEWS_SORTED = sorted;
}

/* 새 탭으로 열려는 클릭(가운데 클릭, Ctrl/Cmd/Shift+클릭)은 그대로 브라우저 기본 동작에 맡기고,
   일반 클릭만 가로채서 오른쪽 모달로 기사를 보여줌 */
function nwHandleClick(e, el) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return true;
    e.preventDefault();
    const idx = parseInt(el.getAttribute('data-news-idx'), 10);
    const n = (window.__NEWS_SORTED || [])[idx];
    if (!n) return false;
    openNewsModal(n);
    return false;
}

function openNewsModal(n) {
    const head = document.getElementById('newsModalHead');
    if (head) {
        head.innerHTML = `
            <div class="news-modal-meta">
                <span class="news-item-source">${escapeHtml(n.source || '')}</span>
                <span class="news-item-dot"></span>
                <span>${escapeHtml(n.date || '')}</span>
            </div>
            <h2 class="news-modal-title">${escapeHtml(n.title || '')}</h2>
        `;
    }

    const openOriginal = document.getElementById('newsModalOpenOriginal');
    if (openOriginal) openOriginal.href = n.url;

    // 모달을 열자마자 바로 기사 본문을 iframe으로 로드 시도 (버튼 뒤에 숨기지 않음)
    const frame = document.getElementById('newsModalFrame');
    const loading = document.getElementById('newsModalLoading');
    if (loading) loading.style.display = 'flex';
    if (frame) {
        frame.style.visibility = 'hidden';
        frame.onload = () => {
            if (loading) loading.style.display = 'none';
            frame.style.visibility = 'visible';
        };
        frame.src = n.url;
        clearTimeout(window.__nwModalTimer);
        window.__nwModalTimer = setTimeout(() => {
            if (loading) loading.style.display = 'none';
            frame.style.visibility = 'visible';
        }, 4000);
    }

    const backdrop = document.getElementById('newsModalBackdrop');
    const wrapper = document.getElementById('newsModalWrapper');
    if (backdrop) backdrop.classList.add('active');
    if (wrapper) wrapper.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const backdrop = document.getElementById('newsModalBackdrop');
    const wrapper = document.getElementById('newsModalWrapper');
    if (backdrop) backdrop.classList.remove('active');
    if (wrapper) wrapper.classList.remove('active');
    document.body.style.overflow = 'auto';
    clearTimeout(window.__nwModalTimer);
    const frame = document.getElementById('newsModalFrame');
    if (frame) frame.src = 'about:blank';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const wrapper = document.getElementById('newsModalWrapper');
        if (wrapper && wrapper.classList.contains('active')) closeNewsModal();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    try { renderNewsGrid(); } catch (e) { console.error('뉴스 렌더링 실패:', e); }
});
