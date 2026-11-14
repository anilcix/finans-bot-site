/* BTC Risk & Liquidity Monitor: local generated JSON only; no browser API keys. */
(() => {
  'use strict';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const valid = v => typeof v === 'number' && Number.isFinite(v);
  const money = v => !valid(v) ? '—' : '$' + Math.abs(v).toLocaleString('tr-TR', {maximumFractionDigits:0});
  const signed = v => !valid(v) ? '—' : (v < 0 ? '−' : '+') + money(v);
  const pct = v => !valid(v) ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  const compact = v => '$' + (v / 1e9).toFixed(2) + 'B';
  const labels = {'1d':'1G','7d':'7G','30d':'30G'};
  const changeCell = c => `<td class="${valid(c?.usd) ? c.usd < 0 ? 'negative' : 'positive' : ''}">${signed(c?.usd)}<br><small>${pct(c?.pct)}</small></td>`;
  const row = (name, c) => `<tr><th scope="row">${esc(name)}</th><td>${money(c?.supply_usd)}</td>${['1d','7d','30d'].map(p => changeCell(c?.changes?.[p])).join('')}</tr>`;
  window.btcLiquidityMarkup = m => {
    if (!m) return '<section class="card" id="btc-liquidity"><h2>BTC Risk & Liquidity Monitor</h2><p>Yeni modülün verisi henüz üretilmedi. Bir sonraki kripto ajanı güncellemesinde hazırlanacak.</p></section>';
    const coins = m.coins || {}, dom = m.dominance || {};
    const alerts = (m.alerts || []).map(a => `<p class="bl-alert" role="status">⚠ ${esc(a.message)} ${esc(labels[a.period] || '')}</p>`).join('');
    const signals = Object.entries(dom.signals || {}).map(([p, s]) => `<span>${esc(labels[p])}: ${s.status === 'warning' ? '⚠ Likidite daralması' : s.status === 'normal' ? 'Koşul oluşmadı' : 'Karşılaştırma geçmişi birikiyor'}</span>`).join(' · ');
    return `<section class="card" id="btc-liquidity"><style>
      #btc-liquidity{scroll-margin-top:65px;font-size:12px;line-height:1.5}#btc-liquidity .bl-note{font-size:10px;color:#8da99a;line-height:1.65;margin:8px 0}
      #btc-liquidity h3{font-size:12px;font-weight:500;letter-spacing:.3px;margin:22px 0 8px}
      #btc-liquidity .bl-table-wrap{overflow-x:auto;border:1px solid #ffffff12;border-radius:8px;margin:16px 0}
      #btc-liquidity table{width:100%;min-width:550px;border-collapse:collapse;font-size:11px;line-height:1.45}
      #btc-liquidity th,#btc-liquidity td{text-align:right;padding:9px 10px;border-bottom:1px solid #ffffff0b;font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:400}
      #btc-liquidity thead th{font-size:9px;color:#88a292;font-weight:500;letter-spacing:.5px;background:#ffffff04}
      #btc-liquidity tbody th{font-size:11px;font-weight:500}#btc-liquidity th:first-child{text-align:left}
      #btc-liquidity tbody tr:first-child{background:#5ce0b709}#btc-liquidity tbody tr:first-child th{color:#a9e5c9}
      #btc-liquidity tbody tr:last-child>*{border-bottom:0}#btc-liquidity tbody tr:hover{background:#ffffff04}
      #btc-liquidity small{font-size:9px;opacity:.65}#btc-liquidity .bl-alert{padding:10px;border-left:2px solid #ff806b;background:#ff806b0c}
      #btc-liquidity .bl-controls{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:20px 0 10px;font-size:10px;color:#8da99a}
      #btc-liquidity button,#btc-liquidity select{background:#0c1912;color:#bdd8ca;border:1px solid #294636;padding:7px 10px;border-radius:5px;font-family:inherit;font-size:10px;cursor:pointer;min-height:32px}
      #btc-liquidity button[aria-pressed="true"]{background:#163c2a;color:#8cf0bb;border-color:#3c7957}
      #btc-liquidity button:focus-visible,#btc-liquidity select:focus-visible,#btc-liquidity .bl-chart:focus-visible{outline:2px solid #5ce0b7;outline-offset:2px}
      #btc-liquidity .bl-chart{border:1px solid #ffffff12;border-radius:8px;background:#050d08;padding:12px 8px 4px;overflow:hidden}
      #btc-liquidity .bl-readout{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 16px;min-height:26px;margin:0 10px;font-size:10px;color:#9ab7a6;font-variant-numeric:tabular-nums}
      #btc-liquidity .bl-readout strong{font-size:11px;color:#d9f3e5;font-weight:500}#btc-liquidity svg{width:100%;height:auto;display:block;color:#8aa895;cursor:crosshair;touch-action:pan-y}
      #btc-liquidity .bl-chart-hint{font-size:9px;color:#6e8a78;margin:6px 2px 15px}
      #btc-liquidity .bl-peg{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px;margin-top:12px;font-size:10px}
      #btc-liquidity .bl-peg>div{padding:10px;background:#ffffff03;border:1px solid #ffffff10;border-radius:6px}
      @media(max-width:600px){#btc-liquidity{padding:14px 10px}#btc-liquidity th,#btc-liquidity td{padding:8px}#btc-liquidity .bl-controls{gap:5px}#btc-liquidity .bl-readout{gap:4px 10px;margin:0 4px}}
    </style><h2>BTC Risk & Liquidity Monitor</h2><p>${esc(m.reading)}</p>${alerts}
      <p class="bl-note">Kaynak: DefiLlama · Alınma: ${esc(new Date(m.fetched_at).toLocaleString('tr-TR'))} · Toplam, izlenen dört stablecoin'i kapsar.</p>
      <div class="bl-table-wrap"><table aria-label="Stablecoin arzı ve dönemsel değişimler"><thead><tr><th scope="col">Stablecoin</th><th scope="col">Arz ($1 nominal)</th><th scope="col">Günlük ($ / %)</th><th scope="col">7G ($ / %)</th><th scope="col">30G ($ / %)</th></tr></thead><tbody>${row('Toplam · 4 stablecoin', m.total)}${['USDT','USDC','USDe','USDS'].map(s => row(s, coins[s])).join('')}</tbody></table></div>
      <div class="bl-controls"><label for="bl-asset">Arz grafiği</label><select id="bl-asset"><option value="total">Toplam · 4 stablecoin</option>${['USDT','USDC','USDe','USDS'].map(s => `<option>${s}</option>`).join('')}</select>${[7,30,90,365].map(n => `<button type="button" data-bl-days="${n}" aria-pressed="${n===30}">${n===365?'1Y':n+'G'}</button>`).join('')}</div>
      <div id="bl-supply-chart"></div><h3>USDT dominansı ve arzı</h3><p class="bl-note">Arz: DefiLlama (sol eksen, milyar $). Dominans: CoinGecko USDT piyasa değeri / toplam kripto piyasa değeri (sağ eksen, %). Günlük UTC gözlemleri bu modülün kurulmasından itibaren birikir.</p><div id="bl-dominance-chart"></div>
      <p class="bl-note">Alarm koşulu: aynı dönemde dominans değişimi &gt; 0 yüzde puan ve USDT arz değişimi &lt; $0.</p><p class="bl-note">${signals}</p>
      <h3>$1 peg kontrolü</h3><div class="bl-peg">${['USDT','USDC','USDe','USDS'].map(s => {const c=coins[s]||{};return `<div><strong>${s}</strong><br>${valid(c.price_usd)?'$'+c.price_usd.toFixed(5):'—'} · ${pct(c.peg_deviation_pct)}<br><small>${esc(({normal:'Normal',warning:'⚠ Peg sapması',critical:'⚠ Kritik peg sapması',unavailable:'Fiyat verisi yok'})[c.peg_status] || 'Veri yok')}</small></div>`;}).join('')}</div>
      <p class="bl-note">${esc(m.methodology)} Fiyat sapması tek başına ödeme güçlüğünü kanıtlamaz.</p>${(m.errors||[]).map(e=>`<p class="bl-note">⚠ ${esc(e)}</p>`).join('')}</section>`;
  };
  const layout={w:900,h:305,l:82,r:86,t:29,b:62};
  const dateLabel = day => new Date(day+'T00:00:00Z').toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
  function geometry(points, series) {
    const {w,h,l,r,t,b}=layout, times=points.map(p=>Date.parse(p.date+'T00:00:00Z'));
    const x=i=>l+(times[i]-times[0])/(times.at(-1)-times[0])*(w-l-r);
    const scales=series.map(s=>{
      const vals=points.map(p=>p[s.key]).filter(valid);if(!vals.length)return null;
      let min=Math.min(...vals),max=Math.max(...vals),pad=(max-min)*.12||Math.abs(max)*.005||1;min-=pad;max+=pad;
      return {min,max,y:v=>t+(max-v)/(max-min)*(h-t-b)};
    });
    return {x,scales};
  }
  function chart(points, series, title) {
    if (points.length < 2) return '<p class="bl-note">Bu aralık için en az iki günlük gözlem gerekli; geçmiş veri henüz yeterli değil.</p>';
    const {w,h,l,r,t,b}=layout,{x,scales}=geometry(points,series);
    let svg=`<div class="bl-chart" tabindex="0" role="group" aria-label="${esc(title)}; tarih seçmek için sağ ve sol ok tuşlarını kullanın"><div class="bl-readout" aria-live="off"></div><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
    for(let i=0;i<5;i++){const y=t+i*(h-t-b)/4;svg+=`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="currentColor" opacity=".12"/>`;}
    series.forEach((s,si)=>{
      const scale=scales[si];if(!scale)return;const {min,max,y}=scale;
      let path='',previous=-1;
      points.forEach((p,i)=>{if(!valid(p[s.key])){previous=-1;return;}path+=(previous===i-1&&previous>=0?'L':'M')+x(i).toFixed(1)+','+y(p[s.key]).toFixed(1)+' ';previous=i;});
      svg+=`<path d="${path}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round"/>`;
      for(let j=0;j<5;j++){const v=max-j*(max-min)/4;svg+=`<text x="${si===0?l-10:w-r+10}" y="${t+j*(h-t-b)/4+4}" fill="currentColor" text-anchor="${si===0?'end':'start'}" font-size="11">${esc(s.format(v))}</text>`;}
      svg+=`<text x="${si===0?l:w-r}" y="14" fill="${s.color}" text-anchor="${si===0?'start':'end'}" font-size="10">${esc(s.label)}</text>`;
    });
    const ticks=[...new Set([0,Math.round((points.length-1)/4),Math.round((points.length-1)/2),Math.round((points.length-1)*3/4),points.length-1])];
    ticks.forEach(i=>{svg+=`<text x="${x(i)}" y="${h-b+23}" fill="currentColor" text-anchor="middle" font-size="10">${esc(new Date(points[i].date+'T00:00:00Z').toLocaleDateString('tr-TR',{day:'2-digit',month:'short',timeZone:'UTC'}))}</text>`;});
    svg+=`<g class="bl-selection" pointer-events="none"><line class="bl-crosshair" y1="${t}" y2="${h-b}" stroke="#b2cbbd" stroke-width="1" stroke-dasharray="3 4"/>${series.map((s,i)=>`<circle data-bl-marker="${i}" r="4" fill="${s.color}" stroke="#050d08" stroke-width="2"/>`).join('')}<g class="bl-date-badge"><rect x="-68" y="${h-b+33}" width="136" height="23" rx="4" fill="#214832" stroke="#488164"/><text class="bl-selected-date" y="${h-b+49}" text-anchor="middle" fill="#e4f9ed" font-size="11"></text></g></g>`;
    return svg+'</svg></div><p class="bl-chart-hint">Grafiğe dokun veya tıkla · Tarih yatay eksende, değerler üstte · '+points.length+' günlük gözlem</p>';
  }
  function bindChart(container, points, series) {
    if(points.length<2)return;
    const svg=container.querySelector('svg'),card=container.querySelector('.bl-chart'),readout=container.querySelector('.bl-readout');
    const {x,scales}=geometry(points,series),{w,l,r}=layout;
    let selected=points.length-1;
    const select=(i,announce=false)=>{
      selected=Math.max(0,Math.min(points.length-1,i));const point=points[selected],cx=x(selected);
      const line=svg.querySelector('.bl-crosshair');line.setAttribute('x1',cx);line.setAttribute('x2',cx);
      svg.querySelector('.bl-date-badge').setAttribute('transform',`translate(${Math.max(70,Math.min(w-70,cx))},0)`);
      svg.querySelector('.bl-selected-date').textContent=dateLabel(point.date);
      series.forEach((s,j)=>{const marker=svg.querySelector(`[data-bl-marker="${j}"]`),v=point[s.key];marker.style.display=valid(v)&&scales[j]?'':'none';if(valid(v)&&scales[j]){marker.setAttribute('cx',cx);marker.setAttribute('cy',scales[j].y(v));}});
      readout.setAttribute('aria-live',announce?'polite':'off');
      readout.innerHTML=`<strong>${esc(dateLabel(point.date))}</strong>`+series.map(s=>`<span style="color:${s.color}">${esc(s.label)} <strong>${esc(valid(point[s.key])?(s.key.includes('dominance')?s.format(point[s.key]):money(point[s.key])):'—')}</strong></span>`).join('');
    };
    const fromPointer=(event,announce)=>{
      const rect=svg.getBoundingClientRect(),px=(event.clientX-rect.left)/rect.width*w;
      const target=Math.max(l,Math.min(w-r,px));
      let nearest=0;for(let i=1;i<points.length;i++)if(Math.abs(x(i)-target)<Math.abs(x(nearest)-target))nearest=i;
      select(nearest,announce);
    };
    svg.addEventListener('pointerdown',event=>fromPointer(event,true));
    svg.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'||event.buttons===1)fromPointer(event,false);});
    card.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();select(event.key==='Home'?0:event.key==='End'?points.length-1:selected+(event.key==='ArrowLeft'?-1:1),true);
    });
    select(selected);
  }
  window.mountBtcLiquidity = m => {
    const root=document.getElementById('btc-liquidity');if(!root||!m)return;
    let days=30;
    const draw=()=>{
      const cutoff=new Date(Date.parse(m.fetched_at)-days*86400000).toISOString().slice(0,10);
      const asset=root.querySelector('#bl-asset').value;
      const history=(asset==='total'?m.total:m.coins?.[asset])?.history||[];
      const supplyPoints=history.filter(p=>p.date>=cutoff),supplySeries=[{key:'supply_usd',color:'#5ce0b7',label:asset==='total'?'Toplam arz':asset+' arzı',format:compact}],supplyContainer=root.querySelector('#bl-supply-chart');
      supplyContainer.innerHTML=chart(supplyPoints,supplySeries,'Stablecoin tarihsel arzı');bindChart(supplyContainer,supplyPoints,supplySeries);
      const dom=(m.dominance?.history||[]).filter(p=>p.date>=cutoff);
      const domSeries=[{key:'usdt_supply_usd',color:'#5ce0b7',label:'USDT arzı',format:compact},{key:'usdt_dominance_pct',color:'#e9ad61',label:'USDT dominansı',format:v=>v.toFixed(2)+'%'}],domContainer=root.querySelector('#bl-dominance-chart');
      domContainer.innerHTML=chart(dom,domSeries,'USDT arzı ve dominansı karşılaştırması');bindChart(domContainer,dom,domSeries);
    };
    root.querySelector('#bl-asset').addEventListener('change',draw);
    root.querySelectorAll('[data-bl-days]').forEach(button=>button.addEventListener('click',()=>{days=Number(button.dataset.blDays);root.querySelectorAll('[data-bl-days]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw();}));
    draw();
  };
})();
