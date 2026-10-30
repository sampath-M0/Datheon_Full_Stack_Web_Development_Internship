/* TaskFlow Plus: smart add, undo/redo, subtasks, recurring tasks, focus timer, insights and a persistent "memory".
   Layered on app.js, which shares its globals (S, F, render, saveToLocalStorage, clean, esc, uid, toast...). */
(()=>{
const ymd=d=>d.toLocaleDateString('en-CA'),plus=k=>{const d=new Date();d.setDate(d.getDate()+k);return ymd(d)};
S=loadFromLocalStorage();S.log=S.log||[];S.prefs=S.prefs||{};
const base=saveToLocalStorage,ev=(k,x)=>{S.log.push({t:Date.now(),k,x:String(x).slice(0,60)});S.log=S.log.slice(-200)};
let last=JSON.stringify(S.tasks),openId=null,ft=null,pj='';const U=[],Rd=[];

/* Memory: every change is diffed, logged, and kept on an undo/redo stack */
saveToLocalStorage=function(){
 const a=JSON.parse(last),ids=new Set(S.tasks.map(t=>t.id));
 S.tasks.forEach(t=>{const o=a.find(x=>x.id===t.id);if(!o)ev('add',t.text);else if(!o.done&&t.done){ev('done',t.text);t.doneAt=Date.now()}else if(o.done&&!t.done)t.doneAt=0});
 a.forEach(o=>{if(!ids.has(o.id))ev('del',o.text)});
 const cur=JSON.stringify(S.tasks);if(cur!==last){U.push(last);if(U.length>60)U.shift();Rd.length=0;last=cur}
 base()};
const jump=(from,to,w)=>{if(!from.length)return toast('Nothing to '+w);to.push(last);last=from.pop();S.tasks=JSON.parse(last);base();render();toast((w==='undo'?'Undid':'Redid')+' the last change')};
addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();
 if(k==='z'&&!e.shiftKey){e.preventDefault();jump(U,Rd,'undo')}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();jump(Rd,U,'redo')}});

/* Smart add: "Submit report tomorrow #work !high every week" */
function parse(raw){let cat=null,pri=null,due=null,rep=null;
 const text=raw.replace(/#(work|personal|study)\b/i,(m,c)=>{cat=c[0].toUpperCase()+c.slice(1).toLowerCase();return''})
 .replace(/!(high|medium|med|low)\b/i,(m,p)=>{pri={high:3,medium:2,med:2,low:1}[p.toLowerCase()];return''})
 .replace(/\bevery (day|week)\b/i,(m,w)=>{rep=w.toLowerCase()==='day'?'daily':'weekly';return''})
 .replace(/\b(today|tomorrow)\b/i,(m,w)=>{due=plus(w.toLowerCase()==='today'?0:1);return''})
 .replace(/\bin (\d{1,2}) days?\b/i,(m,n)=>{due=plus(+n);return''})
 .replace(/\b(?:on |next )?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i,(m,d)=>{
   const i=['sun','mon','tue','wed','thu','fri','sat'].indexOf(d.slice(0,3).toLowerCase());due=plus((i-new Date().getDay()+7)%7||7);return''})
 .replace(/\s{2,}/g,' ').trim();
 return{text:text||raw.trim(),cat,pri,due,rep}}
$('#due').insertAdjacentHTML('afterend','<select id="rep" aria-label="Repeat"><option value="">No repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select>');
$('#txt').setAttribute('list','mem');$('#txt').placeholder='Try: Submit report tomorrow #work !high';
document.body.insertAdjacentHTML('beforeend','<datalist id="mem"></datalist><div id="fbar" hidden><b id="ftime">25:00</b><span id="fname"></span><button id="fstop" type="button">Stop</button></div>');
$('.prog').insertAdjacentHTML('afterend','<section class="card ins" id="ins" aria-label="Insights and memory"></section>');
$('#add').onsubmit=e=>{e.preventDefault();const p=parse($('#txt').value);if(!p.text)return;
 S.tasks.unshift(clean({text:p.text,cat:p.cat||$('#cat').value,pri:p.pri||$('#pri').value,due:p.due||$('#due').value,rep:p.rep||$('#rep').value,done:false}));
 S.prefs.addCat=$('#cat').value;S.prefs.addPri=$('#pri').value;saveToLocalStorage();render();$('#txt').value='';$('#txt').focus();
 const got=[p.cat,p.pri&&['','low','medium','high'][p.pri]+' priority',p.due,p.rep].filter(Boolean);if(got.length)toast('Smart add: '+got.join(', '))};

/* Recurring tasks: completing one schedules the next */
$('#list').addEventListener('change',e=>{if(!e.target.classList.contains('chk'))return;const t=S.tasks.find(x=>x.id===e.target.closest('.task').dataset.id);
 if(!t||!t.done||!t.rep||t.sp)return;t.sp=true;const d=new Date((t.due||ymd(new Date()))+'T00:00');d.setDate(d.getDate()+(t.rep==='daily'?1:7));
 S.tasks.unshift(clean({...t,id:uid(),done:false,doneAt:0,sp:false,focus:0,due:ymd(d),sub:(t.sub||[]).map(s=>({...s,id:uid(),done:false}))}));saveToLocalStorage();toast('Next '+t.rep+' task scheduled for '+ymd(d))});

/* Subtasks and focus buttons */
$('#list').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;const t=S.tasks.find(x=>x.id===b.closest('.task').dataset.id);if(!t)return;
 if(b.dataset.p==='subs'){openId=openId===t.id?null:t.id;render();if(openId){const i=$('.sadd');if(i)i.focus()}}
 if(b.dataset.p==='focus')startFocus(t);
 if(b.dataset.p==='rs'){t.sub=t.sub.filter(s=>s.id!==b.dataset.s);saveToLocalStorage();render()}});
$('#list').addEventListener('change',e=>{const id=e.target.dataset.s;if(!id)return;const t=S.tasks.find(x=>x.id===e.target.closest('.task').dataset.id),s=t&&t.sub.find(x=>x.id===id);if(s){s.done=e.target.checked;saveToLocalStorage();render()}});
$('#list').addEventListener('keydown',e=>{if(!e.target.classList.contains('sadd')||e.key!=='Enter')return;const v=e.target.value.trim(),t=S.tasks.find(x=>x.id===e.target.closest('.task').dataset.id);
 if(!v||!t)return;t.sub.push({id:uid(),text:v,done:false});saveToLocalStorage();render();const i=$('.sadd');if(i)i.focus()});
function decorate(){$$('#list .task').forEach(li=>{const t=S.tasks.find(x=>x.id===li.dataset.id);if(!t)return;const subs=t.sub||[],dn=subs.filter(s=>s.done).length;
 li.querySelector('.meta').insertAdjacentHTML('beforeend',(subs.length?`<span class="tag">${dn}/${subs.length} steps</span>`:'')+(t.rep?`<span class="tag">&#8635; ${t.rep}</span>`:'')+(t.focus?`<span class="tag">${t.focus} min focus</span>`:''));
 li.querySelector('.ops').insertAdjacentHTML('afterbegin','<button data-p="focus" aria-label="Start a 25 minute focus session">&#9201;</button><button data-p="subs" aria-label="Show or hide steps">&#9776;</button>');
 if(openId===t.id){li.draggable=false;li.querySelector('.body').insertAdjacentHTML('beforeend',`<div class="subs">${subs.map(s=>`<label><input type="checkbox" data-s="${s.id}" ${s.done?'checked':''}><span>${esc(s.text)}</span><button type="button" data-p="rs" data-s="${s.id}" aria-label="Remove step">&#10005;</button></label>`).join('')}<input class="sadd" placeholder="Add a step, press Enter" maxlength="80"></div>`)}})}

/* Focus timer (25 min, adds focus minutes to the task) */
function tick(){const l=ft.end-Date.now();if(l<=0)return endFocus(true);const m=String(Math.floor(l/60000)).padStart(2,'0'),s=String(Math.floor(l%60000/1000)).padStart(2,'0');$('#ftime').textContent=m+':'+s;document.title=m+':'+s+' focus | TaskFlow'}
function startFocus(t){if(ft)return toast('A focus session is already running');ft={id:t.id,end:Date.now()+1500000};$('#fname').textContent=t.text;$('#fbar').hidden=false;tick();ft.iv=setInterval(tick,1000)}
function endFocus(ok){clearInterval(ft.iv);const t=S.tasks.find(x=>x.id===ft.id);ft=null;$('#fbar').hidden=true;document.title='TaskFlow | Task Manager';
 if(ok&&t){t.focus=(t.focus||0)+25;ev('focus',t.text);saveToLocalStorage();toast('Focus session complete: +25 min on "'+t.text+'"')}render()}
$('#fstop').onclick=()=>endFocus(false);

/* Insights: streak, 7-day chart, focus time, and the activity memory */
function insights(){const d={};S.log.forEach(l=>{if(l.k==='done'){const k=ymd(new Date(l.t));d[k]=(d[k]||0)+1}});
 const days=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-6+i);return[ymd(x),x.toLocaleDateString(undefined,{weekday:'short'})]}),mx=Math.max(1,...days.map(([k])=>d[k]||0));
 let st=0;const c=new Date();if(!d[ymd(c)])c.setDate(c.getDate()-1);while(d[ymd(c)]){st++;c.setDate(c.getDate()-1)}
 const foc=S.log.filter(l=>l.k==='focus').length*25,lab={add:'Added',done:'Completed',del:'Deleted',focus:'Focused on'},was=$('#ins details'),op=was&&was.open;
 $('#ins').innerHTML=`<div class="insg"><div><b>${st}</b><span>day streak</span></div><div><b>${foc}</b><span>focus minutes</span></div><div class="bars" role="img" aria-label="Tasks completed in the last 7 days">${days.map(([k,n])=>`<i title="${d[k]||0} completed"><u style="height:${(d[k]||0)/mx*100}%"></u><em>${n[0]}</em></i>`).join('')}</div></div>
 <details><summary>Memory: recent activity</summary><ul>${S.log.slice(-6).reverse().map(l=>`<li>${lab[l.k]}: ${esc(l.x)} <time>${new Date(l.t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time></li>`).join('')||'<li>Nothing yet</li>'}</ul><button id="forget" type="button">Forget history</button></details>`;
 if(op)$('#ins details').open=true;
 const c2={};S.log.forEach(l=>{if(l.k==='add'||l.k==='done')c2[l.x]=(c2[l.x]||0)+1});
 $('#mem').innerHTML=Object.entries(c2).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([x])=>`<option value="${esc(x)}">`).join('')}
$('#ins').addEventListener('click',e=>{if(e.target.id==='forget'&&confirm('Clear activity history, streak and suggestions?')){S.log=[];base();render()}});

/* Memory of preferences: filters, sort and last-used category and priority come back next visit */
const baseRender=render;
render=function(){baseRender();decorate();insights();S.prefs.f=F.f;S.prefs.fcat=F.cat;S.prefs.sort=F.sort;S.prefs.addCat=$('#cat').value;S.prefs.addPri=$('#pri').value;const j=JSON.stringify(S.prefs);if(j!==pj){pj=j;base()}};
const P=S.prefs;if(['all','active','done'].includes(P.f))F.f=P.f;if(['all',...CATS].includes(P.fcat))F.cat=P.fcat;if(['manual','due','pri'].includes(P.sort))F.sort=P.sort;
$('#fcat').value=F.cat;$('#sort').value=F.sort;if(CATS.includes(P.addCat))$('#cat').value=P.addCat;if(['1','2','3'].includes(P.addPri))$('#pri').value=P.addPri;
render();
})();
