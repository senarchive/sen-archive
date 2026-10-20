import fs from 'fs';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OUTPUT_DIR = 'js/video_extras'; // vid 첫 글자별 조각 파일 (예: js/video_extras/A.json)
const COMMENTS_PER_ORDER = 100;
const REQUEST_DELAY_MS = 120;

function extractVideoIds(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const text = fs.readFileSync(filePath, 'utf-8');
    const ids = new Set();
    const re = /"vid"\s*:\s*"([a-zA-Z0-9_-]{6,15})"/g;
    let m;
    while ((m = re.exec(text)) !== null) ids.add(m[1]);
    return Array.from(ids);
}

async function fetchJson(url) {
    const res = await fetch(url);
    const data = await res.json();
    return { ok: res.ok, data };
}

async function fetchStatsAndLiveStatus(ids) {
    const result = {};
    for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const url = `https://www.googleapis.com/youtube/v3/videos`
            + `?part=statistics,liveStreamingDetails&id=${chunk.join(',')}&key=${YOUTUBE_API_KEY}`;
        const { ok, data } = await fetchJson(url);
        if (!ok) {
            console.warn(`⚠️ videos.list 실패: ${data && data.error && data.error.message}`);
            continue;
        }
        for (const item of (data.items || [])) {
            const commentCount = item.statistics && item.statistics.commentCount != null
                ? parseInt(item.statistics.commentCount, 10) : null;
            const details = item.liveStreamingDetails;
            let liveStatus = 'none';
            if (details) liveStatus = details.activeLiveChatId ? 'live' : 'ended';
            result[item.id] = { commentCount, liveStatus };
        }
        await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
    }
    return result;
}

async function fetchComments(vid, order) {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads`
        + `?part=snippet&videoId=${encodeURIComponent(vid)}`
        + `&maxResults=${COMMENTS_PER_ORDER}&order=${order}&textFormat=plainText&key=${YOUTUBE_API_KEY}`;
    const { ok, data } = await fetchJson(url);
    if (!ok) {
        const reason = data && data.error && data.error.errors && data.error.errors[0] && data.error.errors[0].reason;
        return { items: [], disabled: reason === 'commentsDisabled', failed: reason !== 'commentsDisabled' };
    }
    const items = (data.items || []).map(it => {
        const s = it.snippet.topLevelComment.snippet;
        return {
            authorDisplayName: s.authorDisplayName,
            authorProfileImageUrl: s.authorProfileImageUrl,
            textOriginal: s.textOriginal || s.textDisplay,
            likeCount: s.likeCount || 0,
            publishedAt: s.publishedAt
        };
    });
    return { items, disabled: false, failed: false };
}

function loadExisting() {
    const out = {};
    if (!fs.existsSync(OUTPUT_DIR)) return out;
    for (const f of fs.readdirSync(OUTPUT_DIR)) {
        if (!f.endsWith('.json')) continue;
        try { Object.assign(out, JSON.parse(fs.readFileSync(`${OUTPUT_DIR}/${f}`, 'utf-8'))); } catch (e) { }
    }
    return out;
}

async function main() {
    if (!YOUTUBE_API_KEY) {
        console.error('❌ YOUTUBE_API_KEY 환경변수가 없습니다.');
        process.exit(1);
    }

    const ids = new Set([
        ...extractVideoIds('js/shorts_data.js'),
        ...extractVideoIds('js/contents_data.js'),
        ...extractVideoIds('js/event_data.js'),
        ...extractVideoIds('js/live_data.js'),
        ...extractVideoIds('js/album_content_data.js'),
        ...extractVideoIds('js/music_show_data.js')
    ]);
    const old = loadExisting();
    const idList = Array.from(ids);
    console.log(`🎬 총 ${idList.length}개 영상 대상으로 통계/댓글 캐싱 시작...`);

    const statsMap = await fetchStatsAndLiveStatus(idList);
    console.log('✅ 통계/라이브 상태 수집 완료');

    const output = {};
    for (let i = 0; i < idList.length; i++) {
        const vid = idList[i];
        console.log(`[${i + 1}/${idList.length}] ${vid} 댓글 수집 중...`);

        const relevance = await fetchComments(vid, 'relevance');
        await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
        const time = await fetchComments(vid, 'time');
        await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));

        // API 오류(쿼터 초과 등)로 실패했고 이전 데이터가 있으면 기존 데이터를 유지
        if ((relevance.failed || time.failed) && old[vid]) { output[vid] = old[vid]; continue; }

        output[vid] = {
            commentCount: (statsMap[vid] && statsMap[vid].commentCount) ?? null,
            liveStatus: (statsMap[vid] && statsMap[vid].liveStatus) || 'none',
            commentsDisabled: relevance.disabled || time.disabled,
            comments: {
                relevance: relevance.items,
                time: time.items
            }
        };
    }

    const shards = {};
    for (const [vid, entry] of Object.entries(output)) {
        const key = vid.charAt(0).replace(/[^A-Za-z0-9_-]/g, '_');
        (shards[key] = shards[key] || {})[vid] = entry;
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    for (const f of fs.readdirSync(OUTPUT_DIR)) {
        if (f.endsWith('.json')) fs.unlinkSync(`${OUTPUT_DIR}/${f}`);
    }
    for (const [key, obj] of Object.entries(shards)) {
        fs.writeFileSync(`${OUTPUT_DIR}/${key}.json`, JSON.stringify(obj), 'utf-8');
    }
    console.log(`✅ 저장 완료: ${OUTPUT_DIR}/ (영상 ${idList.length}개, 조각 ${Object.keys(shards).length}개)`);
}

main().catch(e => {
    console.error('❌ 치명적 오류:', e);
    process.exit(1);
});
