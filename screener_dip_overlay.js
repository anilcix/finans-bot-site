(function(){
  if(!location.pathname.endsWith('/agents/screener.html'))return;
  function pct(v){return v==null||!Number.isFinite(Number(v))?'—':`${Number(v)>=0?'+':''}${Number(v).toFixed(2)}%`}
  function minuteFrom(anchor,at){
    if(!anchor||!at)return'';
    const a=new Date(anchor).getTime(),b=new Date(at).getTime();
    if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)return'';
    return `${Math.floor((b-a)/60000)+1}. dk`;
  }
  async function patch(){
    const card=[...document.querySelectorAll('#content>.card')].find(c=>(c.querySelector('h2')?.textContent||'').includes('Tarayıcı Sonrası'));
    if(!card)return;
    try{
      const r=await fetch('../data/screener_history.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
      const h=await r.json(),events=(h.events||[]).slice(0,100),s=h.summary||{};
      const titles=[...card.querySelectorAll('.horizon-title')];
      [15,30].forEach((m,i)=>{
        const stat=titles[i]?.nextElementSibling;if(!stat)return;
        let pill=stat.querySelector(`[data-worst-dip="${m}"]`);
        if(!pill){pill=document.createElement('span');pill.className='statpill';pill.dataset.worstDip=String(m);stat.appendChild(pill)}
        pill.textContent=`En kötü dip: ${pct(s[`${m}m`]?.worst_dip_pct)}`;
      });
      const rows=[...card.querySelectorAll('table.data-table tr')].slice(1);
      events.forEach((e,i)=>{
        const tr=rows[i];if(!tr||tr.children.length<9)return;
        [[15,7],[30,8]].forEach(([m,idx])=>{
          const cell=tr.children[idx];if(!cell)return;
          const old=cell.querySelector(`[data-dip="${m}"]`);if(old)old.remove();
          if(e[`dip_change_${m}m_pct`]==null)return;
          const div=document.createElement('div');div.className='mini negative';div.dataset.dip=String(m);
          const when=minuteFrom(e.signal_candle_close_utc||e.detected_at,e[`dip_${m}m_at`]);
          div.textContent=`Dip: ${pct(e[`dip_change_${m}m_pct`])}${when?' · '+when:''}`;
          cell.appendChild(div);
        });
      });
      const note=card.querySelector('.history-note');
      if(note&&!note.textContent.includes('Dip ='))note.textContent += ' Dip = aynı pencere içindeki en düşük 1dk LOW fiyatının sinyal girişine göre değişimidir; stop riskini gösterir.';
    }catch(e){}
  }
  setTimeout(patch,800);setInterval(patch,5000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)patch()});
})();