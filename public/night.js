/* TabrikUZ night mode. A navbar toggle switches html[data-theme]. At night a
   low-resolution canvas darkens the page and lets light through only where
   it falls: two lanterns fixed to the window, wandering fireflies, the moon
   in the hero and the pointer. One requestAnimationFrame loop drives it,
   and it stops whenever it is day, the tab is hidden or motion is reduced. */
(()=>{'use strict';
const root=document.documentElement,KEY='tabrikuz-theme';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer: coarse)').matches;
let theme='day';try{theme=localStorage.getItem(KEY)==='night'?'night':'day'}catch{}

// ---- Toggle in the navbar: animated sun / moon.
const toggle=document.createElement('button');
toggle.type='button';toggle.className='theme-toggle';
toggle.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true"><g class="tt-sun"><circle cx="24" cy="24" r="9" fill="url(#ttSun)"/><g class="tt-rays" stroke="#f6b73c" stroke-width="3" stroke-linecap="round">'+
 Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return '<line x1="'+(24+Math.cos(a)*14).toFixed(1)+'" y1="'+(24+Math.sin(a)*14).toFixed(1)+'" x2="'+(24+Math.cos(a)*19).toFixed(1)+'" y2="'+(24+Math.sin(a)*19).toFixed(1)+'"/>'}).join('')+
 '</g></g><g class="tt-moon"><path d="M30 8a16 16 0 1 0 10 28A13 13 0 0 1 30 8Z" fill="url(#ttMoon)"/><circle cx="22" cy="27" r="2.2" fill="#c9c3ea"/><circle cx="17" cy="20" r="1.4" fill="#c9c3ea"/>'+
 '<path class="tt-star" d="M38 10l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="#fff6d0"/><path class="tt-star s2" d="M42 24l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" fill="#fff"/></g>'+
 '<defs><radialGradient id="ttSun" cx=".4" cy=".35"><stop offset="0" stop-color="#fff6c8"/><stop offset=".6" stop-color="#ffcf4d"/><stop offset="1" stop-color="#f29a2e"/></radialGradient>'+
 '<radialGradient id="ttMoon" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e9e4ff"/><stop offset="1" stop-color="#b9b0e6"/></radialGradient></defs></svg><span class="tt-label"></span>';
const actions=document.querySelector('.header-actions');
if(actions)actions.prepend(toggle);

// ---- Lanterns fixed to the window, fireflies, the dark veil.
const lanterns=['left','right'].map(side=>{
 const el=document.createElement('div');el.className='night-lantern night-lantern--'+side;el.setAttribute('aria-hidden','true');
 el.innerHTML='<img src="/assets/backgrounds/day-lantern.webp" alt="" decoding="async"><i class="night-lantern-glow"></i>';
 return el;
});
const veil=document.createElement('canvas');veil.className='night-veil';veil.setAttribute('aria-hidden','true');
const ctx=veil.getContext('2d');
const flyCount=coarse?5:9;
const flies=Array.from({length:flyCount},(_,i)=>{
 const el=document.createElement('img');el.className='firefly';el.src='/assets/ornaments/firefly.webp';el.alt='';el.decoding='async';
 return {el,x:Math.random()*innerWidth,y:120+Math.random()*(innerHeight-160),a:Math.random()*6.28,s:.35+Math.random()*.55,
  r:(coarse?36:46)+Math.random()*(coarse?20:28),ph:Math.random()*6.28,f:1.2+Math.random()*1.6};
});
const layer=document.createElement('div');layer.className='night-layer';layer.setAttribute('aria-hidden','true');
layer.append(veil,...lanterns,...flies.map(f=>f.el));

// ---- Moon, stars and drifting wisps in the hero's sky.
function sky(){
 const hero=document.querySelector('.celebration-hero');
 if(!hero||hero.querySelector(':scope > .night-sky'))return;
 const s=document.createElement('div');s.className='night-sky';s.setAttribute('aria-hidden','true');
 s.innerHTML='<div class="night-stars">'+Array.from({length:26},(_,i)=>'<img src="/assets/ornaments/night-star.webp" alt="" style="--x:'+((i*37+11)%97)+'%;--y:'+((i*53+7)%62)+'%;--d:-'+(i*.37).toFixed(2)+'s;--s:'+(10+(i%4)*6)+'px">').join('')+'</div>'+
  '<div class="night-moon"><img class="moon-face" src="/assets/ornaments/night-moon.webp" alt="">'+
  Array.from({length:3},(_,i)=>'<img class="moon-wisp" src="/assets/ornaments/night-cloud.webp" alt="" style="--d:-'+(i*7)+'s;--t:'+(20+i*4)+'s;--y:'+(18+i*26)+'%">').join('')+'</div>';
 hero.prepend(s);
}

const pointer={x:-999,y:-999,on:0};
addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;pointer.on=1},{passive:true});
addEventListener('pointerdown',e=>{pointer.x=e.clientX;pointer.y=e.clientY;pointer.on=1},{passive:true});
document.addEventListener('pointerleave',()=>pointer.on=0);

let scale=coarse?.34:.5,raf=0,last=0;
function resize(){veil.width=Math.ceil(innerWidth*scale);veil.height=Math.ceil(innerHeight*scale)}
addEventListener('resize',resize,{passive:true});

function light(x,y,r,warm,strength=1){
 const k=scale,g=ctx.createRadialGradient(x*k,y*k,0,x*k,y*k,r*k);
 g.addColorStop(0,'rgba(0,0,0,'+strength+')');g.addColorStop(.5,'rgba(0,0,0,'+(strength*.82)+')');g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x*k,y*k,r*k,0,6.283);ctx.fill();
 warmth.push([x,y,r,warm,strength]);
}
let warmth=[];
function frame(t){
 raf=0;
 if(root.dataset.theme!=='night'||document.hidden)return;
 const now=t/1000,dt=Math.min(.05,(t-last)/1000||.016);last=t;
 const w=innerWidth,h=innerHeight;
 ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,veil.width,veil.height);
 ctx.fillStyle='rgba(5,12,40,0.8)';ctx.fillRect(0,0,veil.width,veil.height);
 ctx.globalCompositeOperation='destination-out';warmth=[];
 // Lanterns: the light sits on the glass, wherever the swing has carried it.
 for(const l of lanterns){const r=l.querySelector('img').getBoundingClientRect();if(r.width)light(r.left+r.width/2,r.top+r.height*.55,Math.max(250,Math.min(w,h)*.48),'255,196,110',1)}
 // The moon lights the sky around it while the hero is on screen.
 const moon=document.querySelector('.night-moon .moon-face');
 if(moon){const r=moon.getBoundingClientRect();if(r.bottom>0&&r.top<h)light(r.left+r.width/2,r.top+r.height/2,r.width*1.3,'170,205,255',.9)}
 // Fireflies wander on smooth curves and stay inside the window.
 for(const f of flies){
  if(!reduced.matches){
   f.a+=Math.sin(now*f.f+f.ph)*.03+(Math.random()-.5)*.08;
   f.x+=Math.cos(f.a)*f.s*60*dt;f.y+=Math.sin(f.a)*f.s*60*dt;
   if(f.x<30||f.x>w-30)f.a=Math.PI-f.a;if(f.y<100||f.y>h-30)f.a=-f.a;
   f.x=Math.max(30,Math.min(w-30,f.x));f.y=Math.max(100,Math.min(h-30,f.y));
  }
  const glow=.62+.38*Math.sin(now*f.f*2+f.ph);
  f.el.style.transform='translate('+f.x.toFixed(1)+'px,'+f.y.toFixed(1)+'px)';f.el.style.opacity=(.45+.55*glow).toFixed(2);
  light(f.x,f.y,f.r*(.8+.2*glow),'210,255,150',.7+.3*glow);
 }
 if(pointer.on)light(pointer.x,pointer.y,coarse?170:230,'255,226,170',.97);
 // A faint warm tint where each light falls.
 ctx.globalCompositeOperation='lighter';
 for(const [x,y,r,c,s] of warmth){const k=scale,g=ctx.createRadialGradient(x*k,y*k,0,x*k,y*k,r*k);g.addColorStop(0,'rgba('+c+','+(.10*s)+')');g.addColorStop(1,'rgba('+c+',0)');ctx.fillStyle=g;ctx.fillRect((x-r)*k,(y-r)*k,2*r*k,2*r*k)}
 if(!reduced.matches||pointer.on)raf=requestAnimationFrame(frame);
}
function start(){if(!raf&&root.dataset.theme==='night'&&!document.hidden)raf=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',start);
reduced.addEventListener('change',start);
addEventListener('pointermove',()=>{if(reduced.matches)start()},{passive:true});
addEventListener('scroll',()=>{if(reduced.matches)start()},{passive:true});

function apply(next,save){
 theme=next;root.dataset.theme=next;
 const night=next==='night';
 toggle.setAttribute('aria-pressed',String(night));
 toggle.setAttribute('aria-label',night?'Kunduzgi rejimga o‘tish':'Tungi rejimga o‘tish');
 toggle.querySelector('.tt-label').textContent=night?'Tun':'Kun';
 document.querySelector('meta[name=theme-color]')?.setAttribute('content',night?'#120d26':'#fcf9f5');
 if(save)try{localStorage.setItem(KEY,next)}catch{}
 if(night){if(!layer.isConnected){document.body.append(layer);resize()}sky();start()}
}
toggle.addEventListener('click',()=>{root.classList.add('theme-switching');apply(theme==='night'?'day':'night',true);setTimeout(()=>root.classList.remove('theme-switching'),700)});

// The hero is re-rendered on navigation; put the sky back when it returns.
const app=document.getElementById('app');
if(app)new MutationObserver(()=>{if(root.dataset.theme==='night')sky()}).observe(app,{childList:true});
apply(theme,false);
})();
