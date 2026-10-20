/* 팬 제작 사이트 모음 — 동글 아이콘 1렬 */
const FAN_SITES = [
    { name: '센플릭스', desc: '리센느 영상 모아보기, 일정 참고, 차트, 뉴스 등 정리된 사이트', url: 'https://adam-yam.github.io/SCENE-FLIX/', c: '#E50914' },
    { name: '음원총공팀', desc: '리센느 음원총공팀 웹페이지 — 총공, 투표 관련 각종 가이드 및 안내사항', url: 'https://rescene.stream/', c: '#FF4D94' },
    { name: '팬에디션', desc: '조회수 예측기, 미니게임(콘텐츠 월드컵·회전문 뽑기·얼굴맞추기·조회수 업다운·포카뽑기), 앨범/포카/굿즈 컬렉션 북', url: 'https://scene-simulation.github.io/?tab=home', c: '#9AA6FF' },
    { name: '카드가챠', desc: '리센느 카드가챠, 노래맞추기', url: 'https://rescene.parrot.ai.kr/', c: '#26c6da' },
    { name: '음원순위', desc: 'Rescene 음원순위 추적기', url: 'https://woniwoniwoniwoni.github.io/rescene-record/', c: '#66bb6a' },
    { name: 'MMA 투표', desc: 'MMA top 10 투표 트래커', url: 'https://woniwoniwoniwoni.github.io/mma-vote-tracker/', c: '#ffa726' },
    { name: '안원잘부몰', desc: '안원잘부몰', url: 'https://helloiamwoni.com/', c: '#ec407a' },
    { name: '레미니스토어', desc: '레미니스토어', url: 'https://reministore.com/', c: '#7e57c2' },
    { name: '리센느맵', desc: '리센느가 유튜브 등에서 방문했던 장소들을 지도에 표시', url: 'https://rescene-map.vercel.app/?place=145', c: '#29b6f6' }
];

function renderFanSites() {
    const row = document.getElementById('fanSitesRow');
    if (!row) return;
    row.innerHTML = FAN_SITES.map(function (s) {
        const host = s.url.replace(/^https?:\/\//, '').split('/')[0];
        const fav = 'https://www.google.com/s2/favicons?domain=' + host + '&sz=128';
        return '<a class="fs-item" href="' + s.url + '" target="_blank" rel="noopener noreferrer" title="' + s.desc.replace(/"/g, '&quot;') + '" style="--fs-c:' + s.c + ';">' +
            '<span class="fs-circle"><span class="fs-glyph">' + s.name.charAt(0) + '</span>' +
            '<img src="' + fav + '" alt="" loading="lazy" onload="if(this.naturalWidth>16)this.classList.add(\'ok\')" onerror="this.remove()"></span>' +
            '<span class="fs-name">' + s.name + '</span></a>';
    }).join('');
}
document.addEventListener('DOMContentLoaded', renderFanSites);
