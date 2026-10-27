(function(){
  if(!location.pathname.endsWith('/agents/screener.html'))return;
  const API='https://project-alpha-terminal.onrender.com/api/public/screener-ws';
  const LIVE_KEY='alpha_live_screener_enabled';
  let liveEnabled=false;
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
  function hitRate(events,m,threshold){
    const vals=events.map(e=>Number(e[`change_${m}m_pct`])).filter(Number.isFinite);
    if(!vals.length)return null;
    return vals.filter(v=>v>=threshold).length/vals.length*100;
  }

  function historySummary(events,m){
    const done=events.filter(e=>e[`change_${m}m_pct`]!=null&&Number.isFinite(Number(e[`change_${m}m_pct`])));
    const vals=done.map(e=>Number(e[`change_${m}m_pct`])).sort((a,b)=>a-b);
    const dips=done.map(e=>Number(e[`dip_change_${m}m_pct`])).filter(Number.isFinite);
    const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
    return {completed:vals.length,pending:events.length-vals.length,up_rate_pct:vals.length?vals.filter(v=>v>0).length/vals.length*100:null,avg_change_pct:avg,median_change_pct:vals.length?(vals[Math.floor((vals.length-1)/2)]+vals[Math.floor(vals.length/2)])/2:null,best_change_pct:vals.length?vals[vals.length-1]:null,worst_change_pct:vals.length?vals[0]:null,hit_1pct_rate_pct:vals.length?vals.filter(v=>v>=1).length/vals.length*100:null,hit_1_5pct_rate_pct:vals.length?vals.filter(v=>v>=1.5).length/vals.length*100:null,worst_dip_pct:dips.length?Math.min(...dips):null};
  }
  async function patchPeakHistoryLabels(){
    const slot=document.getElementById('liveHistorySlot');
    if(!slot||typeof window.historyCard!=='function')return;
    try{
      const r=await fetch(API+'/history?limit=100&t='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw Error('HTTP '+r.status);
      const h=await r.json();
      if(!Array.isArray(h.events))throw Error('Geçersiz geçmiş verisi');
      const events=h.events.slice(0,100);
      h.summary={'15m':historySummary(events,15),'30m':historySummary(events,30)};
      const holder=document.createElement('div');holder.innerHTML=window.historyCard(h);
      const card=holder.firstElementChild;if(!card)return;
      const heading=card.querySelector('h2');if(heading)heading.textContent='Tarayıcı Sonrası · 15dk / 30dk Peak + Dip Tarihçe';
      const note=card.querySelector('.history-note');if(note)note.textContent='Peak ve dip, sinyal mumunun kapanışından sonraki pencerede ölçülür. Özetler görüntülenen kayıtlardan hesaplanır.';
      const statlines=[...card.querySelectorAll('.statline')];
      [15,30].forEach((m,i)=>{const stat=statlines[i],s=h.summary[m+'m'];if(!stat)return;
        for(const [label,value] of [['+1% gören',s.hit_1pct_rate_pct],['+1.5% gören',s.hit_1_5pct_rate_pct],['En kötü dip',s.worst_dip_pct]]){
          const p=document.createElement('span');p.className='statpill';p.textContent=label+': '+localPct(value);stat.appendChild(p);
        }
      });
      const rows=[...card.querySelectorAll('table.data-table tr')].slice(1);
      events.forEach((e,i)=>{const tr=rows[i];if(!tr)return;
        [[15,7],[30,8]].forEach(([m,idx])=>{const cell=tr.children[idx];if(!cell)return;
          const peak=e[`change_${m}m_pct`],dip=e[`dip_change_${m}m_pct`];
          if(peak!=null){const el=document.createElement('div');el.className='mini positive';el.textContent='Peak: '+localPct(peak);cell.appendChild(el)}
          if(dip!=null){const el=document.createElement('div');el.className='mini negative';el.textContent='Dip: '+localPct(dip);cell.appendChild(el)}
        });
      });
      slot.replaceChildren(card);
    }catch(e){
      if(!slot.querySelector('.card'))slot.innerHTML='<div class="card"><h2>Tarayıcı Sinyal Geçmişi</h2><div class="empty">⚠ Geçmiş kayıtlar yüklenemedi. Bu, veritabanının boş olduğu anlamına gelmez.</div></div>';
    }
  }

  function signalKey(d){return (d.movers||[]).map(x=>`${x.symbol}:${x.signal_candle_close_utc||x.level_context?.signal_candle_close_utc||d.signal_candle_close_utc||''}`).sort().join('|')}
  function flashNewSignals(d){const key=signalKey(d);if(lastSignalKey&&key&&key!==lastSignalKey){document.title='🔴 YENİ SİNYAL — Tarayıcı';setTimeout(()=>{document.title='Tarayıcı — Piyasa İstihbarat Ağı'},12000)}lastSignalKey=key}
  function fmtPrice(v){if(v==null||!Number.isFinite(Number(v)))return'—';const n=Number(v),a=Math.abs(n);if(a>=1000)return n.toLocaleString('tr-TR',{maximumFractionDigits:2});if(a>=1)return n.toLocaleString('tr-TR',{maximumFractionDigits:4});return n.toLocaleString('tr-TR',{maximumFractionDigits:7})}
  function fmtPct(v){return v==null||!Number.isFinite(Number(v))?'—':`${Number(v)>=0?'+':''}${Number(v).toFixed(2)}%`}
  function fmtClock(v){if(!v)return'—';try{return new Date(v).toLocaleTimeString('tr-TR',{timeZone:TZ,hour:'2-digit',minute:'2-digit'})}catch(e){return'—'}}
  function fmtDateTime(v){if(!v)return'—';try{return new Date(v).toLocaleString('tr-TR',{timeZone:TZ,day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch(e){return'—'}}
  function signalWindow(row,d){let open=row?.level_context?.signal_candle_open_utc||row?.signal_candle_open_utc||row?.signal_time_utc||d?.signal_candle_open_utc||null;let close=row?.level_context?.signal_candle_close_utc||row?.signal_candle_close_utc||d?.signal_candle_close_utc||null;if(open&&!close){const t=new Date(open);if(Number.isFinite(t.getTime()))close=new Date(t.getTime()+10*60*1000).toISOString()}return `${fmtClock(open)}–${fmtClock(close)}`}
  function expectedClosedWindow(){const now=Date.now();const currentStart=Math.floor(now/900000)*900000;return `${fmtClock(new Date(currentStart-900000).toISOString())}–${fmtClock(new Date(currentStart).toISOString())}`}
  function isStaleStatic(d){if(!d||d.live_source||!d.generated_at)return false;const t=new Date(d.generated_at).getTime();return Number.isFinite(t)&&Date.now()-t>STALE_MS}
  function setScanningStatus(){const u=document.getElementById('updated');if(!u)return;u.className='updated';u.textContent=`⟳ Güncel 15dk mum taranıyor · hedef ${expectedClosedWindow()} (TR)`}
  function setLiveStatus(d){const u=document.getElementById('updated');if(!u)return;const dur=Number.isFinite(Number(d.scan_duration_s))?` · ${Number(d.scan_duration_s).toFixed(1)} sn`:'';u.className='updated fresh';u.textContent=`● CANLI · Tarama ${signalWindow(null,d)} (TR) · Hesaplandı ${fmtDateTime(d.generated_at)}${dur}`}
  function setRetryStatus(reason=''){const u=document.getElementById('updated');if(!u)return;if(!reason&&lastLiveOk&&Date.now()-lastLiveOk<120000)return;u.className='updated stale';u.textContent=`⚠ ${reason||'Canlı tarama yanıtı bekleniyor'} · hedef ${expectedClosedWindow()} (TR) · otomatik tekrar deneniyor`}

  const baseActiveCard=window.activeCard;
  if(typeof baseActiveCard==='function'){
    window.activeCard=function(d){const stale=isStaleStatic(d);const view=stale?{...d,movers:[],static_stale:true,scan_meta:{...(d.scan_meta||{}),signal_count_before_cap:0}}:d;const holder=document.createElement('div');holder.innerHTML=baseActiveCard(view);const card=holder.firstElementChild;if(!card)return holder.innerHTML;if(stale){const note=card.querySelector('.note');if(note&&!note.textContent.includes('Statik yedek veri eski'))note.insertAdjacentHTML('beforeend',`<br><span class="stale">⚠ Statik yedek veri eski; eski sinyal aktif sayılmaz. Canlı tarama bekleniyor.</span>`)}const table=card.querySelector('table.data-table');if(table&&!stale){const head=table.querySelector('tr');if(head&&head.children.length&&!Array.from(head.children).some(x=>x.textContent.trim().startsWith('Sinyal Mumu'))){const th=document.createElement('th');th.textContent='Sinyal Mumu (TR)';head.children[0].insertAdjacentElement('afterend',th);const trs=Array.from(table.querySelectorAll('tr')).slice(1);(view.movers||[]).forEach((row,i)=>{const tr=trs[i];if(!tr||!tr.children.length)return;const td=document.createElement('td');td.className='nowrap';td.innerHTML=`<b>${signalWindow(row,view)}</b><div class="mini">15dk kapanış sinyali</div>`;tr.children[0].insertAdjacentElement('afterend',td)})}}return card.outerHTML}
  }

  function levelCell(obj){obj=obj||{};const status=obj.status||'UNAVAILABLE';const text=obj.status_tr||'—';const cls=(status==='ABOVE'||status==='CROSS_UP')?'positive':(status==='BELOW'||status==='CROSS_DOWN')?'negative':'';const touch=obj.touched&&status!=='CROSS_UP'&&status!=='CROSS_DOWN'?' · temas':'';return `<div class="${cls}" style="font-weight:800;white-space:nowrap">${text}${touch}</div><div class="mini">${fmtPrice(obj.value)} · ${fmtPct(obj.distance_pct)}</div>`}
  function renderLevelContext(d){const content=document.getElementById('content');if(!content)return;let old=document.getElementById('levelContextCard');if(isStaleStatic(d)){if(old)old.remove();return}const rows=(d.movers||[]).filter(x=>x.level_context&&x.level_context.levels);if(!rows.length){if(old)old.remove();return}const wrap=document.createElement('div');wrap.id='levelContextCard';wrap.className='card';wrap.innerHTML=`<h2>Sinyal Anı · Ana Seviye Konumu</h2><div class="note">Sinyal 15dk kapanışındaki fiyatın DO, NYMO, WO ve DVWAP'a göre konumu. “Yeni kesti” = önceki 15dk kapanışı ile sinyal kapanışı seviyenin farklı tarafında kapandı.</div><div class="table-wrap"><table class="data-table"><tr><th>Coin</th><th>Sinyal Fiyatı</th><th>DO</th><th>NYMO</th><th>WO</th><th>DVWAP</th><th>Sinyal Mumu (TR)</th></tr>${rows.map(x=>{const c=x.level_context,l=c.levels||{};return `<tr><td><b>${x.symbol||'—'}</b></td><td>${fmtPrice(c.signal_price)}</td><td>${levelCell(l.DO)}</td><td>${levelCell(l.NYMO)}</td><td>${levelCell(l.WO)}</td><td>${levelCell(l.DVWAP)}</td><td class="nowrap"><b>${signalWindow(x,d)}</b></td></tr>`}).join('')}</table></div>`;if(old)old.replaceWith(wrap);else{const active=content.firstElementChild;if(active)active.insertAdjacentElement('afterend',wrap);else content.prepend(wrap)}}
  window.renderScreenerLevelContext=renderLevelContext;

  async function refreshLive(showScanning=false){if(!liveEnabled||busy||document.hidden)return;busy=true;if(showScanning)setScanningStatus();try{const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('API HTTP '+r.status);const d=await r.json();if(d.error)throw new Error(d.error);if(d.running===false)throw new Error('Tarama motoru durmuş; BAŞLAT düğmesine basın');if(d.status==='error')throw new Error(d.error||'Tarama motoru hatası');if(!d||!d.generated_at||typeof window.activeCard!=='function')throw new Error('invalid live payload');const content=document.getElementById('content');if(!content)return;const holder=document.createElement('div');holder.innerHTML=window.activeCard(d);const card=holder.firstElementChild;if(!card)return;const note=card.querySelector('.note');if(note&&!note.textContent.includes('CANLI'))note.insertAdjacentHTML('beforeend',`<br><span class="fresh">● CANLI · Taranan mum ${signalWindow(null,d)} (Türkiye)</span>`);const first=[...content.children].find(x=>x.id!=='liveScannerControls' && x.classList.contains('card'));if(first)content.replaceChild(card,first);else content.appendChild(card);renderLevelContext(d);patchPeakHistoryLabels();lastLiveOk=Date.now();setLiveStatus(d);flashNewSignals(d)}catch(e){setRetryStatus('Canlı veri alınamadı: '+(e.message||'Bağlantı hatası'))}finally{busy=false}}
  async function renderStaticContext(){try{const r=await fetch('../data/screener.json?t='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(!isStaleStatic(d))renderLevelContext(d)}}catch(e){}}
  function msToNextBoundary(){const now=Date.now();const next=(Math.floor(now/900000)+1)*900000;return Math.max(1000,next-now+5000)}
  function scheduleBoundary(){setTimeout(()=>{refreshLive(true);setTimeout(()=>refreshLive(false),8000);setTimeout(()=>refreshLive(false),16000);scheduleBoundary()},msToNextBoundary())}
  function renderLiveControls(){
    let bar=document.getElementById('liveScannerControls');
    if(!bar){
      bar=document.createElement('div');bar.id='liveScannerControls';bar.className='card';
      bar.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px';
      const content=document.getElementById('content');if(content)content.parentElement?.insertBefore(bar,content);
    }
    bar.innerHTML=`<div style="flex:1;min-width:220px"><b style="color:${liveEnabled?'#39ff88':'#ff7070'}">${liveEnabled?'● CANLI TARAYICI AKTİF':'● CANLI TARAYICI KAPALI'}</b><div class="mini" style="margin-top:5px">${liveEnabled?'Açık 15dk mum Binance WebSocket ile canlı taranıyor.':'Tarama yapılmıyor; GitHub Actions kotası bu özellik için kullanılmıyor.'}</div></div><button id="liveScannerToggle" style="cursor:pointer;padding:9px 14px;border-radius:8px;border:1px solid #39ff88;background:#07140b;color:#dfffea;font-weight:800">${liveEnabled?'■ DURDUR':'▶ BAŞLAT'}</button>`;
    document.getElementById('liveScannerToggle').onclick=async()=>{
      const target=!liveEnabled;const btn=document.getElementById('liveScannerToggle');if(btn)btn.disabled=true;
      try{
        const r=await fetch(API+(target?'/start':'/stop'),{method:'POST',cache:'no-store'});
        if(!r.ok)throw new Error('motor '+r.status);
        const d=await r.json();liveEnabled=!!d.running;localStorage.setItem(LIVE_KEY,liveEnabled?'1':'0');renderLiveControls();
        if(liveEnabled){setScanningStatus();setTimeout(()=>refreshLive(true),1200)}
        else{const u=document.getElementById('updated');if(u){u.className='updated stale';u.textContent='WebSocket tarayıcı durduruldu';}}
      }catch(e){if(btn)btn.disabled=false;setRetryStatus('Başlatma başarısız: '+(e.message||'Bağlantı hatası'))}
    };
  }
  setTimeout(renderStaticContext,400);
  setTimeout(async()=>{await patchPeakHistoryLabels();renderLiveControls()},700);setTimeout(async()=>{try{const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();liveEnabled=!!d.running;renderLiveControls();if(liveEnabled)refreshLive(true)}}catch(e){}},850);
  setTimeout(()=>{if(liveEnabled)refreshLive(true)},900);
  setInterval(()=>refreshLive(false),15000);setInterval(patchPeakHistoryLabels,5000);scheduleBoundary();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(liveEnabled)refreshLive(true);patchPeakHistoryLabels()}});

})();