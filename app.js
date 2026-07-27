(function(){
const D=window.TWC;const AGE=D.age, SEX=D.sex;
const tip=document.getElementById('tooltip');
const NS='http://www.w3.org/2000/svg';
function el(t,a={}){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;}
// datalist
const dl=document.getElementById('genelist');
D.genes.forEach(g=>{const o=document.createElement('option');o.value=g;dl.appendChild(o);});

const svg=document.getElementById('scatter');
let curG=null;
function pick(name){
  if(!name) return;
  const g=D.genes.find(x=>x.toUpperCase()===name.toUpperCase().trim());
  if(!g){ document.getElementById('readout').innerHTML=`<b>${name}</b> is not in this explorer set. Try one of the suggestions, or a strongly age-associated protein.`; return; }
  curG=g; document.getElementById('search').value=g; draw();
}
function draw(){
  const p=D.prot[curG]; const V=p.v;
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  const W=600,H=380,padL=48,padR=16,padT=16,padB=42;
  const pts=AGE.map((a,i)=>({a,y:V[i],s:SEX[i]})).filter(o=>o.y!=null);
  const ymin=Math.min(...pts.map(o=>o.y)), ymax=Math.max(...pts.map(o=>o.y));
  const X=a=>padL+(a-18)/(110-18)*(W-padL-padR);
  const Y=v=>padT+(1-(v-ymin)/((ymax-ymin)||1))*(H-padT-padB);
  // grid + axes
  svg.appendChild(el('line',{x1:padL,y1:H-padB,x2:W-padR,y2:H-padB,stroke:'#ccc'}));
  svg.appendChild(el('line',{x1:padL,y1:padT,x2:padL,y2:H-padB,stroke:'#ccc'}));
  for(let a=20;a<=100;a+=20){ const x=X(a); const t=el('text',{x,y:H-padB+15,'text-anchor':'middle','font-family':'system-ui','font-size':10,fill:'#999'}); t.textContent=a; svg.appendChild(t); }
  svg.appendChild(el('text',{x:(padL+W-padR)/2,y:H-5,'text-anchor':'middle','font-family':'system-ui','font-size':11,fill:'#666'})).textContent='age (years)';
  const yl=el('text',{x:14,y:H/2,'text-anchor':'middle','font-family':'system-ui','font-size':11,fill:'#666',transform:`rotate(-90 14 ${H/2})`}); yl.textContent=curG+' plasma level'; svg.appendChild(yl);
  // linear regression
  const n=pts.length, mx=pts.reduce((s,o)=>s+o.a,0)/n, my=pts.reduce((s,o)=>s+o.y,0)/n;
  let sxy=0,sxx=0; pts.forEach(o=>{sxy+=(o.a-mx)*(o.y-my); sxx+=(o.a-mx)**2;});
  const slope=sxy/sxx, b0=my-slope*mx;
  // points
  pts.forEach(o=>{ const c=el('circle',{cx:X(o.a),cy:Y(o.y),r:3.4,fill:o.s? '#2f6f9f':'#c0603a',opacity:0.72,cursor:'pointer'});
    c.addEventListener('mousemove',e=>{tip.style.display='block';tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY-10)+'px';tip.innerHTML=`age ${o.a}, ${o.s?'M':'F'}<br>${curG} ${o.y}`;});
    c.addEventListener('mouseleave',()=>tip.style.display='none'); svg.appendChild(c); });
  // trend line
  svg.appendChild(el('line',{x1:X(21),y1:Y(slope*21+b0),x2:X(100),y2:Y(slope*100+b0),stroke:'#1a1a1a','stroke-width':2.2}));
  // readout
  const dir=p.coef>0?'rises':'falls';
  const perDecade=(p.coef*10).toFixed(3);
  document.getElementById('m-dir').textContent=p.coef>0?'rising':'falling';
  document.getElementById('m-dir-d').textContent=curG+' with age';
  document.getElementById('readout').innerHTML=
    `<b>${curG}</b> ${dir} with age (model change ${p.coef>0?'+':''}${p.coef} per year, q = ${p.q.toExponential(1)}). `+
    `Each dot is one of the ${pts.length} donors, blue male and orange female. `+
    (Math.abs(p.coef)>0.004?'This is one of the steeper age-associated proteins in plasma.':'A significant but gentler age association.');
}
document.getElementById('search').addEventListener('keydown',e=>{if(e.key==='Enter')pick(e.target.value);});

// Analysis 2: top movers
const bars=document.getElementById('bars');
const rows=D.genes.map(g=>({g,coef:D.prot[g].coef})).sort((a,b)=>b.coef-a.coef);
const top=[...rows.slice(0,8),...rows.slice(-6)];
const lim=Math.max(...D.genes.map(g=>Math.abs(D.prot[g].coef)));
top.forEach(r=>{ const w=Math.abs(r.coef)/lim*50; const pos=r.coef>0;
  bars.insertAdjacentHTML('beforeend',
   `<div class="brow"><div class="bname"><a onclick="pick('${r.g}')" style="color:#2f6f9f;cursor:pointer;text-decoration:none">${r.g}</a></div>`+
   `<div class="btrack"><div class="bmid"></div><div class="bfill" style="background:${pos?'#b0563e':'#2f6f9f'};${pos?'left:50%':'right:50%'};width:${w}%"></div></div>`+
   `<div class="bnum">${r.coef>0?'+':''}${r.coef}/yr</div></div>`);
});
pick('GDF15');
window.pick=pick;
})();
