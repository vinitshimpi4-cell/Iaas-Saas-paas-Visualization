'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
/* Layers top to bottom; "you" = number of top layers managed by the customer (matches the reference diagram) */
const LAYERS=['Applications','Data','Runtime','Middleware','OS','Virtualization','Servers','Storage','Networking'];
const MODELS={
onprem:{n:'On-premises',f:'You run everything yourself',you:9,ex:'Your own data center',simple:'You buy, house and manage every layer.',
 flow:['You buy hardware','You build the network','You run OS + middleware','You run app + data'],note:'Nothing is outsourced: hardware, software and staff are all yours.'},
iaas:{n:'IaaS',f:'Infrastructure as a Service',you:5,ex:'Amazon EC2',simple:'Renting the building blocks to create your own IT environment.',
 flow:['AWS data centers','Servers, storage, network','EC2 virtual machine','Your OS, middleware, app, data'],note:'AWS runs the hardware and virtualization. You choose the instance, patch the operating system and run your own application.'},
paas:{n:'PaaS',f:'Platform as a Service',you:2,ex:'AWS Elastic Beanstalk',simple:'A ready-to-use platform to deploy your app without hand-managing every layer.',
 flow:['AWS data centers','Elastic Beanstalk platform','EC2 + load balancer + scaling','Your code and data'],note:'Elastic Beanstalk provisions and coordinates AWS resources and can use EC2 instances underneath. Resources run in your account, so you can still tune them.'},
saas:{n:'SaaS',f:'Software as a Service',you:0,ex:'Web-based email',simple:'Using finished software online instead of building and running it yourself.',
 flow:['Provider runs app + infrastructure','Your browser','You: account, settings, access'],note:'The provider runs the whole application. You use it in a browser and still control your own account settings, content and access.'}};
let cur='iaas',timers=[];
const KEYS=Object.keys(MODELS);

/* ---- animated stacks ---- */
function buildStacks(){
 $('#stacks').innerHTML=KEYS.map(k=>{const m=MODELS[k],v=9-m.you;
  const seg=(n,t)=>n?`<div class="seg" style="flex:${n}">${t}</div>`:'';
  return `<div class="col ${k===cur?'sel':''}" data-k="${k}"><h3>${m.n}<small>${k==='onprem'?'':m.f}</small></h3><div class="wrap"><div class="brk">${seg(m.you,'Managed by you')}${seg(v,'Managed by vendor')}</div><div class="stack">${LAYERS.map((l,i)=>`<div class="row" data-i="${i}">${l}</div>`).join('')}</div></div></div>`}).join('');
}
function play(){
 timers.forEach(clearTimeout);timers=[];
 const at=(f,ms)=>timers.push(setTimeout(f,ms));
 buildStacks();
 const cols=$$('.col');
 /* 1) layers rise from the bottom, all light green (you) */
 for(let i=8;i>=0;i--)at(()=>cols.forEach(c=>$$('.row',c)[i].classList.add('in')),(8-i)*130);
 /* 2) vendor-managed layers turn dark green, bottom to top */
 for(let i=8;i>=0;i--)at(()=>cols.forEach((c,ci)=>{if(i>=MODELS[KEYS[ci]].you){const r=$$('.row',c)[i];r.classList.add('ven','flash')}}),1500+(8-i)*170);
 /* 3) brackets appear */
 at(()=>$$('.seg').forEach(s=>s.classList.add('show')),3200);
 $$('.col').forEach(c=>c.onclick=()=>{cur=c.dataset.k;renderModels()});
}
$('#replay').onclick=play;

/* ---- cards, detail, matrix ---- */
function renderModels(){
 $('#cards').innerHTML=KEYS.map(k=>{const m=MODELS[k];return `<button class="card ${k===cur?'on':''}" data-k="${k}" role="tab" aria-selected="${k===cur}"><h3>${m.n}</h3><small>${m.f}</small><p>${m.simple}</p></button>`}).join('');
 const m=MODELS[cur],names=(a,b)=>LAYERS.slice(a,b).join(', ')||'None';
 $('#detail').innerHTML=`<h3>${m.n}: ${m.f}<small>Example: ${m.ex}</small></h3><p>${m.note}</p><div class="flow">${m.flow.map((s,i)=>(i?`<em style="animation-delay:${i*.45-.2}s">→</em>`:'')+`<b style="animation-delay:${i*.45}s">${s}</b>`).join('')}</div><p><b>You manage:</b> ${names(0,m.you)}</p><p><b>Vendor manages:</b> ${names(m.you,9)}</p>`;
 $('#matrix').innerHTML=`<tr><th>Layer</th>${KEYS.map(k=>`<th class="${k===cur?'hl':''}">${MODELS[k].n}</th>`).join('')}</tr>`+LAYERS.map((l,i)=>`<tr><td>${l}</td>${KEYS.map(k=>{const y=i<MODELS[k].you;return `<td class="${k===cur?'hl':''}"><span class="chip ${y?'you':'ven'}">${y?'You':'Vendor'}</span></td>`}).join('')}</tr>`).join('');
 $$('.card').forEach(c=>c.onclick=()=>{cur=c.dataset.k;renderModels()});
 $$('.col').forEach(c=>c.classList.toggle('sel',c.dataset.k===cur));
}
renderModels();
/* play when the diagram scrolls into view */
new IntersectionObserver((e,o)=>{if(e[0].isIntersecting){play();o.disconnect()}},{threshold:.4}).observe($('#stacks'));
buildStacks();
