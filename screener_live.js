(function(){
  if(!location.pathname.endsWith('/agents/screener.html'))return;
  const API='https://project-alpha-terminal.onrender.com/api/public/screener';
  const STALE_MS=20*60*1000;
  const TZ='Europe/Istanbul';
  let lastSignalKey='';
  let busy=false;
  let lastLiveOk=0;

  const readableStyle=document.createElement('style');
  readableStyle.textContent=`
    body.screener-page #content>.card:first-child .note{font-size:9.5px!important;line-height:1.38!important}
    body.screener-page #content>.card:first-child .statpill{font-size:8px!important}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th{font-size:8.4px!important;line-height:1.08!important;padding:5px 3px!important}
    body.screener-page #content>.card:first-child table.data-table.screener-compact td{font-size:9.4px!important;line-height:1.12!important;padding:5px 3px!important}
    body.screener-page #content>.card:first-child table.data-table.screener-compact td b{font-size:10px!important}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .mini{font-size:7.1px!important;line-height:1.08!important;opacity:.76!important}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .signal-note{font-size:8.2px!important;line-height:1.12!important}
  `;
  document.head.appendChild(readableStyle);

  function loadHistoryLevelSnapshots(){
    if(document.querySelector('script[data-history-levels]'))return;
    const s=document.createElement('script');s.src='../screener_history_levels.js';s.defer=true;s.dataset.historyLevels='1';document.head.appendChild(s);
  }
  loadHistoryLevelSnapshots();

  function minuteLabel(anchor,at){
    if(!anchor||!at)return'';
    const a=new Date(anchor).getTime(),b=new Date(at).getTime();
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)return'';
    return `${Math.floor((b-a)/60000)+1}. dk`;
  }
  function localPct(v){return v==null||!Number.isFinite(Number(v))?'—':`${Number(v)>=0?'+':''}${Number(v).toFixed(2)}%`}

  async function patchPeakHistoryLabels(){
    const cards=[...document.querySelectorAll('#content>.card')];
    const card=cards.find(c=>(c.querySelector('h2')?.textContent||'').includes('Tarayıcı Sonrası'));
    if(!card)return;
    const h2=card.querySelector('h2');if(h2)h2.textContent='Tarayıcı Sonrası · 15dk / 30dk Peak + Dip Tarihçe';
    const titles=[...card.querySelectorAll('.horizon-title')];
    if(titles[0])titles[0].textContent='İlk 15 dakika · Peak + Dip';
    if(titles[1])titles[1].textContent='İlk 30 dakika · Peak + Dip';
    [...card.querySelectorAll('.statpill')].forEach(p=>{if(p.textContent.trim().startsWith('En kötü:'))p.textContent=p.textContent.replace('En kötü:','En düşük peak:')});
    [...card.querySelectorAll('table.data-table th')].forEach(th=>{const t=th.textContent.trim();if(t==='+15dk')th.textContent='15dk Peak / Dip';else if(t==='+30dk')th.textContent='30dk Peak / Dip';else if(t==='Fiyat İzi')th.textContent='Fiyat İzi · Peak'});
    const note=card.querySelector('.history-note');
    if(note)note.textContent='Peak = pencere içindeki en yüksek 1dk HIGH; Dip = pencere içindeki en düşük 1dk LOW. İkisi de sinyal 10dk kapanış fiyatına göre hesaplanır. Dip stop riskini, peak ise ulaşılabilir maksimum yukarı hareketi gösterir.';
    try{
      const r=await fetch('../data/screener_history.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
      const h=await r.json();const events=(h.events||[]).slice(0,100),summary=h.summary||{};
      [15,30].forEach((m,i)=>{
        const stat=titles[i]?.nextElementSibling;if(!stat)return;
        let pill=stat.querySelector(`[data-worst-dip="${m}"]`);
        if(!pill){pill=document.createElement('span');pill.className='statpill';pill.dataset.worstDip=String(m);stat.appendChild(pill)}
        pill.textContent=`En kötü dip: ${localPct(summary[`${m}m`]?.worst_dip_pct)}`;
      });
      const rows=[...card.querySelectorAll('table.data-table tr')].slice(1);
      events.forEach((e,i)=>{
        const tr=rows[i];if(!tr||tr.children.length<9)return;
        [[15,7],[30,8]].forEach(([m,idx])=>{
          const cell=tr.children[idx];if(!cell)return;
          cell.querySelectorAll(`[data-peak-minute="${m}"],[data-dip="${m}"]`).forEach(x=>x.remove());
          const anchor=e.signal_candle_close_utc||e.detected_at;
          const peakWhen=minuteLabel(anchor,e[`peak_${m}m_at`]);
          if(e[`change_${m}m_pct`]!=null){const d=document.createElement('div');d.className='mini positive';d.dataset.peakMinute=String(m);d.textContent=`Yüksek: ${localPct(e[`change_${m}m_pct`])}${peakWhen?' · '+peakWhen:''}`;cell.appendChild(d)}
          if(e[`dip_change_${m}m_pct`]!=null){const d=document.createElement('div');d.className='mini negative';d.dataset.dip=String(m);const dipWhen=minuteLabel(anchor,e[`dip_${m}m_at`]);d.textContent=`Düşük: ${localPct(e[`dip_change_${m}m_pct`])}${dipWhen?' · '+dipWhen:''}`;cell.appendChild(d)}
        });
      });
    }catch(e){}
  }

  function signalKey(d){return (d.movers||[]).map(x=>`${x.symbol}:${x.signal_candle_close_utc||x.level_context?.signal_candle_close_utc||d.signal_candle_close_utc||''}`).sort().join('|')}
  function flashNewSignals(d){const key=signalKey(d);if(lastSignalKey&&key&&key!==lastSignalKey){document.title='🔴 YENİ SİNYAL — Tarayıcı';setTimeout(()=>{document.title='Tarayıcı — Piyasa İstihbarat Ağı'},12000)}lastSignalKey=key}
  function fmtPrice(v){if(v==null||!Number.isFinite(Number(v)))return'—';const n=Number(v),a=Math.abs(n);if(a>=1000)return n.toLocaleString('tr-TR',{maximumFractionDigits:2});if(a>=1)return n.toLocaleString('tr-TR',{maximumFractionDigits:4});return n.toLocaleString('tr-TR',{maximumFractionDigits:7})}
  function fmtPct(v){return v==null||!Number.isFinite(Number(v))?'—':`${Number(v)>=0?'+':''}${Number(v).toFixed(2)}%`}
  function fmtClock(v){if(!v)return'—';try{return new Date(v).toLocaleTimeString('tr-TR',{timeZone:TZ,hour:'2-digit',minute:'2-digit'})}catch(e){return'—'}}
  function fmtDateTime(v){if(!v)return'—';try{return new Date(v).toLocaleString('tr-TR',{timeZone:TZ,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch(e){return'—'}}
  function signalWindow(row,d){let open=row?.level_context?.signal_candle_open_utc||row?.signal_candle_open_utc||row?.signal_time_utc||d?.signal_candle_open_utc||null;let close=row?.level_context?.signal_candle_close_utc||row?.signal_candle_close_utc||d?.signal_candle_close_utc||null;if(open&&!close){const t=new Date(open);if(Number.isFinite(t.getTime()))close=new Date(t.getTime()+10*60*1000).toISOString()}return `${fmtClock(open)}–${fmtClock(close)}`}
  function expectedClosedWindow(){const now=Date.now();const currentStart=Math.floor(now/600000)*600000;return `${fmtClock(new Date(currentStart-600000).toISOString())}–${fmtClock(new Date(currentStart).toISOString())}`}
  function isStaleStatic(d){if(!d||d.live_source||!d.generated_at)return false;const t=new Date(d.generated_at).getTime();return Number.isFinite(t)&&Date.now()-t>STALE_MS}
  function setScanningStatus(){const u=document.getElementById('updated');if(!u)return;u.className='updated';u.textContent=`⟳ Güncel 10dk mum taranıyor · hedef ${expectedClosedWindow()} (TR)`}
  function setLiveStatus(d){const u=document.getElementById('updated');if(!u)return;const dur=Number.isFinite(Number(d.scan_duration_s))?` · ${Number(d.scan_duration_s).toFixed(1)} sn`:'';u.className='updated fresh';u.textContent=`● CANLI · Tarama ${signalWindow(null,d)} (TR) · Hesaplandı ${fmtDateTime(d.generated_at)}${dur}`}
  function setRetryStatus(){const u=document.getElementById('updated');if(!u)return;if(lastLiveOk&&Date.now()-lastLiveOk<120000)return;u.className='updated stale';u.textContent=`⚠ Canlı tarama yanıtı bekleniyor · hedef ${expectedClosedWindow()} (TR) · otomatik tekrar deneniyor`}

  const baseActiveCard=window.activeCard;
  if(typeof baseActiveCard==='function'){
    window.activeCard=function(d){const stale=isStaleStatic(d);const view=stale?{...d,movers:[],static_stale:true,scan_meta:{...(d.scan_meta||{}),signal_count_before_cap:0}}:d;const holder=document.createElement('div');holder.innerHTML=baseActiveCard(view);const card=holder.firstElementChild;if(!card)return holder.innerHTML;if(stale){const note=card.querySelector('.note');if(note&&!note.textContent.includes('Statik yedek veri eski'))note.insertAdjacentHTML('beforeend',`<br><span class="stale">⚠ Statik yedek veri eski; eski sinyal aktif sayılmaz. Canlı tarama bekleniyor.</span>`)}const table=card.querySelector('table.data-table');if(table&&!stale){const head=table.querySelector('tr');if(head&&head.children.length&&!Array.from(head.children).some(x=>x.textContent.trim().startsWith('Sinyal Mumu'))){const th=document.createElement('th');th.textContent='Sinyal Mumu (TR)';head.children[0].insertAdjacentElement('afterend',th);const trs=Array.from(table.querySelectorAll('tr')).slice(1);(view.movers||[]).forEach((row,i)=>{const tr=trs[i];if(!tr||!tr.children.length)return;const td=document.createElement('td');td.className='nowrap';td.innerHTML=`<b>${signalWindow(row,view)}</b><div class="mini">10dk kapanış sinyali</div>`;tr.children[0].insertAdjacentElement('afterend',td)})}}return card.outerHTML}
  }

  function levelCell(obj){obj=obj||{};const status=obj.status||'UNAVAILABLE';const text=obj.status_tr||'—';const cls=(status==='ABOVE'||status==='CROSS_UP')?'positive':(status==='BELOW'||status==='CROSS_DOWN')?'negative':'';const touch=obj.touched&&status!=='CROSS_UP'&&status!=='CROSS_DOWN'?' · temas':'';return `<div class="${cls}" style="font-weight:800;white-space:nowrap">${text}${touch}</div><div class="mini">${fmtPrice(obj.value)} · ${fmtPct(obj.distance_pct)}</div>`}
  function renderLevelContext(d){const content=document.getElementById('content');if(!content)return;let old=document.getElementById('levelContextCard');if(isStaleStatic(d)){if(old)old.remove();return}const rows=(d.movers||[]).filter(x=>x.level_context&&x.level_context.levels);if(!rows.length){if(old)old.remove();return}const wrap=document.createElement('div');wrap.id='levelContextCard';wrap.className='card';wrap.innerHTML=`<h2>Sinyal Anı · Ana Seviye Konumu</h2><div class="note">Sinyal 10dk kapanışındaki fiyatın DO, NYMO, WO ve DVWAP'a göre konumu. “Yeni kesti” = önceki 10dk kapanışı ile sinyal kapanışı seviyenin farklı tarafında kapandı.</div><div class="table-wrap"><table class="data-table"><tr><th>Coin</th><th>Sinyal Fiyatı</th><th>DO</th><th>NYMO</th><th>WO</th><th>DVWAP</th><th>Sinyal Mumu (TR)</th></tr>${rows.map(x=>{const c=x.level_context,l=c.levels||{};return `<tr><td><b>${x.symbol||'—'}</b></td><td>${fmtPrice(c.signal_price)}</td><td>${levelCell(l.DO)}</td><td>${levelCell(l.NYMO)}</td><td>${levelCell(l.WO)}</td><td>${levelCell(l.DVWAP)}</td><td class="nowrap"><b>${signalWindow(x,d)}</b></td></tr>`}).join('')}</table></div>`;if(old)old.replaceWith(wrap);else{const active=content.firstElementChild;if(active)active.insertAdjacentElement('afterend',wrap);else content.prepend(wrap)}}
  window.renderScreenerLevelContext=renderLevelContext;

  async function refreshLive(showScanning=false){if(busy||document.hidden)return;busy=true;if(showScanning)setScanningStatus();try{const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('live screener '+r.status);const d=await r.json();if(!d||!d.generated_at||typeof window.activeCard!=='function')throw new Error('invalid live payload');const content=document.getElementById('content');if(!content)return;const holder=document.createElement('div');holder.innerHTML=window.activeCard(d);const card=holder.firstElementChild;if(!card)return;const note=card.querySelector('.note');if(note&&!note.textContent.includes('CANLI'))note.insertAdjacentHTML('beforeend',`<br><span class="fresh">● CANLI · Taranan mum ${signalWindow(null,d)} (Türkiye)</span>`);const first=content.firstElementChild;if(first)content.replaceChild(card,first);else content.prepend(card);renderLevelContext(d);patchPeakHistoryLabels();lastLiveOk=Date.now();setLiveStatus(d);flashNewSignals(d)}catch(e){setRetryStatus()}finally{busy=false}}
  async function renderStaticContext(){try{const r=await fetch('../data/screener.json?t='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(!isStaleStatic(d))renderLevelContext(d)}}catch(e){}}
  function msToNextBoundary(){const now=Date.now();const next=(Math.floor(now/600000)+1)*600000;return Math.max(1000,next-now+5000)}
  function scheduleBoundary(){setTimeout(()=>{refreshLive(true);setTimeout(()=>refreshLive(false),8000);setTimeout(()=>refreshLive(false),16000);scheduleBoundary()},msToNextBoundary())}
  setTimeout(renderStaticContext,400);setTimeout(patchPeakHistoryLabels,700);setTimeout(()=>refreshLive(true),700);setInterval(()=>refreshLive(false),15000);setInterval(patchPeakHistoryLabels,5000);scheduleBoundary();document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshLive(true);patchPeakHistoryLabels()}});
})();