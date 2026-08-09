import fs from 'fs';
import * as cheerio from 'cheerio';

const QUERY = '리센느';
const BLOCKED_KEYWORDS = (process.env.EXCLUDED_KEYWORDS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

function isBlocked(text) {
    if (!text || BLOCKED_KEYWORDS.length === 0) return false;
    return BLOCKED_KEYWORDS.some(kw => text.includes(kw));
}

/* HTML 엔티티(&lt; &amp; 등)를 실제 문자로 디코딩. 구글 뉴스 RSS는 태그 자체가
   &lt;a href=...&gt; 처럼 이스케이프된 채로 오는 경우가 있어, 태그 제거보다 먼저 디코딩해야 함 */
function decodeEntities(str) {
    return String(str || '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/&amp;/g, '&'); // & 디코딩은 다른 엔티티들을 먼저 푼 뒤 마지막에
}

function stripHtml(str) {
    return decodeEntities(str).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
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

/* ⭐️ 구글 뉴스 링크(news.google.com/rss/articles/...)는 실제 언론사 주소가 아니라
   구글 자체 리다이렉트 페이지임. 실제 이동은 브라우저 자바스크립트로만 일어나서,
   서버에서 그냥 fetch로 접속하면 진짜 기사가 아니라 구글 페이지 자체의 아이콘/설명이 잡힘.
   → 구글이 내부적으로 쓰는 디코딩 방식을 재현해서 실제 언론사 URL을 알아냄.
   (구글 공식 API가 아니라 비공식 방식이라 실패할 수 있음 — 실패하면 조용히 null 반환) */
function extractGoogleArticleId(url) {
    try {
        const u = new URL(url);
        if (u.hostname !== 'news.google.com') return null;
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.indexOf('articles');
        return idx !== -1 && parts[idx + 1] ? parts[idx + 1] : null;
    } catch (e) {
        return null;
    }
}

async function resolveGoogleNewsUrl(googleUrl) {
    const articleId = extractGoogleArticleId(googleUrl);
    if (!articleId) return null;
    try {
        const pageRes = await fetch(`https://news.google.com/articles/${articleId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' }
        });
        if (!pageRes.ok) return null;
        const html = await pageRes.text();
        const $ = cheerio.load(html);
        const div = $('c-wiz > div').first();
        const signature = div.attr('data-n-a-sg');
        const timestamp = div.attr('data-n-a-ts');
        const base64Str = div.attr('data-n-a-id');
        if (!signature || !timestamp || !base64Str) return null;

        const innerPayload = JSON.stringify([
            'garturlreq',
            [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1],
                'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
            base64Str,
            Number(timestamp),
            signature
        ]);
        const freq = JSON.stringify([[['Fbv4je', innerPayload, null, 'generic']]]);

        const rpcRes = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
            },
            body: `f.req=${encodeURIComponent(freq)}`
        });
        if (!rpcRes.ok) return null;
        const text = await rpcRes.text();
        const lines = text.split('\n\n');
        if (lines.length < 2) return null;
        const parsed = JSON.parse(lines[1]);
        const inner = JSON.parse(parsed[0][2]);
        const realUrl = inner && inner[1];
        if (realUrl && /^https?:\/\//i.test(realUrl) && !/(^|\.)google\.com$/i.test(new URL(realUrl).hostname)) {
            return realUrl;
        }
        return null;
    } catch (e) {
        return null;
    }
}

/* 이미지/요약이 구글 자체(뉴스 리다이렉트 실패로 구글 페이지에 머문 경우) 값인지 걸러내는 안전장치.
   URL 디코딩이 실패하더라도, 최소한 "구글 아이콘 + 구글 홍보문구"가 사진/요약으로 노출되는
   최악의 상황만은 절대 발생하지 않도록 함 */
function isGoogleOwnedImage(url) {
    try {
        const host = new URL(url).hostname.toLowerCase();
        return host === 'google.com' || host.endsWith('.google.com') ||
            host === 'gstatic.com' || host.endsWith('.gstatic.com') ||
            host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com');
    } catch (e) {
        return false;
    }
}
const GOOGLE_BOILERPLATE_RE = /aggregated from sources all over the world by google news/i;

/* 기사 원문 페이지에서 대표 이미지(og:image)와 실제 요약(og:description)을 함께 가져옴.
   ⭐️ 구글 뉴스 RSS의 description은 실제 기사 요약이 아니라 "관련기사 링크 목록" HTML이라
   그대로 쓰면 깨진 문자열이 노출됨 → 원문 페이지의 메타 설명으로 완전히 대체함.
   실패해도 조용히 빈 값을 반환해서 전체 수집이 중단되지 않도록 함 */
async function fetchArticleMeta(url) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' },
            redirect: 'follow',
            signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) return {};
        // 최종적으로 도착한 페이지가 여전히 구글 소유 도메인이면(리다이렉트 실패), 아예 시도하지 않음
        if (isGoogleOwnedImage(res.url)) return {};
        const html = await res.text();
        const $ = cheerio.load(html);

        let image =
            $('meta[property="og:image"]').attr('content') ||
            $('meta[property="og:image:url"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('meta[name="twitter:image:src"]').attr('content') ||
            '';
        image = (image || '').trim();
        if (image.startsWith('//')) image = 'https:' + image;
        if (image && !/^https?:\/\//i.test(image)) image = ''; // 상대경로 등 신뢰할 수 없는 값은 버림
        if (image && isGoogleOwnedImage(image)) image = ''; // 구글 자체 이미지는 절대 사용하지 않음

        let summary =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content') ||
            '';
        summary = stripHtml(summary).slice(0, 160);
        if (GOOGLE_BOILERPLATE_RE.test(summary)) summary = ''; // 구글 뉴스 자체 홍보 문구는 절대 사용하지 않음

        return { image, summary };
    } catch (e) {
        return {};
    }
}

/* 동시에 너무 많은 요청을 보내지 않도록 제한된 동시성으로 처리 */
async function withConcurrency(items, limit, worker) {
    let idx = 0;
    async function run() {
        while (idx < items.length) {
            const cur = idx++;
            await worker(items[cur], cur);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

async function attachArticleMeta(items) {
    console.log(`구글 뉴스 링크 → 실제 언론사 URL 변환 및 썸네일/요약 수집 중... (${items.length}건)`);
    let resolvedOk = 0, imgOk = 0, sumOk = 0;
    await withConcurrency(items, 6, async (item) => {
        let targetUrl = item.url;

        // 구글 뉴스로 감싸진 링크면, 먼저 실제 언론사 URL로 변환을 시도.
        // 성공하면 카드/모달에서 쓰는 url 자체도 실제 언론사 주소로 교체(구글을 한 번 더 거치지 않게 됨).
        if (extractGoogleArticleId(item.url)) {
            const resolved = await resolveGoogleNewsUrl(item.url);
            if (resolved) {
                item.url = resolved;
                targetUrl = resolved;
                resolvedOk++;
            } else {
                // 변환에 실패하면 구글 리다이렉트 페이지 자체를 fetch해봤자 구글 자체 정보만 나오므로
                // 아예 시도하지 않고 건너뜀 (로고 fallback으로 안전하게 떨어짐)
                return;
            }
        }

        const meta = await fetchArticleMeta(targetUrl);
        if (meta.image) { item.image = meta.image; imgOk++; }
        item.summary = meta.summary || '';
        if (meta.summary) sumOk++;
    });
    console.log(`URL 변환 성공: ${resolvedOk}건, 썸네일 확보: ${imgOk}/${items.length}건, 요약 확보: ${sumOk}/${items.length}건`);
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

    await attachArticleMeta(all);

    const fileContent = `/* ⭐️ RESCENE NEWS 데이터 — news_scraper.js 로 자동 생성됨 (${new Date().toISOString()}) */\n\nconst NEWS_DATA = ${JSON.stringify(all, null, 4)};\n`;
    fs.writeFileSync(new URL('./news_data.js', import.meta.url), fileContent, 'utf-8');
    console.log(`완료: ${all.length}건을 news_data.js 에 저장했습니다.`);
}

main().catch(err => {
    console.error('뉴스 수집 중 오류 발생:', err);
    process.exit(1);
});
