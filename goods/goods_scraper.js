import puppeteer from 'puppeteer';
import fs from 'fs';
const DATA_PATH = 'goods/goods_data.json';

function browserCheckSoldout(cfg) {
    if (cfg.explicitMarkerSelector && document.querySelector(cfg.explicitMarkerSelector)) return true;

    if (cfg.buyBtnSelector) {
        const buyBtn = document.querySelector(cfg.buyBtnSelector);
        if (buyBtn) {
            const label = (buyBtn.innerText || buyBtn.textContent || '').trim();
            if (/품절|판매중지|판매종료|SOLD ?OUT/i.test(label)) return true;
            if (buyBtn.disabled || buyBtn.getAttribute('aria-disabled') === 'true') return true;
            if (buyBtn.classList && (buyBtn.classList.contains('disabled') || buyBtn.classList.contains('soldout'))) return true;
            return false;
        }
    }

    const scope = (cfg.scopeSelector && document.querySelector(cfg.scopeSelector)) || null;
    if (!scope) return false;
    return /품절|판매중지|판매종료|SOLD ?OUT/i.test(scope.innerText || '');
}

function browserGetImage(cfg) {
    if (cfg.imageSelector) {
        const el = document.querySelector(cfg.imageSelector);
        if (el) {
            const src = el.getAttribute('src') || el.getAttribute('content') || el.getAttribute('data-src') || el.getAttribute('data-original');
            if (src) return src;
        }
    }
    const og = document.querySelector('meta[property="og:image"], meta[name="og:image"]');
    if (og && og.content) return og.content;
    return null;
}

const SHOP_SELECTORS = {
    withmuu: {
        priceSelector: '.item_price',
        imageSelector: '.detail_img img, .zoomImg img, .prd_img img',
        soldoutCheck: (page) => page.evaluate(browserCheckSoldout, {
            explicitMarkerSelector: '.btn_soldout, .icon_soldout, .soldout_img, img[alt="품절"]',
            buyBtnSelector: '#buyBtn, .btn_buy, a[onclick*="goOrder"], button[onclick*="goOrder"], .btnBuy, .prd-buy-btn',
            scopeSelector: '.infowrap, .item_price, .prd_detail, #span_product_price_text'
        })
    },
    ktown4u: {
        priceSelector: '.text-s1, [class*="text-s1"]',
        imageSelector: '[class*="thumbnail"] img, [class*="productImg"] img, [class*="ProductImg"] img',
        soldoutCheck: (page) => page.evaluate(browserCheckSoldout, {
            explicitMarkerSelector: '[class*="soldOut"], [class*="sold_out"], .icon-soldout',
            buyBtnSelector: 'button[class*="buy"], a[class*="buy"], [class*="btnBuy"]',
            scopeSelector: '[class*="product"], [class*="detail"], main'
        })
    },
    kream: {
        priceSelector: '.amount, [class*="amount"]',
        imageSelector: '[class*="product_img"] img, [class*="productImg"] img, picture img',
        soldoutCheck: (page) => page.evaluate(browserCheckSoldout, {
            explicitMarkerSelector: '.btn_soldout, [class*="sold_out"], [class*="soldOut"]',
            buyBtnSelector: 'button[class*="buy"], button[class*="Buy"], a[class*="buy"]',
            scopeSelector: 'main, #__next, [class*="product_detail"], [class*="productDetail"]'
        })
    }
};

const SHOP_NAV_OPTIONS = {
    withmuu: { waitUntil: 'domcontentloaded', timeout: 30000, extraDelay: 4000 },
    ktown4u: { waitUntil: 'domcontentloaded', timeout: 30000, extraDelay: 4000 },
    kream: { waitUntil: 'networkidle2', timeout: 45000, extraDelay: 6000 }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function parsePriceToNumber(priceText) {
    if (!priceText) return null;
    const match = priceText.replace(/,/g, '').match(/\d{3,}/);
    return match ? Number(match[0]) : null;
}

function absolutizeUrl(url, base) {
    try { return new URL(url, base).href; } catch (e) { return url; }
}

async function scrapeOneShop(page, shopKey, url) {
    const cfg = SHOP_SELECTORS[shopKey];
    if (!cfg) throw new Error(`알 수 없는 쇼핑몰 타입: ${shopKey}`);
    const navOpt = SHOP_NAV_OPTIONS[shopKey] || {};

    await page.goto(url, { waitUntil: navOpt.waitUntil || 'domcontentloaded', timeout: navOpt.timeout || 30000 });
    await delay(navOpt.extraDelay || 4000);

    await page.waitForSelector(cfg.priceSelector, { timeout: 6000 }).catch(() => null);
    const priceText = await page.$eval(cfg.priceSelector, el => el.innerText).catch(() => null);
    const priceNum = parsePriceToNumber(priceText);
    const isSoldOut = await cfg.soldoutCheck(page).catch(() => false);
    const rawImage = await page.evaluate(browserGetImage, { imageSelector: cfg.imageSelector }).catch(() => null);
    const image = rawImage ? absolutizeUrl(rawImage, url) : null;

    return { priceNum, stock: isSoldOut ? 'soldout' : 'available', image };
}

async function scrapeGoods() {
    console.log("🤖 굿즈 가격/품절/썸네일 크롤링 시작...");

    if (!fs.existsSync(DATA_PATH)) {
        console.error(`❌ ${DATA_PATH} 가 없습니다.`);
        return;
    }
    const goodsData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7' });
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    for (const itemKey of Object.keys(goodsData)) {
        const item = goodsData[itemKey];
        if (!item.shops || !item.shops.length) continue;

        for (const shop of item.shops) {
            console.log(`[${itemKey} - ${shop.shop}] 접속 중... ${shop.url}`);
            let succeeded = false;

            for (let attempt = 1; attempt <= 2 && !succeeded; attempt++) {
                try {
                    const { priceNum, stock, image } = await scrapeOneShop(page, shop.shop, shop.url);
                    console.log(`  > 가격: ${priceNum ?? '확인 실패'} / 상태: ${stock}${image ? ' / 이미지 O' : ' / 이미지 X'}`);
                    shop.priceNum = priceNum;
                    shop.price = priceNum != null ? `₩ ${priceNum.toLocaleString('ko-KR')}` : shop.price ?? null;
                    shop.stock = priceNum != null ? stock : (shop.stock || 'unknown');
                    shop.lastCheckedAt = new Date().toISOString();
                    delete shop.lastError;

                    if (image && (!item.image || String(item.image).startsWith('http'))) {
                        item.image = image;
                    }
                    succeeded = true;
                } catch (e) {
                    shop.lastError = e.message;
                    shop.lastCheckedAt = new Date().toISOString();
                    console.error(`  ✗ [${itemKey} - ${shop.shop}] 시도 ${attempt}/2 실패: ${e.message}`);
                    if (attempt < 2) await delay(2000);
                }
            }
            await delay(600);
        }

        const withPrice = item.shops.filter(s => s.priceNum != null);
        const inStockWithPrice = withPrice.filter(s => s.stock === 'available');
        const pool = inStockWithPrice.length ? inStockWithPrice : withPrice;
        item.cheapest = pool.length ? pool.reduce((a, b) => (a.priceNum <= b.priceNum ? a : b)).shop : item.cheapest;
        item.soldout = item.shops.length > 0 && item.shops.every(s => s.stock === 'soldout');
    }

    await browser.close();

    fs.writeFileSync(DATA_PATH, JSON.stringify(goodsData, null, 2), 'utf-8');
    console.log(`✅ 데이터가 [${DATA_PATH}]에 저장되었습니다. (총 ${Object.keys(goodsData).length}개 상품)`);
}

scrapeGoods().catch((e) => {
    console.error('❌ 스크래퍼 실행 중 치명적 오류:', e);
    process.exit(1);
});
