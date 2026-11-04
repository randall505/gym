/* Reusable UI pieces. Each one takes data and returns an HTML string. */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>Math.round(n).toLocaleString();
const fmtDate=s=>new Date(s+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'});
const icon=n=>`<i data-lucide="${n}"></i>`;
const refreshIcons=()=>window.lucide&&lucide.createIcons();

const Button=(label,action,{kind='primary',ic='',data=''}={})=>`<button class="btn ${kind}" data-action="${action}" ${data}>${ic?icon(ic):''}${label}</button>`;
const Panel=(inner,cls='')=>`<section class="panel ${cls}">${inner}</section>`;
const Badge=t=>`<span class="badge">${t}</span>`;
const Tabs=(items,active,action)=>`<div class="tabs">${items.map(i=>`<button class="${i===active?'on':''}" data-action="${action}" data-v="${i}">${i}</button>`).join('')}</div>`;
const PageHeader=(title,sub,right='')=>`<header class="head"><div><h1>${title}</h1><p class="muted">${sub}</p></div>${right}</header>`;
const Field=(label,name,value,type='text',opts)=>`<label class="field"><span class="label">${label}</span>${opts?`<select name="${name}">${opts.map(o=>`<option ${o==value?'selected':''}>${o}</option>`).join('')}</select>`:`<input name="${name}" type="${type}" value="${esc(value)}">`}</label>`;
const ExerciseRow=e=>`<div class="row"><span>${exById(e.id).name}</span><span class="muted">${e.sets} × ${e.reps}, ${e.rest}s rest</span></div>`;
const HistoryRow=h=>`<div class="row"><div><b>${esc(h.routine)}</b><div class="muted">${fmtDate(h.date)}, ${h.minutes} min</div></div><span>${fmt(h.volume)} kg</span></div>`;

/* Modal and toast */
function openModal(title,body){
 $('#modal').innerHTML=`<div class="overlay" data-action="overlay"><div class="modal" role="dialog" aria-label="${title}"><div class="between"><h2>${title}</h2>${Button('','closeModal',{kind:'ghost',ic:'x',data:'aria-label="Close"'})}</div>${body}</div></div>`;
 refreshIcons();
}
const closeModal=()=>{$('#modal').innerHTML=''};
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2500)}

/* Exercise illustration: a simple line figure per category */
const FIG={
 Push:'<circle cx="50" cy="22" r="6"/><path d="M50 30V62M50 62L40 86M50 62L60 86M50 38H24M50 38H76M14 38H86M18 28V48M82 28V48"/>',
 Pull:'<circle cx="50" cy="30" r="6"/><path d="M50 38V68M50 68L42 90M50 68L58 90M50 44L34 12M50 44L66 12M20 12H80"/>',
 Legs:'<circle cx="50" cy="20" r="6"/><path d="M50 28V54M50 54L32 64L38 86M50 54L68 64L62 86M50 34H74"/>',
 Core:'<circle cx="22" cy="50" r="6"/><path d="M29 54L82 64M38 56V76M82 64L90 76M10 78H94"/>'
};
const Figure=cat=>`<svg class="fig" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FIG[cat]}</svg>`;

/* Charts: plain SVG, no library. The latest bar is accent, older bars are grey. */
function barChart(vals,labels){
 const W=420,H=170,max=Math.max(...vals,1),bw=W/vals.length;
 const lines=[0,.5,1].map(f=>`<line class="gl" x1="0" x2="${W}" y1="${H-f*H*.9}" y2="${H-f*H*.9}"/>`).join('');
 const bars=vals.map((v,i)=>{const h=v/max*H*.9;
  return `<rect x="${i*bw+bw*.2}" y="${H-h}" width="${bw*.6}" height="${h}" rx="2" fill="${i===vals.length-1?'var(--accent)':'var(--past)'}"><title>${labels[i]}: ${fmt(v)}</title></rect><text x="${i*bw+bw/2}" y="${H+16}" text-anchor="middle">${labels[i]}</text>`}).join('');
 return `<svg class="chart" viewBox="0 0 ${W} ${H+24}" role="img">${lines}${bars}</svg>`;
}
function lineChart(pts){
 const W=420,H=170,vs=pts.map(p=>p.v),lo=Math.min(...vs)-1,hi=Math.max(...vs)+1;
 const xy=pts.map((p,i)=>[10+i/(pts.length-1||1)*(W-20),H-(p.v-lo)/(hi-lo)*H*.9]);
 return `<svg class="chart" viewBox="0 0 ${W} ${H+24}" role="img"><line class="gl" x1="0" x2="${W}" y1="${H}" y2="${H}"/><polyline points="${xy.map(a=>a.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>${xy.map((a,i)=>`<circle cx="${a[0]}" cy="${a[1]}" r="3.5" fill="var(--accent)"><title>${pts[i].label}: ${pts[i].v} kg</title></circle>`).join('')}<text x="10" y="${H+16}">${pts[0].label}</text><text x="${W-10}" y="${H+16}" text-anchor="end">${pts[pts.length-1].label}</text></svg>`;
}
