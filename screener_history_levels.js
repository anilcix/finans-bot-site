(function(){
  if(!location.pathname.endsWith('/agents/screener.html'))return;

  function num(v,d=4){
    v=Number(v);return Number.isFinite(v)?v.toFixed(d).replace(/0+$/,'').replace(/\.$/,''):'—';
  }
  function pct(v){
    v=Number(v);return Number.isFinite(v)?`${v>=0?'+':''}${v.toFixed(2)}%`:'—';
  }
  function dt(v){
    if(!v)return'—';
    try{return new Date(v).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return'—'}
  }
  function cls(status){
    if(status==='ABOVE'||status==='CROSS_UP')return'positive';
    if(status==='BELOW'||status==='CROSS_DOWN')return'negative';
    return'';
  }
  function cell(level){
    if(!level)return'<td>—</td>';
    const status=level.status_tr||level.status||'—';
    const touch=level.touched?' · temas':'';
    return `<td class="${cls(level.status)}"><b>${status}</b><div class="mini">${num(level.value)} · ${pct(level.distance_pct)}${touch}</div></td>`;
  }

  async function render(){
    try{
      const r=await fetch('../data/screener_history.json?t='+Date.now(),{cache:'no-store'});
      if(!r.ok)return;
      const h=await r.json();
      const events=(h.events||[]).filter(x=>x.level_context&&x.level_context.levels).slice(0,100);
      const cards=[...document.querySelectorAll('#content .card')];
      const history=cards.find(c=>(c.querySelector('h2')?.textContent||'').includes('Tarihçe'));
      if(!history)return;
      let old=document.getElementById('historyLevelSnapshots');
      if(old)old.remove();
      const wrap=document.createElement('div');wrap.id='historyLevelSnapshots';
      wrap.innerHTML=`<div class="horizon-title" style="margin-top:18px">Sinyal Anı · Ana Seviye Snapshot</div>
        <div class="history-note">Bu değerler sinyalin oluştuğu 10dk mum kapanışında kaydedilir; fiyat sonradan değişse bile history içindeki DO / NYMO / WO / DVWAP durumu yeniden hesaplanmaz.</div>
        ${events.length?`<div class="table-wrap"><table class="data-table"><tr><th>Sinyal Mumu</th><th>Coin</th><th>Sinyal Fiyatı</th><th>DO</th><th>NYMO</th><th>WO</th><th>DVWAP</th><th>+15dk</th><th>+30dk</th></tr>${events.map(x=>{const c=x.level_context||{},l=c.levels||{};return `<tr><td class="nowrap">${dt(x.signal_candle_close_utc)}</td><td><b>${x.symbol||'—'}</b></td><td>${num(c.signal_price??x.entry_price)}</td>${cell(l.DO)}${cell(l.NYMO)}${cell(l.WO)}${cell(l.DVWAP)}<td>${x.change_15m_pct==null?'⏳':pct(x.change_15m_pct)}</td><td>${x.change_30m_pct==null?'⏳':pct(x.change_30m_pct)}</td></tr>`}).join('')}</table></div>`:'<div class="empty">Yeni seviye-snapshot sisteminden sonra henüz kayıt oluşmadı.</div>'}`;
      history.appendChild(wrap);
    }catch(e){}
  }

  setTimeout(render,1400);
  setInterval(render,60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
})();
