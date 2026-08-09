import fs from 'fs';

const QUERY = '리센느';
const BLOCKED_KEYWORDS = (process.env.EXCLUDED_KEYWORDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

function isBlocked(text) {
    if (!text || BLOCKED_KEYWORDS.length === 0) return false;
    return BLOCKED_KEYWORDS.some(kw => text.includes(kw));
}

function stripHtml(str) {
    return String(str || '').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
}

async function fetchGoogleNews() {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=ko&gl=KR&ceid=KR:ko`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const xml = await res.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRegex.exec(xml)) !== null) {
        const block = m[1];
        const title = stripHtml((block.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
        const link = stripHtml((block.match(/<link>([\s\S]*?)<\/link>/) || [])[1]);
        const pubDate = stripHtml((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]);
        const source = stripHtml((block.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1]);
        const description = stripHtml((block.match(/<description>([\s\S]*?)<\/description>/) || [])[1]);
        if (!title || !link) continue;
        if (isBlocked(title) || isBlocked(description)) continue;

        items.push({
            title,
            source: source || 'Google News',
            date: pubDate ? new Date(pubDate).toISOString().slice(0, 10) : '',
            url: link,
            summary: description.slice(0, 160)
        });
    }
    return items;
}

async function fetchNaverNews() {
    try {
        const url = `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(QUERY)}&sort=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();

        const items = [];
        const anchorRegex = /<a[^>]+class="news_tit"[^>]+href="([^"]+)"[^>]+title="([^"]+)"/g;
        let m;
        while ((m = anchorRegex.exec(html)) !== null) {
            const [, link, title] = m;
            const decodedTitle = stripHtml(title);
            if (isBlocked(decodedTitle)) continue;
            items.push({
                title: decodedTitle,
                source: '네이버뉴스',
                date: new Date().toISOString().slice(0, 10),
                url: link,
                summary: ''
            });
        }
        return items;
    } catch (e) {
        console.warn('네이버 뉴스 수집 실패 (건너뜀):', e.message);
        return [];
    }
}

function dedupe(items) {
    const seen = new Set();
    return items.filter(i => {
        const key = i.title.replace(/\s+/g, '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function main() {
    console.log(`"${QUERY}" 관련 뉴스 수집 중...`);
    if (BLOCKED_KEYWORDS.length === 0) {
        console.warn('⚠️ EXCLUDED_KEYWORDS가 비어있습니다. 제외 키워드 필터 없이 진행합니다.');
    } else {
        console.log(`제외 키워드 ${BLOCKED_KEYWORDS.length}개 적용 중 (값은 로그에 노출하지 않음)`);
    }
    const [googleItems, naverItems] = await Promise.all([fetchGoogleNews(), fetchNaverNews()]);
    let all = dedupe([...googleItems, ...naverItems]);
    all.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    all = all.slice(0, 100);

    const fileContent = `/* ⭐️ RESCENE NEWS 데이터 — news_scraper.js 로 자동 생성됨 (${new Date().toISOString()}) */\n\nconst NEWS_DATA = ${JSON.stringify(all, null, 4)};\n`;
    fs.writeFileSync(new URL('./news_data.js', import.meta.url), fileContent, 'utf-8');
    console.log(`완료: ${all.length}건을 news_data.js 에 저장했습니다.`);
}

main().catch(err => {
    console.error('뉴스 수집 중 오류 발생:', err);
    process.exit(1);
});
