const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)],R=document.documentElement;
const KEY='taskflow.v1',CATS=['Work','Personal','Study'],rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const today=()=>new Date().toLocaleDateString('en-CA');
const clean=t=>({id:String(t.id||uid()),text:String(t.text).slice(0,120),cat:CATS.includes(t.cat)?t.cat:'Personal',pri:[1,2,3].includes(+t.pri)?+t.pri:2,due:/^\d{4}-\d{2}-\d{2}$/.test(t.due)?t.due:'',done:!!t.done,doneAt:+t.doneAt||0,sp:!!t.sp,rep:['daily','weekly'].includes(t.rep)?t.rep:'',focus:+t.focus||0,sub:Array.isArray(t.sub)?t.sub.slice(0,30).map(s=>({id:String(s.id||uid()),text:String(s.text||'').slice(0,80),done:!!s.done})):[]});

/* Storage: versioned, validated, never throws */
function seed(){const d=today();return{v:1,tasks:[
 {id:uid(),text:'Plan the week',cat:'Personal',pri:2,due:d,done:false},
 {id:uid(),text:'Finish the task manager README',cat:'Work',pri:3,due:d,done:false},
 {id:uid(),text:'Revise for the next class',cat:'Study',pri:1,due:'',done:true}]}}
function loadFromLocalStorage(){try{const raw=localStorage.getItem(KEY);if(raw===null)return seed();const d=JSON.parse(raw);
 if(d&&(d.v===1||d.v===2)&&Array.isArray(d.tasks))return{v:2,tasks:d.tasks.filter(t=>t&&t.text!=null).map(clean),log:Array.isArray(d.log)?d.log.slice(-200):[],prefs:d.prefs&&typeof d.prefs==='object'?d.prefs:{}}}catch(e){}return{v:1,tasks:[]}}
function saveToLocalStorage(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Could not save. Storage is full or blocked. Export a backup.')}}

let S=loadFromLocalStorage(),F={f:'all',cat:'all',q:'',sort:'manual'},editing=null,undo=null,drag=null,tt;

/* Helpers */
function dueInfo(t){if(!t.due)return null;const d=Math.round((new Date(t.due+'T00:00')-new Date(today()+'T00:00'))/864e5);
 return{l:d<0?`Overdue ${-d}d`:d===0?'Today':d===1?'Tomorrow':new Date(t.due+'T00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}),c:d<0&&!t.done?'od':d===0?'td':''}}
function visible(){let v=S.tasks.filter(t=>(F.f==='all'||(F.f==='done')===t.done)&&(F.cat==='all'||t.cat===F.cat)&&t.text.toLowerCase().includes(F.q));
 if(F.sort==='due')v=[...v].sort((a,b)=>(a.due||'9')>(b.due||'9')?1:-1);if(F.sort==='pri')v=[...v].sort((a,b)=>b.pri-a.pri);return v}
const item=t=>{const d=dueInfo(t);return `<li class="task${t.done?' done':''}" data-id="${t.id}" data-pri="${t.pri}" draggable="${F.sort==='manual'&&!editing}">
<input type="checkbox" class="chk" aria-label="Mark complete" ${t.done?'checked':''}>
<div class="body">${editing===t.id?`<input class="edit" value="${esc(t.text)}" maxlength="120" aria-label="Edit task">`:`<span class="txt">${esc(t.text)}</span>`}
<div class="meta"><span class="tag c-${t.cat}">${t.cat}</span>${d?`<span class="due ${d.c}">${d.l}</span>`:''}</div></div>
<div class="ops"><button data-a="edit" aria-label="Edit task">&#9998;</button><button data-a="del" aria-label="Delete task">&#10005;</button></div></li>`};

function render(){
 const all=S.tasks,done=all.filter(t=>t.done).length,od=all.filter(t=>!t.done&&t.due&&t.due<today()).length,r=all.length?done/all.length:0;
 $('#sum').textContent=all.length?`${all.length-done} to do, ${done} done`:'Nothing here yet';
 $('#pct').textContent=Math.round(r*100)+'%';$('#ring').style.strokeDashoffset=283*(1-r);
 $('#s-open').textContent=all.length-done;$('#s-done').textContent=done;$('#s-od').textContent=od;
 const v=visible();$('#list').innerHTML=v.map(item).join('');
 $('#empty').hidden=v.length>0;$('#empty').textContent=all.length?'No tasks match these filters.':'Add your first task above.';
 $$('[data-f]').forEach(b=>b.classList.toggle('on',b.dataset.f===F.f));
 const ed=$('.edit');if(ed){ed.focus();ed.select()}}

function toast(m,fn){const t=$('#toast');$('span',t).textContent=m;$('button',t).hidden=!fn;undo=fn||null;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,5000)}
$('#toast button').onclick=()=>{if(undo){undo();undo=null}$('#toast').hidden=true};
function confetti(el){if(rm)return;const r=el.getBoundingClientRect(),cs=['#2D5A3D','#6B7A2F','#9AAA4A','#F5F0E1','#6B6F6A'];
 for(let i=0;i<14;i++){const s=document.createElement('span'),a=Math.random()*6.28,d=40+Math.random()*50;s.className='cf';
  s.style.cssText=`left:${r.left+12}px;top:${r.top+12}px;background:${cs[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;document.body.appendChild(s);setTimeout(()=>s.remove(),850)}}
function commit(val){const id=editing;if(!id)return;editing=null;const t=S.tasks.find(x=>x.id===id),v=val.trim();if(t&&v){t.text=v.slice(0,120);saveToLocalStorage()}render()}

/* Add */
$('#add').onsubmit=e=>{e.preventDefault();const text=$('#txt').value.trim();if(!text)return;
 S.tasks.unshift(clean({text,cat:$('#cat').value,pri:$('#pri').value,due:$('#due').value,done:false}));saveToLocalStorage();render();$('#txt').value='';$('#txt').focus()};

/* List actions */
const L=$('#list');
L.addEventListener('change',e=>{if(!e.target.classList.contains('chk'))return;const t=S.tasks.find(x=>x.id===e.target.closest('.task').dataset.id);if(!t)return;
 t.done=e.target.checked;saveToLocalStorage();if(t.done)confetti(e.target);setTimeout(render,t.done?450:0)});
L.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=b.closest('.task').dataset.id;
 if(b.dataset.a==='edit'){editing=id;render()}
 if(b.dataset.a==='del'){const i=S.tasks.findIndex(x=>x.id===id),[t]=S.tasks.splice(i,1);saveToLocalStorage();render();toast('Task deleted',()=>{S.tasks.splice(i,0,t);saveToLocalStorage();render()})}});
L.addEventListener('dblclick',e=>{const x=e.target.closest('.txt');if(x){editing=x.closest('.task').dataset.id;render()}});
L.addEventListener('keydown',e=>{if(!e.target.classList.contains('edit'))return;if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape'){editing=null;render()}});
L.addEventListener('focusout',e=>{if(e.target.classList.contains('edit'))commit(e.target.value)});

/* Drag and drop reorder (manual order, mouse) */
L.addEventListener('dragstart',e=>{const li=e.target.closest('.task');if(!li)return;drag=li.dataset.id;li.classList.add('drag');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',drag)});
L.addEventListener('dragover',e=>{if(!drag)return;e.preventDefault();$$('.over',L).forEach(x=>x.classList.remove('over'));const o=e.target.closest('.task');if(o)o.classList.add('over')});
L.addEventListener('drop',e=>{e.preventDefault();const to=e.target.closest('.task');if(!to||!drag||to.dataset.id===drag)return;
 const a=S.tasks.findIndex(t=>t.id===drag),[m]=S.tasks.splice(a,1),b=S.tasks.findIndex(t=>t.id===to.dataset.id);S.tasks.splice(b,0,m);saveToLocalStorage()});
L.addEventListener('dragend',()=>{drag=null;render()});

/* Filters, search, sort */
$$('[data-f]').forEach(b=>b.onclick=()=>{F.f=b.dataset.f;render()});
$('#fcat').onchange=e=>{F.cat=e.target.value;render()};$('#sort').onchange=e=>{F.sort=e.target.value;render()};
$('#q').oninput=e=>{F.q=e.target.value.trim().toLowerCase();render()};

/* Backup */
$('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));a.download='taskflow-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
$('#impb').onclick=()=>$('#imp').click();
$('#imp').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const d=JSON.parse(await f.text()),arr=Array.isArray(d)?d:d.tasks;
 if(!Array.isArray(arr))throw 0;const prev=S.tasks;S.tasks=arr.filter(t=>t&&t.text!=null).map(clean);saveToLocalStorage();render();toast(`Imported ${S.tasks.length} tasks`,()=>{S.tasks=prev;saveToLocalStorage();render()})}catch(x){toast('That file is not a valid TaskFlow backup.')}};
$('#clr').onclick=()=>{const n=S.tasks.filter(t=>t.done).length;if(!n)return toast('No completed tasks to clear.');const prev=S.tasks;S.tasks=prev.filter(t=>!t.done);saveToLocalStorage();render();toast(`${n} completed task${n>1?'s':''} cleared`,()=>{S.tasks=prev;saveToLocalStorage();render()})};

/* Theme, cursor light, shortcuts, sync, offline */
$('#theme').onclick=()=>{const t=R.dataset.theme==='dark'?'light':'dark';R.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}};
if(matchMedia('(pointer:fine)').matches)addEventListener('pointermove',e=>{R.style.setProperty('--mx',e.clientX+'px');R.style.setProperty('--my',e.clientY+'px')},{passive:true});
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 if(e.key==='n'||e.key==='N'){e.preventDefault();$('#txt').focus()}if(e.key==='/'){e.preventDefault();$('#q').focus()}});
addEventListener('storage',e=>{if(e.key===KEY){S=loadFromLocalStorage();render()}});
if('serviceWorker' in navigator&&location.protocol!=='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
saveToLocalStorage();render();
