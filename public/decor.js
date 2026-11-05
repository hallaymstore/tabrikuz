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

// Every section boundary on the landing page: [section it opens, centre piece, vine].
const SEAMS=[['#collections','01','02'],['#how','02','01'],['#pricing','04','03'],['#pricing + section','03','02']];

// Corner bouquets: [selector, position, art, mirrored]. Art is placed so its
// mass sits outside the box and only the tips reach in over padding.
const CORNERS=[
 ['.showcase-scene','top-left','top-left'],
 ['.showcase-scene','bottom-right','bottom-right'],
 ['.template-grid .world-card:nth-child(odd)','top-left','top-left'],
 ['.template-grid .world-card:nth-child(even)','top-left','top-right',true],
 ['.steps > .step:first-child','bottom-left','bottom-left'],
 ['.steps > .step:last-child','bottom-right','bottom-right'],
 ['.price-grid > .price-card:first-child','top-right','top-left',true],
 ['.price-card.featured','top-right','top-right'],
 ['.cta-banner','top-left','top-left'],
 ['.cta-banner','top-right','top-right'],
 ['.cta-banner','bottom-left','bottom-left'],
 ['.cta-banner','bottom-right','bottom-right'],
 // Sections: big bouquets breaking out of the screen edges.
 ['#app > #collections','top-left','top-left'],
 ['#app > #collections','top-right','top-right'],
 ['#app > #how','bottom-left','bottom-left'],
 ['#app > #how','bottom-right','bottom-right'],
 ['#app > #pricing','top-left','top-left'],
 ['#app > #pricing','top-right','top-right']
];
// Sections that get a drifting layer of small sprigs behind their content.
const FLOATS=['.celebration-hero','#collections','#how','#pricing'];
const SPRIGS=['button-floral-01','button-floral-02'];

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

// A seam: full-width vine across the boundary plus a centre piece.
function seam(kind,vine,where){
 const el=node('div','flora-divider flora-divider--'+kind+' flora-seam--'+where);
 el.append(img('seam-vine-'+vine,'flora-vine'));
 const sway=document.createElement('div');sway.className='flora-sway';
 sway.append(img('divider-floral-'+kind,'flora-divider-art'));
 if(kind==='02'){
  // Lamps and glints share the garland's transform, so they never detach.
  LAMPS.forEach(([x,y],i)=>{
   const lamp=document.createElement('span');lamp.className='flora-lamp';
   lamp.style.cssText='--x:'+x+';--y:'+y+';--d:'+(-i*.9).toFixed(1)+'s;--t:'+(2+i%2*.6)+'s';
   lamp.append(img('lamp-pendant','flora-lamp-art'));
   const glow=document.createElement('i');glow.className='flora-lamp-glow';lamp.append(glow);
   sway.append(lamp);
  });
  GEMS.forEach(([x,y],i)=>{
   const gem=document.createElement('i');gem.className='flora-glint';
   gem.style.cssText='--x:'+x+';--y:'+y+';--d:'+(-i*.45).toFixed(2)+'s';
   sway.append(gem);
  });
 }
 el.append(sway);track(el);return el;
}

function corner(host,where,art,mirror){
 const key='flora-corner--'+where;
 if(host.querySelector(':scope > .'+key))return;
 const el=node('span','flora-corner '+key+(mirror?' flora-mirror':''));
 el.append(img('corner-'+art,'flora-corner-art'));
 host.classList.add('flora-host');host.append(el);track(el);
}

function floats(host,seed){
 if(host.querySelector(':scope > .flora-float'))return;
 const layer=node('div','flora-float');
 for(let i=0;i<7;i++){
  // Keep drifters in the side margins, clear of centred copy.
  const n=seed*7+i,x=i%2?88+(n*7)%9:(n*5)%9,y=(n*53+7)%88;
  const s=img(SPRIGS[n%SPRIGS.length],'flora-drift');
  s.style.cssText='--x:'+x+'%;--y:'+y+'%;--d:'+(-(n*1.9)%11).toFixed(1)+'s;--t:'+(7+(n%5)*1.6)+'s;--r:'+((n%2?1:-1)*(14+n%4*6))+'deg';
  layer.append(s);
 }
 host.classList.add('flora-host');host.prepend(layer);track(layer);
}

function header(){
 const head=document.querySelector('.site-header');
 if(!head||head.querySelector(':scope > .flora-navbar'))return;
 const el=node('div','flora-navbar');
 el.append(img('seam-vine-01','flora-navbar-vine'),img('navbar-garland','flora-navbar-art'));
 head.append(el);track(el);
}

function footer(){
 const foot=document.querySelector('.footer');
 if(!foot||foot.querySelector(':scope > .flora-divider'))return;
 foot.prepend(seam('01','03','footer'));
}

function modal(){
 const box=document.querySelector('#authModal .modal');
 if(!box)return;
 corner(box,'top-left','top-left');
}

function sync(){
 for(const el of visible)if(!el.isConnected){io.unobserve(el);visible.delete(el)}
 if(!document.body.classList.contains('landing-experience'))return;
 for(const [sel,kind,vine] of SEAMS){
  const section=app.querySelector(':scope > '+sel);
  if(!section)continue;
  const prev=section.previousElementSibling;
  if(prev&&prev.matches('.flora-divider'))continue;
  section.before(seam(kind,vine,'section'));
 }
 for(const [sel,where,art,mirror] of CORNERS)document.querySelectorAll(sel).forEach(host=>corner(host,where,art,mirror));
 FLOATS.forEach((sel,i)=>{const host=app.querySelector(sel);if(host)floats(host,i)});
}

// app.js swaps #app's children on navigation and re-renders the template
// grid on filtering. Mutations made only of our own [data-decor] nodes are
// ignored, so a sync can never re-trigger itself.
let queued=false;
const own=n=>n.nodeType!==1||n.hasAttribute('data-decor');
new MutationObserver(records=>{
 if(queued||records.every(r=>[...r.addedNodes].every(own)&&[...r.removedNodes].every(own)))return;
 queued=true;requestAnimationFrame(()=>{queued=false;sync()});
}).observe(app,{childList:true,subtree:true});
header();footer();modal();sync();
})();
