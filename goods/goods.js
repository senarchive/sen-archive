let GOODS_DATA = {};
let goodsActiveCategory = '전체';
let goodsShowEnded = false;
let goodsSortMode = 'default';

const GOODS_CATEGORY_ORDER = ['전체', '앨범', '인형·키링', '응원봉', '콜라보 MD', '팬콘 MD', '기타', '팬사인회 응모 (종료)'];
const GOODS_WISH_KEY = 'rescene_goods_wishlist';
function goodsLoadWish() {
    try { return new Set(JSON.parse(localStorage.getItem(GOODS_WISH_KEY) || '[]')); }
    catch (e) { return new Set(); }
}
function goodsSaveWish(set) {
    try { localStorage.setItem(GOODS_WISH_KEY, JSON.stringify([...set])); } catch (e) { }
}
let goodsWishSet = goodsLoadWish();

function goodsToggleWish(id, evt) {
    if (evt) { evt.preventDefault(); evt.stopPropagation(); }
    if (goodsWishSet.has(id)) goodsWishSet.delete(id);
    else goodsWishSet.add(id);
    goodsSaveWish(goodsWishSet);
    const btn = document.querySelector(`.goods-item[data-item="${id}"] .goods-wish-btn`);
    if (btn) btn.classList.toggle('active', goodsWishSet.has(id));
}

function goodsToggleCompare(btn) {
    const card = btn.closest('.goods-item');
    if (card) card.classList.toggle('expanded');
}

function goodsSetSort(mode) {
    goodsSortMode = mode;
    document.querySelectorAll('.goods-sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === mode));
    renderGoodsGrid();
}

async function loadGoodsData() {
    const grid = document.getElementById('goodsGrid');
    if (grid) grid.innerHTML = renderSkeletons(6);
    try {
        const res = await fetch('goods_data.json', { cache: 'no-store' });
        GOODS_DATA = await res.json();
    } catch (e) {
        console.error('굿즈 데이터 로드 실패:', e);
        GOODS_DATA = {};
    }
    renderGoodsSidebar();
    renderGoodsGrid();
}

function renderSkeletons(n) {
    let html = '';
    for (let i = 0; i < n; i++) {
        html += `<div class="goods-item">
            <div class="goods-img skeleton-block"></div>
            <div class="goods-info">
                <div class="goods-skeleton-line skeleton-block" style="width:90%;height:13px;"></div>
                <div class="goods-skeleton-line skeleton-block" style="width:60%;height:13px;margin-top:6px;"></div>
                <div class="goods-skeleton-line skeleton-block" style="width:45%;height:17px;margin-top:12px;"></div>
            </div>
        </div>`;
    }
    return html;
}

function goodsCategoryCounts() {
    const counts = {};
    Object.values(GOODS_DATA).forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
    });
    counts['전체'] = Object.keys(GOODS_DATA).length;
    return counts;
}

function renderGoodsSidebar() {
    const el = document.getElementById('goodsSidebar');
    if (!el) return;
    const counts = goodsCategoryCounts();
    const present = GOODS_CATEGORY_ORDER.filter(c => c === '전체' || counts[c]);
    el.innerHTML = present.map(cat => {
        const active = cat === goodsActiveCategory ? 'active' : '';
        return `<button type="button" class="goods-cat-btn ${active}" onclick="goodsSetCategory('${escapeHtml(cat)}')">
            ${escapeHtml(cat)} <span class="goods-cat-count">${counts[cat] || 0}</span>
        </button>`;
    }).join('');
}

function goodsSetCategory(cat) {
    goodsActiveCategory = cat;
    renderGoodsSidebar();
    renderGoodsGrid();
    window.scrollTo({ top: document.getElementById('goodsTop')?.offsetTop - 100 || 0, behavior: 'smooth' });
}

function goodsToggleEnded() {
    goodsShowEnded = !goodsShowEnded;
    renderGoodsGrid();
}

function goodsFilteredEntries() {
    let entries = Object.entries(GOODS_DATA);
    if (goodsActiveCategory !== '전체') {
        entries = entries.filter(([, v]) => v.category === goodsActiveCategory);
    } else if (!goodsShowEnded) {
        entries = entries.filter(([, v]) => v.category !== '팬사인회 응모 (종료)');
    }

    if (goodsSortMode === 'price-asc' || goodsSortMode === 'price-desc') {
        const dir = goodsSortMode === 'price-asc' ? 1 : -1;
        entries = entries.slice().sort((a, b) => {
            const pa = goodsCheapestPriceNum(a[1]);
            const pb = goodsCheapestPriceNum(b[1]);
            if (pa == null && pb == null) return 0;
            if (pa == null) return 1;
            if (pb == null) return -1;
            return (pa - pb) * dir;
        });
    } else if (goodsSortMode === 'stock') {
        entries = entries.slice().sort((a, b) => {
            const sa = goodsInStockCount(a[1]) > 0 ? 1 : 0;
            const sb = goodsInStockCount(b[1]) > 0 ? 1 : 0;
            if (sa !== sb) return sb - sa;
            return goodsInStockCount(b[1]) - goodsInStockCount(a[1]);
        });
    }

    return entries;
}

function goodsCheapestShop(item) {
    if (!item.cheapest) return null;
    return item.shops.find(s => s.shop === item.cheapest) || null;
}

function goodsCheapestPriceNum(item) {
    const cheapestShop = goodsCheapestShop(item);
    if (cheapestShop && typeof cheapestShop.priceNum === 'number') return cheapestShop.priceNum;
    const nums = (item.shops || []).map(s => s.priceNum).filter(n => typeof n === 'number');
    return nums.length ? Math.min(...nums) : null;
}

function goodsInStockCount(item) {
    return (item.shops || []).filter(s => s.stock === 'available').length;
}

function goodsCardHtml(id, item) {
    const cheapestShop = goodsCheapestShop(item);
    const priceText = cheapestShop && cheapestShop.price ? cheapestShop.price : '가격 확인중...';
    const soldoutCls = item.soldout ? 'is-soldout' : '';
    const badgesHtml = (item.badges || []).map(b => `<span class="goods-badge goods-badge-${b.replace(/\s+/g, '').toLowerCase()}">${escapeHtml(b)}</span>`).join('');
    const isWished = goodsWishSet.has(id);

    const shopsSorted = [...item.shops].sort((a, b) => {
        if ((a.stock === 'available') !== (b.stock === 'available')) return a.stock === 'available' ? -1 : 1;
        return (a.priceNum ?? Infinity) - (b.priceNum ?? Infinity);
    });

    const shopRowHtml = (s) => {
        const isCheapest = s.shop === item.cheapest;
        const stockLabel = s.stock === 'soldout' ? '<span class="stock-num" style="color:#ff4757;">SOLD OUT</span>'
            : s.stock === 'unknown' ? '<span class="stock-num">확인중</span>'
            : '';
        return `<div class="stock-row ${isCheapest ? 'is-cheapest' : ''}">
            <span class="shop-name">${escapeHtml(s.label)}${isCheapest && !item.soldout ? '<span class="cheapest-badge">최저가</span>' : ''}</span>
            <span style="display:flex; align-items:center; gap:8px;">
                ${s.price ? `<span class="shop-price">${escapeHtml(s.price)}</span>` : ''}
                ${stockLabel}
                <a href="${s.url}" target="_blank" rel="noopener" class="buy-btn ${s.stock === 'soldout' ? 'sold-out' : ''}">${s.stock === 'soldout' ? '품절' : '구매'}</a>
            </span>
        </div>`;
    };

    const multiShop = shopsSorted.length > 1;
    const stockListHtml = shopsSorted.map(shopRowHtml).join('');
    const inStockCount = goodsInStockCount(item);
    const metaText = multiShop
        ? `판매처 ${shopsSorted.length}곳${inStockCount ? ` · 재고있음 ${inStockCount}곳` : ' · 전체 품절'}`
        : (inStockCount ? '재고있음' : '품절');

    const imgSrc = item.image || '../images/goods/_placeholder.jpg';

    return `<div class="goods-item" data-item="${id}">
        <div class="goods-img ${soldoutCls}">
            <button type="button" class="goods-wish-btn ${isWished ? 'active' : ''}" onclick="goodsToggleWish('${id}', event)" aria-label="찜하기">
                <svg viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
            </button>
            <div class="goods-badge-row">${badgesHtml}</div>
            <img src="${imgSrc}" alt="${escapeHtml(item.name)}" onerror="this.style.opacity=0;this.parentElement.classList.add('no-img');">
            <div class="soldout-stamp"><span>SOLD</span></div>
        </div>
        <div class="goods-info">
            <div class="goods-name">${escapeHtml(item.name)}</div>
            <div class="goods-price-row">
                <span class="goods-price-text">${escapeHtml(priceText)}</span>
                ${multiShop && !item.soldout ? '<span class="goods-price-badge">최저가</span>' : ''}
            </div>
            <div class="goods-meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l1-5h16l1 5M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M8 13a2 2 0 0 0 4 0M12 13a2 2 0 0 0 4 0"/></svg>
                <span>${metaText}</span>
            </div>
            ${multiShop
                ? `<button type="button" class="goods-compare-toggle" onclick="goodsToggleCompare(this)">
                    <span>판매처 비교</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="goods-stock-list">${stockListHtml}</div>`
                : `<div class="goods-stock-list goods-stock-list-single">${stockListHtml}</div>`
            }
        </div>
    </div>`;
}

function renderGoodsGrid() {
    const grid = document.getElementById('goodsGrid');
    const countEl = document.getElementById('goodsResultCount');
    if (!grid) return;
    const entries = goodsFilteredEntries();

    if (countEl) countEl.innerHTML = `총 <strong>${entries.length}</strong>개의 상품`;

    if (!entries.length) {
        grid.innerHTML = `<div class="goods-empty">등록된 상품이 없습니다.</div>`;
    } else {
        grid.innerHTML = entries.map(([id, item]) => goodsCardHtml(id, item)).join('');
    }

    const endedToggleEl = document.getElementById('goodsEndedToggle');
    if (endedToggleEl) {
        const endedCount = Object.values(GOODS_DATA).filter(v => v.category === '팬사인회 응모 (종료)').length;
        if (goodsActiveCategory === '전체' && endedCount > 0) {
            endedToggleEl.style.display = 'block';
            endedToggleEl.innerHTML = goodsShowEnded
                ? `<button type="button" onclick="goodsToggleEnded()">종료된 팬사인회 응모 상품(${endedCount}개) 숨기기 ↑</button>`
                : `<button type="button" onclick="goodsToggleEnded()">종료된 팬사인회 응모 상품(${endedCount}개) 더보기 ↓</button>`;
        } else {
            endedToggleEl.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', loadGoodsData);
