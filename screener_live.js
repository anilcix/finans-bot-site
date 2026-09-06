(function(){
  if(!location.pathname.endsWith('/agents/screener.html'))return;
  const API='https://project-alpha-terminal.onrender.com/api/public/screener';
  const STALE_MS=20*60*1000;
  let lastSignalKey='';
  let busy=false;

  function loadHistoryLevelSnapshots(){
    if(document.querySelector('script[data-history-levels]'))return;
    const s=document.createElement('script');s.src='../screener_history_levels.js';s.defer=true;s.dataset.historyLevels='1';document.head.appendChild(s);
  }
  loadHistoryLevelSnapshots();

  function signalKey(d){
    return (d.movers||[]).map(x=>`${x.symbol}:${x.signal_candle_close_utc||x.level_context?.signal_candle_close_utc||d.signal_candle_close_utc||''}`).sort().join('|');
  }

  function flashNewSignals(d){
    const key=signalKey(d);
    if(lastSignalKey && key && key!==lastSignalKey){
      document.title='🔴 YENİ SİNYAL — Tarayıcı';
      setTimeout(()=>{document.title='Tarayıcı — Piyasa İstihbarat Ağı'},12000);
    }
    lastSignalKey=key;
  }

  function fmtPrice(v){
    if(v==null||!Number.isFinite(Number(v)))return'—';
    const n=Number(v),a=Math.abs(n);
    if(a>=1000)return n.toLocaleString('tr-TR',{maximumFractionDigits:2});
    if(a>=1)return n.toLocaleString('tr-TR',{maximumFractionDigits:4});
    return n.toLocaleString('tr-TR',{maximumFractionDigits:7});
  }
  function fmtPct(v){return v==null||!Number.isFinite(Number(v))?'—':`${Number(v)>=0?'+':''}${Number(v).toFixed(2)}%`}
  function fmtClock(v){
    if(!v)return'—';
    try{return new Date(v).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}catch(e){return'—'}
  }
  function signalWindow(row,d){
    let open=row?.level_context?.signal_candle_open_utc||row?.signal_candle_open_utc||row?.signal_time_utc||d?.signal_candle_open_utc||null;
    let close=row?.level_context?.signal_candle_close_utc||row?.signal_candle_close_utc||d?.signal_candle_close_utc||null;
    if(open&&!close){const t=new Date(open);if(Number.isFinite(t.getTime()))close=new Date(t.getTime()+10*60*1000).toISOString()}
    return `${fmtClock(open)}–${fmtClock(close)}`;
  }
  function isStaleStatic(d){
    if(!d||d.live_source||!d.generated_at)return false;
    const t=new Date(d.generated_at).getTime();
    return Number.isFinite(t)&&Date.now()-t>STALE_MS;
  }

  // Add the exact qualifying 10m candle to the existing scanner table. If the
  // GitHub fallback is stale, do not present old rows as current active signals.
  const baseActiveCard=window.activeCard;
  if(typeof baseActiveCard==='function'){
    window.activeCard=function(d){
      const stale=isStaleStatic(d);
      const view=stale?{...d,movers:[],scan_meta:{...(d.scan_meta||{}),signal_count_before_cap:0}}:d;
      const holder=document.createElement('div');holder.innerHTML=baseActiveCard(view);
      const card=holder.firstElementChild;if(!card)return holder.innerHTML;
      if(stale){
        const note=card.querySelector('.note');
        const last=(d.movers||[])[0];
        const win=last?signalWindow(last,d):'—';
        if(note)note.insertAdjacentHTML('beforeend',`<br><span class="stale">⚠ Statik veri eski · son kayıt ${win}. Canlı tarama bekleniyor; eski sinyal aktif sayılmaz.</span>`);
      }
      const table=card.querySelector('table.data-table');
      if(table&&!stale){
        const head=table.querySelector('tr');
        if(head&&head.children.length&&!Array.from(head.children).some(x=>x.textContent.trim()==='Sinyal Mumu')){
          const th=document.createElement('th');th.textContent='Sinyal Mumu';head.children[0].insertAdjacentElement('afterend',th);
          const trs=Array.from(table.querySelectorAll('tr')).slice(1);
          (view.movers||[]).forEach((row,i)=>{
            const tr=trs[i];if(!tr||!tr.children.length)return;
            const td=document.createElement('td');td.className='nowrap';td.innerHTML=`<b>${signalWindow(row,view)}</b><div class="mini">10dk kapanış sinyali</div>`;
            tr.children[0].insertAdjacentElement('afterend',td);
          });
        }
      }
      return card.outerHTML;
    };
  }

  function levelCell(obj){
    obj=obj||{};
    const status=obj.status||'UNAVAILABLE';
    const text=obj.status_tr||'—';
    const cls=(status==='ABOVE'||status==='CROSS_UP')?'positive':(status==='BELOW'||status==='CROSS_DOWN')?'negative':'';
    const touch=obj.touched&&status!=='CROSS_UP'&&status!=='CROSS_DOWN'?' · temas':'';
    return `<div class="${cls}" style="font-weight:800;white-space:nowrap">${text}${touch}</div><div class="mini">${fmtPrice(obj.value)} · ${fmtPct(obj.distance_pct)}</div>`;
  }
  function renderLevelContext(d){
    const content=document.getElementById('content');if(!content)return;
    let old=document.getElementById('levelContextCard');
    if(isStaleStatic(d)){if(old)old.remove();return}
    const rows=(d.movers||[]).filter(x=>x.level_context&&x.level_context.levels);
    if(!rows.length){if(old)old.remove();return}
    const wrap=document.createElement('div');wrap.id='levelContextCard';wrap.className='card';
    wrap.innerHTML=`<h2>Sinyal Anı · Ana Seviye Konumu</h2><div class="note">Sinyal 10dk kapanışındaki fiyatın DO, NYMO, WO ve DVWAP'a göre konumu. “Yeni kesti” = önceki 10dk kapanışı ile sinyal kapanışı seviyenin farklı tarafında kapandı.</div><div class="table-wrap"><table class="data-table"><tr><th>Coin</th><th>Sinyal Mumu</th><th>Sinyal Fiyatı</th><th>DO</th><th>NYMO</th><th>WO</th><th>DVWAP</th></tr>${rows.map(x=>{const c=x.level_context,l=c.levels||{};return `<tr><td><b>${x.symbol||'—'}</b></td><td class="nowrap"><b>${signalWindow(x,d)}</b></td><td>${fmtPrice(c.signal_price)}</td><td>${levelCell(l.DO)}</td><td>${levelCell(l.NYMO)}</td><td>${levelCell(l.WO)}</td><td>${levelCell(l.DVWAP)}</td></tr>`}).join('')}</table></div><div class="mini" style="margin-top:9px">DVWAP: 10dk HLC3 × hacim, günlük UTC reset. NYMO: New York 00:00 ve yaz/kış saati uyumlu.</div>`;
    if(old)old.replaceWith(wrap);else{
      const active=content.firstElementChild;
      if(active)active.insertAdjacentElement('afterend',wrap);else content.prepend(wrap);
    }
  }
  window.renderScreenerLevelContext=renderLevelContext;

  async function refreshLive(){
    if(busy||document.hidden)return;
    busy=true;
    try{
      const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('live screener '+r.status);
      const d=await r.json();
      if(!d||!d.generated_at||typeof window.activeCard!=='function')return;
      const content=document.getElementById('content');
      if(!content)return;
      const holder=document.createElement('div');
      holder.innerHTML=window.activeCard(d);
      const card=holder.firstElementChild;
      if(!card)return;
      const note=card.querySelector('.note');
      if(note){
        const close=d.signal_candle_close_utc?fmtClock(d.signal_candle_close_utc):'—';
        note.insertAdjacentHTML('beforeend',`<br><span class="fresh">● CANLI · Son kapanan 10dk mum: ${close}</span>`);
      }
      const first=content.firstElementChild;
      if(first)content.replaceChild(card,first);else content.prepend(card);
      renderLevelContext(d);
      const u=document.getElementById('updated');
      if(u){u.className='updated fresh';u.textContent='Canlı tarama: '+new Date(d.generated_at).toLocaleString('tr-TR')}
      flashNewSignals(d);
    }catch(e){
      // Static GitHub data stays as fallback, but stale rows are not labelled active.
    }finally{busy=false}
  }

  async function renderStaticContext(){
    try{
      const r=await fetch('../data/screener.json?t='+Date.now(),{cache:'no-store'});
      if(r.ok)renderLevelContext(await r.json());
    }catch(e){}
  }

  function msToNextBoundary(){
    const now=Date.now();
    const next=(Math.floor(now/600000)+1)*600000;
    return Math.max(1000,next-now+5000);
  }

  function scheduleBoundary(){
    setTimeout(()=>{
      refreshLive();
      setTimeout(refreshLive,8000);
      scheduleBoundary();
    },msToNextBoundary());
  }

  setTimeout(renderStaticContext,500);
  setTimeout(refreshLive,1200);
  setInterval(refreshLive,20000);
  scheduleBoundary();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLive()});
})();
