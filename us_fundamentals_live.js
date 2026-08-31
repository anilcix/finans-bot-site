(function(){
  if(!location.pathname.endsWith('/agents/equities.html'))return;
  const API='https://project-alpha-terminal.onrender.com/api/public/us-fundamentals';
  const root=document.getElementById('content');
  if(!root)return;

  function removeLegacyUsSection(){
    [...root.querySelectorAll(':scope > .card')].forEach(c=>{
      if(c.id==='usLiveFundCard')return;
      const h=c.querySelector('h2');
      const t=(h?.textContent||'').toUpperCase();
      if(t.includes('ABD TEMEL ANALİZ'))c.remove();
    });
  }

  const style=document.createElement('style');
  style.textContent='.us-live-card{border:1px solid rgba(57,255,136,.28);box-shadow:0 0 22px rgba(57,255,136,.06)}.us-live-row{display:flex;gap:8px;margin-top:12px}.us-live-input{flex:1;background:rgba(4,14,9,.9);border:1px solid var(--green-dim);border-radius:10px;padding:12px;color:var(--text);font:inherit;text-transform:uppercase;outline:none}.us-live-input:focus{border-color:var(--green)}.us-live-btn{border:1px solid var(--green);background:rgba(57,255,136,.08);color:var(--green);border-radius:10px;padding:0 16px;font:700 10px IBM Plex Mono,monospace;cursor:pointer}.us-live-btn:disabled{opacity:.45;cursor:wait}.us-live-note{font-size:9px;color:var(--muted);line-height:1.55;margin-top:8px}.us-live-result{margin-top:12px}.us-live-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.us-live-company{font-size:15px;font-weight:800}.us-live-score{border:1px solid var(--green-dim);border-radius:999px;padding:5px 9px;font-size:9px}.us-live-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}.us-metric{border:1px solid rgba(57,255,136,.14);border-radius:9px;padding:9px}.us-metric-name{font-size:8px;color:var(--muted);text-transform:uppercase}.us-metric-val{font-size:15px;font-weight:800;margin-top:4px}.us-metric-src{font-size:7.5px;color:var(--muted);line-height:1.4;margin-top:4px}.us-ok{color:#39ff88}.us-warn{color:#ffcf5c}.us-error{border:1px solid rgba(255,92,92,.35);color:#ff8b8b;border-radius:9px;padding:10px;font-size:10px;line-height:1.5}.us-checks{margin-top:10px;font-size:8.5px;color:var(--muted);line-height:1.65}@media(max-width:760px){.us-live-grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.us-live-grid{grid-template-columns:1fr}.us-live-row{flex-direction:column}.us-live-btn{padding:11px 14px}}';
  document.head.appendChild(style);

  removeLegacyUsSection();
  const observer=new MutationObserver(removeLegacyUsSection);observer.observe(root,{childList:true});

  const card=document.createElement('div');card.className='card us-live-card';card.id='usLiveFundCard';
  card.innerHTML='<h2>🇺🇸 ABD Hisse Temel Analiz</h2><div class="us-live-note">NASDAQ / NYSE ticker gir. Sistem finansalları SEC Companyfacts / XBRL üzerinden doğrular. Örn: TSLA, NFLX, JPM, LLY, COST.</div><div class="us-live-row"><input id="usLiveTicker" class="us-live-input" maxlength="10" autocomplete="off" spellcheck="false" placeholder="Ticker: TSLA"><button id="usLiveBtn" class="us-live-btn">ANALİZ ET</button></div><div id="usLiveResult" class="us-live-result"></div>';
  root.insertBefore(card,root.firstChild);

  const input=document.getElementById('usLiveTicker'),btn=document.getElementById('usLiveBtn'),out=document.getElementById('usLiveResult');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const num=(v,d=2)=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toFixed(d);
  const pct=v=>v==null||!Number.isFinite(Number(v))?'—':(Number(v)>=0?'+':'')+Number(v).toFixed(1)+'%';
  const money=v=>{v=Number(v);if(!Number.isFinite(v))return'—';const a=Math.abs(v),s=v<0?'−':'';if(a>=1e12)return s+'$'+(a/1e12).toFixed(2)+'T';if(a>=1e9)return s+'$'+(a/1e9).toFixed(2)+'B';if(a>=1e6)return s+'$'+(a/1e6).toFixed(1)+'M';return s+'$'+a.toLocaleString('en-US',{maximumFractionDigits:0})};
  function metric(m,label,format){m=m||{};const ok=!!m.verified;return '<div class="us-metric"><div class="us-metric-name">'+label+'</div><div class="us-metric-val '+(ok?'us-ok':'us-warn')+'">'+(m.value==null?'—':format(m.value))+'</div><div class="us-metric-src">'+(ok?'✓ Doğrulandı':'⚠ Doğrulanamadı')+(m.period?' · '+esc(m.period):'')+'<br>'+esc(m.source||'Kaynak yok')+'</div></div>'}
  function render(d){const m=d.metrics||{},checks=d.checks||[],score=d.score==null?'—':Number(d.score).toFixed(0)+'/100';out.innerHTML='<div class="us-live-head"><div><div class="us-live-company">'+esc(d.company||d.symbol)+' <span class="note">'+esc(d.symbol)+'</span></div><div class="us-live-note">SEC CIK '+esc(d.cik||'—')+' · doğrulama %'+esc(d.verification_rate_pct??0)+'</div></div><div class="us-live-score">Temel kalite: '+score+' · '+esc(d.score_label||'—')+'</div></div><div class="us-live-grid">'+metric(m.price,'Fiyat',v=>'$'+Number(v).toLocaleString('en-US',{maximumFractionDigits:2}))+metric(m.revenue_growth_yoy_pct,'Gelir büyümesi YoY',pct)+metric(m.net_margin_pct,'Net kâr marjı',pct)+metric(m.operating_margin_pct,'Faaliyet marjı',pct)+metric(m.fcf_margin_pct,'FCF marjı',pct)+metric(m.free_cash_flow,'Serbest nakit akışı',money)+metric(m.cash,'Nakit',money)+metric(m.debt,'Toplam borç',money)+metric(m.debt_to_equity,'Borç / Özkaynak',v=>num(v,2)+'x')+metric(m.current_ratio,'Cari oran',v=>num(v,2)+'x')+metric(m.pe_fy,'F/K · son FY',v=>num(v,1)+'x')+'</div><div class="us-checks">'+checks.map(c=>(c.passed?'✓ ':'⚠ ')+esc(c.name)+(c.period?' · '+esc(c.period):'')+(c.value_pct!=null?' · fark %'+num(c.value_pct,2):'')+' · '+esc(c.rule||'')).join('<br>')+'</div>'}
  async function analyze(){let symbol=input.value.trim().toUpperCase();input.value=symbol;if(!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(symbol)){out.innerHTML='<div class="us-error">Geçerli bir ABD ticker gir.</div>';return}btn.disabled=true;btn.textContent='ANALİZ EDİLİYOR';out.innerHTML='<div class="us-live-note">SEC finansalları okunuyor…</div>';try{const r=await fetch(API+'?symbol='+encodeURIComponent(symbol)+'&t='+Date.now(),{cache:'no-store'});let d;try{d=await r.json()}catch(e){throw new Error('Sunucu geçerli veri döndürmedi')}if(!r.ok||d.error){if(String(d.error||'').includes('403'))throw new Error('SEC geçici olarak otomatik erişimi sınırladı. Birkaç saniye sonra yeniden dene.');throw new Error(d.error||'Temel analiz alınamadı')}render(d)}catch(e){out.innerHTML='<div class="us-error">⚠ '+esc(e.message)+'</div>'}finally{btn.disabled=false;btn.textContent='ANALİZ ET'}}
  btn.addEventListener('click',analyze);input.addEventListener('keydown',e=>{if(e.key==='Enter')analyze()});
})();