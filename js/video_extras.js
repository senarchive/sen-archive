const VE_ORDER_LABEL = { relevance: '추천순', time: '최신순' };
const VE_PAGE_SIZE = 20;

function veEscape(str) {
    return String(str || '').replace(/[&<>'"]/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[m]));
}

function veWatchUrl(vid) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(vid)}`;
}

let veDataPromise = null;
function veLoadData() {
    if (veDataPromise) return veDataPromise;
    const root = (typeof SITE_ROOT !== 'undefined' ? SITE_ROOT : '');
    veDataPromise = fetch(`${root}js/video_extras_data.json?t=` + Math.floor(Date.now() / 3600000))
        .then(res => res.ok ? res.json() : {})
        .catch(() => ({}));
    return veDataPromise;
}

const veCommentState = {};

function veGetCommentOrder(panelId) {
    return (veCommentState[panelId] && veCommentState[panelId].order) || 'relevance';
}

function veResetComments(panelId) {
    if (veCommentState[panelId]) veCommentState[panelId].vid = null;
}

async function veGetCommentTotal(vid) {
    const data = await veLoadData();
    const entry = data[vid];
    return entry ? entry.commentCount : null;
}

function veCommentSortBarHtml(panelId, onChange) {
    const cur = veGetCommentOrder(panelId);
    return `<div class="ve-comment-sortbar" role="group" aria-label="댓글 정렬">
        ${['relevance', 'time'].map(o => `
            <button type="button" class="ve-sort-btn${cur === o ? ' active' : ''}"
                    data-order="${o}" onclick="${onChange}('${o}')">${VE_ORDER_LABEL[o]}</button>
        `).join('')}
    </div>`;
}

function veUpdateSortBar(barEl, order) {
    if (!barEl) return;
    barEl.querySelectorAll('.ve-sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.order === order);
    });
}

function veCommentItemHtml(c) {
    return `
        <div class="sh-comment-item">
            <img class="sh-comment-avatar" src="${veEscape(c.authorProfileImageUrl)}" alt="" loading="lazy">
            <div class="sh-comment-body">
                <span class="sh-comment-author">${veEscape(c.authorDisplayName)}</span>
                <div class="sh-comment-bubble">${veEscape(c.textOriginal || c.textDisplay)}</div>
                <div class="sh-comment-meta">
                    <span class="sh-comment-like">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21h4V9H2v12zm19-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L12.17 1 6.59 6.59C6.22 6.95 6 7.45 6 8v11c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                        ${c.likeCount || 0}
                    </span>
                    <span class="ve-comment-date">${veFormatDate(c.publishedAt)}</span>
                </div>
            </div>
        </div>`;
}

function veAttachCommentScroll(listEl, listId) {
    if (listEl.dataset.veScrollBound === '1') return;
    listEl.dataset.veScrollBound = '1';
    listEl.addEventListener('scroll', () => {
        const nearBottom = listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 120;
        if (nearBottom) veLoadMoreComments(listId);
    });
}

function veLoadMoreComments(listId) {
    const state = veCommentState[listId];
    const listEl = document.getElementById(listId);
    if (!state || !listEl || !state.vid) return;
    if (state.exhausted) return;

    const nextItems = state.items.slice(state.shown, state.shown + VE_PAGE_SIZE);
    if (!nextItems.length) {
        state.exhausted = true;
        veMaybeAppendMoreLink(listEl, state);
        return;
    }
    nextItems.forEach(c => listEl.insertAdjacentHTML('beforeend', veCommentItemHtml(c)));
    state.shown += nextItems.length;

    if (state.shown >= state.items.length) {
        state.exhausted = true;
        veMaybeAppendMoreLink(listEl, state);
    }
}

function veMaybeAppendMoreLink(listEl, state) {
    if (state.totalCount != null && state.totalCount > state.items.length) {
        listEl.insertAdjacentHTML('beforeend',
            `<div class="sh-comment-more-link"><a href="${veWatchUrl(state.vid)}" target="_blank" rel="noopener">
                전체 댓글 ${state.totalCount.toLocaleString('ko-KR')}개는 유튜브에서 보기 →</a></div>`);
    }
}

async function veLoadComments(opts) {
    const { vid, listId, onCount } = opts;
    const order = opts.order || 'relevance';
    const listEl = document.getElementById(listId);
    if (!listEl || !vid) return;

    const prev = veCommentState[listId];
    if (!opts.force && prev && prev.vid === vid && prev.order === order) return;

    const setCount = (val) => { if (typeof onCount === 'function') onCount(val); };
    const openLink = `<a href="${veWatchUrl(vid)}" target="_blank" rel="noopener">유튜브에서 보기 →</a>`;

    listEl.innerHTML = `<div class="sh-comment-loading">댓글 불러오는 중...</div>`;
    setCount('');

    const data = await veLoadData();
    const entry = data[vid];

    if (!entry) {
        listEl.innerHTML = `<div class="sh-comment-error">아직 이 영상의 댓글을 준비 중이에요.<br>${openLink}</div>`;
        setCount('');
        return;
    }

    if (entry.commentsDisabled) {
        listEl.innerHTML = `<div class="sh-comment-error">이 영상은 댓글 기능이 꺼져 있어요.</div>`;
        setCount(0);
        return;
    }

    const items = (entry.comments && entry.comments[order]) || [];
    veCommentState[listId] = {
        vid, order, items, shown: 0, exhausted: false,
        totalCount: entry.commentCount
    };
    setCount(entry.commentCount != null ? entry.commentCount : '');

    if (!items.length) {
        listEl.innerHTML = `<div class="sh-comment-empty">아직 댓글이 없어요.</div>`;
        return;
    }

    listEl.innerHTML = '';
    veLoadMoreComments(listId);
    listEl.scrollTop = 0;
    veAttachCommentScroll(listEl, listId);
}

async function veFetchTopComments(vid, count = 5) {
    const data = await veLoadData();
    const entry = data[vid];
    if (!entry || entry.commentsDisabled) return [];
    const items = (entry.comments && entry.comments.relevance) || [];
    return items.slice(0, count).map(c => ({
        author: c.authorDisplayName,
        text: c.textOriginal || c.textDisplay,
        like: c.likeCount || 0
    }));
}

function veFormatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

const VE_SHARE_ICONS = [
    { key: 'kakao',     label: '카카오톡',   img: 'images/kakaotalk.png' },
    { key: 'x',         label: 'X',          img: 'images/x.png' },
    { key: 'instagram', label: 'Instagram',  img: 'images/instagram.png' }
];

function veActionBarHtml(vid, title) {
    const root = (typeof SITE_ROOT !== 'undefined' ? SITE_ROOT : '');
    const safeTitle = veEscape(title || '');
    const shareBtns = VE_SHARE_ICONS.map(s => `
        <button type="button" class="ve-share-btn" data-share="${s.key}"
                onclick="veShare('${s.key}', '${veEscape(vid)}', this)"
                aria-label="${s.label}로 공유" title="${s.label}로 공유">
            <img src="${root}${s.img}" alt="${s.label}" onerror="this.style.visibility='hidden'">
        </button>`).join('');

    return `
    <a class="ve-action-btn ve-origin-btn" href="${veWatchUrl(vid)}" target="_blank" rel="noopener" title="${safeTitle}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.9 4.8 12 4.8 12 4.8s-5.9 0-7.6.4a2.8 2.8 0 0 0-2 2C2 8.9 2 12 2 12s0 3.1.4 4.8a2.8 2.8 0 0 0 2 2c1.7.4 7.6.4 7.6.4s5.9 0 7.6-.4a2.8 2.8 0 0 0 2-2C22 15.1 22 12 22 12s0-3.1-.4-4.8zM10.1 15.1V8.9l5.2 3.1-5.2 3.1z"/></svg>
        <span>원본 영상 보기</span>
    </a>
    <div class="ve-share-group">
        <span class="ve-share-label">공유</span>
        ${shareBtns}
        <button type="button" class="ve-share-btn ve-copy-btn" onclick="veShare('copy', '${veEscape(vid)}', this)" aria-label="링크 복사" title="링크 복사">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"></path><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"></path></svg>
        </button>
    </div>`;
}

function veRenderActionBar(containerId, vid, title) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = veActionBarHtml(vid, title);
}

function veToast(msg) {
    let el = document.getElementById('veToast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'veToast';
        el.className = 've-toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(veToast._t);
    veToast._t = setTimeout(() => el.classList.remove('show'), 1900);
}

function veCopyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
        document.body.removeChild(ta);
    });
}

function veShare(kind, vid, btnEl) {
    const url = veWatchUrl(vid);
    const title = (btnEl && btnEl.closest('.ve-action-bar')
        && btnEl.closest('.ve-action-bar').dataset.title) || 'RESCENE';

    if (kind === 'x') {
        const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        window.open(intent, '_blank', 'noopener,width=600,height=520');
        return;
    }

    if (kind === 'copy') {
        veCopyText(url).then(() => veToast('링크를 복사했어요.')).catch(() => veToast('복사에 실패했어요.'));
        return;
    }

    if (navigator.share) {
        navigator.share({ title, url }).catch(() => {  });
        return;
    }
    const nameMap = { kakao: '카카오톡', instagram: '인스타그램' };
    veCopyText(url)
        .then(() => veToast(`링크를 복사했어요. ${nameMap[kind] || ''}에 붙여넣어 주세요.`))
        .catch(() => veToast('복사에 실패했어요.'));
}

const veLiveCache = {};

function veIsMobileViewport() {
    return !!(window.matchMedia && window.matchMedia('(max-width: 700px)').matches);
}

function veLiveChatUrl(vid) {
    return `https://www.youtube.com/live_chat?v=${encodeURIComponent(vid)}&embed_domain=${encodeURIComponent(location.hostname)}`;
}

async function veGetLiveStatus(vid) {
    const data = await veLoadData();
    const entry = data[vid];
    return entry ? entry.liveStatus : 'none';
}

async function veCheckLive(vid, fallbackIsLive) {
    if (vid in veLiveCache) return veLiveCache[vid];
    const status = await veGetLiveStatus(vid);
    veLiveCache[vid] = (status !== 'none') || !!fallbackIsLive;
    return veLiveCache[vid];
}

async function veRenderLiveChat(containerId, vid) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="sh-comment-loading">채팅 불러오는 중...</div>`;

    const openLink = `<a href="${veWatchUrl(vid)}" target="_blank" rel="noopener">유튜브에서 바로 보기 →</a>`;

    if (veIsMobileViewport()) {
        el.innerHTML = `<div class="ve-livechat-none">모바일 웹에서는 유튜브 정책상 채팅을 화면에 직접 띄울 수 없어요.<br>${openLink}</div>`;
        return;
    }

    const status = await veGetLiveStatus(vid);
    if (!el.isConnected) return;
    if (status !== 'live') {
        el.innerHTML = `<div class="ve-livechat-none">방송이 끝난 영상은 채팅 다시보기를 이 화면에 직접 띄울 수 없어요.<br>유튜브에서는 채팅 다시보기를 볼 수 있어요.<br>${openLink}</div>`;
        return;
    }

    const src = veLiveChatUrl(vid);
    el.innerHTML = `<iframe class="ve-livechat-frame" src="${src}"
        frameborder="0" title="실시간 채팅"></iframe>
        <div class="ve-livechat-fallback">
            채팅이 보이지 않으면 ${openLink}
        </div>`;
}

function veClearLiveChat(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
}
