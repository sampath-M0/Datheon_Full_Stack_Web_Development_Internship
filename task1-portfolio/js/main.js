const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)],R=document.documentElement;
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
let mx=innerWidth/2,my=innerHeight/3,col;
const gc=()=>col=getComputedStyle(R).getPropertyValue('--accent').trim();gc();

/* Projects: edit this list. Add a link:'https://github.com/sampath-M0/repo' to point a card at its repo. */
const P=[
{t:'JARVIS Voice Assistant',s:'Fully offline voice assistant for Android',d:'A JARVIS-style assistant that runs entirely on the phone, so it keeps working with no internet connection. Native Android app with a Jetpack Compose interface.',g:['Kotlin','Jetpack Compose','Offline AI','Android']},
{t:'AI Router',s:'One endpoint, many free-tier API keys',d:'Pools several free-tier API keys per provider (Gemini, Groq). When a key hits its rate limit it fails over to the next key, then to the next provider, so requests keep flowing.',g:['Gemini','Groq','Key rotation','Failover']},
{t:'Multi-Agent Incident Commander',s:'Generative AI and LLM Applications (PNG2)',d:'Several cooperating AI agents that help diagnose outages. It is advisory-only: it recommends, and people decide.',g:['Multi-agent','LLM','Diagnosis','Advisory-only']},
];
$('#grid').innerHTML=P.map((p,i)=>`<article class="card rv" style="--d:${i*70}ms" data-i="${i}" tabindex="0" role="button" aria-label="Open ${p.t}"><h3>${p.t}</h3><p>${p.s}</p><div class="tags">${p.g.map(x=>`<span>${x}</span>`).join('')}</div></article>`).join('');

/* Theme + menu */
$('#theme').onclick=()=>{const t=R.dataset.theme==='dark'?'light':'dark';R.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}gc()};
$('#burger').onclick=()=>document.body.classList.toggle('menu');
$$('#nav a').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('menu')));
$('#yr').textContent=new Date().getFullYear();

/* Cursor light + ring */
addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;R.style.setProperty('--mx',mx+'px');R.style.setProperty('--my',my+'px')},{passive:true});
if(fine&&!rm){const cur=$('#cur');let cx=mx,cy=my;cur.classList.add('on');
 (function f(){cx+=(mx-cx)*.17;cy+=(my-cy)*.17;cur.style.transform=`translate(${cx}px,${cy}px)`;requestAnimationFrame(f)})();
 document.addEventListener('pointerover',e=>cur.classList.toggle('h',!!e.target.closest('a,button,.card,input,textarea')));}

/* Particle network that reacts to the cursor */
const cv=$('#bg'),c=cv.getContext('2d');let W,H,pts=[];
function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;pts=Array.from({length:Math.min(70,W/18|0)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.45,vy:(Math.random()-.5)*.45}))}
size();addEventListener('resize',size);
function draw(){c.clearRect(0,0,W,H);c.fillStyle=c.strokeStyle=col;
 pts.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
  c.globalAlpha=.55;c.beginPath();c.arc(p.x,p.y,1.8,0,7);c.fill();
  for(let j=i+1;j<pts.length;j++){const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<120){c.globalAlpha=(1-d/120)*.28;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()}}
  const m=Math.hypot(p.x-mx,p.y-my);if(m<170){c.globalAlpha=(1-m/170)*.6;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(mx,my);c.stroke()}});
 requestAnimationFrame(draw)}
if(!rm)draw();

/* Typing roles */
const rl=['AI-powered applications','full-stack web apps','offline Android apps','multi-agent AI systems'],ty=$('#typed');let ri=0,ci=0,del=0;
(function tick(){const w=rl[ri];if(rm){ty.textContent=w;return}ty.textContent=w.slice(0,ci);
 if(!del&&ci++===w.length){del=1;return setTimeout(tick,1500)}
 if(del&&--ci===0){del=0;ri=(ri+1)%rl.length}setTimeout(tick,del?32:70)})();

/* Reveal, counters, scroll-spy, progress */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
$$('.rv').forEach(x=>io.observe(x));
const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,n=+el.dataset.n;co.unobserve(el);let k=0;const s=setInterval(()=>{el.textContent=++k;if(k>=n)clearInterval(s)},rm?1:260)}),{threshold:.6});
$$('[data-n]').forEach(x=>co.observe(x));
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$$('#nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}),{rootMargin:'-40% 0px -55% 0px'});
$$('main section').forEach(s=>so.observe(s));
addEventListener('scroll',()=>{$('#progress').style.transform=`scaleX(${scrollY/(R.scrollHeight-innerHeight||1)})`;$('header').classList.toggle('sc',scrollY>20)},{passive:true});

/* Cards: glow follows pointer, subtle 3D tilt, modal */
const grid=$('#grid'),md=$('#modal');
grid.addEventListener('pointermove',e=>{const k=e.target.closest('.card');if(!k)return;const r=k.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;k.style.setProperty('--x',x+'px');k.style.setProperty('--y',y+'px');if(!rm)k.style.transform=`perspective(700px) rotateX(${(y/r.height-.5)*-8}deg) rotateY(${(x/r.width-.5)*8}deg)`});
grid.addEventListener('pointerout',e=>{const k=e.target.closest('.card');if(k)k.style.transform=''});
function open(i){const p=P[i];$('#mt').textContent=p.t;$('#ms').textContent=p.s;$('#md').textContent=p.d;$('#mg').innerHTML=p.g.map(x=>`<span>${x}</span>`).join('');$('#ml').href=p.link||'https://github.com/sampath-M0';md.showModal()}
grid.addEventListener('click',e=>{const k=e.target.closest('.card');if(k)open(+k.dataset.i)});
grid.addEventListener('keydown',e=>{const k=e.target.closest('.card');if(k&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(+k.dataset.i)}});
$('#mx').onclick=()=>md.close();md.addEventListener('click',e=>{if(e.target===md)md.close()});

/* Contact: opens the visitor's email app */
$('#f').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);location.href='mailto:sampathpanuganti740@gmail.com?subject='+encodeURIComponent('Portfolio message from '+f.get('n'))+'&body='+encodeURIComponent(f.get('m')+'\n\nReply to: '+f.get('e'))};
