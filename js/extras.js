function renderLiveRelease() {
    const fmt = d => d ? d.replace(/-/g, '.') : 'TBA';
    const facts = document.getElementById('lrFacts');
    if (facts && typeof FANDOM_INFO !== 'undefined') {
        facts.innerHTML = FANDOM_INFO.map(f => `<div class="lr-fact"><span class="lr-fact-k">${f.k}</span><span class="lr-fact-v">${f.v}</span></div>`).join('');
    }
    const con = document.getElementById('lrConcerts');
    if (con && typeof CONCERT_DATA !== 'undefined') {
        con.innerHTML = CONCERT_DATA.map(c => `<li><span class="lr-date">${fmt(c.date)}</span><span class="lr-title">${c.title}</span>${c.note ? `<span class="lr-note">${c.note}</span>` : ''}</li>`).join('');
    }
    const rel = document.getElementById('lrReleases');
    if (rel && typeof RELEASE_DATA !== 'undefined') {
        rel.innerHTML = RELEASE_DATA.map(r => `<li class="${r.upcoming ? 'lr-up' : ''}"><span class="lr-date">${fmt(r.date)}</span><span class="lr-title">${r.title}</span><span class="lr-note">${r.upcoming ? 'COMING SOON · ' : ''}${r.type}</span></li>`).join('');
    }
}
document.addEventListener('DOMContentLoaded', renderLiveRelease);
