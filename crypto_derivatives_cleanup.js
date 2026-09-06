(function(){
  if(window.__cryptoDerivativesCleanup)return;window.__cryptoDerivativesCleanup=true;
  if(!location.pathname.includes('crypto_derivatives.html'))return;

  function norm(s){return String(s||'').replace(/\s+/g,' ').trim()}
  function removeKrakenBlocks(){
    const header=document.querySelector('.page-header p');
    if(header){
      header.textContent=norm(header.textContent)
        .replace(/\s*·\s*Kraken Futures\s*/i,' · ')
        .replace(/\s*·\s*·\s*/g,' · ')
        .replace(/^\s*·\s*|\s*·\s*$/g,'');
    }

    document.querySelectorAll('.stat-box').forEach(el=>{
      const label=norm(el.querySelector('.label')?.textContent).toLocaleUpperCase('tr-TR');
      if(label.startsWith('KRAKEN '))el.remove();
      if(label.startsWith('VERİ KALİTESİ')){
        const note=el.querySelector('.note');
        if(note)note.textContent='Kraken hariç ana türev kaynakları';
      }
    });

    document.querySelectorAll('.read-item').forEach(el=>{
      if(/\bkraken\b/i.test(norm(el.textContent)))el.remove();
    });

    document.querySelectorAll('.source-item').forEach(el=>{
      const label=norm(el.querySelector('.source-label')?.textContent);
      if(/^Kraken(?:\s+Futures(?:\s+Analytics)?)?$/i.test(label))el.remove();
    });

    document.querySelectorAll('.card').forEach(card=>{
      const h=card.querySelector(':scope > h2');
      if(!h)return;
      if(/^Kraken\b/i.test(norm(h.textContent)))card.remove();
    });
  }

  let timer=null;
  function schedule(){clearTimeout(timer);timer=setTimeout(removeKrakenBlocks,40)}
  const content=document.getElementById('content');
  if(content){new MutationObserver(schedule).observe(content,{childList:true,subtree:true})}
  window.addEventListener('market-language-changed',schedule);
  schedule();
})();
