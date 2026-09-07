(function(){
  if(window.__sectionTreeInit)return;window.__sectionTreeInit=true;
  const content=document.getElementById('content');if(!content)return;

  const isScreener=/screener\.html$/i.test(location.pathname);
  if(isScreener)document.body.classList.add('screener-page');

  const style=document.createElement('style');
  style.textContent=`
    .section-tree{position:fixed;left:18px;top:92px;bottom:24px;width:210px;z-index:80;display:none;background:rgba(5,8,6,.94);border:1px solid var(--green-dim,#175c3a);border-radius:12px;padding:12px 9px;overflow:auto;backdrop-filter:blur(8px)}
    .section-tree-title{font:700 10px 'IBM Plex Mono',monospace;color:var(--muted,#5c8a72);letter-spacing:.13em;padding:5px 9px 10px;text-transform:uppercase;border-bottom:1px solid rgba(57,255,136,.12);margin-bottom:7px}
    .section-tree-list{display:grid;gap:3px}.section-tree-btn{appearance:none;width:100%;border:0;border-left:2px solid transparent;background:transparent;color:var(--muted,#5c8a72);text-align:left;font:500 10.5px/1.35 'IBM Plex Mono',monospace;padding:8px 9px;cursor:pointer;border-radius:0 7px 7px 0}.section-tree-btn:hover{color:var(--text,#d7ffe6);background:rgba(57,255,136,.05)}.section-tree-btn.active{color:var(--green,#39ff88);border-left-color:var(--green,#39ff88);background:rgba(57,255,136,.08);font-weight:700}
    .section-mobile{display:none;position:sticky;top:0;z-index:85;margin:0 auto 8px;max-width:960px;padding:8px 20px;background:rgba(5,8,6,.96);border-bottom:1px solid rgba(57,255,136,.12)}.section-mobile-row{display:flex;align-items:center;gap:8px}.section-mobile-label{font-size:9px;color:var(--muted,#5c8a72)}.section-mobile-select{min-width:0;flex:1;background:#071008;color:var(--text,#d7ffe6);border:1px solid var(--green-dim,#175c3a);border-radius:8px;padding:9px 10px;font:600 11px 'IBM Plex Mono',monospace}
    #content .card{scroll-margin-top:20px}.weekly-score-delta{display:inline-flex;align-items:center;justify-content:center;gap:5px;margin-top:7px;padding:3px 7px;border-radius:999px;border:1px solid var(--green-dim,#175c3a);font:600 9px/1.2 'IBM Plex Mono',monospace}.weekly-score-delta.up{color:var(--green,#39ff88)}.weekly-score-delta.down{color:var(--red,#ff5c5c);border-color:rgba(255,92,92,.35)}.weekly-score-delta.flat{color:var(--muted,#5c8a72)}

    body.screener-page #content>.card:first-child{padding:18px}
    body.screener-page #content>.card:first-child .note{font-size:9px;line-height:1.35;margin-bottom:7px}
    body.screener-page #content>.card:first-child .statline{gap:4px;margin-top:6px}
    body.screener-page #content>.card:first-child .statpill{font-size:7.5px;padding:3px 6px}
    body.screener-page #content>.card:first-child .table-wrap{overflow-x:auto}
    body.screener-page #content>.card:first-child table.data-table.screener-compact{table-layout:fixed;width:100%;min-width:680px}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th{padding:5px 3px;font-size:7.8px;line-height:1.02;white-space:normal!important;overflow-wrap:anywhere;vertical-align:bottom}
    body.screener-page #content>.card:first-child table.data-table.screener-compact td{padding:5px 3px;font-size:8.7px;line-height:1.08;vertical-align:top;white-space:normal;overflow-wrap:anywhere}
    body.screener-page #content>.card:first-child table.data-table.screener-compact td b{font-size:9.3px}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .mini{font-size:6.4px;line-height:1.05;white-space:normal;opacity:.72;letter-spacing:-.02em;margin-top:1px}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .reading{min-width:0!important;width:auto!important;max-width:none!important;font-size:7.8px;line-height:1.08}
    body.screener-page #content>.card:first-child table.data-table.screener-compact .signal-note{font-size:7.2px;line-height:1.08}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(1){width:14%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(2){width:6%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(3){width:8%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(4){width:10%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(5){width:8%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(6){width:7%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(7){width:9%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(8){width:8%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(9){width:18%}
    body.screener-page #content>.card:first-child table.data-table.screener-compact th:nth-child(10){width:12%}
    #historyLevelSnapshots table td.positive{color:var(--green,#39ff88)!important}#historyLevelSnapshots table td.negative{color:var(--red,#ff5c5c)!important}
    @media(min-width:1440px){.section-tree{display:block}}@media(max-width:1439px){.section-mobile{display:block}}@media(max-width:760px){body.screener-page #content>.card:first-child table.data-table.screener-compact{min-width:640px}}@media(max-width:640px){.section-mobile{padding:7px 12px}.section-mobile-label{display:none}}
  `;document.head.appendChild(style);

  const nav=document.createElement('aside');nav.className='section-tree';nav.innerHTML='<div class="section-tree-title">BÖLÜMLER</div><div class="section-tree-list"></div>';document.body.appendChild(nav);
  const mobile=document.createElement('div');mobile.className='section-mobile';mobile.innerHTML='<div class="section-mobile-row"><span class="section-mobile-label">BÖLÜM</span><select class="section-mobile-select"></select></div>';
  const header=document.querySelector('.page-header');if(header&&header.parentNode)header.parentNode.insertBefore(mobile,header.nextSibling);else document.body.insertBefore(mobile,content);
  const list=nav.querySelector('.section-tree-list'),select=mobile.querySelector('select');let io=null,timer=null,macroDataPromise=null;

  function slug(s){return String(s||'section').toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,64)||'section'}
  function go(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
  function rebuild(){
    const hs=[...content.querySelectorAll('.card > h2,.card h2')].filter((h,i,a)=>a.indexOf(h)===i&&h.offsetParent!==null);
    if(hs.length<2){nav.style.display='none';mobile.style.display='none';return}
    nav.style.removeProperty('display');mobile.style.removeProperty('display');list.innerHTML='';select.innerHTML='';
    const sections=hs.map((h,i)=>{const card=h.closest('.card')||h.parentElement;if(!card.id)card.id=slug(h.textContent)+'-'+i;return{id:card.id,label:h.textContent.trim(),el:card}});
    sections.forEach(s=>{const b=document.createElement('button');b.className='section-tree-btn';b.textContent=s.label;b.dataset.target=s.id;b.onclick=()=>go(s.id);list.appendChild(b);const o=document.createElement('option');o.value=s.id;o.textContent=s.label;select.appendChild(o)});
    select.onchange=()=>go(select.value);if(io)io.disconnect();io=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting)[0];if(!v)return;nav.querySelectorAll('.section-tree-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===v.target.id));select.value=v.target.id},{rootMargin:'-12% 0px -72% 0px'});sections.forEach(s=>io.observe(s.el));
  }

  function moveColumnToEnd(table,labelPrefix){
    const head=table.querySelector('tr');if(!head)return;
    const headers=[...head.children];const idx=headers.findIndex(x=>x.textContent.trim().toLowerCase().startsWith(labelPrefix.toLowerCase()));if(idx<0||idx===headers.length-1)return;
    head.appendChild(headers[idx]);
    [...table.querySelectorAll('tr')].slice(1).forEach(tr=>{if(tr.children[idx])tr.appendChild(tr.children[idx])});
  }

  function compactScreener(){
    if(!isScreener)return;
    const cards=[...content.querySelectorAll(':scope > .card')];
    const active=cards.find(c=>/Aktif Spot Akış/i.test(c.querySelector('h2')?.textContent||''));
    if(active){
      const table=active.querySelector('table.data-table');
      if(table){
        moveColumnToEnd(table,'Sinyal Mumu');
        table.classList.add('screener-compact');
        const head=table.querySelector('tr');if(head){const th=[...head.children];if(th[3])th[3].innerHTML='Taker<br>Alıcı %';if(th[4])th[4].innerHTML='10dk<br>Hacim';if(th[5])th[5].innerHTML='10dk<br>Fiyat';if(th[6])th[6].innerHTML='True Spot<br>Delta';if(th[7])th[7].innerHTML='Son 3<br>CVD';if(th[9])th[9].innerHTML='Kapanış<br>(TR)'}
        [...table.querySelectorAll('tr')].slice(1).forEach(tr=>{
          const c=tr.children;
          const zmini=c[2]?.querySelector('.mini');if(zmini)zmini.textContent='1dk BASE Δ';
          const taker=c[3]?.querySelector('.mini');if(taker){if(!taker.title)taker.title=taker.textContent.trim();taker.textContent=taker.textContent.replace(/Buy\s*/i,'B ').replace(/Sell\s*/i,'S ')}
          const time=c[c.length-1];if(time){const b=time.querySelector('b');if(b&&b.textContent.includes('–')){if(!b.title)b.title=b.textContent.trim();b.textContent=b.textContent.split('–').pop().trim()}const m=time.querySelector('.mini');if(m)m.textContent='kapanış'}
        });
      }
    }
    const history=cards.find(c=>/Tarihçe/i.test(c.querySelector('h2')?.textContent||''));
    if(history){const table=history.querySelector('table.data-table');if(table){moveColumnToEnd(table,'Sinyal Mumu');moveColumnToEnd(table,'Ekrana Düştü')}}
  }

  async function addMacroWeeklyDelta(){
    if(!/macro\.html$/i.test(location.pathname)||document.getElementById('weeklyScoreDelta'))return;
    const scoreNode=content.querySelector('.big-score .num');if(!scoreNode)return;
    try{if(!macroDataPromise)macroDataPromise=fetch('../data/macro.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());const d=await macroDataPromise,current=Number(d.composite_score),hist=Array.isArray(d.score_history)?d.score_history:[];if(!Number.isFinite(current)||!hist.length)return;const target=new Date(d.generated_at||Date.now()).getTime()-7*86400000,valid=hist.map(x=>({date:new Date(x.date).getTime(),value:Number(x.value)})).filter(x=>Number.isFinite(x.date)&&Number.isFinite(x.value));if(!valid.length)return;const prior=valid.reduce((a,b)=>Math.abs(b.date-target)<Math.abs(a.date-target)?b:a,valid[0]);let p=prior.value;if(current>1&&p>=0&&p<=1)p*=100;const delta=current-p,el=document.createElement('div');el.id='weeklyScoreDelta';el.className='weekly-score-delta '+(delta>.05?'up':delta<-.05?'down':'flat');el.textContent=`${delta>.05?'▲':delta<-.05?'▼':'•'} 7g ${delta>=0?'+':''}${delta.toFixed(1)} puan`;scoreNode.appendChild(el)}catch(e){}
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{compactScreener();rebuild();addMacroWeeklyDelta()},70)}
  new MutationObserver(schedule).observe(content,{childList:true,subtree:true,characterData:true});window.addEventListener('resize',schedule,{passive:true});schedule();
})();