const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const {money,norm,add,setQty,totals,luhn,badges,PROMOS,FREE_AT,MAXQ}=Store,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const rj=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},wj=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=[],byId=new Map(),maxP=1000,wish=rj('grove.wish',[]),orders=rj('grove.orders',[]),promo=rj('grove.promo',''),cart=rj('grove.cart',[]),co={step:1,data:{}};
let F=Object.assign({cat:'All',q:'',sort:'featured',max:null},rj('grove.f',{}));F.saved=false;
cart=Array.isArray(cart)?cart.filter(l=>l&&Number.isInteger(l.id)&&l.qty>0).map(l=>({id:l.id,qty:Math.min(MAXQ,l.qty|0)})):[];
if(!Array.isArray(wish))wish=[];if(!Array.isArray(orders))orders=[];if(typeof promo!=='string')promo='';
const save=()=>{wj('grove.cart',cart);wj('grove.wish',wish);wj('grove.orders',orders);wj('grove.promo',promo);wj('grove.f',F)};
const openD=d=>d.showModal?d.showModal():d.setAttribute('open',''),closeD=d=>d.close?d.close():d.removeAttribute('open');
const ICON={Electronics:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',Jewelry:'<svg viewBox="0 0 24 24"><path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l-2 5 5 11 5-11-2-5"/></svg>',Clothing:'<svg viewBox="0 0 24 24"><path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/></svg>'};
const art=p=>`<div class="art">${ICON[p.cat]||''}</div>`,img=p=>p.img?`<img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy">`:art(p);
const stars=r=>`<span class="stars" style="--r:${(r/5*100).toFixed(0)}%" role="img" aria-label="Rated ${r.toFixed(1)} out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</span>`;
const cartLines=()=>cart.map(l=>({...byId.get(l.id),qty:l.qty})).filter(l=>l.title);

function toast(m,act){const t=document.createElement('div');t.className='toast';t.innerHTML=`<span>${esc(m)}</span>`;
 if(act){const b=document.createElement('button');b.textContent=act.label;b.onclick=()=>{act.fn();t.remove()};t.appendChild(b)}$('#toasts').appendChild(t);setTimeout(()=>t.remove(),4500)}
function fly(from){if(rm||!from.animate)return;const a=from.getBoundingClientRect(),b=$('#cartbtn').getBoundingClientRect(),d=document.createElement('i');d.className='fly';
 d.style.cssText=`left:${a.left+a.width/2}px;top:${a.top}px`;document.body.appendChild(d);
 d.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(.3)`,opacity:.4}],{duration:650,easing:'cubic-bezier(.5,0,.8,.4)'}).onfinish=()=>d.remove()}
const bump=()=>{const b=$('#badge');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')};

/* Catalog: filter, search, sort, URL sync */
function view(){const q=F.q.toLowerCase(),a=products.filter(p=>(F.cat==='All'||p.cat===F.cat)&&(!F.saved||wish.includes(p.id))&&(F.max==null||p.price<=F.max*100)&&(!q||(p.title+' '+p.desc).toLowerCase().includes(q)));
 const s={'price-asc':(x,y)=>x.price-y.price,'price-desc':(x,y)=>y.price-x.price,rating:(x,y)=>y.rate-x.rate||y.count-x.count}[F.sort];return s?[...a].sort(s):a}
const card=(p,i)=>`<article class="pc" style="--i:${Math.min(i,12)}" data-id="${p.id}"><button class="heart" data-a="wish" aria-pressed="${wish.includes(p.id)}" aria-label="Save ${esc(p.title)}">&#9829;</button>
<button class="pimg" data-a="view" aria-label="Quick view: ${esc(p.title)}">${img(p)}</button>
<div class="pb"><div class="bd">${badges(p).map(b=>`<span>${b}</span>`).join('')}</div><h3>${esc(p.title)}</h3><div class="rt">${stars(p.rate)}<small>(${p.count})</small></div>
<div class="pr"><b>${money(p.price)}</b><button class="btn sm" data-a="add">Add to cart</button></div></div></article>`;
function renderGrid(){const v=view();$('#grid').innerHTML=v.map(card).join('');$('#empty').hidden=!!v.length;$('#count').textContent=`${v.length} product${v.length===1?'':'s'}`}
function renderCats(){$('#cats').innerHTML=['All',...new Set(products.map(p=>p.cat))].map(c=>`<button class="chip${F.cat===c?' on':''}" data-cat="${c}" aria-pressed="${F.cat===c}">${c}<small>${c==='All'?products.length:products.filter(p=>p.cat===c).length}</small></button>`).join('')}
function sync(){const h=new URLSearchParams();if(F.cat!=='All')h.set('cat',F.cat);if(F.q)h.set('q',F.q);if(F.sort!=='featured')h.set('sort',F.sort);if(F.max!=null&&F.max<maxP)h.set('max',F.max);
 const s=h.toString();try{history.replaceState(null,'',s?'#'+s:location.pathname+location.search)}catch(e){}save()}
const refresh=()=>{sync();renderCats();renderGrid()};
$('#cats').onclick=e=>{const b=e.target.closest('[data-cat]');if(b){F.cat=b.dataset.cat;refresh()}};
$('#sort').onchange=e=>{F.sort=e.target.value;refresh()};
$('#max').oninput=e=>{F.max=+e.target.value;$('#maxl').textContent='$'+F.max;refresh()};
let qt;$('#q').oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>{F.q=e.target.value.trim();refresh()},200)};
$('#savedbtn').onclick=e=>{F.saved=!F.saved;e.currentTarget.setAttribute('aria-pressed',F.saved);renderGrid()};
$('#reset').onclick=()=>{F={...F,cat:'All',q:'',sort:'featured',max:null,saved:false};$('#q').value='';$('#sort').value='featured';$('#max').value=maxP;$('#maxl').textContent='$'+maxP;$('#savedbtn').setAttribute('aria-pressed','false');refresh()};

/* Product actions (grid and quick view) */
function addToCart(id,btn){const p=byId.get(id),l=cart.find(x=>x.id===id);if(l&&l.qty>=MAXQ)return toast(`Limit is ${MAXQ} per item.`);
 cart=add(cart,id);save();renderCart();bump();if(btn)fly(btn);toast('Added to cart: '+p.title,{label:'View cart',fn:()=>drawer(true)});
 if(btn&&btn.classList.contains('sm')){btn.textContent='Added';setTimeout(()=>btn.textContent='Add to cart',1200)}}
function toggleWish(id){wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];save();renderWish();
 $$(`.pc[data-id="${id}"] .heart`).forEach(h=>h.setAttribute('aria-pressed',wish.includes(id)));const w=$('#qv [data-a="wish"]');if(w)w.textContent=wish.includes(id)?'Saved':'Save for later';if(F.saved)renderGrid()}
function renderWish(){const c=$('#wc');c.textContent=wish.length;c.hidden=!wish.length}
function quick(id){const p=byId.get(id);$('#qv').innerHTML=`<div class="dc qvc"><button class="ib x" data-close aria-label="Close">&#10005;</button><div class="qi">${img(p)}</div><div><div class="bd">${badges(p).map(b=>`<span>${b}</span>`).join('')}</div>
<h2>${esc(p.title)}</h2><div class="rt">${stars(p.rate)}<small>${p.rate.toFixed(1)} (${p.count} reviews)</small></div><p>${esc(p.desc)}</p><p class="qp">${money(p.price)}</p>
<div class="qa"><button class="btn" data-a="add" data-id="${p.id}">Add to cart</button><button class="btn ghost" data-a="wish" data-id="${p.id}">${wish.includes(p.id)?'Saved':'Save for later'}</button></div></div></div>`;openD($('#qv'))}
const onAct=e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=+(b.dataset.id||b.closest('[data-id]').dataset.id);
 if(b.dataset.a==='add')addToCart(id,b);if(b.dataset.a==='wish')toggleWish(id);if(b.dataset.a==='view')quick(id)};
$('#grid').addEventListener('click',onAct);$('#qv').addEventListener('click',onAct);
$('#grid').addEventListener('error',e=>{if(e.target.tagName==='IMG'){const p=byId.get(+e.target.closest('.pc').dataset.id);e.target.outerHTML=art(p)}},true);
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))closeD(d)}));

/* Cart drawer */
function drawer(open){const d=$('#drawer');d.classList.toggle('open',open);d.inert=!open;$('#scrim').classList.toggle('on',open);$$('header,main,footer').forEach(x=>x.inert=open);document.body.classList.toggle('lock',open);
 if(open)$('#dclose').focus();else $('#cartbtn').focus()}
function renderCart(){const lines=cartLines(),t=totals(lines,promo),n=lines.reduce((s,l)=>s+l.qty,0),p=PROMOS[promo],free=lines.length&&(t.after>=FREE_AT||(p&&p.ship&&t.ship===0));
 $('#badge').textContent=n;$('#badge').hidden=!n;$('#cartbtn').setAttribute('aria-label',`Open cart, ${n} item${n===1?'':'s'}`);
 $('#shiptxt').textContent=!lines.length?'Free shipping on orders over $100':free?'You have free shipping!':`Add ${money(FREE_AT-t.after)} more for free shipping`;$('#shipbar').style.width=(free?100:Math.min(100,t.after/FREE_AT*100))+'%';
 $('#lines').innerHTML=lines.length?lines.map(l=>`<li data-id="${l.id}"><div class="li">${img(l)}</div><div class="ld"><b>${esc(l.title)}</b><span>${money(l.price)}</span>
<div class="qty"><button data-a="dec" aria-label="Decrease quantity">&minus;</button><output aria-label="Quantity">${l.qty}</output><button data-a="inc" aria-label="Increase quantity" ${l.qty>=MAXQ?'disabled':''}>+</button></div></div>
<div class="lr"><b>${money(l.price*l.qty)}</b><button class="lnk" data-a="rm" aria-label="Remove ${esc(l.title)}">Remove</button></div></li>`).join(''):'<li class="mt">Your cart is empty.<br>Add something you like.</li>';
 const row=(a,b,c)=>`<div${c?` class="${c}"`:''}><dt>${a}</dt><dd>${b}</dd></div>`;
 $('#sum').innerHTML=row('Subtotal',money(t.sub))+(t.disc?row(`Discount (${promo})`,'-'+money(t.disc),'dc2'):'')+row('Shipping',lines.length?(t.ship?money(t.ship):'Free'):'-')+row('Estimated tax (8%)',money(t.tax))+row('Total',money(t.total),'tot');
 $('#promomsg').textContent=promo&&p?(t.disc||p.ship?`${promo}: ${p.text} applied.`:`${promo} needs a ${money(p.min)} minimum.`):'';
 $('#checkout').disabled=!lines.length;$('#clearcart').hidden=!lines.length}
$('#lines').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=+b.closest('li').dataset.id,l=cart.find(x=>x.id===id);if(!l)return;
 if(b.dataset.a==='inc')cart=add(cart,id);if(b.dataset.a==='dec')cart=setQty(cart,id,l.qty-1);
 if(b.dataset.a==='rm'){const prev=cart;cart=setQty(cart,id,0);toast('Removed from cart',{label:'Undo',fn:()=>{cart=prev;save();renderCart()}})}save();renderCart()});
$('#promoform').onsubmit=e=>{e.preventDefault();const c=$('#promo').value.trim().toUpperCase(),p=PROMOS[c];
 if(!c){promo='';save();renderCart();return}if(!p){$('#promomsg').textContent='That code is not valid.';return}promo=c;$('#promo').value='';save();renderCart()};
$('#clearcart').onclick=()=>{const prev=cart;cart=[];save();renderCart();toast('Cart cleared',{label:'Undo',fn:()=>{cart=prev;save();renderCart()}})};
$('#cartbtn').onclick=()=>drawer(true);$('#dclose').onclick=()=>drawer(false);$('#scrim').onclick=()=>drawer(false);

/* Checkout: shipping > payment > review > confirmation (simulated, nothing is charged or stored) */
const V={name:v=>v.trim().length>=2||'Enter your full name',email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())||'Enter a valid email address',addr:v=>v.trim().length>=5||'Enter your street address',city:v=>v.trim().length>=2||'Enter your city',zip:v=>/^[A-Za-z0-9 -]{4,10}$/.test(v.trim())||'Enter a valid postal code',
 card:v=>luhn(v.replace(/\s/g,''))||'Enter a valid card number',exp:v=>{const m=v.match(/^(\d{2})\/(\d{2})$/);if(!m||+m[1]<1||+m[1]>12)return'Use the format MM/YY';return new Date(2000+ +m[2],+m[1],1)>new Date()||'This card has expired'},cvc:v=>/^\d{3,4}$/.test(v)||'Enter the 3 or 4 digit code'};
const fld=(id,label,at='')=>`<div class="f"><label for="f-${id}">${label}</label><input id="f-${id}" name="${id}" ${at} value="${esc(co.data[id]||'')}" aria-describedby="e-${id}"><small class="er" id="e-${id}" role="alert"></small></div>`;
function renderCO(){const lines=cartLines(),t=totals(lines,promo),s=co.step,d=co.data;
 const head=s<4?`<ol class="steps">${['Shipping','Payment','Review'].map((n,i)=>`<li${s===i+1?' aria-current="step"':''} class="${s>i+1?'done':''}">${n}</li>`).join('')}</ol>`:'';
 const list=`<ul class="rv">${lines.map(l=>`<li><span>${esc(l.title)} &times; ${l.qty}</span><b>${money(l.price*l.qty)}</b></li>`).join('')}</ul><dl class="sm2"><div><dt>Subtotal</dt><dd>${money(t.sub)}</dd></div>${t.disc?`<div><dt>Discount</dt><dd>-${money(t.disc)}</dd></div>`:''}<div><dt>Shipping</dt><dd>${t.ship?money(t.ship):'Free'}</dd></div><div><dt>Tax</dt><dd>${money(t.tax)}</dd></div><div class="tot"><dt>Total</dt><dd>${money(t.total)}</dd></div></dl>`;
 let b;
 if(s===1)b=`<form id="cof" novalidate><h2>Shipping details</h2>${fld('name','Full name','autocomplete="name"')}${fld('email','Email','type="email" autocomplete="email"')}${fld('addr','Street address','autocomplete="street-address"')}<div class="two">${fld('city','City','autocomplete="address-level2"')}${fld('zip','Postal code','autocomplete="postal-code"')}</div><button class="btn wide">Continue to payment</button></form>`;
 if(s===2)b=`<form id="cof" novalidate><h2>Payment</h2><p class="hint">Demo only: the card is validated but never stored or sent. Try 4242 4242 4242 4242, any future date, any code.</p>${fld('card','Card number','inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242"')}<div class="two">${fld('exp','Expiry (MM/YY)','inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY"')}${fld('cvc','Security code','inputmode="numeric" autocomplete="cc-csc" maxlength="4"')}</div><div class="two"><button type="button" class="btn ghost" data-back>Back</button><button class="btn">Review order</button></div></form>`;
 if(s===3)b=`<h2>Review your order</h2><p class="hint">Ship to ${esc(d.name)}, ${esc(d.addr)}, ${esc(d.city)} ${esc(d.zip)}. Paying with card ending ${esc((d.card||'').replace(/\s/g,'').slice(-4))}.</p>${list}<div class="two"><button type="button" class="btn ghost" data-back>Back</button><button class="btn" id="place">Place order</button></div>`;
 if(s===4)b=`<div class="ok"><svg viewBox="0 0 52 52" width="64" height="64"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3"/><path d="M15 27l8 8 14-16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><h2>Thank you, ${esc(co.order.name.split(' ')[0])}!</h2><p>Your order <b>${co.order.id}</b> is confirmed. A receipt would be emailed to ${esc(co.order.email)}.</p><button class="btn" data-close>Continue shopping</button></div>`;
 $('#co').innerHTML=`<div class="dc"><button class="ib x" data-close aria-label="Close checkout">&#10005;</button>${head}${b}</div>`;const f=$('#co input');if(f&&s<3)f.focus()}
function check(f,keys){let first=null;keys.forEach(k=>{const el=f.elements[k],r=V[k](el.value),er=$('#e-'+k);if(r===true){er.textContent='';el.removeAttribute('aria-invalid')}else{er.textContent=r;el.setAttribute('aria-invalid','true');first=first||el}});if(first)first.focus();return!first}
$('#co').addEventListener('submit',e=>{e.preventDefault();const f=e.target;if(co.step===1&&check(f,['name','email','addr','city','zip'])){['name','email','addr','city','zip'].forEach(k=>co.data[k]=f.elements[k].value.trim());co.step=2;renderCO()}
 else if(co.step===2&&check(f,['card','exp','cvc'])){['card','exp','cvc'].forEach(k=>co.data[k]=f.elements[k].value);co.step=3;renderCO()}});
$('#co').addEventListener('click',async e=>{if(e.target.closest('[data-back]')){co.step--;renderCO()}
 if(e.target.id==='place'){const bt=e.target;bt.disabled=true;bt.textContent='Processing...';await new Promise(r=>setTimeout(r,900));const lines=cartLines(),t=totals(lines,promo);
  const o={id:'GM-'+Date.now().toString(36).toUpperCase().slice(-6)+Math.random().toString(36).slice(2,4).toUpperCase(),date:Date.now(),name:co.data.name,email:co.data.email,city:co.data.city,last4:co.data.card.replace(/\s/g,'').slice(-4),lines:lines.map(l=>({title:l.title,qty:l.qty,price:l.price})),t};
  orders=[o,...orders].slice(0,20);cart=[];promo='';save();renderCart();co.order=o;co.data={};co.step=4;renderCO()}});
$('#co').addEventListener('input',e=>{const t=e.target;if(t.name==='card')t.value=t.value.replace(/\D/g,'').slice(0,19).replace(/(.{4})/g,'$1 ').trim();if(t.name==='exp'){const v=t.value.replace(/\D/g,'').slice(0,4);t.value=v.length>2?v.slice(0,2)+'/'+v.slice(2):v}});
$('#co').addEventListener('close',()=>{co.data={}});
$('#checkout').onclick=()=>{if(!cartLines().length)return;co={step:1,data:{}};drawer(false);renderCO();openD($('#co'))};

/* Order history */
$('#ordbtn').onclick=()=>{$('#od').innerHTML=`<div class="dc"><button class="ib x" data-close aria-label="Close">&#10005;</button><h2>Your orders</h2>${orders.length?`<ul class="ords">${orders.map(o=>`<li><div><b>${o.id}</b><span>${new Date(o.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}</span></div><p>${o.lines.map(l=>`${esc(l.title)} &times; ${l.qty}`).join(', ')}</p><b>${money(o.t.total)}</b></li>`).join('')}</ul>`:'<p class="hint">No orders yet. Orders you place appear here.</p>'}</div>`;openD($('#od'))};

/* Theme, shortcuts, cursor light */
$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('grove.theme',t)}catch(e){}};
addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#drawer').classList.contains('open'))drawer(false);if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();$('#q').focus()}});
if(matchMedia('(pointer:fine)').matches)addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px')},{passive:true});
$('#note').addEventListener('click',e=>{if(e.target.id==='retry')boot()});

/* Boot: live API, then saved copy, then demo catalog */
async function boot(){$('#grid').innerHTML=Array(8).fill('<div class="pc sk"><div class="pimg"></div><div class="pb"><i></i><i></i></div></div>').join('');let src='live';
 try{const r=await fetch('https://fakestoreapi.com/products',{signal:AbortSignal.timeout?AbortSignal.timeout(8000):undefined});if(!r.ok)throw new Error(r.status);const j=await r.json();if(!Array.isArray(j)||!j.length)throw new Error('empty');wj('grove.catalog',j);products=j.map(norm)}
 catch(e){const c=rj('grove.catalog',null);src=c?'saved':'demo';products=(c||FALLBACK).map(norm)}
 byId=new Map(products.map(p=>[p.id,p]));if(src==='live'){cart=cart.filter(l=>byId.has(l.id));wish=wish.filter(id=>byId.has(id))}
 maxP=Math.ceil(Math.max(...products.map(p=>p.price))/100);$('#max').max=maxP;if(F.max==null||F.max>maxP)F.max=maxP;$('#max').value=F.max;$('#maxl').textContent='$'+F.max;
 if(!['All',...new Set(products.map(p=>p.cat))].includes(F.cat))F.cat='All';$('#q').value=F.q;$('#sort').value=F.sort;
 const n=$('#note');n.hidden=src==='live';if(src!=='live')n.innerHTML=`${src==='saved'?'Could not reach the live catalog, so you are seeing your saved products.':'Could not reach the live catalog, so you are seeing a small demo catalog.'} <button class="lnk" id="retry">Try again</button>`;
 renderCats();renderGrid();renderCart();renderWish()}
(function(){if(location.hash.length>1){const h=new URLSearchParams(location.hash.slice(1));F.cat=h.get('cat')||'All';F.q=h.get('q')||'';F.sort=['price-asc','price-desc','rating'].includes(h.get('sort'))?h.get('sort'):'featured';F.max=h.get('max')?+h.get('max'):null}})();
boot();
