import fs from 'fs';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const OUTPUT_PATH = 'js/video_extras_data.json';
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
        return { items: [], disabled: reason === 'commentsDisabled' };
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
    return { items, disabled: false };
}

async function main() {
    if (!YOUTUBE_API_KEY) {
        console.error('❌ YOUTUBE_API_KEY 환경변수가 없습니다.');
        process.exit(1);
    }

    const ids = new Set([
        ...extractVideoIds('js/shorts_data.js'),
        ...extractVideoIds('js/contents_data.js')
    ]);
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

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output), 'utf-8');
    console.log(`✅ 저장 완료: ${OUTPUT_PATH} (영상 ${idList.length}개)`);
}

main().catch(e => {
    console.error('❌ 치명적 오류:', e);
    process.exit(1);
});
