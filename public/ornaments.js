/* TabrikUZ bespoke botanical placement — v6. */
(()=>{'use strict';
const root=document.getElementById('app');
if(!root)return;
const ASSET='/assets/ornaments/';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tracked=new Set();
const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{entries.forEach(e=>e.target.classList.toggle('ornaments-offscreen',!e.isIntersecting))},{rootMargin:'120px'}):null;
function image(file,cls){const img=document.createElement('img');img.className=cls;img.src=ASSET+file+'.svg';img.alt='';img.loading='lazy';img.decoding='async';return img}
function corner(node,index){
if(node.querySelector(':scope > .edge-bouquet'))return;
const wrap=document.createElement('div');wrap.className='edge-bouquet floral-corners';wrap.setAttribute('aria-hidden','true');
const left=image('corner-'+(index%3+1),'floral-corner corner-left');
const right=image('corner-'+((index+1)%3+1),'floral-corner corner-right');
wrap.append(left,right);
for(let n=0;n<3;n++){const leaf=document.createElement('i');leaf.className='floating-leaf leaf-'+n;wrap.append(leaf)}
node.append(wrap);
if(io&&!tracked.has(node)){tracked.add(node);io.observe(node)}
}
function separator(kind='section',index=0){
const el=document.createElement('div');el.className='botanical-separator separator-'+kind+' seam-variant-'+(index%3+1);el.setAttribute('aria-hidden','true');
const row=document.createElement('div');row.className='floral-seam-row';
for(let tile=0;tile<5;tile++){
const unit=document.createElement('div');unit.className='floral-seam-tile';
unit.append(image('seam-'+((index+tile)%3+1),'seam-art'));
for(let n=0;n<5;n++){
const x=[.14,.31,.52,.73,.88][n],anchor=32+24*Math.sin(Math.PI*2*x),drop=10+(n%3)*5;
const pendant=document.createElement('span');pendant.className='seam-pendant'+(n%3===1?' pendant-crystal':'');
pendant.style.setProperty('--x',String(x*100)+'%');pendant.style.setProperty('--anchor',String(anchor)+'px');pendant.style.setProperty('--drop',String(drop)+'px');pendant.style.setProperty('--delay',String(-(tile*5+n)*.53)+'s');
pendant.innerHTML='<i class="pendant-string"></i><i class="pendant-glow"></i><i class="pendant-gem"></i>';unit.append(pendant)
}
row.append(unit)
}
el.append(row);return el
}
const header=document.querySelector('.site-header');
if(header){
const old=header.querySelector('.nav-bouquet');if(old)old.remove();
const garland=document.createElement('div');garland.className='custom-nav-garland';garland.setAttribute('aria-hidden','true');garland.append(image('navbar','navbar-floral-art'));header.append(garland);
if(!header.querySelector('.botanical-separator'))header.append(separator('nav',0))
}
const footer=document.querySelector('.footer');if(footer&&!footer.querySelector('.botanical-separator'))footer.prepend(separator('footer',2));
let queued=false;function sync(){
queued=false;
root.querySelectorAll(':scope > .botanical-separator').forEach(e=>e.remove());
const sections=[...root.children].filter(e=>e.matches?.('section,.occasion-strip'));
sections.forEach((section,i)=>{if(i>0)section.before(separator('section',i))});
const cards=root.querySelectorAll('.template-info,.price-card,.step,.cta-banner');
cards.forEach((node,i)=>corner(node,i));
root.querySelectorAll('.header-actions .btn,#app .btn,#app [data-template]').forEach(el=>el.classList.add('ornament-button'));
for(const node of tracked)if(!node.isConnected){io?.unobserve(node);tracked.delete(node)}
}
let syncing=false;
function schedule(){if(queued||syncing)return;queued=true;requestAnimationFrame(()=>{syncing=true;sync();syncing=false})}
const mutation=new MutationObserver(records=>{if(records.every(r=>[...r.addedNodes].every(n=>n.nodeType!==1||n.classList?.contains('botanical-separator'))))return;schedule()});
mutation.observe(root,{childList:true,subtree:false});
sync();
})();