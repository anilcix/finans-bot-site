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
    @media(min-width:1440px){.section-tree{display:block}}
    @media(max-width:1439px){.section-mobile{display:block}}
    @media(max-width:640px){.section-mobile{padding:7px 12px}.section-mobile-label{display:none}.section-mobile-select{font-size:10px;padding:8px 9px}}
  `;
  document.head.appendChild(style);

  const nav=document.createElement('aside');nav.className='section-tree';nav.setAttribute('aria-label','Sayfa bölümleri');
  nav.innerHTML='<div class="section-tree-title">BÖLÜMLER</div><div class="section-tree-list"></div>';
  document.body.appendChild(nav);

  const mobile=document.createElement('div');mobile.className='section-mobile';mobile.innerHTML='<div class="section-mobile-row"><span class="section-mobile-label">BÖLÜM</span><select class="section-mobile-select" aria-label="Bölüme git"></select></div>';
  const header=document.querySelector('.page-header');
  if(header&&header.parentNode)header.parentNode.insertBefore(mobile,header.nextSibling);else document.body.insertBefore(mobile,content);

  const list=nav.querySelector('.section-tree-list');
  const select=mobile.querySelector('select');
  let sections=[];let io=null;let rebuildTimer=null;

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
  function schedule(){clearTimeout(rebuildTimer);rebuildTimer=setTimeout(rebuild,80)}
  const mo=new MutationObserver(schedule);mo.observe(content,{childList:true,subtree:true,characterData:true});
  window.addEventListener('market-language-changed',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  schedule();
})();
