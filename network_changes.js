(function(){
  if(!document.querySelector('.board')||!document.getElementById('flow'))return;
  let newsChanged=false;
  const st=document.createElement('style');
  st.textContent='.status{display:none!important}.flow-line.data-changed{stroke:#ff5c5c!important;filter:drop-shadow(0 0 5px rgba(255,92,92,.85))!important}.flow-halo.data-changed{stroke:rgba(255,92,92,.20)!important}.pulse.data-changed{fill:#ff5c5c!important;filter:drop-shadow(0 0 6px #ff5c5c)!important}';
  document.head.appendChild(st);

  function apply(){
    const nodes=[...document.querySelectorAll('.node:not(.hub)')];
    const halos=[...document.querySelectorAll('.flow-halo')];
    const lines=[...document.querySelectorAll('.flow-line')];
    const dots=[...document.querySelectorAll('.pulse')];
    nodes.forEach((node,i)=>{
      const on=node.classList.contains('news') && newsChanged;
      halos[i]?.classList.toggle('data-changed',on);
      lines[i]?.classList.toggle('data-changed',on);
      dots[i]?.classList.toggle('data-changed',on);
    });
  }

  async function load(){
    try{
      const r=await fetch('./data/agent_changes.json?t='+Date.now(),{cache:'no-store'});
      const a=r.ok?await r.json():null;
      newsChanged=!!a?.agents?.news?.changed;
    }catch(e){
      newsChanged=false;
    }
    apply();
  }

  const flow=document.getElementById('flow');
  new MutationObserver(()=>setTimeout(apply,0)).observe(flow,{childList:true});
  addEventListener('resize',()=>setTimeout(apply,80));
  load();
  setInterval(load,600000);
})();
