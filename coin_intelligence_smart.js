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

  function walletRows(rows){
    return (rows||[]).map(r=>`<tr><td><b>${esc(r.kind||'—')}</b></td><td title="${esc(r.address||'')}">${short(r.address)}</td><td>${labels(r)}</td><td>${num(r.amount)}</td><td>${pct(r.share_pct)}</td></tr>`).join('');
  }
  function moveRows(rows){
    return (rows||[]).map(r=>`<tr><td>${when(r.at)}</td><td>${money(r.amount_usd)}</td><td title="${esc(r.from||'')}">${short(r.from)}</td><td>${esc((r.from_labels||[]).join(', ')||'—')}</td><td title="${esc(r.to||'')}">${short(r.to)}</td><td>${esc((r.to_labels||[]).join(', ')||'—')}</td></tr>`).join('');
  }
  function renderSmart(d){
    const out=document.getElementById('coinIntelResult');if(!out)return;
    const sections=[...out.querySelectorAll('.ci-section')];
    const target=sections.find(s=>(s.querySelector('h3')?.textContent||'').startsWith('VC / Team Wallets'));
    if(!target)return;
    const sm=d.smart_money||{};
    if(!sm.available){
      target.innerHTML=`<h3>VC / Team Wallets · Exchange Inflows · Whale Activity</h3><div class="ci-warn">${esc(sm.note||'Bu coin için doğrulanmış smart-money verisi yok.')}</div>${sm.chain?`<div class="ci-muted" style="margin-top:6px">Zincir: ${esc(sm.chain)} · Kontrat: ${esc(short(sm.contract))}</div>`:''}`;
      return;
    }
    const flow=(sm.exchange_flows||[])[0]||{};
    const tracked=[...(sm.vc_wallets||[]),...(sm.team_unlock_wallets||[]),...(sm.exchange_wallets||[])];
    target.innerHTML=`<h3>VC / Team Wallets · Exchange Inflows · Whale Activity</h3>
      <div class="ci-grid">
        <div class="ci-box"><div class="ci-label">Top-10 Holder Yoğunluğu</div><div class="ci-value">${pct(sm.top_holder_concentration_pct)}</div><div class="ci-muted">İlk ${sm.holders_sampled??0} holder örneği</div></div>
        <div class="ci-box"><div class="ci-label">Etiketli Holder</div><div class="ci-value">${sm.labeled_holders??0}</div><div class="ci-muted">Sahiplik tahmini yapılmaz</div></div>
        <div class="ci-box"><div class="ci-label">7g Gözlenen Borsa Net Akışı</div><div class="ci-value ${Number(flow.net_tokens)>0?'negative':Number(flow.net_tokens)<0?'positive':''}">${num(flow.net_tokens)} token</div><div class="ci-muted">${money(flow.net_usd)}</div></div>
        <div class="ci-box"><div class="ci-label">Whale Hareketi</div><div class="ci-value">${(sm.whale_moves||[]).length}</div><div class="ci-muted">Büyük son transfer örneği</div></div>
      </div>
      <div class="ci-muted">Zincir: ${esc(sm.chain||'—')} · Kontrat: ${esc(short(sm.contract))} · Kapsam: ${esc(sm.coverage||'—')}</div>
      ${tracked.length?`<div style="overflow:auto;margin-top:9px"><table class="ci-table"><tr><th>Tür</th><th>Cüzdan</th><th>Etiket</th><th>Token</th><th>Supply Payı</th></tr>${walletRows(tracked.slice(0,16))}</table></div>`:'<div class="ci-warn" style="margin-top:9px">İlk holder örneğinde doğrulanmış VC/team/exchange etiketi bulunmadı.</div>'}
      ${(sm.whale_moves||[]).length?`<div class="ci-section"><h3>Son Büyük Transferler</h3><div style="overflow:auto"><table class="ci-table"><tr><th>Zaman</th><th>Yaklaşık Değer</th><th>Gönderen</th><th>Gönderen etiketi</th><th>Alıcı</th><th>Alıcı etiketi</th></tr>${moveRows(sm.whale_moves)}</table></div></div>`:''}
      ${(sm.vc_moves||[]).length?`<div class="ci-section"><h3>VC Etiketli Hareketler</h3><div style="overflow:auto"><table class="ci-table"><tr><th>Zaman</th><th>Yaklaşık Değer</th><th>Gönderen</th><th>Etiket</th><th>Alıcı</th><th>Etiket</th></tr>${moveRows(sm.vc_moves)}</table></div></div>`:''}
      ${(sm.team_moves||[]).length?`<div class="ci-section"><h3>Team / Treasury Etiketli Hareketler</h3><div style="overflow:auto"><table class="ci-table"><tr><th>Zaman</th><th>Yaklaşık Değer</th><th>Gönderen</th><th>Etiket</th><th>Alıcı</th><th>Etiket</th></tr>${moveRows(sm.team_moves)}</table></div></div>`:''}
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
