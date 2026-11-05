/* TabrikUZ floral decoration — the single decorator for ornaments.
   Art lives in /assets/ornaments/*.webp; CSS only positions and animates it.
   Every node it adds carries data-decor, so re-runs are idempotent and the
   observer ignores its own insertions. */
(()=>{'use strict';
const app=document.getElementById('app');
if(!app)return;
const ART='/assets/ornaments/';

// Lamp anchors (x, y as fractions of divider-floral-02) sit on the underside of
// the flower band; crystals mark where the drop gems hang, for the shimmer.
const LAMPS=[[.21,.54],[.43,.72],[.57,.72],[.79,.54]];
const GEMS=[[.035,.43],[.165,.62],[.255,.72],[.362,.81],[.494,.91],[.632,.81],[.74,.72],[.845,.62],[.955,.43]];

// Which divider goes where, keyed by the section it opens.
const DIVIDERS=[['#collections','01'],['#how','02'],['#pricing + section','03']];

// Corner art per component: [selector, corner, ...]. Kept sparse on purpose.
const CORNERS=[
 ['.cta-banner','top-left','bottom-right'],
 ['.price-card.featured','top-right'],
 ['.steps > .step:first-child','bottom-left'],
 ['.steps > .step:last-child','bottom-right']
];

const visible=new Set();
const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 for(const e of entries)e.target.classList.toggle('flora-live',e.isIntersecting);
},{rootMargin:'80px 0px'}):null;
function track(el){if(io){io.observe(el);visible.add(el)}else el.classList.add('flora-live')}

function img(file,cls){
 const el=document.createElement('img');
 el.src=ART+file+'.webp';el.alt='';el.className=cls;el.decoding='async';el.loading='lazy';el.draggable=false;
 return el;
}
function node(tag,cls){const el=document.createElement(tag);el.className=cls;el.dataset.decor='';el.setAttribute('aria-hidden','true');return el}

function divider(kind){
 const el=node('div','flora-divider flora-divider--'+kind);
 const sway=document.createElement('div');sway.className='flora-sway';
 sway.append(img('divider-floral-'+kind,'flora-divider-art'));
 if(kind==='02'){
  // Lamps and glints share the garland's transform, so they never detach.
  LAMPS.forEach(([x,y],i)=>{
   const lamp=document.createElement('span');lamp.className='flora-lamp';
   lamp.style.cssText='--x:'+x+';--y:'+y+';--d:'+(-i*1.7).toFixed(1)+'s;--t:'+(4.6+i%2*1.1)+'s';
   lamp.append(img('lamp-pendant','flora-lamp-art'));
   const glow=document.createElement('i');glow.className='flora-lamp-glow';lamp.append(glow);
   sway.append(lamp);
  });
  GEMS.forEach(([x,y],i)=>{
   const gem=document.createElement('i');gem.className='flora-glint';
   gem.style.cssText='--x:'+x+';--y:'+y+';--d:'+(-i*.9).toFixed(1)+'s';
   sway.append(gem);
  });
 }
 el.append(sway);track(el);return el;
}

function corner(host,where){
 if(host.querySelector(':scope > .flora-corner--'+where))return;
 const el=node('span','flora-corner flora-corner--'+where);
 el.append(img('corner-'+where,'flora-corner-art'));
 host.classList.add('flora-host');host.append(el);track(el);
}

function header(){
 const head=document.querySelector('.site-header');
 if(!head||head.querySelector(':scope > .flora-navbar'))return;
 const el=node('div','flora-navbar');
 el.append(img('navbar-garland','flora-navbar-art'));
 head.append(el);
}

function sync(){
 for(const el of visible)if(!el.isConnected){io.unobserve(el);visible.delete(el)}
 if(!document.body.classList.contains('landing-experience'))return;
 for(const [sel,kind] of DIVIDERS){
  const section=app.querySelector(':scope > '+sel);
  if(!section)continue;
  const prev=section.previousElementSibling;
  if(prev&&prev.matches('.flora-divider'))continue;
  section.before(divider(kind));
 }
 for(const [sel,...where] of CORNERS)app.querySelectorAll(sel).forEach(host=>where.forEach(w=>corner(host,w)));
}

// app.js swaps #app's children on navigation. Only direct-child changes matter,
// and mutations made of our own [data-decor] nodes are ignored, so a sync can
// never re-trigger itself.
let queued=false;
const own=n=>n.nodeType!==1||n.hasAttribute('data-decor');
new MutationObserver(records=>{
 if(queued||records.every(r=>[...r.addedNodes].every(own)&&[...r.removedNodes].every(own)))return;
 queued=true;requestAnimationFrame(()=>{queued=false;sync()});
}).observe(app,{childList:true});
header();sync();
})();
