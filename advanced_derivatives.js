(function(){
  if(!location.pathname.endsWith('/agents/crypto_derivatives.html'))return;
  const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=x=>{if(x==null||!isFinite(Number(x)))return'—';const n=Math.abs(Number(x)),sg=Number(x)<0?'-':'';return sg+'$'+(n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n.toFixed(0))};
  const num=x=>x==null?'—':Number(x).toLocaleString('tr-TR',{maximumFractionDigits:2});
  const pct=x=>x==null?'—':Number(x).toFixed(2)+'%';
  const date=x=>{try{return new Date(x).toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'2-digit'})}catch(e){return x}};

  const st=document.createElement('style');st.textContent=`
  .adv-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.adv-kicker{font-size:9px;color:#d6bc70;letter-spacing:.08em}.adv-note{font-size:9px;line-height:1.6;color:var(--muted)}
  .adv-table{width:100%;border-collapse:collapse;font-size:10px}.adv-table th,.adv-table td{padding:8px 7px;border-bottom:1px solid rgba(57,255,136,.1);text-align:right;white-space:nowrap}.adv-table th:first-child,.adv-table td:first-child{text-align:left}
  .pair-row{display:grid;grid-template-columns:76px 1fr 1fr;gap:7px;align-items:center;padding:5px 0}.pair-label{font-size:9px;color:var(--muted);text-align:right}.mini-bar{height:8px;background:rgba(255,255,255,.04);border-radius:99px;overflow:hidden;position:relative}.mini-bar i{display:block;height:100%;border-radius:99px}.call i{background:#51c997}.put i{background:#db747d}.div-row{display:grid;grid-template-columns:76px 1fr 92px;gap:8px;align-items:center;padding:5px 0}.div-track{height:9px;background:rgba(255,255,255,.04);position:relative;border-radius:99px;overflow:hidden}.div-track:after{content:'';position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.35)}.div-track i{position:absolute;top:1px;bottom:1px;border-radius:99px}.div-pos{left:50%;background:#51c997}.div-neg{right:50%;background:#db747d}.adv-value{font-size:9px;text-align:right}.adv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pill-proxy{display:inline-block;border:1px solid rgba(255,207,92,.35);color:#ffcf5c;border-radius:999px;padding:4px 7px;font-size:8px}.pill-raw{display:inline-block;border:1px solid rgba(57,255,136,.3);color:#39ff88;border-radius:999px;padding:4px 7px;font-size:8px}@media(max-width:760px){.adv-grid{grid-template-columns:1fr}.adv-table{font-size:9px}.pair-row,.div-row{grid-template-columns:64px 1fr 76px}}
  `;document.head.appendChild(st);

  function volChart(rows){
    rows=(rows||[]).slice().sort((a,b)=>a.strike-b.strike);const mx=Math.max(1,...rows.flatMap(r=>[r.call_volume_24h||0,r.put_volume_24h||0]));
    return rows.map(r=>`<div class="pair-row"><div class="pair-label">$${Number(r.strike).toLocaleString()}</div><div><div class="mini-bar call"><i style="width:${Math.max(1,(r.call_volume_24h||0)/mx*100)}%"></i></div><div style="font-size:8px;color:#51c997;margin-top:2px">C ${num(r.call_volume_24h)}</div></div><div><div class="mini-bar put"><i style="width:${Math.max(1,(r.put_volume_24h||0)/mx*100)}%"></i></div><div style="font-size:8px;color:#db747d;margin-top:2px">P ${num(r.put_volume_24h)}</div></div></div>`).join('');
  }
  function divChart(rows,key,formatter){
    rows=(rows||[]).slice().sort((a,b)=>a.strike-b.strike);const mx=Math.max(1e-9,...rows.map(r=>Math.abs(Number(r[key]||0))));
    return rows.map(r=>{const v=Number(r[key]||0),w=Math.min(50,Math.abs(v)/mx*49);return `<div class="div-row"><div class="pair-label">$${Number(r.strike).toLocaleString()}</div><div class="div-track"><i class="${v>=0?'div-pos':'div-neg'}" style="width:${w}%"></i></div><div class="adv-value" style="color:${v>=0?'#51c997':'#db747d'}">${formatter(v)}</div></div>`}).join('');
  }
  function expiryTable(rows){return `<div style="overflow:auto"><table class="adv-table"><thead><tr><th>Vade</th><th>Max Pain</th><th>Notional OI</th><th>OI PCR</th><th>24s Vol PCR</th></tr></thead><tbody>${(rows||[]).map(r=>`<tr><td>${date(r.expiry)}</td><td>${r.max_pain==null?'—':'$'+Number(r.max_pain).toLocaleString()}</td><td>${money(r.notional_oi_usd)}</td><td>${r.oi_pcr==null?'—':Number(r.oi_pcr).toFixed(2)}</td><td>${r.volume_pcr==null?'—':Number(r.volume_pcr).toFixed(2)}</td></tr>`).join('')}</tbody></table></div>`}

  async function run(){
    try{
      const d=await(await fetch('../data/crypto_derivatives.json?t='+Date.now(),{cache:'no-store'})).json();const a=d.advanced_options;if(!a||a.error)return;
      const content=$('#content');if(!content||$('#advancedOptionsIntel'))return;
      const iv=a.iv||{};const cards=document.createElement('div');cards.id='advancedOptionsIntel';
      cards.innerHTML=`
      <div class="card"><div class="adv-head"><div><div class="adv-kicker">DERIBIT · RAW + MODEL AYRIMI</div><h2 style="margin-top:5px">Gelişmiş Opsiyon İstihbaratı</h2></div><span class="pill-raw">RAW: OI / VOLUME</span></div><div class="adv-grid"><div class="stat-grid">${typeof stat==='function'?stat('DVOL / Current IV',iv.current_dvol==null?'—':Number(iv.current_dvol).toFixed(2),'Deribit historical vol','Deribit historical volatility/DVOL serisinin son değeri.')+stat('IV Rank',pct(iv.iv_rank_pct),'min-max konumu','(Current − min)/(max − min).')+stat('IV Percentile',pct(iv.iv_percentile_pct),'tarihsel yüzdelik','Geçmiş gözlemlerin yüzde kaçının mevcut DVOL altında/eşit olduğunu gösterir.')+stat('Zero Gamma',a.zero_gamma==null?'—':'$'+Math.round(a.zero_gamma).toLocaleString(),'proxy','Public OI üzerinden calls + / puts − varsayımıyla hesaplanan zero-gamma proxy.'):' '}</div><div class="adv-note">IV Rank ile IV Percentile artık ayrı hesaplanıyor. GEX ve Charm dealer yönünü public OI'dan göremediğimiz için kesin dealer exposure değil; açıkça proxy olarak gösteriliyor.</div></div></div>
      <div class="card"><div class="adv-head"><h2>Options Volume · Strike · 24s</h2><span class="pill-raw">DERIBIT RAW VOLUME</span></div>${volChart(a.options_volume_by_strike)}<div class="adv-note">Call ve put barları Deribit'in son 24 saat kontrat hacminden doğrudan gruplanır.</div></div>
      <div class="card"><div class="adv-head"><h2>Put / Call & Max Pain · Vade Bazlı</h2><span class="pill-raw">DERIBIT OI + VOLUME</span></div>${expiryTable(a.expiry_profile)}<div class="adv-note">OI PCR = Put OI / Call OI · Volume PCR = 24s Put Volume / Call Volume. Max Pain her vadenin kendi OI zincirinden hesaplanır.</div></div>
      <div class="adv-grid"><div class="card"><div class="adv-head"><h2>GEX Profile</h2><span class="pill-proxy">DEALER-STYLE PROXY</span></div>${divChart(a.gex_profile,'net_gex_musd',v=>(v>=0?'+':'')+'$'+Math.abs(v).toFixed(1)+'M')}<div class="adv-note">Black-Scholes gamma × OI. Call + / Put − varsayımı kullanılır; dealer tarafı doğrudan gözlenemez.</div></div><div class="card"><div class="adv-head"><h2>Charm Exposure</h2><span class="pill-proxy">MODEL PROXY</span></div>${divChart(a.charm_profile,'net_charm_usd_day',v=>(v>=0?'+':'')+money(Math.abs(v))+'/g')}<div class="adv-note">Yaklaşık günlük delta-hedge değişimi: Black-Scholes calendar Charm × OI × spot. Yön varsayımı GEX ile aynıdır.</div></div></div>`;
      content.insertBefore(cards,content.firstChild);
    }catch(e){}
  }
  setTimeout(run,700);
})();
