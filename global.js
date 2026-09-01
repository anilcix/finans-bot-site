(function(){
  const KEY='marketLang';
  const valid=x=>x==='en'||x==='tr';
  const get=()=>valid(localStorage.getItem(KEY))?localStorage.getItem(KEY):'tr';
  window.marketLang=get();
  const TERMINAL_URL='https://project-alpha-terminal.onrender.com';
  window.marketLang=get();
  const D={
    tr:{back:'← Ana Ağa Dön',loading:'Yükleniyor…',update:'Güncelleme',sources:'Veri Kaynakları',dataQuality:'Veri Kalitesi',active:'aktif',unavailable:'erişilemedi',terminal:'🔒 TRADE TERMINAL'},
    en:{back:'← Back to Network',loading:'Loading…',update:'Updated',sources:'Data Sources',dataQuality:'Data Quality',active:'active',unavailable:'unavailable',terminal:'🔒 TRADE TERMINAL'}
  };
  window.marketT=(k)=>D[get()][k]||k;

  const pageMap={
    'news.html':{tr:['📰 HABERLER','Güvenilir Kaynak · Türkçe Özet · Ajan Yorumu · Piyasa Etkisi'],en:['📰 NEWS','Trusted Sources · Summary · Agent View · Market Impact']},
    'macro.html':{tr:['🌡️ MAKRO','Tarihsel Seviye · Momentum · Piyasa Karşılaştırması · Erken Uyarı'],en:['🌡️ MACRO','Historical Level · Momentum · Market Comparison · Early Warning']},
    'credit.html':{tr:['💳 KREDİ','Kredi döngüsü · spread · SLOOS · erken uyarı'],en:['💳 CREDIT','Credit Cycle · Spreads · SLOOS · Early Warning']},
    'screener.html':{tr:['🔍 TARAYICI','Hacim · OI · momentum · sinyal taraması'],en:['🔍 SCREENER','Volume · OI · Momentum · Signal Scan']},
    'harmonizer.html':{tr:['🧠 HARMANLAYICI','Uzman ajanlardan tek piyasa görüşü'],en:['🧠 HARMONIZER','One Market View from Specialist Agents']},
    'crypto.html':{tr:['₿ KRİPTO','Spot · Dominance · Stablecoin Likiditesi · DeFi · Ağ Aktivitesi · ETF Flow'],en:['₿ CRYPTO','Spot · Dominance · Stablecoin Liquidity · DeFi · Network Activity · ETF Flow']},
    'hidden_pressure.html':{tr:['🕵️ GİZLİ BASKI','Özel izleme · baskı sinyalleri'],en:['🕵️ HIDDEN PRESSURE','Special Monitoring · Pressure Signals']},
    'equities.html':{tr:['📈 HİSSE / EMTİA','Hisse · BIST · emtia · temel analiz'],en:['📈 EQUITIES / COMMODITIES','Stocks · BIST · Commodities · Fundamental Analysis']},
    'options.html':{tr:['📊 OPSİYON','VIX · contango · term structure'],en:['📊 OPTIONS','VIX · Contango · Term Structure']},
    'crypto_derivatives.html':{tr:['📐 KRİPTO TÜREV','OI · Funding · CVD · Liquidation · Opsiyon'],en:['📐 CRYPTO DERIVATIVES','OI · Funding · CVD · Liquidations · Options']}
  };
  const home={
    tr:{title:'PİYASA İSTİHBARAT AĞI',sub:'9 AJAN · GERÇEK VERİ · OTOMATİK GÜNCELLEME',status:'GitHub Actions ile her 10 dakikada bir güncelleniyor',nodes:[['Haberler','Fed · piyasa · kripto · son 72 saat'],['Makro','faiz · enflasyon · büyüme'],['Kredi','spread · SLOOS · temerrüt'],['Tarayıcı','hacim · OI · momentum'],['Harmanlayıcı','9 ajan → tek piyasa görüşü'],['Kripto','BTC · ETH · ETF · funding · OI'],['Gizli Baskı','özel izleme · baskı sinyalleri'],['Hisse / Emtia','SPY · QQQ · BIST · altın · petrol'],['Opsiyon','VIX · contango · term structure'],['Kripto Türev','GEX · max pain · basis · funding']]},
    en:{title:'MARKET INTELLIGENCE NETWORK',sub:'9 AGENTS · REAL DATA · AUTOMATIC UPDATES',status:'Updated every 10 minutes via GitHub Actions',nodes:[['News','Fed · markets · crypto · last 72 hours'],['Macro','rates · inflation · growth'],['Credit','spreads · SLOOS · defaults'],['Screener','volume · OI · momentum'],['Harmonizer','9 agents → one market view'],['Crypto','BTC · ETH · ETF · funding · OI'],['Hidden Pressure','special monitoring · pressure signals'],['Equities / Commodities','SPY · QQQ · BIST · gold · oil'],['Options','VIX · contango · term structure'],['Crypto Derivatives','GEX · max pain · basis · funding']]}
  };
  function ensureTerminalEntry(){
    if(!document.querySelector('.board')||document.getElementById('tradeTerminalEntry'))return;
    const a=document.createElement('a');a.id='tradeTerminalEntry';a.className='trade-terminal-entry';a.href=TERMINAL_URL;a.target='_blank';a.rel='noopener noreferrer';a.textContent=D[get()].terminal;a.setAttribute('aria-label','Open private Trade Terminal');document.body.appendChild(a);
  }
  function applyHome(lang){
    if(!document.querySelector('.board'))return;
    const x=home[lang];const h=document.querySelector('header h1'),p=document.querySelector('header p'),s=document.querySelector('.status');if(h)h.textContent=x.title;if(p)p.textContent=x.sub;if(s){const i=s.querySelector('i');s.textContent=' '+x.status;if(i)s.prepend(i)}
    document.querySelectorAll('.node').forEach((n,i)=>{const h3=n.querySelector('h3'),sub=n.querySelector('.sub');if(x.nodes[i]){if(h3)h3.textContent=x.nodes[i][0];if(sub)sub.textContent=x.nodes[i][1]}})
    ensureTerminalEntry();const t=document.getElementById('tradeTerminalEntry');if(t)t.textContent=D[lang].terminal;
  }
  function applyLang(){
    const lang=get();window.marketLang=lang;document.documentElement.lang=lang;
    document.querySelectorAll('.back').forEach(x=>x.textContent=D[lang].back);
    const file=location.pathname.split('/').pop()||'index.html',m=pageMap[file]?.[lang];
    if(m){const h=document.querySelector('.page-header h1'),p=document.querySelector('.page-header p');if(h)h.textContent=m[0];if(p)p.textContent=m[1]}
    applyHome(lang);
    const btn=document.getElementById('marketLangToggle');if(btn)btn.textContent=lang==='tr'?'TR · EN':'EN · TR';
    window.dispatchEvent(new CustomEvent('market-language-changed',{detail:{lang}}));
  }
  function selector(){
    if(document.getElementById('marketLangToggle'))return;
    const st=document.createElement('style');st.textContent='.market-lang-toggle{position:fixed;right:12px;top:auto;bottom:12px;z-index:9999;background:#07100a;border:1px solid var(--green-dim,#175c3a);color:var(--green,#39ff88);border-radius:999px;padding:6px 10px;font:600 10px IBM Plex Mono,monospace;cursor:pointer;box-shadow:0 0 14px rgba(57,255,136,.08)}.trade-terminal-entry{position:fixed;left:12px;top:10px;z-index:9999;background:#07100a;border:1px solid #39ff88;color:#39ff88;border-radius:999px;padding:6px 11px;font:700 10px IBM Plex Mono,monospace;text-decoration:none;letter-spacing:.04em;box-shadow:0 0 16px rgba(57,255,136,.12)}.trade-terminal-entry:hover{background:rgba(57,255,136,.08);box-shadow:0 0 22px rgba(57,255,136,.2)}@media(max-width:640px){.trade-terminal-entry{top:auto;bottom:8px;left:8px;font-size:8px;padding:5px 8px}.market-lang-toggle{right:8px;top:auto;bottom:8px}}';document.head.appendChild(st);
    const b=document.createElement('button');b.id='marketLangToggle';b.className='market-lang-toggle';b.onclick=()=>{localStorage.setItem(KEY,get()==='tr'?'en':'tr');applyLang()};document.body.appendChild(b);ensureTerminalEntry();applyLang();
  }

  async function injectETF(){
    if(!location.pathname.includes('crypto.html')||document.getElementById('etfFlowCard'))return;
    const content=document.getElementById('content');if(!content||!content.children.length)return;
    let d;try{d=await(await fetch('../data/crypto.json?t='+Date.now())).json()}catch(e){return}
    const e=d.etf_flows;if(!e?.ok)return;
    const lang=get();
    const money=v=>`${Number(v)>=0?'+':'-'}$${Math.abs(Number(v)).toFixed(1)}M`;
    const row=(x)=>`<div class="etf-day"><div class="etf-date">${x.date}</div><div class="etf-total ${Number(x.total_usd_m)>=0?'positive':'negative'}">${money(x.total_usd_m)}</div></div>`;
    const sums={btc:(e?.btc?.days||[]).reduce((a,x)=>a+Number(x.total_usd_m||0),0),eth:(e?.eth?.days||[]).reduce((a,x)=>a+Number(x.total_usd_m||0),0)};
    const block=(key,label)=>{const rows=e?.[key]?.days||[];const sum=sums[key];return `<div class="etf-block"><div class="etf-head"><b>${label}</b><span class="${sum>=0?'positive':'negative'}">3D ${money(sum)}</span></div>${rows.slice(0,3).map(row).join('')||'<div class="note">—</div>'}</div>`};
    const btcView=sums.btc>100?(lang==='tr'?'Bitcoin ETF kanalı son 3 günde belirgin net girişte; kurumsal spot talep destekleyici.':'Bitcoin ETF channel shows meaningful 3-day net inflows; institutional spot demand is supportive.'):sums.btc<-100?(lang==='tr'?'Bitcoin ETF kanalı son 3 günde net çıkışta; spot talep tarafı fiyat için baskı oluşturuyor.':'Bitcoin ETF channel shows 3-day net outflows; spot demand is a headwind for price.'):(lang==='tr'?'Bitcoin ETF 3 günlük akışı sınırlı/karışık; tek başına güçlü yön teyidi vermiyor.':'Bitcoin ETF 3-day flow is limited/mixed and does not provide a strong directional confirmation by itself.');
    const st=document.createElement('style');st.textContent='.etf-card{border-left:3px solid #7eb6e6}.etf-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}.etf-block{border:1px solid var(--green-dim);border-radius:10px;padding:12px}.etf-head,.etf-day{display:flex;justify-content:space-between;gap:12px;align-items:center}.etf-head{font-size:11px;margin-bottom:8px}.etf-day{padding:7px 0;border-top:1px solid rgba(57,255,136,.1);font-size:10px}.etf-date{color:var(--muted)}.etf-total{font-weight:800}.etf-view{margin-top:10px;padding:10px;border:1px solid rgba(126,182,230,.22);border-radius:8px;font-size:10px;line-height:1.6}.etf-note{font-size:9px;color:var(--muted);line-height:1.6;margin-top:10px}@media(max-width:700px){.etf-grid{grid-template-columns:1fr}}';document.head.appendChild(st);
    const c=document.createElement('div');c.id='etfFlowCard';c.className='card etf-card';c.innerHTML=lang==='tr'?`<h2>Spot ETF Akışı · Son 3 İşlem Günü</h2><div class="etf-grid">${block('btc','₿ Bitcoin ETF')}${block('eth','Ξ Ethereum ETF')}</div><div class="etf-view"><b>Ajan okuması:</b> ${btcView}</div><div class="etf-note">Kaynak: Farside Investors · Birim US$m. 3D toplam, gösterilen son 3 tamamlanmış işlem gününün net akış toplamıdır. Pozitif giriş, negatif çıkış.</div>`:`<h2>Spot ETF Flows · Last 3 Trading Days</h2><div class="etf-grid">${block('btc','₿ Bitcoin ETF')}${block('eth','Ξ Ethereum ETF')}</div><div class="etf-view"><b>Agent read:</b> ${btcView}</div><div class="etf-note">Source: Farside Investors · US$m. 3D is the sum of the latest 3 completed trading-day net flows. Positive = inflow, negative = outflow.</div>`;
    content.insertBefore(c,content.firstChild);
  }
  window.addEventListener('market-language-changed',()=>{
    if(location.pathname.includes('news.html') && typeof window.render==='function'){
      try{window.render()}catch(e){}
    }
    const old=document.getElementById('etfFlowCard');if(old)old.remove();setTimeout(injectETF,50)
  });
  const obs=new MutationObserver(()=>injectETF());obs.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{selector();setTimeout(injectETF,400)});else{selector();setTimeout(injectETF,400)}
})();