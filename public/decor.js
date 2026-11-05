/* TabrikUZ floral decoration — the single decorator for ornaments.
   Art lives in /assets/ornaments/; CSS only positions and animates it.
   Ornaments are "rigs": a static base (stems, gold, pearls) that stays fixed
   to its card or seam, plus every leaf and blossom as its own part that
   moves around its own pivot (scripts/build-rigs.py). Every node this file
   adds carries data-decor, so re-runs are idempotent and the observer
   ignores its own insertions. */
(()=>{'use strict';
const app=document.getElementById('app');
if(!app)return;
const ART='/assets/ornaments/';
let RIGS=null;

// Lamp anchors (x, y as fractions of divider-floral-02) sit on the underside of
// the flower band; crystals mark where the drop gems hang, for the shimmer.
const LAMPS=[[.21,.54],[.43,.72],[.57,.72],[.79,.54]];
const GEMS=[[.035,.43],[.165,.62],[.255,.72],[.362,.81],[.494,.91],[.632,.81],[.74,.72],[.845,.62],[.955,.43]];

// Every section boundary on the landing page: [section it opens, centre piece, vine].
const SEAMS=[['#collections','01','02'],['#how','02','01'],['#pricing','04','03'],['#pricing + section','03','02']];

// Corner bouquets: [selector, position, art, mirrored]. The mass sits outside
// the box and only the tips reach in over padding.
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
 ['#app > #collections','top-left','top-left'],
 ['#app > #collections','top-right','top-right'],
 ['#app > #how','bottom-left','bottom-left'],
 ['#app > #how','bottom-right','bottom-right'],
 ['#app > #pricing','top-left','top-left'],
 ['#app > #pricing','top-right','top-right']
];
// Vine-wrapped pillars flank these sections on wide screens; narrower
// screens get a climbing vine on each edge instead.
const PILLARS=['#collections','#pricing'];
const CLIMBERS=['#collections','#how','#pricing'];

const visible=new Set();
const io='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 for(const e of entries)e.target.classList.toggle('flora-live',e.isIntersecting);
},{rootMargin:'60px 0px'}):null;
function track(el){if(io){io.observe(el);visible.add(el)}else el.classList.add('flora-live')}
const untrack=()=>{for(const el of visible)if(!el.isConnected){io.unobserve(el);visible.delete(el)}};

function img(file,cls){
 const el=document.createElement('img');
 el.src=ART+file;el.alt='';el.className=cls;el.decoding='async';el.loading='lazy';el.draggable=false;
 return el;
}
function node(tag,cls){const el=document.createElement(tag);el.className=cls;el.dataset.decor='';el.setAttribute('aria-hidden','true');return el}
const pct=(a,b)=>(b?a/b*100:0).toFixed(3)+'%';

// Rebuild one ornament from its base and its parts atlas.
function rig(name,seed=0){
 const r=RIGS&&RIGS[name],wrap=document.createElement('div');
 wrap.className='flora-rig';
 if(!r){wrap.append(img(name+'.webp','flora-rig-base'));return wrap}
 wrap.style.cssText='aspect-ratio:'+r.w+'/'+r.h+';--atlas:url('+ART+'rig/'+name+'-parts.webp)';
 wrap.append(img('rig/'+name+'-base.webp','flora-rig-base'));
 r.parts.forEach(([x,y,w,h,kind,px,py,ax,ay],i)=>{
  const p=document.createElement('i'),n=i+seed*7;
  p.className='flora-part k-'+kind;
  p.style.cssText='left:'+pct(x,r.w)+';top:'+pct(y,r.h)+';width:'+pct(w,r.w)+';height:'+pct(h,r.h)+
   ';background-size:'+pct(r.aw,w)+' '+pct(r.ah,h)+';background-position:'+pct(ax,r.aw-w)+' '+pct(ay,r.ah-h)+
   ';transform-origin:'+px+'% '+py+'%;--t:'+(1.7+(n*7%11)/7).toFixed(2)+'s;--d:-'+(n*.37%3).toFixed(2)+'s;--a:'+(5+n*3%7)+'deg';
  wrap.append(p);
 });
 return wrap;
}

// A seam: full-width vine across the boundary plus a centre piece.
function seam(kind,vine,where){
 const el=node('div','flora-divider flora-divider--'+kind+' flora-seam--'+where);
 const band=document.createElement('div');band.className='flora-vine';
 const v=rig('seam-vine-'+vine,kind.charCodeAt(1));
 if(RIGS)v.style.setProperty('--ar',String(RIGS['seam-vine-'+vine].w/RIGS['seam-vine-'+vine].h));
 band.append(v);el.append(band);
 const centre=document.createElement('div');centre.className='flora-sway';
 const art=rig('divider-floral-'+kind,3);art.classList.add('flora-divider-art');centre.append(art);
 if(kind==='02'){
  // Lamps and glints hang from fixed points on the static base.
  LAMPS.forEach(([x,y],i)=>{
   const lamp=document.createElement('span');lamp.className='flora-lamp';
   lamp.style.cssText='--x:'+x+';--y:'+y+';--d:'+(-i*.9).toFixed(1)+'s;--t:'+(2+i%2*.6)+'s';
   lamp.append(img('lamp-pendant.webp','flora-lamp-art'));
   const glow=document.createElement('i');glow.className='flora-lamp-glow';lamp.append(glow);
   centre.append(lamp);
  });
  GEMS.forEach(([x,y],i)=>{
   const gem=document.createElement('i');gem.className='flora-glint';
   gem.style.cssText='--x:'+x+';--y:'+y+';--d:'+(-i*.45).toFixed(2)+'s';
   centre.append(gem);
  });
 }
 el.append(centre);track(el);return el;
}

function corner(host,where,art,mirror,seed){
 const key='flora-corner--'+where;
 if(host.querySelector(':scope > .'+key))return;
 const el=node('span','flora-corner '+key+(mirror?' flora-mirror':''));
 el.append(rig('corner-'+art,seed));
 host.classList.add('flora-host');host.append(el);track(el);
}

function pillar(host,side,i){
 if(host.querySelector(':scope > .flora-pillar--'+side))return;
 const el=node('div','flora-pillar flora-pillar--'+side);
 const shaft=document.createElement('div');shaft.className='flora-pillar-shaft';
 const wraps=document.createElement('div');wraps.className='flora-pillar-wraps';
 // One wrap per ~300px of shaft, alternating the three vine designs.
 const count=Math.max(2,Math.ceil((host.offsetHeight-200)/300));
 // Each wrap is watched on its own so only the on-screen ones move.
 for(let k=0;k<count;k++){const w=rig('wrap-vine-0'+((k+i)%3+1),k+i*5);wraps.append(w);track(w)}
 el.append(img('pillar-capital.webp','flora-pillar-capital'),shaft,img('pillar-base.webp','flora-pillar-base'),wraps);
 host.classList.add('flora-host');host.append(el);
}

function climber(host,side,i){
 if(host.querySelector(':scope > .flora-climber--'+side))return;
 const el=node('div','flora-climber flora-climber--'+side);
 el.append(rig('wrap-vine-0'+((i+(side==='right'?1:0))%3+1),i*3));
 host.classList.add('flora-host');host.append(el);track(el);
}

// Petals falling across the screen, cut from the blossoms in the rigs.
function petals(){
 if(document.querySelector('.flora-petals')||!RIGS)return;
 const pool=[];
 for(const name of ['divider-floral-01','divider-floral-02','seam-vine-03','corner-top-left'])
  for(const p of RIGS[name]?.parts||[])if((p[4]==='bloom')&&p[2]<70&&p[3]<70)pool.push([name,p]);
 if(!pool.length)return;
 const layer=node('div','flora-petals');
 for(let i=0;i<16;i++){
  const [name,[,, w,h,,,,ax,ay]]=pool[(i*7)%pool.length],r=RIGS[name],size=14+(i*5)%12;
  const fall=document.createElement('i');fall.className='flora-petal';
  fall.style.cssText='--x:'+((i*61+7)%100)+'vw;--t:'+(9+(i*3)%8)+'s;--d:-'+((i*1.7)%14).toFixed(1)+'s;--sway:'+((i%2?1:-1)*(30+(i*11)%40))+'px';
  const b=document.createElement('b');
  b.style.cssText='width:'+size+'px;height:'+(size*h/w).toFixed(1)+'px;background-image:url('+ART+'rig/'+name+'-parts.webp);background-size:'+pct(r.aw,w)+' '+pct(r.ah,h)+';background-position:'+pct(ax,r.aw-w)+' '+pct(ay,r.ah-h)+';--spin:'+(i%3+1)*1.3+'s';
  fall.append(b);layer.append(fall);
 }
 document.body.append(layer);
}

function header(){
 const head=document.querySelector('.site-header');
 if(!head||head.querySelector(':scope > .flora-navbar'))return;
 const el=node('div','flora-navbar');
 // A slim chain of the three vines (static, so the sticky header stays
 // light); only the centre garland's leaves and blossoms move.
 const band=document.createElement('div');band.className='flora-navbar-vine';
 for(let i=0;i<6;i++)band.append(img('seam-vine-0'+(i%3+1)+'.webp','flora-navbar-link'+(i%2?' flora-flip':'')));
 const g=rig('navbar-garland',4);g.classList.add('flora-navbar-art');
 el.append(band,g);head.append(el);track(el);
}

function footer(){
 const foot=document.querySelector('.footer');
 if(!foot||foot.querySelector(':scope > .flora-divider'))return;
 foot.prepend(seam('01','03','footer'));
}

function modal(){
 const box=document.querySelector('#authModal .modal');
 if(box)corner(box,'top-left','top-left',false,2);
}

function sync(){
 untrack();
 if(!document.body.classList.contains('landing-experience'))return;
 for(const [sel,kind,vine] of SEAMS){
  const section=app.querySelector(':scope > '+sel);
  if(!section)continue;
  const prev=section.previousElementSibling;
  if(prev&&prev.matches('.flora-divider'))continue;
  section.before(seam(kind,vine,'section'));
 }
 CORNERS.forEach(([sel,where,art,mirror],i)=>document.querySelectorAll(sel).forEach((host,j)=>corner(host,where,art,mirror,i+j)));
 PILLARS.forEach((sel,i)=>{const host=app.querySelector(':scope > '+sel);if(host){pillar(host,'left',i);pillar(host,'right',i+1)}});
 CLIMBERS.forEach((sel,i)=>{const host=app.querySelector(':scope > '+sel);if(host){climber(host,'left',i);climber(host,'right',i)}});
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

fetch(ART+'rigs.json').then(r=>r.ok?r.json():null).catch(()=>null).then(data=>{
 RIGS=data;header();footer();modal();sync();petals();
});
})();
