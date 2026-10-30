/* Pure store logic (no DOM): money in integer cents, cart operations, totals, validation helpers. Tested in tests.html. */
const Store=(()=>{
 const TAX=.08,FREE_AT=10000,SHIP=599,MAXQ=10;
 const PROMOS={WELCOME10:{pct:10,text:'10% off'},GREEN20:{pct:20,min:5000,text:'20% off orders over $50'},FREESHIP:{ship:1,text:'Free shipping'}};
 const money=c=>'$'+(c/100).toFixed(2);
 const CATS={electronics:'Electronics',jewelery:'Jewelry',jewelry:'Jewelry',"men's clothing":'Clothing',"women's clothing":'Clothing'};
 const norm=p=>({id:+p.id,title:String(p.title),price:Math.round(p.price*100),desc:String(p.description||''),cat:CATS[p.category]||'Other',img:p.image||'',rate:+(p.rating&&p.rating.rate)||0,count:+(p.rating&&p.rating.count)||0});
 const add=(c,id,n=1)=>c.some(x=>x.id===id)?c.map(x=>x.id===id?{...x,qty:Math.min(MAXQ,x.qty+n)}:x):[...c,{id,qty:Math.min(MAXQ,n)}];
 const setQty=(c,id,q)=>q<=0?c.filter(x=>x.id!==id):c.map(x=>x.id===id?{...x,qty:Math.min(MAXQ,q)}:x);
 function totals(lines,code){const sub=lines.reduce((s,l)=>s+l.price*l.qty,0),p=PROMOS[code],ok=p&&sub>=(p.min||0);
  const disc=ok&&p.pct?Math.round(sub*p.pct/100):0,after=sub-disc,ship=!lines.length?0:(after>=FREE_AT||(ok&&p.ship))?0:SHIP,tax=Math.round(after*TAX);
  return{sub,disc,after,ship,tax,total:after+ship+tax}}
 const luhn=n=>{if(!/^\d{13,19}$/.test(n))return false;let s=0,d=false;for(let i=n.length-1;i>=0;i--){let x=+n[i];if(d){x*=2;if(x>9)x-=9}s+=x;d=!d}return s%10===0};
 const badges=p=>[p.rate>=4.5&&'Top rated',p.count>=400&&'Popular',p.price<2500&&'Deal'].filter(Boolean).slice(0,2);
 return{money,norm,add,setQty,totals,luhn,badges,PROMOS,FREE_AT,MAXQ,TAX}})();
