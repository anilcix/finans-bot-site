(function(){
  if(!location.pathname.endsWith('/agents/macro.html'))return;
  const root=document.getElementById('content');if(!root)return;
  const st=document.createElement('style');
  st.textContent='.heat-card{border-left:3px solid #39ff88}.heat-title-row{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.heat-axis{font-size:8px;color:var(--muted);letter-spacing:.08em}.heat-row{padding:10px 0;border-top:1px solid rgba(57,255,136,.10)}.heat-row:first-of-type{border-top:0}.heat-head{display:grid;grid-template-columns:minmax(150px,1.2fr) minmax(170px,1fr) auto;gap:10px;align-items:center}.heat-name{font-size:11px;font-weight:700}.heat-value{font-size:10px;color:var(--muted);margin-top:3px}.heat-track{height:9px;border-radius:999px;background:linear-gradient(90deg,#39d98a 0%,#a9cf78 32%,#d1b86b 52%,#e18b70 72%,#ff6f8c 100%);position:relative}.heat-dot{position:absolute;top:50%;width:16px;height:16px;border-radius:50%;background:#e7e7df;border:2px solid #111;transform:translate(-50%,-50%);box-shadow:0 0 5px rgba(255,255,255,.25)}.heat-chip{font-size:9px;border:1px solid var(--green-dim);border-radius:999px;padding:5px 8px;white-space:nowrap}.heat-on{color:#5ee6a8;border-color:rgba(94,230,168,.35);background:rgba(94,230,168,.07)}.heat-off{color:#ff8ca0;border-color:rgba(255,140,160,.35);background:rgba(255,140,160,.07)}.heat-watch{color:#e7c878;border-color:rgba(231,200,120,.30);background:rgba(231,200,120,.05)}.heat-neutral{color:#c6c9c8}.heat-note{font-size:9px;color:var(--muted);line-height:1.55;margin-top:12px}@media(max-width:640px){.heat-head{grid-template-columns:1fr;gap:7px}.heat-chip{width:max-content}}';
  document.head.appendChild(st);
  const clamp=v=>Math.max(2,Math.min(98,Number(v)||50));
  const fmt=(v,s='')=>v==null?'—':`${Number(v)>=0&&s==='%'?'+':''}${Number(v).toFixed(2)}${s}`;
  const classify=s=>s>=67?['Risk-on','heat-on']:s<=33?['Risk-off','heat-off']:s>=45&&s<=55?['Nötr','heat-neutral']:['İzlemede','heat-watch'];
  const find=(d,needle)=>d.barometer?.find(x=>(x.label||'').toLowerCase().includes(needle));
  async function load(){
    try{
      const d=await(await fetch('../data/macro.json?t='+Date.now(),{cache:'no-store'})).json();
      const rows=[];
      function add(name,m,valueText){if(!m)return;const s=m.combined_score??(m.invert?100-m.percentile:m.percentile);rows.push({name,score:clamp(s),value:valueText??String(m.value),state:classify(s)})}
      add('Inflation (CPI YoY)',find(d,'enflasyon'),find(d,'enflasyon')?fmt(find(d,'enflasyon').value,'%'):null);
      add('Fed Policy Rate',find(d,'fed politika'),find(d,'fed politika')?fmt(find(d,'fed politika').value,'%'):null);
      add('Real Rate (Cleveland Fed 1Y)',find(d,'cleveland'),find(d,'cleveland')?fmt(find(d,'cleveland').value,'%'):null);
      add('HY Credit Spread',find(d,'hy kredi'),find(d,'hy kredi')?Math.round(find(d,'hy kredi').value*100)+' bps':null);
      add('IG Credit Spread',find(d,'ig kredi'),find(d,'ig kredi')?Math.round(find(d,'ig kredi').value*100)+' bps':null);
      add('Curve Level (10Y-2Y)',find(d,'10y-2y'),find(d,'10y-2y')?fmt(find(d,'10y-2y').value,'%'):null);
      add('Unemployment Rate',find(d,'işsizlik'),find(d,'işsizlik')?fmt(find(d,'işsizlik').value,'%'):null);
      add('GDPNow Nowcast',find(d,'gdpnow'),find(d,'gdpnow')?fmt(find(d,'gdpnow').value,'%'):null);
      const liq=d.liquidity_plumbing?.net_liquidity_proxy;
      if(liq){const score=liq.change_3w>=50?78:liq.change_3w<=-50?22:50+liq.change_3w/5;rows.push({name:'Net Liquidity (3-week Δ)',score:clamp(score),value:`${liq.change_3w>=0?'+':''}${Math.round(liq.change_3w)} $B`,state:classify(score)})}
      const yc=d.yield_curve;if(yc){const score=yc.regime?.toLowerCase().includes('dik')?65:yc.regime?.toLowerCase().includes('ters')?30:50;rows.splice(6,0,{name:'Curve Regime',score:clamp(score),value:yc.regime,state:classify(score)})}
      const sloos=d.credit_detail?.sloos_business_large ?? null;
      const card=document.createElement('div');card.className='card heat-card';card.id='macroHeatPanel';
      card.innerHTML=`<div class="heat-title-row"><h2 style="margin:0">Piyasa Isı Ölçeği</h2><div class="heat-axis">RISK-ON ← → RISK-OFF</div></div>${rows.map(r=>`<div class="heat-row"><div class="heat-head"><div><div class="heat-name">${r.name}</div><div class="heat-value">${r.value}</div></div><div class="heat-track"><i class="heat-dot" style="left:${100-r.score}%"></i></div><div class="heat-chip ${r.state[1]}">${r.state[0]}</div></div></div>`).join('')}<div class="heat-note">Konumlar bizim mevcut makro modelimizin tarihsel seviye + momentum skorundan türetilir. Yüksek reel faiz otomatik olarak risk-on sayılmaz; kredi, büyüme ve likidite ayrı okunur.</div>`;
      if(!document.getElementById('macroHeatPanel'))root.insertBefore(card,root.firstChild);
    }catch(e){}
  }
  load();
})();