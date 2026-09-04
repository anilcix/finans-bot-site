(function(){
  if(!location.pathname.endsWith('/agents/screener.html'))return;
  const API='https://project-alpha-terminal.onrender.com/api/public/screener';
  let lastSignalKey='';
  let busy=false;

  function signalKey(d){
    return (d.movers||[]).map(x=>`${x.symbol}:${x.signal_candle_close_utc||d.signal_candle_close_utc||''}`).sort().join('|');
  }

  function flashNewSignals(d){
    const key=signalKey(d);
    if(lastSignalKey && key && key!==lastSignalKey){
      document.title='🔴 YENİ SİNYAL — Tarayıcı';
      setTimeout(()=>{document.title='Tarayıcı — Piyasa İstihbarat Ağı'},12000);
    }
    lastSignalKey=key;
  }

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
        const close=d.signal_candle_close_utc?new Date(d.signal_candle_close_utc).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'—';
        note.insertAdjacentHTML('beforeend',`<br><span class="fresh">● CANLI · Son kapanan 10dk mum: ${close}</span>`);
      }
      const first=content.firstElementChild;
      if(first)content.replaceChild(card,first);else content.prepend(card);
      const u=document.getElementById('updated');
      if(u){u.className='updated fresh';u.textContent='Canlı tarama: '+new Date(d.generated_at).toLocaleString('tr-TR')}
      flashNewSignals(d);
    }catch(e){
      // Static GitHub data stays visible as fallback.
    }finally{busy=false}
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

  setTimeout(refreshLive,1200);
  setInterval(refreshLive,20000);
  scheduleBoundary();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLive()});
})();
