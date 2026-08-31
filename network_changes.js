(function(){
  if(!document.querySelector('.board')||!document.getElementById('flow'))return;
  const MAP=[
    ['news','news'],['macro','macro'],['credit','credit'],['scan','screener'],
    ['crypto','crypto'],['hidden','hidden_pressure'],['equity','equities'],
    ['option','options'],['deriv','crypto_derivatives']
  ];
  let changed={};
  const st=document.createElement('style');
  st.textContent='.flow-line.data-changed{stroke:#ff5c5c!important;filter:drop-shadow(0 0 5px rgba(255,92,92,.85))!important}.flow-halo.data-changed{stroke:rgba(255,92,92,.20)!important}.pulse.data-changed{fill:#ff5c5c!important;filter:drop-shadow(0 0 6px #ff5c5c)!important}';
  document.head.appendChild(st);

  function apply(){
    const nodes=[...document.querySelectorAll('.node:not(.hub)')];
    const halos=[...document.querySelectorAll('.flow-halo')];
    const lines=[...document.querySelectorAll('.flow-line')];
    const dots=[...document.querySelectorAll('.pulse')];
    nodes.forEach((node,i)=>{
      const pair=MAP.find(([cls])=>node.classList.contains(cls));
      const key=pair&&pair[1];
      const on=!!(key&&changed[key]);
      halos[i]?.classList.toggle('data-changed',on);
      lines[i]?.classList.toggle('data-changed',on);
      dots[i]?.classList.toggle('data-changed',on);
    });
  }

  async function load(){
    try{
      const ts=Date.now();
      const [a,s]=await Promise.all([
        fetch('./data/agent_changes.json?t='+ts,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
        fetch('./data/screener_change.json?t='+ts,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
      ]);
      changed={};
      for(const [k,v] of Object.entries(a?.agents||{}))changed[k]=!!v?.changed;
      if(s?.screener)changed.screener=!!s.screener.changed;
      apply();
    }catch(e){apply()}
  }

  const flow=document.getElementById('flow');
  new MutationObserver(()=>setTimeout(apply,0)).observe(flow,{childList:true});
  addEventListener('resize',()=>setTimeout(apply,80));
  load();
  setInterval(load,600000);
})();
