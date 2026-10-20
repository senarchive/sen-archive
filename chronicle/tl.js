/* chronological timeline model: one stream, month by month */
(()=>{const R=window.RC;const T=window.TL={R};
const re=/^(\d{4})\.(\d{2})(?:\.(\d{2}))?$/;
const iso=d=>{const m=re.exec(d);return m?`${m[1]}-${m[2]}-${m[3]||'00'}`:null};
const chOf=id=>R.chapters.find(c=>c.id===id);
const eraDate=c=>{const m=/(\d{4})\.(\d{2})\.(\d{2})/.exec(c.meta);return m?`${m[1]}-${m[2]}-${m[3]}`:'2024-03-26'};
const items=[];
// era markers
R.chapters.forEach(c=>items.push({type:'era',iso:eraDate(c),ord:0,ch:c,title:c.title,p:c.caption,img:c.group,cover:c.cover}));
// section items (media cards)
const secIso=new Set();
R.sections.forEach(s=>s.items.forEach(i=>{const d=i.d.length===7?i.d+'-00':i.d;secIso.add(d);items.push({type:'card',iso:d,ord:2,sec:s.k,secKr:s.kr,secEn:s.en,title:i.t,p:i.p,img:i.img,vid:i.vid,tag:i.tag,logo:i.logo,stat:i.stat,home:i.home,note:i.note})}));
// chapter events as ticks
const era=(iso)=>{let cur=R.chapters[0];R.chapters.forEach(c=>{if(eraDate(c)<=iso)cur=c});return cur};
R.chapters.forEach(c=>(c.events||[]).forEach(e=>{const d=iso(e.d);if(!d)return;if(secIso.has(d)&&!e.s)return;if(e.s&&d===eraDate(c)&&/발매|데뷔/.test(e.t)){/* shown by era marker */ items.push({type:'ms',iso:d,ord:1,ch:c,title:e.t});return}items.push({type:'tick',iso:d,ord:1,ch:c,title:e.t,hot:!!e.s})}));
// pulse schedule
R.pulse.sched.forEach(([d,t])=>items.push({type:'tick',iso:d,ord:1,ch:chOf('pulse'),title:t,future:d>R.todayISO,hot:d===R.pulse.date}));
items.sort((a,b)=>a.iso<b.iso?-1:a.iso>b.iso?1:a.ord-b.ord);
T.items=items;
T.eraAt=era;
// group by month
const months=[];items.forEach(i=>{const k=i.iso.slice(0,7);let m=months[months.length-1];if(!m||m.key!==k){m={key:k,y:+k.slice(0,4),mo:+k.slice(5),items:[]};months.push(m)}m.items.push(i);i.ch=i.ch||era(i.iso)});
T.months=months;
T.MON=['','JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
T.day=i=>i.iso.endsWith('-00')?'':i.iso.slice(8);
T.dplus=iso=>R.dp(iso.endsWith('-00')?iso.slice(0,8)+'01':iso);
T.rankItem=i=>i.iso==='2026-06-01';
T.thumb=i=>R.thumb(i);
T.link=(i,cls,inner)=>R.wrapLink(i,cls,inner);
T.boot=()=>{const s=document.createElement('style');s.textContent=R.thumbCSS;document.head.appendChild(s);R.refreshOnLoad&&0};
})();
