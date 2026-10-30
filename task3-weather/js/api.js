/* Data providers. Both return the same normalized shape, so the UI never cares which API is used:
   {off, now:{t,feels,h,wind(km/h),deg,p,vis(km),cond,day,sr,ss,uv}, hourly:[{ts,t,cond,day}], daily:[{ts,min,max,cond}]}  (temps in C, ts in unix seconds, off = city UTC offset in seconds) */
const LABEL={clear:'Clear sky',partly:'Partly cloudy',clouds:'Overcast',fog:'Fog',drizzle:'Drizzle',rain:'Rain',snow:'Snow',storm:'Thunderstorm'};
const omCond=c=>c===0?'clear':c<=2?'partly':c===3?'clouds':c<=48?'fog':c<=57?'drizzle':c<=67?'rain':c<=77?'snow':c<=82?'rain':c<=86?'snow':'storm';
const owmCond=i=>i<300?'storm':i<400?'drizzle':i<600?'rain':i<700?'snow':i<800?'fog':i===800?'clear':i<=802?'partly':'clouds';

async function http(url,sig){
 const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),10000);
 if(sig)sig.addEventListener('abort',()=>ctl.abort(),{once:true});
 try{const r=await fetch(url,{signal:ctl.signal});if(!r.ok)throw Object.assign(new Error('HTTP '+r.status),{status:r.status});return await r.json()}
 catch(e){if(sig&&sig.aborted)throw e;if(ctl.signal.aborted)throw Object.assign(new Error('timeout'),{timeout:true});throw e}
 finally{clearTimeout(to)}}

const OM={name:'Open-Meteo',
 async geo(q,sig){const j=await http(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`,sig);
  return(j.results||[]).map(r=>({name:r.name,region:r.admin1||'',country:r.country_code||'',lat:r.latitude,lon:r.longitude}))},
 async forecast(p,sig){
  const j=await http(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,is_day,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=5`,sig);
  const off=j.utc_offset_seconds,u=s=>Date.parse(s+'Z')/1000-off,c=j.current,h=j.hourly,d=j.daily,now=u(c.time);
  let i=h.time.findIndex(s=>u(s)>=now-1800);if(i<0)i=0;
  return{off,now:{t:c.temperature_2m,feels:c.apparent_temperature,h:c.relative_humidity_2m,wind:c.wind_speed_10m,deg:c.wind_direction_10m,p:c.surface_pressure,vis:(h.visibility[i]||0)/1000,cond:omCond(c.weather_code),day:!!c.is_day,sr:u(d.sunrise[0]),ss:u(d.sunset[0]),uv:d.uv_index_max[0]},
   hourly:h.time.slice(i,i+24).map((s,k)=>({ts:u(s),t:h.temperature_2m[i+k],cond:omCond(h.weather_code[i+k]),day:!!h.is_day[i+k]})),
   daily:d.time.map((s,k)=>({ts:u(s+'T00:00'),min:d.temperature_2m_min[k],max:d.temperature_2m_max[k],cond:omCond(d.weather_code[k])}))}}};

const OWM={name:'OpenWeatherMap',
 async geo(q,sig){const j=await http(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${CONFIG.OWM_KEY}`,sig);
  return j.map(r=>({name:r.name,region:r.state||'',country:r.country,lat:r.lat,lon:r.lon}))},
 async forecast(p,sig){
  const q=`lat=${p.lat}&lon=${p.lon}&units=metric&appid=${CONFIG.OWM_KEY}`;
  const [w,f]=await Promise.all([http(`https://api.openweathermap.org/data/2.5/weather?${q}`,sig),http(`https://api.openweathermap.org/data/2.5/forecast?${q}`,sig)]);
  const off=w.timezone,hr=ts=>(((ts+off)%86400)+86400)%86400/3600,isDay=ts=>hr(ts)>=6&&hr(ts)<19,g={};
  f.list.forEach(e=>{const k=new Date((e.dt+off)*1000).toISOString().slice(0,10);(g[k]=g[k]||[]).push(e)});
  return{off,now:{t:w.main.temp,feels:w.main.feels_like,h:w.main.humidity,wind:(w.wind.speed||0)*3.6,deg:w.wind.deg||0,p:w.main.pressure,vis:(w.visibility==null?10000:w.visibility)/1000,cond:owmCond(w.weather[0].id),day:w.dt>=w.sys.sunrise&&w.dt<w.sys.sunset,sr:w.sys.sunrise,ss:w.sys.sunset,uv:null},
   hourly:f.list.slice(0,8).map(e=>({ts:e.dt,t:e.main.temp,cond:owmCond(e.weather[0].id),day:isDay(e.dt)})),
   daily:Object.entries(g).slice(0,5).map(([k,a])=>{const mid=a.find(e=>hr(e.dt)>=12)||a[0];return{ts:Date.parse(k+'T00:00Z')/1000-off,min:Math.min(...a.map(e=>e.main.temp_min)),max:Math.max(...a.map(e=>e.main.temp_max)),cond:owmCond(mid.weather[0].id)}})}}};

const API=CONFIG.OWM_KEY?OWM:OM;
