const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const rj=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},wj=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PK='skycast.prefs',CK='skycast.cache';
let pf=Object.assign({units:'c',fav:[],recent:[],last:null},rj(PK,{})),cur=null,data=null,ctl=null,clk=null,sugg=[],sel=-1;
const same=(a,b)=>Math.abs(a.lat-b.lat)<.01&&Math.abs(a.lon-b.lon)<.01,isF=()=>pf.units==='f';
const T=c=>Math.round(isF()?c*9/5+32:c)+'°',W=k=>isF()?Math.round(k*.621)+' mph':Math.round(k)+' km/h',V=k=>isF()?(k*.621).toFixed(1)+' mi':(k<10?k.toFixed(1):Math.round(k))+' km';
const card=d=>['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8],uvL=u=>u<3?'Low':u<6?'Moderate':u<8?'High':u<11?'Very high':'Extreme';
const fmt=(ts,off,o)=>new Date((ts+off)*1000).toLocaleTimeString([],{...o,timeZone:'UTC'});

/* Sky palettes: [top, bottom]; dark skies switch the text to cream */
const SKY={'clear-day':['#F5F0E1','#B7C57A'],'partly-day':['#EFEBDD','#B5BFA3'],'clouds-day':['#E2E0D4','#A3AC9F'],'rain-day':['#C7CFC4','#8C9A8E'],'drizzle-day':['#D3D9CD','#9DA89E'],'storm-day':['#3B433D','#1B201C'],'snow-day':['#F5F0E1','#D3D7CE'],'fog-day':['#DEDCD0','#B0B3A9'],
 'clear-night':['#10180F','#24402F'],'partly-night':['#151B17','#2C3A30'],'clouds-night':['#1B201C','#38413A'],'rain-night':['#131915','#2A352E'],'drizzle-night':['#151B17','#2E3A32'],'storm-night':['#0E120F','#2A302B'],'snow-night':['#1B201C','#3A453D'],'fog-night':['#1E231F','#464E47']};

/* Icons */
const CL='<path class="cl" d="M7 17.5a3.5 3.5 0 0 1-.4-7A5 5 0 0 1 16.2 9.6 4 4 0 0 1 17 17.5z"/>';
const IC={sun:'<g class="spin"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></g>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',clouds:CL,
 partly:'<g class="spin"><circle cx="8" cy="7.5" r="2.8"/><path d="M8 1.8v1.2M2.3 7.5h1.2M3.9 3.4l.8.8M12.1 3.4l-.8.8"/></g>'+CL,
 rain:CL+'<path class="drop" d="M8 19.5l-.8 2.2M12 19.5l-.8 2.2M16 19.5l-.8 2.2"/>',drizzle:CL+'<path class="drop" d="M9 19.5l-.6 1.8M14 19.5l-.6 1.8"/>',
 snow:CL+'<g class="drop"><circle cx="8" cy="20.5" r=".7"/><circle cx="12" cy="21.5" r=".7"/><circle cx="16" cy="20.5" r=".7"/></g>',
 storm:CL+'<path class="bolt" d="M12.8 15l-2.6 3.6h3.2l-2.2 3.6"/>',fog:'<path d="M4 8h16M6 12h14M4 16h16M7 20h11"/>'};
const icon=(c,day,s)=>`<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[c==='clear'?(day?'sun':'moon'):c==='partly'&&!day?'clouds':c]}</svg>`;
const label=(c,day)=>c==='clear'&&!day?'Clear night':LABEL[c];

/* Weather effects (rain, snow, stars) */
const cv=$('#fx'),cx=cv.getContext&&cv.getContext('2d');let mode='',P=[],raf;
const size=()=>{cv.width=innerWidth;cv.height=innerHeight};size();addEventListener('resize',size);
function fx(c,day){if(!cx)return;mode=['rain','storm','drizzle'].includes(c)?'rain':c==='snow'?'snow':c==='clear'&&!day?'stars':'';
 const n=mode==='rain'?(c==='drizzle'?70:150):mode==='snow'?90:mode==='stars'?70:0;P=Array.from({length:n},()=>({x:Math.random(),y:Math.random(),s:Math.random()*.6+.4}));
 cancelAnimationFrame(raf);cx.clearRect(0,0,cv.width,cv.height);if(mode&&!rm)loop()}
function loop(){const W=cv.width,H=cv.height;cx.clearRect(0,0,W,H);cx.strokeStyle=cx.fillStyle=document.body.dataset.tone==='dark'?'rgba(245,240,225,.55)':'rgba(47,51,47,.4)';
 P.forEach(p=>{if(mode==='rain'){p.y+=.012*p.s+.008;p.x-=.0015;if(p.y>1){p.y=-.05;p.x=Math.random()}cx.beginPath();cx.moveTo(p.x*W,p.y*H);cx.lineTo(p.x*W-3,p.y*H+14*p.s);cx.stroke()}
  else if(mode==='snow'){p.y+=.002*p.s+.0008;p.x+=Math.sin(p.y*20+p.s*5)*.0007;if(p.y>1){p.y=-.02;p.x=Math.random()}cx.beginPath();cx.arc(p.x*W,p.y*H,1.5+p.s*1.8,0,7);cx.fill()}
  else{cx.globalAlpha=.35+.65*Math.abs(Math.sin(Date.now()/900+p.s*9));cx.beginPath();cx.arc(p.x*W,p.y*H*.7,p.s*1.4,0,7);cx.fill();cx.globalAlpha=1}});
 raf=requestAnimationFrame(loop)}

/* State and errors */
const setState=s=>{$('#load').hidden=s!=='loading';$('#err').hidden=s!=='error';$('#out').hidden=s!=='ready'};
const newCtl=()=>{if(ctl)ctl.abort();return ctl=new AbortController()};
function errMsg(e){return e.msg||(e.timeout?'The weather service took too long to respond.':e.status===401?'The OpenWeatherMap API key was rejected. Check js/config.js (new keys can take up to two hours to activate).':e.status===429?'Too many requests right now. Please try again in a minute.':(!navigator.onLine||e.name==='TypeError')?'You appear to be offline. Check your connection and try again.':e.nf?`We couldn't find "${e.q}". Check the spelling or try a nearby city.`:'Something went wrong while loading the weather.')}
function showError(e){$('#err p').textContent=errMsg(e);$('#retry').hidden=!!e.nf;setState('error')}

/* Loading with cache (stale data is shown if the network fails) */
async function load(p){cur=p;const my=newCtl();setState('loading');const key=p.lat.toFixed(2)+','+p.lon.toFixed(2),cache=rj(CK,{}),hit=cache[key];
 try{let d;if(hit&&Date.now()-hit.t<CONFIG.CACHE_MIN*6e4)d=hit.d;else{d=await API.forecast(p,my.signal);cache[key]={t:Date.now(),d};
   const ks=Object.keys(cache);if(ks.length>20)delete cache[ks.sort((a,b)=>cache[a].t-cache[b].t)[0]];wj(CK,cache)}
  if(my!==ctl)return;data=d;render(p,d);remember(p)}
 catch(e){if(my!==ctl)return;if(hit){data=hit.d;render(p,hit.d,hit.t,errMsg(e));remember(p);return}showError(e)}}
async function search(v){const my=newCtl();setState('loading');
 try{const r=await API.geo(v,my.signal);if(my!==ctl)return;if(!r.length)throw Object.assign(new Error('nf'),{nf:1,q:v});load(r[0])}catch(e){if(my===ctl)showError(e)}}

/* Rendering */
function render(p,d,at,why){const n=d.now,off=d.off,sk=n.cond+'-'+(n.day?'day':'night'),b=document.body,tone=(!n.day||n.cond==='storm')?'dark':'light',tm=d.daily[0];
 b.dataset.sky=sk;b.dataset.tone=tone;b.style.setProperty('--c1',SKY[sk][0]);b.style.setProperty('--c2',SKY[sk][1]);fx(n.cond,n.day);
 const fav=pf.fav.some(f=>same(f,p));document.title=`${T(n.t)} ${p.name} | Skycast`;
 const st=$('#stale');st.hidden=!at;if(at)st.textContent=`${why} Showing data saved ${Math.max(1,Math.round((Date.now()-at)/6e4))} min ago.`;
 $('#hero').innerHTML=`<div class="place"><h1>${esc(p.name)}</h1><p>${esc([p.region,p.country].filter(Boolean).join(', '))}</p><p class="clock" id="clock"></p>
  <button class="fav" data-fav aria-pressed="${fav}" aria-label="${fav?'Remove from':'Add to'} favourites">${fav?'&#9733;':'&#9734;'}</button></div>
  <div class="big">${icon(n.cond,n.day,110)}<div><b class="temp">${T(n.t)}</b><span class="cond">${label(n.cond,n.day)}</span><small>Feels like ${T(n.feels)} &nbsp;|&nbsp; High ${T(tm.max)} &nbsp;Low ${T(tm.min)}</small></div></div>`;
 clearInterval(clk);const tick=()=>{const e=$('#clock');if(e)e.textContent=fmt(Date.now()/1000,off,{weekday:'short',hour:'numeric',minute:'2-digit'})+' local time'};tick();clk=setInterval(tick,20000);
 const it=[['Humidity',n.h+'%',''],['Wind',W(n.wind),`<span class="arr" style="transform:rotate(${n.deg+180}deg)">&#8593;</span> from ${card(n.deg)}`],['Pressure',Math.round(n.p)+' hPa',''],['Visibility',V(n.vis),''],['Sunrise',fmt(n.sr,off,{hour:'numeric',minute:'2-digit'}),''],['Sunset',fmt(n.ss,off,{hour:'numeric',minute:'2-digit'}),'']];
 if(n.uv!=null)it.push(['UV index',Math.round(n.uv),uvL(n.uv)]);
 $('#det').innerHTML=it.map(([a,v,c],i)=>`<div class="card tile" style="--i:${i}"><span>${a}</span><b>${v}</b><small>${c}</small></div>`).join('');
 const hr=d.hourly,ts=hr.map(x=>x.t),mn=Math.min(...ts),r=Math.max(...ts)-mn||1,w=600,h=70,pts=hr.map((x,i)=>[(i+.5)/hr.length*w,h-8-(x.t-mn)/r*(h-24)]),ln=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join('');
 $('#hi').style.setProperty('--n',hr.length);
 $('#hi').innerHTML=`<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${ln}L${w} ${h}L0 ${h}Z" class="area"/><path d="${ln}" class="line"/></svg><div class="hr">${hr.map((x,i)=>`<div><small>${i?fmt(x.ts,off,{hour:'numeric'}):'Now'}</small>${icon(x.cond,x.day,30)}<b>${T(x.t)}</b></div>`).join('')}</div>`;
 $('#dy').innerHTML=d.daily.map((x,i)=>`<div class="card day" style="--i:${i}"><b>${i?new Date((x.ts+off)*1000).toLocaleDateString([],{weekday:'short',timeZone:'UTC'}):'Today'}</b>${icon(x.cond,true,44)}<span>${T(x.max)} <em>${T(x.min)}</em></span><small>${LABEL[x.cond]}</small></div>`).join('');
 $('#foot').textContent=`Weather data: ${API.name}. Times shown in the city's local time.`;setState('ready')}

/* Favourites, recent searches, last city (the app's memory) */
function remember(p){const c={name:p.name,region:p.region,country:p.country,lat:p.lat,lon:p.lon};
 if(p.name!=='Current location')pf.recent=[c,...pf.recent.filter(r=>!same(r,c))].slice(0,5);pf.last=c;wj(PK,pf);chips()}
function chips(){const a=[...pf.fav.map(f=>({...f,fav:1})),...pf.recent.filter(r=>!pf.fav.some(f=>same(f,r)))];
 $('#chips').innerHTML=a.map((c,i)=>`<button class="chip" data-c="${i}">${c.fav?'&#9733; ':''}${esc(c.name)}</button>`).join('');$('#chips').onclick=e=>{const b=e.target.closest('[data-c]');if(b)load(a[+b.dataset.c])}}
$('#hero').addEventListener('click',e=>{if(!e.target.closest('[data-fav]')||!cur)return;const c={name:cur.name,region:cur.region,country:cur.country,lat:cur.lat,lon:cur.lon};
 pf.fav=pf.fav.some(f=>same(f,c))?pf.fav.filter(f=>!same(f,c)):[...pf.fav,c].slice(0,8);wj(PK,pf);chips();render(cur,data)});

/* Search box with autocomplete */
const q=$('#q'),sg=$('#sug');let dt,sc;
const hide=()=>{sg.hidden=true;q.setAttribute('aria-expanded','false');sel=-1};
function showSug(){sg.innerHTML=sugg.length?sugg.map((s,i)=>`<li role="option" data-i="${i}" id="o${i}">${esc(s.name)}<small>${esc([s.region,s.country].filter(Boolean).join(', '))}</small></li>`).join(''):'<li class="none">No matching places</li>';sg.hidden=false;q.setAttribute('aria-expanded','true');sel=-1}
const pick=p=>{hide();q.value='';q.blur();load(p)};
q.addEventListener('input',()=>{clearTimeout(dt);const v=q.value.trim();if(v.length<2)return hide();
 dt=setTimeout(async()=>{if(sc)sc.abort();sc=new AbortController();try{sugg=await API.geo(v,sc.signal);showSug()}catch(e){}},300)});
q.addEventListener('keydown',e=>{const n=sugg.length;
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(sg.hidden||!n)return;e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+n)%n;$$('#sug li').forEach((li,i)=>li.classList.toggle('on',i===sel));q.setAttribute('aria-activedescendant','o'+sel)}
 else if(e.key==='Enter'){e.preventDefault();clearTimeout(dt);const v=q.value.trim();if(!v)return;if(sel>=0&&sugg[sel])pick(sugg[sel]);else{hide();q.value='';search(v)}}
 else if(e.key==='Escape')hide()});
sg.addEventListener('mousedown',e=>{const li=e.target.closest('[data-i]');if(li){e.preventDefault();pick(sugg[+li.dataset.i])}});
document.addEventListener('click',e=>{if(!e.target.closest('.search'))hide()});
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT/.test(e.target.tagName)){e.preventDefault();q.focus()}});

/* Controls */
$('#units').onclick=()=>{pf.units=isF()?'c':'f';wj(PK,pf);$('#units').textContent=isF()?'°F':'°C';if(data&&cur)render(cur,data)};
$('#loc').onclick=()=>{if(!navigator.geolocation)return showError({msg:'Location is not supported by this browser.'});setState('loading');
 navigator.geolocation.getCurrentPosition(g=>load({name:'Current location',region:'',country:'',lat:g.coords.latitude,lon:g.coords.longitude}),()=>showError({msg:'Location access was blocked. Search for a city instead.',nf:1}),{timeout:10000})};
$('#retry').onclick=()=>cur?load(cur):start();
addEventListener('online',()=>{if(!$('#err').hidden&&cur)load(cur)});
function start(){chips();$('#units').textContent=isF()?'°F':'°C';pf.last?load(pf.last):search(CONFIG.DEFAULT_CITY)}
start();
