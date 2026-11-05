/* Layered celebration art. No per-frame JS rendering or motion permission needed. */
(()=>{'use strict';
const config={
 rose:{kind:'birthday',image:'birthday-clean',poster:'birthday-palace',variant:'rose'},
 lilac:{kind:'birthday',image:'birthday-clean',poster:'birthday-palace',variant:'lilac'},
 gold:{kind:'birthday',image:'birthday-clean',poster:'birthday-palace',variant:'gold'},
 peach:{kind:'birthday',image:'birthday-clean',poster:'birthday-palace',variant:'peach'},
 midnight:{kind:'midnight',image:'midnight-palace',poster:'midnight-palace',variant:'midnight'},
 ivory:{kind:'wedding',image:'wedding-clean',poster:'wedding-palace',variant:'ivory'},
 champagne:{kind:'wedding',image:'wedding-clean',poster:'wedding-palace',variant:'champagne'},
 garden:{kind:'garden',image:'garden-palace',poster:'garden-palace',variant:'garden'},
 velvet:{kind:'love',image:'love-letter',poster:'love-letter',variant:'love'},
 ocean:{kind:'achievement',image:'achievement-garden',poster:'achievement-garden',variant:'achievement'},
 noir:{kind:'gala',image:'gala-ballroom',poster:'gala-ballroom',variant:'gala'},
 blue:{kind:'celebration',image:'aqua-celebration',poster:'aqua-celebration',variant:'celebration'}
};
const flames={birthday:[[43.3,40.5,3.9],[50.4,38.4,4.6],[57.3,40.6,3.9]],midnight:[[40,39.5,3.9],[50,38.2,4.5],[60,39.5,3.9]]};
function layers(t,live){const c=config[t.id];if(!c)return null;const alt={love:'Atirgullar orasidagi samimiy maktub',achievement:'Bitiruv qalpog‘i va diplom bilan yutuqlar bog‘i',gala:'Yorqin chiroqli oltin gala sahnasi',celebration:'Moviy bog‘dagi sovg‘alar bilan bayram'}[c.kind]||(c.kind==='wedding'||c.kind==='garden'?'Gullar va uzuklar bilan bezatilgan to‘y sahnasi':'Tort va sovg‘alar bilan bezatilgan tug‘ilgan kun sahnasi');
 if(!live)return '<img class="scene-poster variant-'+c.variant+'" src="/assets/scenes/'+c.poster+'.webp" alt="'+alt+'" loading="lazy">';
 const fire=(flames[c.kind]||[]).map(([x,y,h],i)=>'<i class="candle-flame" style="--x:'+x+'%;--y:'+y+'%;--h:'+h+'%;--phase:-'+i*.23+'s"><b></b></i>').join('');
 const balloons=c.kind==='birthday'?'<div class="balloon-anchor balloon-left"><img src="/assets/scenes/balloon-bouquet.webp" alt="" loading="lazy" decoding="async" draggable="false"></div><div class="balloon-anchor balloon-right"><img src="/assets/scenes/balloon-bouquet.webp" alt="" loading="lazy" decoding="async" draggable="false"></div>':'';
 const rings=c.kind==='wedding'?'<div class="floating-rings"><img src="/assets/scenes/wedding-rings.webp" alt="" loading="lazy" decoding="async" draggable="false"></div>':'';
 const extras=c.kind==='love'?'<div class="scene-hearts" aria-hidden="true"><i></i><i></i><i></i></div>':c.kind==='gala'?'<div class="scene-spotlights" aria-hidden="true"><i></i><i></i></div>':'';
 const motes=Array.from({length:18},(_,i)=>'<i class="scene-mote" style="--x:'+((i*37+7)%96)+'%;--y:'+((i*29+19)%94)+'%;--delay:-'+i*.7+'s;--duration:'+(6+i%5)+'s"></i>').join('');
 const orbit=Array.from({length:10},(_,i)=>'<i style="--angle:'+i*36+'deg;--ox:'+(50+48*Math.cos(i*Math.PI/5))+'%;--oy:'+(50+46*Math.sin(i*Math.PI/5))+'%;--delay:-'+i*.8+'s"></i>').join('');
 return '<div class="scene-art variant-'+c.variant+'" data-scene-art="'+c.kind+'" data-motion="running" role="img" aria-label="'+alt+'"><div class="motion-camera"><img class="scene-background" src="/assets/scenes/'+c.image+'.webp" alt="" loading="lazy" decoding="async" draggable="false">'+balloons+rings+extras+'<div class="scene-fire" aria-hidden="true">'+fire+'</div><div class="scene-orbit" aria-hidden="true">'+orbit+'</div><div class="scene-motes" aria-hidden="true">'+motes+'</div></div></div>';
}
window.TabrikSceneArt={config,layers};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let pending=false;const observed=new Set();
const visibility=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>target.classList.toggle('motion-offscreen',!isIntersecting)),{threshold:.01});
function sync(){pending=false;for(const el of observed)if(!el.isConnected){visibility.unobserve(el);observed.delete(el)}document.querySelectorAll('[data-scene-art]').forEach(el=>{if(observed.has(el))return;observed.add(el);visibility.observe(el);el.dataset.motion=reduced.matches?'paused':'running'});}
new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(sync)}).observe(document.body,{childList:true,subtree:true});
reduced.addEventListener('change',()=>{observed.forEach(el=>el.dataset.motion=reduced.matches?'paused':'running');document.querySelectorAll('[data-motion-toggle]').forEach(b=>{b.disabled=reduced.matches;b.setAttribute('aria-pressed',String(!reduced.matches));b.textContent=reduced.matches?'▷':'Ⅱ'})});
let frame=0,last=null;document.addEventListener('pointermove',e=>{if(reduced.matches)return;const scene=e.target.closest('[data-birthday-scene]');if(!scene)return;const art=scene.querySelector('[data-scene-art]');if(!art||art.dataset.motion==='paused')return;last={art,x:e.clientX,y:e.clientY,rect:scene.getBoundingClientRect()};if(frame)return;frame=requestAnimationFrame(()=>{frame=0;if(!last||!last.art.isConnected)return;const {art,x,y,rect}=last;art.style.setProperty('--mx',Math.max(-8,Math.min(8,(x-rect.left)/rect.width*16-8))+'px');art.style.setProperty('--my',Math.max(-6,Math.min(6,(y-rect.top)/rect.height*12-6))+'px')})},{passive:true});
function reset(el){if(last?.art===el)last=null;el?.style.setProperty('--mx','0px');el?.style.setProperty('--my','0px')}
document.addEventListener('pointerout',e=>{const scene=e.target.closest('[data-birthday-scene]');if(scene&&!scene.contains(e.relatedTarget))reset(scene.querySelector('[data-scene-art]'))},{passive:true});
document.addEventListener('pointerup',e=>{if(e.pointerType==='touch')reset(e.target.closest('[data-birthday-scene]')?.querySelector('[data-scene-art]'))},{passive:true});
document.addEventListener('click',e=>{const candle=e.target.closest('[data-candle-toggle]'),toggle=e.target.closest('[data-motion-toggle]');if(!candle&&!toggle)return;const scene=e.target.closest('[data-birthday-scene]'),art=scene?.querySelector('[data-scene-art]');if(!art)return;if(candle){const out=art.classList.toggle('candles-out');candle.setAttribute('aria-pressed',String(out));candle.textContent=out?'Shamlarni yoqish':'Shamlarni o‘chirish';scene.querySelector('[data-scene-status]').textContent=out?'Tilak tilang! Shamlar o‘chirildi.':'Shamlar yana yondi.';return}const playing=art.dataset.motion==='paused';art.dataset.motion=playing?'running':'paused';toggle.setAttribute('aria-pressed',String(playing));toggle.textContent=playing?'Ⅱ':'▷';reset(art)});
document.addEventListener('visibilitychange',()=>observed.forEach(el=>el.classList.toggle('motion-document-hidden',document.hidden)));
sync();
})();
