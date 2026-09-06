(function(){
  if(window.__sectionTreeInit)return;window.__sectionTreeInit=true;
  const content=document.getElementById('content');
  if(!content)return;

  const style=document.createElement('style');
  style.textContent=`
    .section-tree{position:fixed;left:18px;top:92px;bottom:24px;width:210px;z-index:80;display:none;background:rgba(5,8,6,.94);border:1px solid var(--green-dim,#175c3a);border-radius:12px;padding:12px 9px;overflow:auto;backdrop-filter:blur(8px)}
    .section-tree-title{font:700 10px 'IBM Plex Mono',monospace;color:var(--muted,#5c8a72);letter-spacing:.13em;padding:5px 9px 10px;text-transform:uppercase;border-bottom:1px solid rgba(57,255,136,.12);margin-bottom:7px}
    .section-tree-list{display:grid;gap:3px}
    .section-tree-btn{appearance:none;width:100%;border:0;border-left:2px solid transparent;background:transparent;color:var(--muted,#5c8a72);text-align:left;font:500 10.5px/1.35 'IBM Plex Mono',monospace;padding:8px 9px;cursor:pointer;border-radius:0 7px 7px 0;transition:.15s ease}
    .section-tree-btn:hover{color:var(--text,#d7ffe6);background:rgba(57,255,136,.05)}
    .section-tree-btn.active{color:var(--green,#39ff88);border-left-color:var(--green,#39ff88);background:rgba(57,255,136,.08);font-weight:700}
    .section-tree-btn:focus-visible{outline:1px solid var(--green,#39ff88);outline-offset:1px}
    .section-mobile{display:none;position:sticky;top:0;z-index:85;margin:0 auto 8px;max-width:960px;padding:8px 20px;background:rgba(5,8,6,.96);border-bottom:1px solid rgba(57,255,136,.12);backdrop-filter:blur(8px)}
    .section-mobile-row{display:flex;align-items:center;gap:8px}
    .section-mobile-label{font-size:9px;color:var(--muted,#5c8a72);white-space:nowrap}
    .section-mobile-select{min-width:0;flex:1;background:#071008;color:var(--text,#d7ffe6);border:1px solid var(--green-dim,#175c3a);border-radius:8px;padding:9px 10px;font:600 11px 'IBM Plex Mono',monospace}
    #content .card{scroll-margin-top:20px}
    .weekly-score-delta{display:inline-flex;align-items:center;justify-content:center;gap:5px;margin-top:7px;padding:3px 7px;border-radius:999px;border:1px solid var(--green-dim,#175c3a);font:600 9px/1.2 'IBM Plex Mono',monospace;letter-spacing:.02em;vertical-align:middle;text-shadow:none}
    .weekly-score-delta.up{color:var(--green,#39ff88);background:rgba(57,255,136,.055)}
    .weekly-score-delta.down{color:var(--red,#ff5c5c);border-color:rgba(255,92,92,.35);background:rgba(255,92,92,.05)}
    .weekly-score-delta.flat{color:var(--muted,#5c8a72)}
    body.screener-page #content>.card:first-child .table-wrap{overflow-x:auto}
    body.screener-page #content>.card:first-child table.data-table.screener-compact{table-layout:fixed;width:100%;min-width:820px}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th,
    body.screener-page #content>.card:first-child table.data-table.screener-compact td{padding:6px 5px;font-size:10px;line-height:1.18;vertical-align:top;word-break:normal;overflow-wrap:anywhere}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .mini{font-size:7.4px;line-height:1.12;white-space:normal;opacity:.78;letter-spacing:-.01em}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .reading{min-width:0!important;width:auto!important;max-width:none!important;font-size:9px;line-height:1.2}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .signal-note{font-size:8px;line-height:1.18}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(1){width:15%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(2){width:12%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(3){width:7%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(4){width:9%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(5){width:12%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(6){width:9%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(7){width:8%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(8){width:10%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(9){width:8%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(10){width:10%}
    @media(min-width:1440px){.section-tree{display:block}}
    @media(max-width:1439px){.section-mobile{display:block}}
    @media(max-width:900px){body.screener-page #content>.card:first-child table.data-table.screener-compact{min-width:760px}}
    @media(max-width:640px){.section-mobile{padding:7px 12px}.section-mobile-label{display:none}.section-mobile-select{font-size:10px;padding:8px 9px}}
  `;
  document.head.appendChild(style);

  if(/screener\.html$/i.test(location.pathname))document.body.classList.add('screener-page');

  const nav=document.createElement('aside');nav.className='section-tree';nav.setAttribute('aria-label','Sayfa bölümleri');
  nav.innerHTML='<div class="section-tree-title">BÖLÜMLER</div><div class="section-tree-list"></div>';
  document.body.appendChild(nav);

  const mobile=document.createElement('div');mobile.className='section-mobile';mobile.innerHTML='<div class="section-mobile-row"><span class="section-mobile-label">BÖLÜM</span><select class="section-mobile-select" aria-label="Bölüme git"></select></div>';
  const header=document.querySelector('.page-header');
  if(header&&header.parentNode)header.parentNode.insertBefore(mobile,header.nextSibling);else document.body.insertBefore(mobile,content);

  const list=nav.querySelector('.section-tree-list');
  const select=mobile.querySelector('select');
  let sections=[];let io=null;let rebuildTimer=null;let macroDataPromise=null;

  function slug(s){return String(s||'section').toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,64)||'section'}
  function go(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});try{history.replaceState(null,'','#'+id)}catch(e){}}
  function setActive(id){
    nav.querySelectorAll('.section-tree-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
    if(select.value!==id)select.value=id;
  }
  function headings(){
    return Array.from(content.querySelectorAll('.card > h2,.card h2')).filter((h,i,a)=>a.indexOf(h)===i && h.offsetParent!==null);
  }
  function rebuild(){
    const hs=headings();
    if(hs.length<2){nav.style.display='none';mobile.style.display='none';return}
    nav.style.removeProperty('display');mobile.style.removeProperty('display');
    const used=new Set();sections=hs.map((h,i)=>{
      const card=h.closest('.card')||h.parentElement;let id=card.id||slug(h.textContent);
      const base=id;let n=2;while(used.has(id)||(!card.id&&document.getElementById(id)&&document.getElementById(id)!==card)){id=base+'-'+n++}
      used.add(id);card.id=id;return{id,label:h.textContent.trim(),el:card};
    });
    list.innerHTML='';select.innerHTML='';
    sections.forEach((s,i)=>{
      const b=document.createElement('button');b.type='button';b.className='section-tree-btn';b.dataset.target=s.id;b.textContent=s.label;b.addEventListener('click',()=>go(s.id));list.appendChild(b);
      const o=document.createElement('option');o.value=s.id;o.textContent=s.label;select.appendChild(o);
    });
    select.onchange=()=>go(select.value);
    if(io)io.disconnect();
    io=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top)-Math.abs(b.boundingClientRect.top));
      if(visible[0])setActive(visible[0].target.id);
    },{root:null,rootMargin:'-12% 0px -72% 0px',threshold:[0,.01]});
    sections.forEach(s=>io.observe(s.el));
    const hash=location.hash&&location.hash.slice(1);if(hash&&sections.some(s=>s.id===hash))setActive(hash);else if(sections[0])setActive(sections[0].id);
  }

  function compactScreener(){
    if(!/screener\.html$/i.test(location.pathname))return;
    const card=content.querySelector('.card');if(!card)return;
    const table=card.querySelector('table.data-table');if(!table)return;
    table.classList.add('screener-compact');
    const rows=Array.from(table.querySelectorAll('tr')).slice(1);
    rows.forEach(tr=>{
      const c=tr.children;if(!c.length)return;
      const shortMini=(idx,text)=>{const el=c[idx]?.querySelector('.mini');if(el&&el.textContent.trim()!==text){if(!el.title)el.title=el.textContent.trim();el.textContent=text}};
      shortMini(1,'10dk kapanış');
      shortMini(3,'1dk BASE Δ');
      const taker=c[4]?.querySelector('.mini');
      if(taker&&/Buy|Sell/i.test(taker.textContent)){
        if(!taker.title)taker.title=taker.textContent.trim();
        taker.textContent=taker.textContent.replace(/Buy\s*/i,'B ').replace(/Sell\s*/i,'S ');
      }
      const coin=c[0]?.querySelector('.mini');
      if(coin&&coin.textContent.length>34){if(!coin.title)coin.title=coin.textContent.trim();coin.textContent=coin.textContent.replace(/Internet Computer/i,'ICP').replace(/Curve DAO Token/i,'CRV')}
    });
  }

  async function addMacroWeeklyDelta(){
    if(!/macro\.html$/i.test(location.pathname)||document.getElementById('weeklyScoreDelta'))return;
    const scoreNode=content.querySelector('.big-score .num');
    if(!scoreNode)return;
    try{
      if(!macroDataPromise)macroDataPromise=fetch('../data/macro.json?t='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('macro data');return r.json()});
      const d=await macroDataPromise;
      const current=Number(d.composite_score);const hist=Array.isArray(d.score_history)?d.score_history:[];
      if(!Number.isFinite(current)||!hist.length)return;
      const now=new Date(d.generated_at||Date.now());const target=now.getTime()-7*86400000;
      const valid=hist.map(x=>({date:new Date(x.date).getTime(),value:Number(x.value)})).filter(x=>Number.isFinite(x.date)&&Number.isFinite(x.value)).sort((a,b)=>a.date-b.date);
      if(!valid.length)return;
      let prior=null;for(const x of valid){if(x.date<=target)prior=x;else break}
      if(!prior)prior=valid.reduce((best,x)=>Math.abs(x.date-target)<Math.abs(best.date-target)?x:best,valid[0]);
      let previous=prior.value;if(current>1&&previous>=0&&previous<=1)previous*=100;
      const delta=current-previous;if(!Number.isFinite(delta))return;
      const el=document.createElement('div');el.id='weeklyScoreDelta';el.className='weekly-score-delta '+(delta>.05?'up':delta<-.05?'down':'flat');
      const arrow=delta>.05?'▲':delta<-.05?'▼':'•';el.textContent=`${arrow} 7g ${delta>=0?'+':''}${delta.toFixed(1)} puan`;
      el.title=`Geçen haftaya göre kompozit skor değişimi · referans ${new Date(prior.date).toLocaleDateString('tr-TR')}`;
      scoreNode.appendChild(el);
    }catch(e){}
  }

  function schedule(){clearTimeout(rebuildTimer);rebuildTimer=setTimeout(()=>{compactScreener();rebuild();addMacroWeeklyDelta()},80)}
  const mo=new MutationObserver(schedule);mo.observe(content,{childList:true,subtree:true,characterData:true});
  window.addEventListener('market-language-changed',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  schedule();
})();