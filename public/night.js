/* TabrikUZ night mode. A navbar toggle switches html[data-theme]. At night a
   low-resolution canvas darkens the page and lets light through only where
   it falls: two lanterns fixed to the window, wandering fireflies, the moon
   in the hero and the pointer. One requestAnimationFrame loop drives it,
   and it stops whenever it is day, the tab is hidden or motion is reduced. */
(()=>{'use strict';
const root=document.documentElement,KEY='tabrikuz-theme';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(pointer: coarse)').matches,lite=root.classList.contains('lite');
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

// Clear separate sprites and soft additive halos; never put a dark canvas over forms.
const layer=document.createElement('div');layer.className='night-layer night-layer-v2';layer.setAttribute('aria-hidden','true');
layer.innerHTML='<div class="night-orbit-moon"><i></i><img src="/assets/ornaments/moon-crisp.webp" alt=""></div>'+Array.from({length:3},(_,i)=>'<img class="night-clear-cloud" src="/assets/backgrounds/day-cloud.webp" alt="" style="--cloud:'+i+';--d:-'+i*11+'s">').join('')+Array.from({length:coarse?5:9},(_,i)=>'<div class="night-firefly-node" style="--x:'+((i*31+7)%93)+'%;--y:'+(20+(i*23)%68)+'%;--d:-'+i*1.9+'s;--t:'+(14+i%4*3)+'s"><i class="firefly-lightspill"></i><img src="/assets/ornaments/firefly-premium.webp" alt=""></div>').join('');document.body.append(layer);
function apply(next,save){theme=next;root.dataset.theme=next;const night=next==='night';toggle.setAttribute('aria-pressed',String(night));toggle.setAttribute('aria-label',night?'Kunduzgi rejimga o‘tish':'Tungi rejimga o‘tish');toggle.querySelector('.tt-label').textContent=night?'Tun':'Kun';document.querySelector('meta[name=theme-color]')?.setAttribute('content',night?'#0b1930':'#fcf9f5');if(save)try{localStorage.setItem(KEY,next)}catch{}}
toggle.addEventListener('click',()=>apply(theme==='night'?'day':'night',true));document.addEventListener('visibilitychange',()=>layer.classList.toggle('night-paused',document.hidden));apply(theme,false);
})();
