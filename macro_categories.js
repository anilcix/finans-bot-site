(function(){
  if(!/macro\.html$/i.test(location.pathname)||window.__macroCategoriesInit)return;window.__macroCategoriesInit=true;
  const style=document.createElement('style');style.textContent=`
    .macro-cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px}.macro-cat{border:1px solid rgba(57,255,136,.12);border-radius:10px;padding:14px;background:rgba(6,12,8,.35)}.macro-cat h3{margin:0 0 10px;color:#ffcf5c;font-size:11px;letter-spacing:.05em}.macro-cat .risk-row{margin:10px 0 14px}.macro-cat .risk-head{grid-template-columns:minmax(150px,1.15fr) minmax(150px,1fr) auto}.macro-extra{margin:10px 0 14px;padding:10px 0;border-top:1px solid rgba(57,255,136,.08)}.macro-extra-name{font-weight:600;font-size:12px}.macro-extra-meta{font-size:10px;color:var(--muted);margin-top:4px}.macro-extra-value{font-size:12px;color:var(--text);margin-top:6px}.macro-extra-signal{font-size:10px;margin-top:5px}@media(max-width:900px){.macro-cat-grid{grid-template-columns:1fr}.macro-cat .risk-head{grid-template-columns:1fr;gap:7px}}
  `;document.head.appendChild(style);
  const bucket=(label)=>{const x=(label||'').toLowerCase();if(x.includes('cpi')||x.includes('fed politika')||x.includes('reel faiz'))return'inflation';if(x.includes('eğri'))return'rates';if(x.includes('hy kredi')||x.includes('ig kredi')||x.includes('sloos'))return'credit';if(x.includes('işsizlik')||x.includes('gdp'))return'growth';return'growth'};
  async function run(){
    const card=[...document.querySelectorAll('#content>.card')].find(c=>(c.querySelector('h2')?.textContent||'').includes('Piyasa Barometresi'));if(!card||card.dataset.grouped==='1')return;
    const rows=[...card.querySelectorAll(':scope > .risk-row')];if(!rows.length)return;card.dataset.grouped='1';
    const grid=document.createElement('div');grid.className='macro-cat-grid';
    const defs=[['inflation','INFLATION & POLICY'],['credit','CREDIT & BANKING'],['rates','RATES & CURVE'],['growth','GROWTH & LIQUIDITY']];const panels={};
    defs.forEach(([k,t])=>{const p=document.createElement('section');p.className='macro-cat';p.dataset.cat=k;p.innerHTML=`<h3>${t}</h3>`;panels[k]=p;grid.appendChild(p)});
    rows.forEach(r=>{const l=r.querySelector('.risk-name')?.textContent||'';panels[bucket(l)].appendChild(r)});
    card.appendChild(grid);
    try{const d=await fetch('../data/macro.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.json());
      if(d.yield_curve){const e=document.createElement('div');e.className='macro-extra';e.innerHTML=`<div class="macro-extra-name">Curve Regime (bull/bear/un-inv)</div><div class="macro-extra-meta">Eğri şekli ve yön değişimi rejimi</div><div class="macro-extra-value">${d.yield_curve.regime||'—'}</div><div class="macro-extra-signal">${d.yield_curve.emoji||''} ${d.yield_curve.desc||''}</div>`;panels.rates.appendChild(e)}
      const nl=d.liquidity_plumbing?.net_liquidity_proxy;if(nl){const ch=Number(nl.change_3w??nl.change);const e=document.createElement('div');e.className='macro-extra';e.innerHTML=`<div class="macro-extra-name">Net Liquidity (3-week Δ)</div><div class="macro-extra-meta">Fed assets − TGA − ON RRP</div><div class="macro-extra-value">${Number.isFinite(ch)?(ch>=0?'+':'')+ch.toFixed(1)+' $bn':'—'}</div><div class="macro-extra-signal" style="color:${ch>=0?'var(--green)':'var(--red)'}">${ch>=0?'● Destekleyici':'● Sıkılaştırıcı'}</div>`;panels.growth.appendChild(e)}
    }catch(e){}
  }
  const mo=new MutationObserver(run);mo.observe(document.getElementById('content')||document.body,{childList:true,subtree:true});setTimeout(run,150);setTimeout(run,800);
})();