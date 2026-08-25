import fs from 'fs';
const DATA_PATH = 'goods/goods_data.json';

const inputArg = process.argv[2];
if (!inputArg) {
    console.error('❌ 사용법: node goods/apply_kream_update.js \'{"url":"...", "priceNum":..., "stock":"...", "image":"..."}\'');
    process.exit(1);
}

let update;
try {
    update = JSON.parse(inputArg);
} catch (e) {
    console.error('❌ 붙여넣은 내용이 올바른 JSON이 아닙니다:', e.message);
    process.exit(1);
}

if (!update.url) {
    console.error('❌ url 필드가 없습니다. 북마클릿으로 추출한 결과를 그대로 붙여넣었는지 확인하세요.');
    process.exit(1);
}

const goodsData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

let found = false;
for (const item of Object.values(goodsData)) {
    for (const shop of item.shops || []) {
        if (shop.url === update.url) {
            shop.priceNum = update.priceNum ?? shop.priceNum;
            shop.price = update.priceNum != null ? `₩ ${update.priceNum.toLocaleString('ko-KR')}` : shop.price;
            shop.stock = update.stock || shop.stock;
            shop.lastCheckedAt = update.checkedAt || new Date().toISOString();
            delete shop.lastError;
            found = true;

            if (update.image && (!item.image || String(item.image).startsWith('http'))) {
                item.image = update.image;
            }
        }
    }

    const withPrice = (item.shops || []).filter(s => s.priceNum != null);
    const inStockWithPrice = withPrice.filter(s => s.stock === 'available');
    const pool = inStockWithPrice.length ? inStockWithPrice : withPrice;
    item.cheapest = pool.length ? pool.reduce((a, b) => (a.priceNum <= b.priceNum ? a : b)).shop : item.cheapest;
    item.soldout = (item.shops || []).length > 0 && (item.shops || []).every(s => s.stock === 'soldout');
}

if (!found) {
    console.error('❌ 해당 url을 가진 상품을 goods_data.json에서 찾지 못했습니다:', update.url);
    process.exit(1);
}

fs.writeFileSync(DATA_PATH, JSON.stringify(goodsData, null, 2), 'utf-8');
console.log('✅ 업데이트 완료:', update.url);
console.log(`   가격: ${update.priceNum ?? '(변경없음)'} / 재고: ${update.stock ?? '(변경없음)'} / 이미지: ${update.image ? 'O' : '(변경없음)'}`);
