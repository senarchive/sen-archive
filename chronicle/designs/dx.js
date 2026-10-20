/* shared story model for all designs (depends on rc.js) */
(()=>{const R=window.RC;const D=window.DX={R};
const G={runaway:['run'],prettygirl:['win','aw']};
D.story=R.chapters.map(c=>({...c,groups:(G[c.id]||[]).map(k=>R.sec(k)),
 photos:c.id==='pulse'?R.pulse.pics.map((p,i)=>({src:R.img(p),cap:String(i+1).padStart(2,'0')})):
  [{src:R.img(c.cover),cap:c.title,cv:1},{src:R.img(c.group),cap:'단체'}].concat((c.mem||[]).map(m=>({src:R.img(m.img),cap:m.n,m:1}))) }));
D.story.push({id:'margins',n:'09',c:['#ffd1a8','#ff8fb4'],title:'In the Margins',meta:'여백 · 광고 · 화보 · 홍보대사',caption:'연표에 다 못 적은 것들을 여백에 모아 뒀어요.',body:[],events:[],groups:['ad','amb','pic'].map(k=>R.sec(k)),photos:[],margins:R.margins});
D.chap=id=>D.story.find(c=>c.id===id);
D.items=()=>R.sections.flatMap(s=>s.items.map(i=>({...i,sec:s.k,secKr:s.kr})));
D.card=(it,cls='card',o={})=>{const inner=`${R.thumb(it)}<span class="cap"><i class="d">${R.md(it.d)}</i><b>${it.t}</b>${it.p?`<small>${it.p}</small>`:''}</span>`;return R.wrapLink(it,cls,inner)};
D.mvbars=c=>(c.mvs||[]).map(m=>`<div class="mv"><span>${m.n}</span><em><u style="--w:${(m.v/R.mvMax*100).toFixed(1)}%"></u></em><b data-count="${m.v}">${R.fmt(m.v)}</b></div>`).join('');
D.chartSVG=(w=520,h=170,col='#fff',txt='#999')=>{const {X,Y,pts}=R.chartPath(w,h,26);const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
 return `<svg viewBox="0 0 ${w} ${h}" class="rk" role="img" aria-label="멜론 TOP100 28위에서 1위"><path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="rkp"/>${R.chart.map((c,i)=>`<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="5" fill="${col}"/><text x="${pts[i][0]}" y="${pts[i][1]+(c.r<3?-12:22)}" text-anchor="middle" fill="${txt}" font-size="12" font-family="JetBrains Mono,monospace">${R.md(c.d)} ${c.l}</text>`).join('')}</svg>`};
D.boot=(o={})=>{const s=document.createElement('style');s.textContent=R.thumbCSS;document.head.appendChild(s);requestAnimationFrame(()=>{R.reveal(o.reveal||'[data-r]');R.counts();document.querySelectorAll('.rkp').forEach(p=>{p.style.strokeDasharray=1;p.style.strokeDashoffset=1;p.style.transition='stroke-dashoffset 2s ease';new IntersectionObserver((e,io)=>{if(e[0].isIntersecting){p.style.strokeDashoffset=0;io.disconnect()}}).observe(p)})})};
D.foot='리센느(RESCENE)를 좋아하는 팬이 만든 비공식 연대기';
D.pulseSched=()=>R.pulse.sched.map(([d,t])=>`<li><b>${R.md(d)}</b><span>${t}</span></li>`).join('');
D.head='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&family=Pinyon+Script&family=JetBrains+Mono:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap">';
D.tags=c=>c.margins?c.margins.map(([h,l])=>`<div class="tg"><h4>${h}</h4><p>${l.map(x=>`<span>${x}</span>`).join('')}</p></div>`).join(''):'';
})();
(()=>{const D=window.DX,R=D.R;
D.body=c=>(c.body||[]).map(p=>`<p>${p}</p>`).join('');
D.ev=c=>(c.events&&c.events.length?`<ul class="ev">${c.events.map(e=>`<li class="${e.s?'s':''}"><b>${e.d}</b><span>${e.t}</span></li>`).join('')}</ul>`:'');
D.ph=(c,cls='ph')=>c.photos.map(p=>`<figure class="${cls}${p.cv?' cv':''}${p.m?' mm':''}"><img src="${p.src}" alt="" loading="eager" decoding="async"><figcaption>${p.cap}</figcaption></figure>`).join('');
D.grp=(c,fn,wrap='grid')=>c.groups.map(g=>`<div class="grp g-${g.k}"><h3><span>${g.kr}</span><em>${g.en}</em></h3><p class="lede">${g.lede}</p><div class="${wrap}">${g.items.map(i=>fn?fn(i):D.card(i)).join('')}</div></div>`).join('');
D.extra=c=>c.id==='runaway'?`<div class="chartbox">${D.chartSVG(520,170,'currentColor','currentColor')}</div>`:c.id==='pulse'?`<ol class="sched">${D.pulseSched()}</ol>`:c.margins?D.tags(c):'';
D.hero=()=>({days:R.sinceDebut,stats:R.stats,intro:R.intro});
D.statsHTML=(cls='st')=>R.stats.map(s=>`<div class="${cls}"><b data-count="${s.v}" data-suf="${s.suf}">${R.fmt(s.v)}${s.suf}</b><span>${s.l}</span></div>`).join('');
})();
