(function(){
  if(!location.pathname.endsWith('/agents/crypto.html'))return;
  const originalFetch=window.fetch.bind(window);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>{v=Number(v);if(!Number.isFinite(v))return'—';if(Math.abs(v)>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(Math.abs(v)>=1e6)return'$'+(v/1e6).toFixed(1)+'M';if(Math.abs(v)>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('tr-TR',{maximumFractionDigits:2})};
  const num=v=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toLocaleString('tr-TR',{maximumFractionDigits:2});
  const pct=v=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toFixed(2)+'%';
  const short=a=>a?`${String(a).slice(0,6)}…${String(a).slice(-4)}`:'—';
  const when=v=>{if(!v)return'—';try{return new Date(v).toLocaleString('tr-TR',{timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return'—'}};
  const labels=r=>esc(((r&&r.labels)||[]).join(', ')||'etiketsiz');

  const alertStyle=document.createElement('style');
  alertStyle.textContent=`
  #coinIntelResult .ci-section{border:1px solid rgba(140,185,165,.18);border-radius:14px;padding:15px;margin:15px 0;background:rgba(9,24,19,.65)}
  #coinIntelResult .ci-section h3{margin:0 0 12px;font-size:14px;letter-spacing:.02em}
  #coinIntelResult .ci-grid{gap:11px}
  #coinIntelResult .ci-box{border-radius:12px;padding:14px}
  #coinIntelResult .ci-table{border-collapse:separate;border-spacing:0;width:100%;font-size:11px}
  #coinIntelResult .ci-table th{position:sticky;top:0;background:#14251e;text-align:left;padding:10px;white-space:nowrap}
  #coinIntelResult .ci-table td{padding:11px 10px;border-bottom:1px solid rgba(150,190,160,.13);vertical-align:middle}
  #coinIntelResult .ci-table tr.ci-danger td{background:rgba(235,58,75,.13);border-bottom-color:rgba(255,85,100,.23)}
  #coinIntelResult .ci-table tr.ci-danger td:first-child{border-left:3px solid #ff5267}
  #coinIntelResult .ci-table tr.ci-watch td{background:rgba(255,187,71,.08)}
  #coinIntelResult .ci-alert{display:inline-block;border-radius:6px;padding:4px 7px;font-size:10px;font-weight:800;white-space:nowrap}
  #coinIntelResult .ci-alert-danger{background:#6a1824;color:#ffe2e6}
  #coinIntelResult .ci-alert-watch{background:#554015;color:#ffe6a3}
  #coinIntelResult .ci-alert-neutral{background:#203b30;color:#bdd9cb}
  #coinIntelResult .ci-transfer-hint{font-size:10px;color:#adc3b6;line-height:1.6;margin:8px 0 12px}
  @media(max-width:650px){#coinIntelResult .ci-section{padding:11px}#coinIntelResult .ci-table{font-size:10px}#coinIntelResult .ci-table th,#coinIntelResult .ci-table td{padding:9px 7px}}
  `;
  document.head.appendChild(alertStyle);
  function transferRisk(r){
    const from=(r.from_labels||[]).join(' ').toLowerCase(),to=(r.to_labels||[]).join(' ').toLowerCase();
    const exchange=/exchange|binance|coinbase|okx|bybit|kraken|kucoin|bitget|gate\\.io|borsa|deposit|hot wallet/;
    const team=/team|treasury|foundation|investor|venture|vesting|unlock|vc\\b/;
    if(exchange.test(to)&&!exchange.test(from))return {level:'danger',text:'🔴 Borsaya giriş',why:'Satış baskısı ihtimali; satış kanıtı değildir'};
    if(team.test(from)&&!team.test(to))return {level:'danger',text:'🔴 Ekip / VC çıkışı',why:'Etiketli cüzdandan çıkış; alıcı doğrulanmalı'};
    if(exchange.test(from)&&!exchange.test(to))return {level:'watch',text:'🟠 Borsadan çıkış',why:'Borsa dışına transfer; birikim kanıtı değildir'};
    return {level:'neutral',text:'⚪ Büyük transfer',why:'Yön ve amaç doğrulanamadı'};
  }
  function walletRows(rows){
    return (rows||[]).map(r=>`<tr><td><b>${esc(r.kind||'—')}</b></td><td title="${esc(r.address||'')}">${short(r.address)}</td><td>${labels(r)}</td><td>${num(r.amount)}</td><td>${pct(r.share_pct)}</td></tr>`).join('');
  }
  function moveRows(rows){
    return (rows||[]).map(r=>{const risk=transferRisk(r);return `<tr class="ci-${risk.level==='danger'?'danger':risk.level==='watch'?'watch':'neutral'}"><td><span class="ci-alert ci-alert-${risk.level}" title="${esc(risk.why)}">${risk.text}</span><br>${when(r.at)}</td><td>${money(r.amount_usd)}</td><td title="${esc(r.from||'')}">${short(r.from)}</td><td>${esc((r.from_labels||[]).join(', ')||'—')}</td><td title="${esc(r.to||'')}">${short(r.to)}</td><td>${esc((r.to_labels||[]).join(', ')||'—')}</td></tr>`}).join('');
  }
  function patchScore(d){
    const out=document.getElementById('coinIntelResult');if(!out)return;
    const a=d.assessment||{};if(!a.long_term_potential_provisional)return;
    const box=[...out.querySelectorAll('.ci-box')].find(b=>(b.querySelector('.ci-label')?.textContent||'').trim()==='Long-term Potential');
    if(!box)return;
    const value=box.querySelector('.ci-value');if(value){value.className='ci-value';value.style.color='#ffcf5c';value.textContent='VERİ YETERSİZ'}
    let note=box.querySelector('.ci-muted');if(!note){note=document.createElement('div');note.className='ci-muted';box.appendChild(note)}
    note.textContent=`Ham skor ${a.long_term_potential_score??'—'}/100 · ${a.long_term_potential_note||'Eksik veri nedeniyle geçici.'}`;
  }
  function renderSmart(d){
    const out=document.getElementById('coinIntelResult');if(!out)return;
    patchScore(d);
    const sections=[...out.querySelectorAll('.ci-section')];
    const target=sections.find(s=>(s.querySelector('h3')?.textContent||'').startsWith('VC / Team Wallets'));
    if(!target)return;
    const sm=d.smart_money||{};
    if(!sm.available){
      target.innerHTML=`<h3>VC / Team Wallets · Exchange Inflows · Whale Activity</h3><div class="ci-warn">${esc(sm.note||'Bu coin için doğrulanmış smart-money verisi yok.')}</div>${sm.chain?`<div class="ci-muted" style="margin-top:6px">Zincir: ${esc(sm.chain)}${sm.native_asset?' · Native varlık':sm.contract?` · Kontrat: ${esc(short(sm.contract))}`:''}</div>`:''}`;
      return;
    }
    const flow=(sm.exchange_flows||[])[0]||{};
    const tracked=[...(sm.vc_wallets||[]),...(sm.team_unlock_wallets||[]),...(sm.exchange_wallets||[])];
    const native=Boolean(sm.native_asset);
    const concentration=native?sm.labeled_supply_concentration_pct:sm.top_holder_concentration_pct;
    const concentrationLabel=native?'Etiketli Supply Yoğunluğu':'Top-10 Holder Yoğunluğu';
    const concentrationNote=native?`${sm.labeled_holders??0} doğrulanmış team/investor/exchange cüzdanı`:`İlk ${sm.holders_sampled??0} holder örneği`;
    target.innerHTML=`<h3>VC / Team Wallets · Exchange Inflows · Whale Activity</h3>
      <div class="ci-grid">
        <div class="ci-box"><div class="ci-label">${concentrationLabel}</div><div class="ci-value">${pct(concentration)}</div><div class="ci-muted">${concentrationNote}</div></div>
        <div class="ci-box"><div class="ci-label">Etiketli Cüzdan</div><div class="ci-value">${sm.labeled_holders??0}</div><div class="ci-muted">Sahiplik tahmini yapılmaz</div></div>
        <div class="ci-box"><div class="ci-label">7g Gözlenen Borsa Net Akışı</div><div class="ci-value ${Number(flow.net_tokens)>0?'negative':Number(flow.net_tokens)<0?'positive':''}">${num(flow.net_tokens)} token</div><div class="ci-muted">${money(flow.net_usd)}</div></div>
        <div class="ci-box"><div class="ci-label">Whale Hareketi</div><div class="ci-value">${(sm.whale_moves||[]).length}</div><div class="ci-muted">Büyük son transfer örneği</div></div>
      </div>
      <div class="ci-muted">Zincir: ${esc(sm.chain||'—')} · ${native?'Native coin':`Kontrat: ${esc(short(sm.contract))}`} · Kapsam: ${esc(sm.coverage||'—')}</div>
      ${tracked.length?`<div style="overflow:auto;margin-top:9px"><table class="ci-table"><tr><th>Tür</th><th>Cüzdan</th><th>Etiket</th><th>Token</th><th>Supply Payı</th></tr>${walletRows(tracked.slice(0,16))}</table></div>`:'<div class="ci-warn" style="margin-top:9px">Doğrulanmış VC/team/exchange etiketi bulunmadı.</div>'}
      ${(sm.whale_moves||[]).length?`<div class="ci-section"><h3>🚨 Son Büyük Transferler</h3><div class="ci-transfer-hint">Kırmızı: borsaya giriş veya etiketli ekip/VC çıkışı · Turuncu: borsadan çıkış · Gri: yönü belirsiz. Bunlar inceleme işaretidir, kesin satış sinyali değildir.</div><div style="overflow:auto"><table class="ci-table"><tr><th>Zaman</th><th>Yaklaşık Değer</th><th>Gönderen</th><th>Gönderen etiketi</th><th>Alıcı</th><th>Alıcı etiketi</th></tr>${moveRows(sm.whale_moves)}</table></div></div>`:''}
      ${(sm.vc_moves||[]).length?`<div class="ci-section"><h3>🏦 VC / Yatırımcı Transferleri</h3><div style="overflow:auto"><table class="ci-table"><tr><th>Zaman</th><th>Yaklaşık Değer</th><th>Gönderen</th><th>Etiket</th><th>Alıcı</th><th>Etiket</th></tr>${moveRows(sm.vc_moves)}</table></div></div>`:''}
      ${(sm.team_moves||[]).length?`<div class="ci-section"><h3>👥 Ekip / Hazine Transferleri</h3><div style="overflow:auto"><table class="ci-table"><tr><th>Zaman</th><th>Yaklaşık Değer</th><th>Gönderen</th><th>Etiket</th><th>Alıcı</th><th>Etiket</th></tr>${moveRows(sm.team_moves)}</table></div></div>`:''}
      <div class="ci-muted" style="margin-top:9px">${esc(sm.note||'')}</div>`;
  }

  window.fetch=async function(input,init){
    const response=await originalFetch(input,init);
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(url.includes('/api/public/coin-intelligence')){
        response.clone().json().then(d=>{if(d&&!d.error)setTimeout(()=>renderSmart(d),60)}).catch(()=>{});
      }
    }catch(e){}
    return response;
  };
})();
