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
      #btc-liquidity{scroll-margin-top:24px}#btc-liquidity .bl-note{font-size:12px;opacity:.75;line-height:1.6}
      #btc-liquidity .bl-table-wrap{overflow-x:auto}#btc-liquidity table{width:100%;min-width:590px;border-collapse:collapse;margin:18px 0}
      #btc-liquidity th,#btc-liquidity td{text-align:right;padding:12px 8px;border-bottom:1px solid #ffffff18;font-variant-numeric:tabular-nums}
      #btc-liquidity th:first-child{text-align:left}#btc-liquidity small{opacity:.75}#btc-liquidity .bl-alert{padding:12px;border-left:3px solid #ff806b;background:#ff806b15}
      #btc-liquidity .bl-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:18px 0 6px}
      #btc-liquidity button,#btc-liquidity select{background:#152338;color:#e8f0ff;border:1px solid #456078;padding:8px 12px;border-radius:6px;font:inherit;cursor:pointer}
      #btc-liquidity button[aria-pressed="true"]{background:#246755;border-color:#5ce0b7}#btc-liquidity button:focus-visible,#btc-liquidity select:focus-visible{outline:2px solid #5ce0b7}
      #btc-liquidity svg{width:100%;height:auto;display:block;color:inherit}#btc-liquidity .bl-peg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:15px}
      #btc-liquidity .bl-peg>div{padding:12px;background:#ffffff06;border:1px solid #ffffff18;border-radius:8px}
    </style><h2>BTC Risk & Liquidity Monitor</h2><p>${esc(m.reading)}</p>${alerts}
      <p class="bl-note">Kaynak: DefiLlama · Alınma: ${esc(new Date(m.fetched_at).toLocaleString('tr-TR'))} · Toplam, izlenen dört stablecoin'i kapsar.</p>
      <div class="bl-table-wrap"><table aria-label="Stablecoin arzı ve dönemsel değişimler"><thead><tr><th scope="col">Stablecoin</th><th scope="col">Arz ($1 nominal)</th><th scope="col">Günlük ($ / %)</th><th scope="col">7G ($ / %)</th><th scope="col">30G ($ / %)</th></tr></thead><tbody>${row('Toplam · 4 stablecoin', m.total)}${['USDT','USDC','USDe','USDS'].map(s => row(s, coins[s])).join('')}</tbody></table></div>
      <div class="bl-controls"><label for="bl-asset">Arz grafiği</label><select id="bl-asset"><option value="total">Toplam · 4 stablecoin</option>${['USDT','USDC','USDe','USDS'].map(s => `<option>${s}</option>`).join('')}</select>${[7,30,90,365].map(n => `<button type="button" data-bl-days="${n}" aria-pressed="${n===30}">${n===365?'1Y':n+'G'}</button>`).join('')}</div>
      <div id="bl-supply-chart"></div><h3>USDT dominansı ve arzı</h3><p class="bl-note">Arz: DefiLlama (sol eksen, milyar $). Dominans: CoinGecko USDT piyasa değeri / toplam kripto piyasa değeri (sağ eksen, %). Günlük UTC gözlemleri bu modülün kurulmasından itibaren birikir.</p><div id="bl-dominance-chart"></div>
      <p class="bl-note">Alarm koşulu: aynı dönemde dominans değişimi &gt; 0 yüzde puan ve USDT arz değişimi &lt; $0.</p><p class="bl-note">${signals}</p>
      <h3>$1 peg kontrolü</h3><div class="bl-peg">${['USDT','USDC','USDe','USDS'].map(s => {const c=coins[s]||{};return `<div><strong>${s}</strong><br>${valid(c.price_usd)?'$'+c.price_usd.toFixed(5):'—'} · ${pct(c.peg_deviation_pct)}<br><small>${esc(({normal:'Normal',warning:'⚠ Peg sapması',critical:'⚠ Kritik peg sapması',unavailable:'Fiyat verisi yok'})[c.peg_status] || 'Veri yok')}</small></div>`;}).join('')}</div>
      <p class="bl-note">${esc(m.methodology)} Fiyat sapması tek başına ödeme güçlüğünü kanıtlamaz.</p>${(m.errors||[]).map(e=>`<p class="bl-note">⚠ ${esc(e)}</p>`).join('')}</section>`;
  };
  function chart(points, series, title) {
    if (points.length < 2) return '<p class="bl-note">Bu aralık için en az iki günlük gözlem gerekli; geçmiş veri henüz yeterli değil.</p>';
    const w=900,h=290,l=92,r=94,t=32,b=48,inner=w-l-r;
    const times=points.map(p=>Date.parse(p.date+'T00:00:00Z')),start=times[0],end=times.at(-1);
    const x=i=>l+(times[i]-start)/(end-start)*inner;
    let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>`;
    for(let i=0;i<5;i++){let y=t+i*(h-t-b)/4;svg+=`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="currentColor" opacity=".12"/>`;}
    series.forEach((s,si)=>{
      const vals=points.map(p=>p[s.key]).filter(valid);if(!vals.length)return;
      let min=Math.min(...vals),max=Math.max(...vals),pad=(max-min)*.1||Math.abs(max)*.005||1;min-=pad;max+=pad;
      const y=v=>t+(max-v)/(max-min)*(h-t-b);
      let path='',previous=-1;
      points.forEach((p,i)=>{if(!valid(p[s.key])){previous=-1;return;}path+=(previous===i-1&&previous>=0?'L':'M')+x(i).toFixed(1)+','+y(p[s.key]).toFixed(1)+' ';previous=i;});
      svg+=`<path d="${path}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`;
      points.forEach((p,i)=>{if(valid(p[s.key]))svg+=`<circle cx="${x(i)}" cy="${y(p[s.key])}" r="3" fill="${s.color}"><title>${esc(p.date+' · '+s.label+': '+s.format(p[s.key]))}</title></circle>`;});
      for(let j=0;j<5;j++){let v=max-j*(max-min)/4;svg+=`<text x="${si===0?l-10:w-r+10}" y="${t+j*(h-t-b)/4+4}" fill="${s.color}" text-anchor="${si===0?'end':'start'}" font-size="12">${esc(s.format(v))}</text>`;}
      svg+=`<text x="${si===0?l:w-r}" y="17" fill="${s.color}" text-anchor="${si===0?'start':'end'}" font-size="12">${esc(s.label)}</text>`;
    });
    [0,Math.floor((points.length-1)/2),points.length-1].forEach(i=>{svg+=`<text x="${x(i)}" y="${h-15}" fill="currentColor" text-anchor="middle" font-size="12">${esc(points[i].date)}</text>`;});
    return svg+'</svg><p class="bl-note">'+esc(points[0].date+' – '+points.at(-1).date)+' · '+points.length+' günlük gözlem · Noktaların üzerinde değerler görülebilir.</p>';
  }
  window.mountBtcLiquidity = m => {
    const root=document.getElementById('btc-liquidity');if(!root||!m)return;
    let days=30;
    const draw=()=>{
      const cutoff=new Date(Date.parse(m.fetched_at)-days*86400000).toISOString().slice(0,10);
      const asset=root.querySelector('#bl-asset').value;
      const history=(asset==='total'?m.total:m.coins?.[asset])?.history||[];
      root.querySelector('#bl-supply-chart').innerHTML=chart(history.filter(p=>p.date>=cutoff),[{key:'supply_usd',color:'#5ce0b7',label:asset==='total'?'Toplam arz':asset+' arzı',format:compact}],'Stablecoin tarihsel arzı');
      const dom=(m.dominance?.history||[]).filter(p=>p.date>=cutoff);
      root.querySelector('#bl-dominance-chart').innerHTML=chart(dom,[{key:'usdt_supply_usd',color:'#5ce0b7',label:'USDT arzı',format:compact},{key:'usdt_dominance_pct',color:'#e9ad61',label:'USDT dominansı',format:v=>v.toFixed(2)+'%'}],'USDT arzı ve dominansı karşılaştırması');
    };
    root.querySelector('#bl-asset').addEventListener('change',draw);
    root.querySelectorAll('[data-bl-days]').forEach(button=>button.addEventListener('click',()=>{days=Number(button.dataset.blDays);root.querySelectorAll('[data-bl-days]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw();}));
    draw();
  };
})();
