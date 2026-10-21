/* RESCENE chronicle — shared data + helpers (all designs read from window.RC) */
(function(){
const R=window.RC={};
R.IMG='img/';
R.reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
R.DEBUT='2024-03-26';
const day=(d)=>Math.floor(Date.parse(d+'T00:00:00Z')/864e5);
const nowD=(()=>{const n=new Date();return Math.floor(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/864e5)})();
R.today=nowD;
R.dp=d=>day(d)-day(R.DEBUT)+1;
R.fd=d=>d.replace(/-/g,'.');
R.md=d=>d.slice(5).replace('-','.');
R.yt=v=>'https://www.youtube.com/watch?v='+v;
R.sinceDebut=nowD-day(R.DEBUT)+1;
R.toPulse=day('2026-11-03')-nowD;
R.fmt=n=>Number(n).toLocaleString('en-US');
R.img=n=>R.IMG+n+(/\.(svg|png|webp|jpg)$/.test(n)?'':'.webp');

/* ---------- members ---------- */
R.members=[
 {k:'woni',n:'원이',en:'WONI',home:'거제',role:'리더'},
 {k:'liv',n:'리브',en:'LIV',home:'수원'},
 {k:'minami',n:'미나미',en:'MINAMI',home:'일본'},
 {k:'may',n:'메이',en:'MAY',home:'고양'},
 {k:'zena',n:'제나',en:'ZENA',home:'경주'}
];

/* ---------- chapters (scent journal) ---------- */
const E=(d,t,s)=>({d,t,s:s?1:0});
R.chapters=[
 {id:'prologue',n:'00',c:['#ffc2dd','#b9a4ff'],era:'debut',cover:'logo.png',group:'g_debut',scent:['이름에 담긴 향','scene + scent'],
  title:'Scene + Scent',meta:'Prologue · 이름에 담긴 향',
  caption:'리센느(RESCENE)라는 이름은 향기로 다시(RE) 장면(SCENE)을 떠올린다는 뜻이에요.',
  body:['향기가 오래된 기억을 불러내는 프루스트 효과에서 영감을 얻어, 앨범마다 하나의 향을 정하고 그 향을 음악으로 풀어내요.','공식 로고에는 É가 붙은 RESCÉNE로 적혀 있어요. "리씬"으로 읽히지 않게 하려는 장치예요.','이 연대기는 그 향을 발매 순서대로 따라가요.'],
  events:[E('소속','더뮤즈엔터테인먼트'),E('팬덤','REMINE (리마인)'),E('구성','5인조, 한국 4명 · 일본 1명(미나미)'),E('데뷔','2024.03.26 싱글 1집 Re:Scene',1)]},
 {id:'re-scene',n:'01',c:['#ff9ec4','#c7a6ff'],era:'rescene',cover:'c_rescene',group:'g_rescene',scent:['플로럴','floral'],
  title:'Re:Scene',meta:'N°1 · 싱글 1집 · 2024.03.26',
  caption:'처음 맡은 꽃 향기. 다섯 명이 같은 장면에서 시작했어요.',
  mvs:[{n:'YoYo',d:'2024.02.29',v:8091368},{n:'UhUh',d:'2024.03.26',v:16060073}],
  events:[E('2024.02.29','선공개 싱글 YoYo 발표'),E('2024.03.26','싱글 1집 Re:Scene 발매, 데뷔',1),E('2024.05','코스모폴리탄 코리아 5월호 화보'),E('2024.06.26',"OST 'Counting Star' 발표")]},
 {id:'scenedrome',n:'02',c:['#ffbe5c','#d0623a'],era:'scenedrome',cover:'c_scenedrome',group:'g_scenedrome',scent:['앰버그리스','ambergris'],
  title:'Scenedrome',meta:'N°2 · 미니 1집 · 2024.08.27',
  caption:'바다가 오래 품었다가 내놓는 깊고 따뜻한 향. 이 앨범의 노래 하나는 2026년 여름에 다시 돌아와요.',
  mvs:[{n:'LOVE ATTACK',d:'2024.08.27',v:30049854},{n:'New World',d:'2024.09.12',v:897739},{n:'Pinball',d:'2024.09.21',v:10914027}],
  events:[E('2024.08.16','YoYo 일본어 버전 발표'),E('2024.08.27','미니 1집 SCENEDROME 발매 · LOVE ATTACK',1),E('2024.10.01','라이브 방송 5시간 22분, 다음 날 새벽 4시경 종료'),E('2024.11.02','아시아 모델 어워즈 라이징스타상'),E('2024.12.04','UhUh 일본어 버전 발표')]},
 {id:'glowup',n:'03',c:['#7fdcff','#b9c9ff'],era:'glowup',cover:'c_glowup',group:'g_glowup',scent:['비누','soap'],
  title:'Glow Up',meta:'N°3 · 미니 2집 · 2025.02.05',
  caption:'갓 씻은 것처럼 깨끗한 비누 향. 제나의 7시간 16분짜리 라이브로 시작한 해예요.',
  mvs:[{n:'Glow Up',d:'2025.02.05',v:15755234}],
  events:[E('2025.01.18','제나의 라이브 7시간 16분, 팀 역대 최장 기록',1),E('2025.02.05','미니 2집 Glow Up 발매',1),E('2025.02.11','한국청소년연맹 홍보대사 (12월 말까지)'),E('2025.02.17','Glow Up 영어 버전 발표'),E('2025.05','BEAUTY+ 5월호 화보')]},
 {id:'dearest',n:'04',c:['#8be37c','#2fb3a0'],era:'dearest',cover:'c_dearest',group:'g_dearest',scent:['비에 젖은 풀잎','wet grass'],
  title:'Dearest',meta:'N°4 · 싱글 2집 · 2025.07.02',
  caption:'비 온 뒤 풀잎에 맺힌 물기 같은 향. 팬 콘서트가 이어진 여름과 가을이에요.',
  mvs:[{n:'Deja Vu',d:'2025.07.02',v:24384582}],
  events:[E('2025.06.12',"OST '밤밤밤' 발표"),E('2025.07.02','싱글 2집 Dearest 발매 · Deja Vu',1),E('2025.07.09','Dearest (Sped Up Version) 발표'),E('2025.08','GS25와 편의점 가이드북 〈야호(YAHO)〉 출시'),E('2025.08.09','팬 콘서트 Project 326',1),E('2025.08.28','뉴시스 한류엑스포 한류특별상'),E('2025.09.17',"OST '고백주파수' 발표"),E('2025.10.03','팬 콘서트 RE:MIND',1)]},
 {id:'lipbomb',n:'05',c:['#ff5c8a','#a64bf0'],era:'lipbomb',cover:'c_lipbomb',group:'g_lipbomb',scent:['베리','berry'],
  title:'lip bomb',meta:'N°5 · 미니 3집 · 2025.11.25',
  caption:'톡 터지는 베리 향. 해가 바뀌면서 일본어 싱글과 협업 곡까지, 활동 폭이 넓어졌어요.',
  mvs:[{n:'Heart Drop',d:'2025.11.06',v:18964600},{n:'Bloom',d:'2025.11.25',v:27578566}],
  events:[E('2025.11.06','선공개 싱글 Heart Drop 발표'),E('2025.11.25','미니 3집 lip bomb 발매 · Bloom',1),E('2026.01.06','대한민국 퍼스트브랜드 대상 여자아이돌(라이징스타)'),E('2026.01.21','일본어 디지털 싱글 ピンボール (Pinball) 발표'),E('2026.02.27',"디지털 싱글 [RESCENE X ???] 'Busy Boy', OST 'Higher' 발표"),E('2026.03.12','Busy Boy (Galantis Remix) 발표')]},
 {id:'runaway',n:'06',c:['#e0c08f','#9a86c9'],era:'runaway',cover:'c_runaway',group:'g_runaway',scent:['인센스','incense'],
  title:'Runaway',meta:'N°6 · 디지털 싱글 · 2026.04.08',
  caption:'은은하게 피어오르는 인센스 향. 원이의 고향 거제와의 인연이 이 봄에 시작돼요.',
  mvs:[{n:'Runaway',d:'2026.04.08',v:22103298}],
  events:[E('2026.04.05',"스페셜 콘서트 '걸그루브'",1),E('2026.04.08','디지털 싱글 Runaway 발매',1),E('2026.05.22','거제시 홍보대사 위촉 (원이의 출생지, 2028년 5월까지)'),E('2026.06','앳스타일 6월호 화보')]},
 {id:'prettygirl',n:'07',c:['#ff7b5c','#ffc34d'],era:'prettygirl',cover:'c_pretty',group:'g_prettygirl',scent:['자몽','grapefruit'],
  title:'Pretty Girl',meta:'N°7 · 스페셜 싱글 · 2026.07.08',
  caption:'상큼한 자몽 향의 여름. 데뷔 841일 만에 첫 음악방송 1위를 안았어요.',
  mvs:[{n:'Pretty Girl',d:'2026.07.08',v:29911246}],
  events:[E('2026.06.24','수원시 홍보대사 (리브의 출생지)'),E('2026.06.29','경주시 홍보대사 (제나의 출생지)'),E('2026.07.02','고양시 홍보대사 (메이의 출생지)'),E('2026.07.08','스페셜 싱글 Pretty Girl 발매',1),E('2026.07.14','더 쇼 1위, 데뷔 첫 음악방송 1위',1),E('2026.07.25','쇼! 음악중심 1위, 첫 지상파 음악방송 1위',1),E('2026.07.26','인기가요 1위 (LOVE ATTACK)'),E('2026.08.15','쇼! 음악중심 트리플 크라운',1),E('2026.08.27','케이 월드 드림 어워즈 베스트 비주얼 콘텐츠상 · 베스트 팬덤상 (공동 수상)'),E('2026.09.01','올해의 브랜드 대상 여자아이돌(핫트렌드)'),E('2026.09.06','SPOTV K-POP 어워즈 GLOBAL CONNECT(공동 수상) · SPOTV AMBASSADOR'),E('2026.09.19','더팩트 뮤직 어워즈 올해의 아티스트(공동 수상) · 투데이스 초이스'),E('2026.09','연예인 최초로 멤버 전원 거제시 명예시민',1),E('2026.10.11','SBS 8뉴스 출연, 역주행 과정 소개')]},
 {id:'pulse',n:'08',c:['#f2f2ff','#7a86ff'],era:'pulse',cover:'pulse_1',group:'pulse_2',scent:['아직 비밀','not yet revealed'],
  title:'Pulse',meta:'N°8 · 미니 4집 · 2026.11.03 발매 예정',
  caption:'아직 맡지 못한 향이에요. 다음 장면은 11월 3일에 열려요.',
  events:[E('2026.11.03','미니 4집 PULSE 발매 예정',1),E('향','공개 전')]}
];
R.chapters.forEach(c=>{c.mem=R.members.map(m=>({k:m.k,n:m.n,en:m.en,img:'m_'+m.k+'_'+(c.era==='pulse'?'prettygirl':c.era)}))});
R.mvAll=R.chapters.flatMap(c=>(c.mvs||[]).map(m=>Object.assign({ch:c.id},m)));
R.mvTotal=R.mvAll.reduce((a,m)=>a+m.v,0);
R.mvMax=Math.max(...R.mvAll.map(m=>m.v));

/* ---------- hero numbers ---------- */
R.intro={days:699,from:'2024-08-27',to:'2026-07-26',song:'LOVE ATTACK',title:'한 곡이 1위가 되기까지',sub:'걸린 시간'};
R.stats=[
 {v:R.sinceDebut,suf:'일째',l:'2024.03.26 데뷔'},
 {v:7,suf:'가지',l:'앨범마다 정해진 향'},
 {v:R.mvTotal,suf:'',l:'MV '+R.mvAll.length+'편 누적 조회수'},
 {v:6,suf:'회',l:'음악방송 1위'}
];

/* ---------- 역주행 ---------- */
R.chart=[{d:'2026-06-01',r:28,l:'28위'},{d:'2026-06-15',r:5,l:'5위'},{d:'2026-07-08',r:1,l:'1위'},{d:'2026-07-13',r:1,l:'일간 1위'}];
R.run=[
 {d:'2026-05-01',t:'하루종일 사투리만 써봤습니다',p:'원이·미나미·제나의 사투리 영상. 안원잘부 채널이 눈에 띄기 시작한 때.',vid:'NS7tSrMrWsc',img:'g_runaway',tag:'사투리'},
 {d:'2026-05-08',t:'구독자 10만 기념 Q&A',p:'5월 8일에는 이미 10만 구독 기념 영상이 올라왔다.',vid:'_AqXSSQ0Cmo',img:'g_glowup',tag:'10만'},
 {d:'2026-05-22',t:'갸루와 거제에 왔습니다 (거제 1편)',p:'원이·미나미의 거제 편이 ‘야호’를 한 번 더 키웠다. 누적 1000만 뷰.',vid:'OrCOflk2QmQ',img:'g_scenedrome',tag:'거제 야호',stat:'1000만 뷰'},
 {d:'2026-05-29',t:'떡상 전 성수나들이 (사투리 2편)',p:'제목 그대로 ‘떡상 전’. 직후인 6월 1일에 멜론 TOP100 28위가 찍힌다.',vid:'JJBf0jCcfrQ',img:'g_dearest',tag:'떡상 직전'},
 {d:'2026-06-05',t:"‘역주행 1등’ 리센느, 거제에서 국빈 대접",p:'거제를 찾은 리센느. 역주행의 한가운데에서.',vid:'xqySvx940PA',img:'g_heartdrop',tag:'거제'},
 {d:'2026-06-26',t:'갑자기 떡상해서 찍는 댓글읽기',p:'떡상 이후 원이·리브·메이가 찍은 댓글 읽기. 그 사이 TOP100은 5위, 1위를 지나갔다.',vid:'xYLNDE4RXsg',img:'g_prettygirl',tag:'떡상 이후'}
];

/* ---------- 음방 1위 ---------- */
R.wins=[
 {d:'2026-07-14',prog:'더 쇼',song:'Pretty Girl',crown:'데뷔 첫 1위',note:'데뷔 841일 · 2년 3개월 19일 만',logo:'aw_theshow.svg',vid:'cltr2QpFEvY',img:'g_prettygirl',n:1},
 {d:'2026-07-25',prog:'쇼! 음악중심',song:'Pretty Girl',crown:'첫 지상파 1위',note:'데뷔 852일 · 2년 4개월 만',logo:'aw_um.svg',img:'g_heartdrop',n:1},
 {d:'2026-07-26',prog:'인기가요',song:'LOVE ATTACK',crown:'발매 699일 만',note:'SBS 인기가요 첫 1위',logo:'aw_sbs.svg',vid:'rzfjou7vPP0',img:'g_scenedrome',n:1},
 {d:'2026-08-08',prog:'쇼! 음악중심',song:'Pretty Girl',crown:'2주 연속',note:'통산 2주 1위',logo:'aw_um.svg',vid:'GB_P2IjKULs',img:'g_prettygirl',n:2},
 {d:'2026-08-15',prog:'쇼! 음악중심',song:'Pretty Girl',crown:'트리플 크라운',note:'통산 3주 1위',logo:'aw_um.svg',img:'g_lipbomb',n:3},
 {d:'2026-08-16',prog:'인기가요',song:'LOVE ATTACK',crown:'2주 연속',note:'통산 2주 1위',logo:'aw_sbs.svg',vid:'_6hFuAlWJ4Y',img:'g_scenedrome',n:2}
];

/* ---------- 시상식 ---------- */
R.awards=[
 {d:'2024-11-02',t:'아시아 모델 어워즈',a:['라이징스타상'],note:'데뷔 첫해 첫 시상',vid:'SGn22S7-JWw',img:'g_scenedrome',logo:null},
 {d:'2025-08-28',t:'제7회 뉴시스 한류엑스포',a:['한류특별상'],note:'',img:'g_dearest',logo:'aw_kexpo.png'},
 {d:'2026-01-06',t:'대한민국 퍼스트브랜드 대상',a:['여자아이돌(라이징스타)'],note:'',img:'g_heartdrop',logo:'aw_first.png'},
 {d:'2026-08-27',t:'케이 월드 드림 어워즈',a:['베스트 비주얼 콘텐츠상','베스트 팬덤상'],note:'2관왕 · 공동 수상',vid:'HVDi_fb5nc8',img:'g_prettygirl',two:1},
 {d:'2026-09-01',t:'올해의 브랜드 대상',a:['여자아이돌(핫트렌드)'],note:'',img:'g_runaway'},
 {d:'2026-09-06',t:'SPOTV K-POP 어워즈',a:['GLOBAL CONNECT','SPOTV AMBASSADOR'],note:'2개 부문 · 공동 수상 포함',vid:'KeGZn740Bso',img:'g_lipbomb',two:1},
 {d:'2026-09-19',t:'더팩트 뮤직 어워즈',a:['올해의 아티스트','투데이스 초이스'],note:'2관왕 · 공동 수상 포함',vid:'Qk_dZCt3NxY',img:'g_prettygirl',two:1}
];

/* ---------- 광고 ---------- */
R.ads=[
 {d:'2026-06-09',t:'넥슨 FC 모바일',k:'게임',img:'ad_fc'},
 {d:'2026-06-26',t:'카사베르디',k:'식품 · 첫 TV CF',vid:'BJlg9RU-xgQ',img:'g_runaway',note:'그레인온 공식 모델'},
 {d:'2026-06-30',t:'엘리트 교복',k:'교복 · 2년 연속',img:'ad_elite'},
 {d:'2026-07-01',t:'CU',k:'편의점',img:'ad_cu',note:'업계 최초 전속 모델 제안'},
 {d:'2026-07-16',t:'도미노피자',k:'식품',img:'ad_domino'},
 {d:'2026-07-21',t:'나랑드 사이다',k:'음료',img:'ad_narang',vid:'HKlm_f-qXdk'},
 {d:'2026-08-18',t:'할리스',k:'커피',vid:'DBhLrwux7Kg',img:'g_prettygirl',note:'창사 이래 첫 광고 모델'},
 {d:'2026-08-24',t:'한스킨',k:'화장품 · 미나미 제나',vid:'rK6UjYOF5gc',img:'g_heartdrop'}
];

/* ---------- 홍보대사 ---------- */
R.amb=[
 {d:'2025-02-11',t:'한국청소년연맹',k:'2025 홍보대사',img:'ad_youth',note:'~2025.12.31'},
 {d:'2026-05-22',t:'거제시',k:'원이의 고향',img:'ad_geoje',vid:'G2Ajw1Po5f8',home:'woni',note:'~2028.05.21'},
 {d:'2026-06-24',t:'수원시',k:'리브의 고향',img:'ad_suwon',vid:'AprhNzAcfdc',home:'liv'},
 {d:'2026-06-29',t:'경주시',k:'제나의 고향',img:'ad_gyeongju',vid:'QHomm66dhL0',home:'zena'},
 {d:'2026-07-02',t:'고양시',k:'메이의 고향',img:'ad_goyang',home:'may'},
 {d:'2026-07-16',t:'캐릭터 라이선싱 페어',k:'2년 연속',img:'ad_charlic'},
 {d:'2026-07-21',t:'섬의 날',k:'행정안전부 주최',img:'ad_island'},
 {d:'2026-07-23',t:'MBC 아시안게임',k:'중계방송',img:'ad_asiangame',vid:'R8flNzqcl1Y'}
];

/* ---------- 화보 ---------- */
R.pics=[
 {d:'2024-05',t:'코스모폴리탄 코리아 5월호',img:'ad_cosmo'},
 {d:'2025-05',t:'BEAUTY+ 5월호',img:'ad_beautyplus'},
 {d:'2026-06',t:'앳스타일 6월호',img:'ad_style'},
 {d:'2026-08',t:'하퍼스 바자 코리아 8월호',img:'ad_harper'},
 {d:'2026-01',t:'하퍼스 바자 코리아 디지털',img:'ad_rang'},
 {d:'2026-01',t:'MIIM · 원이 미나미',img:'ad_miim'}
];

/* ---------- margins (tags) ---------- */
R.margins=[
 ['광고 2026',['I-SHA Wish I-GIRL','WIND AND SEA','넥슨 FC 모바일','카사베르디','엘리트 교복','CU','도미노피자','티오더','나랑드 사이다','Epais','한스킨','할리스','MLB','카카오톡','메가스터디']],
 ['협업',['GS25 가이드북 YAHO','서든어택','김씨네과일','KREAM 굿즈','가우디 특별전','패트와 매트']],
 ['홍보대사',['한국청소년연맹','캐릭터·라이선싱 페어','거제시','수원시','경주시','고양시','저스트 메이크업 IN TOKYO 2027','섬의 날','MBC 아시안게임','한국벤처투자','거제시 명예시민']]
];

/* ---------- pulse ---------- */
R.pulse={date:'2026-11-03',pics:[1,2,3,4,5,6,7].map(i=>'pulse_'+i),
 sched:[['2026-10-12','컴백 프로모션 스케줄러 영상 공개'],['2026-10-13','예약 판매 시작'],['2026-10-19','콘셉트 포토 A 공개'],['2026-10-20','콘셉트 포토 B 공개'],['2026-10-22','콘셉트 트레일러'],['2026-10-23','앨범 디테일 · 트랙리스트'],['2026-10-26','하이라이트 메들리'],['2026-10-27','타이틀 프리뷰'],['2026-10-30','타이틀곡 MV 티저'],['2026-11-03','앨범 발매 · MV 공개 오후 6시 · 쇼케이스 오후 8시']]};
R.todayISO=new Date(Date.UTC(1970,0,1)+nowD*864e5).toISOString().slice(0,10);

/* ---------- helpers ---------- */
/* thumbnail: local photo underneath, YouTube thumbnail on top when it loads */
R.thumb=(it,cls='')=>{
 const loc=it.img?`<img class="b" src="${R.img(it.img)}" alt="" decoding="async">`:'';
 const rem=it.vid?`<img class="t" src="https://i.ytimg.com/vi/${it.vid}/hqdefault.jpg" alt="" referrerpolicy="no-referrer" onload="this.classList.add('ok')" onerror="this.remove()">`:'';
 return `<span class="rc-th ${cls}">${loc}${rem}${it.vid?'<i class="rc-play"></i>':''}</span>`;
};
R.thumbCSS='.rc-th{position:relative;display:block;overflow:hidden;background:linear-gradient(135deg,#241a2c,#40182f)}.rc-th img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}.rc-th img.t{opacity:0;transition:opacity .5s}.rc-th img.t.ok{opacity:1}.rc-play{position:absolute;left:50%;top:50%;width:46px;height:32px;margin:-16px 0 0 -23px;background:#ff2e7e;border-radius:9px;z-index:3;box-shadow:0 8px 22px -6px rgba(255,46,126,.7)}.rc-play::after{content:"";position:absolute;left:18px;top:9px;border-left:11px solid #fff;border-top:7px solid transparent;border-bottom:7px solid transparent}';
R.href=it=>it.vid?R.yt(it.vid):null;
R.wrapLink=(it,cls,inner)=>it.vid?`<a class="${cls}" href="${R.yt(it.vid)}" target="_blank" rel="noopener">${inner}</a>`:`<div class="${cls}">${inner}</div>`;
R.$=(s,r=document)=>r.querySelector(s);
R.$$=(s,r=document)=>[...r.querySelectorAll(s)];
/* reveal: adds .in when an element enters the viewport */
R.reveal=(sel='[data-r]',opt={})=>{
 const els=R.$$(sel);
 if(R.reduce||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:opt.margin||'0px 0px -8% 0px',threshold:opt.threshold||0.05});
 els.forEach(e=>io.observe(e));
};
/* count-up for [data-count] (data-count=value, data-suf, data-dec, data-pre) */
R.counts=(sel='[data-count]')=>{
 const run=el=>{const to=+el.dataset.count,dec=+(el.dataset.dec||0),pre=el.dataset.pre||'',suf=el.dataset.suf||'',fmt=el.dataset.nofmt?(n=>n.toFixed(dec)):(n=>dec?n.toFixed(dec):R.fmt(Math.round(n)));
  const set=n=>{el.textContent=pre+fmt(n)+suf};
  if(R.reduce){set(to);return}
  const t0=performance.now(),dur=+(el.dataset.dur||1600);
  const step=t=>{const k=Math.min(1,(t-t0)/dur);set(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};
  requestAnimationFrame(step)};
 const els=R.$$(sel);
 if(R.reduce||!('IntersectionObserver' in window)){els.forEach(el=>{const to=+el.dataset.count;el.textContent=(el.dataset.pre||'')+(el.dataset.dec?to.toFixed(+el.dataset.dec):R.fmt(to))+(el.dataset.suf||'')});return}
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target)}}),{threshold:.3});
 els.forEach(e=>io.observe(e));
};
/* rAF-throttled scroll callback: cb(y, progress 0..1, maxScroll) */
R.onScroll=cb=>{let t=0;const f=()=>{t=0;const m=Math.max(1,document.documentElement.scrollHeight-innerHeight);cb(scrollY,Math.min(1,scrollY/m),m)};
 addEventListener('scroll',()=>{if(!t)t=requestAnimationFrame(f)},{passive:true});addEventListener('resize',f);f()};
/* progress of an element through the viewport: 0 when its top hits the bottom edge, 1 when its bottom hits the top edge */
R.prog=el=>{const r=el.getBoundingClientRect();return Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)))};
R.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ensure ScrollTrigger measures again after every image settles (prevents stale pin positions) */
R.refreshOnLoad=()=>{if(!window.ScrollTrigger)return;let t=0;const f=()=>{clearTimeout(t);t=setTimeout(()=>ScrollTrigger.refresh(),120)};
 R.$$('img').forEach(i=>{if(!i.complete)i.addEventListener('load',f,{once:true})});addEventListener('load',f);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(f)};
/* ---------- unified story sections (every design renders these) ---------- */
const N={
 run:x=>({d:x.d,t:x.t,p:x.p,img:x.img,vid:x.vid,tag:x.tag,stat:x.stat||''}),
 win:x=>({d:x.d,t:x.prog+' · '+x.song,p:x.crown+' · '+x.note,img:x.img,vid:x.vid,tag:x.prog,logo:x.logo,stat:x.n+'th'.slice(0,0)+(x.n>1?'':'')}),
 aw:x=>({d:x.d,t:x.t,p:x.a.join(' · '),note:x.note,img:x.img,vid:x.vid,tag:x.two?'2 AWARDS':'AWARD',logo:x.logo}),
 ad:x=>({d:x.d,t:x.t,p:x.k+(x.note?' · '+x.note:''),img:x.img,vid:x.vid,tag:x.k}),
 amb:x=>({d:x.d,t:x.t,p:x.k+(x.note?' · '+x.note:''),img:x.img,vid:x.vid,tag:x.home?'HOMETOWN':'AMBASSADOR',home:x.home}),
 pic:x=>({d:x.d,t:x.t,p:'화보',img:x.img,tag:'PICTORIAL'})
};
R.sections=[
 {k:'run',kr:'역주행',en:'the way back up',lede:'발매 2년이 다 되어 가던 LOVE ATTACK. 또 다시 차트인을 하다.',data:R.run},
 {k:'win',kr:'음방 1위',en:'six trophies',lede:'2년 3개월을 기다린 첫 트로피. 이후 두 곡이 쌓은 음악방송 1위는 여섯 번.',data:R.wins},
 {k:'aw',kr:'시상식',en:'on stage',lede:'트로피는 이어졌다. 8월 말부터 9월 중순까지 네 곳의 시상식에서 일곱 개 부문.',data:R.awards},
 {k:'ad',kr:'광고',en:'the new face',lede:'역주행의 열기는 광고판으로 번졌다. 6월 26일 카사베르디부터 7월 21일 나랑드 사이다까지, 한 달 안에 다섯 곳.',data:R.ads},
 {k:'amb',kr:'홍보대사',en:'hometown calls',lede:'‘거제 야호’가 번지자 도시들이 먼저 손을 내밀었다. 거제·수원·고양·경주는 모두 멤버들의 고향이다.',data:R.amb},
 {k:'pic',kr:'화보',en:'in print',lede:'지면 위의 리센느.',data:R.pics}
];
R.sections.forEach(s=>{s.items=s.data.map(N[s.k]);s.n=s.items.length});
R.sec=k=>R.sections.find(s=>s.k===k);
R.memberHome=k=>(R.members.find(m=>m.k===k)||{}).home;
R.chartPath=(w,h,pad=0)=>{const x0=Date.parse('2026-05-28'),x1=Date.parse('2026-07-16');const X=d=>pad+(Date.parse(d)-x0)/(x1-x0)*(w-pad*2),Y=r=>pad+(r-1)/29*(h-pad*2);return {X,Y,pts:R.chart.map(c=>[X(c.d),Y(c.r)])}};
})();
