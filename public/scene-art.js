/* Layered celebration art. No per-frame JS rendering or motion permission needed. */
(()=>{'use strict';
const config={
 rose:{kind:'birthday',image:'birthday-clean',poster:'birthday-palace',variant:'rose'},
 lilac:{kind:'sky',src:'/assets/backgrounds/day-palace.webp',variant:'lilac'},
 gold:{kind:'surprise',src:'/assets/backgrounds/celebration-palace.webp',variant:'gold'},
 peach:{kind:'candy',src:'/assets/backgrounds/day-studio.webp',variant:'peach'},
 midnight:{kind:'midnight',image:'midnight-palace',poster:'midnight-palace',variant:'midnight'},
 ivory:{kind:'wedding',image:'wedding-clean',poster:'wedding-palace',variant:'ivory'},
 champagne:{kind:'wedding',image:'wedding-clean',poster:'wedding-palace',variant:'champagne'},
 garden:{kind:'garden',image:'garden-palace',poster:'garden-palace',variant:'garden'},
 velvet:{kind:'love',image:'love-letter',poster:'love-letter',variant:'love'},
 ocean:{kind:'achievement',image:'achievement-garden',poster:'achievement-garden',variant:'achievement'},
 noir:{kind:'gala',image:'gala-ballroom',poster:'gala-ballroom',variant:'gala'},
 blue:{kind:'celebration',image:'aqua-celebration',poster:'aqua-celebration',variant:'celebration'}
};
// Extra animated layers that give each world its own story.
const I=(n,c)=>window.TabrikIcons?TabrikIcons.svg(n,c):'';
const many=(n,f)=>Array.from({length:n},(_,i)=>f(i)).join('');
const worlds={
 // Shirin bayram: the cake, plus party poppers firing and hearts rising.
 birthday:()=>'<div class="world-layer world-party" aria-hidden="true">'+I('party','w-popper w-popper-left')+I('party','w-popper w-popper-right')+
  many(5,i=>'<span class="w-rise" style="--x:'+(12+i*19)+'%;--d:-'+(i*1.1)+'s;--t:'+(4.5+i%3)+'s">'+I(i%2?'heart':'balloon')+'</span>')+'</div>',
 // Bulutlar mamlakati: clouds drifting at three depths, balloons sailing up.
 sky:()=>'<div class="world-layer world-sky" aria-hidden="true"><i class="w-sun"></i>'+
  many(5,i=>'<img class="w-cloud" src="/assets/backgrounds/day-cloud.webp" alt="" style="--y:'+(8+i*15)+'%;--s:'+(.5+(i%3)*.25)+';--t:'+(26-i*3)+'s;--d:-'+(i*6)+'s">')+
  many(3,i=>'<img class="w-bouquet" src="/assets/scenes/balloon-bouquet.webp" alt="" style="--x:'+(10+i*32)+'%;--t:'+(11+i*2)+'s;--d:-'+(i*4)+'s">')+
  many(4,i=>'<span class="w-rise" style="--x:'+(6+i*26)+'%;--d:-'+(i*1.7)+'s;--t:'+(7+i%2*2)+'s">'+I('balloon')+'</span>')+'</div>',
 // Oltin syurpriz: a giant gift in turning golden rays bursts open.
 surprise:()=>'<div class="world-layer world-surprise" aria-hidden="true"><i class="w-rays"></i><i class="w-glow"></i>'+
  '<div class="w-big-gift">'+I('gift')+'</div>'+
  many(14,i=>'<i class="w-coin'+(i%3?'':' w-star')+'" style="--a:'+(i*360/14)+'deg;--r:'+(70+(i*29)%60)+'px;--d:'+(i%4*.06)+'s"></i>')+
  many(8,i=>'<i class="w-spark" style="--x:'+((i*41+9)%92)+'%;--y:'+((i*23+11)%70)+'%;--d:-'+(i*.4)+'s"></i>')+'</div>',
 // Konfetlar olami: bouncing cupcakes and lollipops, candy raining down.
 candy:()=>'<div class="world-layer world-candy" aria-hidden="true">'+
  '<span class="w-sweet s1">'+I('cupcake')+'</span><span class="w-sweet s2">'+I('lollipop')+'</span><span class="w-sweet s3">'+I('cupcake')+'</span><span class="w-sweet s4">'+I('lollipop')+'</span><span class="w-sweet s5">'+I('candy')+'</span>'+
  many(9,i=>'<span class="w-fall" style="--x:'+((i*37+5)%94)+'%;--d:-'+(i*.9)+'s;--t:'+(4+i%4)+'s;--r:'+(i%2?1:-1)*(180+i*40)+'deg">'+I(['candy','lollipop','cupcake'][i%3])+'</span>')+'</div>'
};
const flames={birthday:[[43.3,40.5,3.9],[50.4,38.4,4.6],[57.3,40.6,3.9]],midnight:[[40,39.5,3.9],[50,38.2,4.5],[60,39.5,3.9]]};
function layers(t,live){const c=config[t.id];if(!c)return null;const alt={sky:'Bulutlar va sharlar orasida uchayotgan bayram',surprise:'Oltin nurlar ichida ochilayotgan sirli sovg‘a',candy:'Kekslar, konfetlar va lolipoplar bilan shirin olam',love:'Atirgullar orasidagi samimiy maktub',achievement:'Bitiruv qalpog‘i va diplom bilan yutuqlar bog‘i',gala:'Yorqin chiroqli oltin gala sahnasi',celebration:'Moviy bog‘dagi sovg‘alar bilan bayram'}[c.kind]||(c.kind==='wedding'||c.kind==='garden'?'Gullar va uzuklar bilan bezatilgan to‘y sahnasi':'Tort va sovg‘alar bilan bezatilgan tug‘ilgan kun sahnasi');
 const bg=c.src||'/assets/scenes/'+c.image+'.webp';
 if(!live&&!c.src)return '<img class="scene-poster variant-'+c.variant+'" src="/assets/scenes/'+c.poster+'.webp" alt="'+alt+'" loading="lazy">';
 const fire=(flames[c.kind]||[]).map(([x,y,h],i)=>'<i class="candle-flame" style="--x:'+x+'%;--y:'+y+'%;--h:'+h+'%;--phase:-'+i*.23+'s"><b></b></i>').join('');
 const balloons=c.kind==='birthday'?'<div class="balloon-anchor balloon-left"><img src="/assets/scenes/balloon-bouquet.webp" alt="" loading="lazy" decoding="async" draggable="false"></div><div class="balloon-anchor balloon-right"><img src="/assets/scenes/balloon-bouquet.webp" alt="" loading="lazy" decoding="async" draggable="false"></div>':'';
 const rings=c.kind==='wedding'?'<div class="floating-rings"><img src="/assets/scenes/wedding-rings.webp" alt="" loading="lazy" decoding="async" draggable="false"></div>':'';
 const extras=(worlds[c.kind]?worlds[c.kind]():'')+(c.kind==='love'?'<div class="scene-hearts" aria-hidden="true"><i></i><i></i><i></i></div>':c.kind==='gala'?'<div class="scene-spotlights" aria-hidden="true"><i></i><i></i></div>':'');
 const motes=Array.from({length:18},(_,i)=>'<i class="scene-mote" style="--x:'+((i*37+7)%96)+'%;--y:'+((i*29+19)%94)+'%;--delay:-'+i*.7+'s;--duration:'+(6+i%5)+'s"></i>').join('');
 const orbit=Array.from({length:10},(_,i)=>'<i style="--angle:'+i*36+'deg;--ox:'+(50+48*Math.cos(i*Math.PI/5))+'%;--oy:'+(50+46*Math.sin(i*Math.PI/5))+'%;--delay:-'+i*.8+'s"></i>').join('');
 return '<div class="scene-art variant-'+c.variant+'" data-scene-art="'+c.kind+'" data-motion="running" role="img" aria-label="'+alt+'"><div class="motion-camera"><img class="scene-background" src="'+bg+'" alt="" loading="lazy" decoding="async" draggable="false">'+balloons+rings+extras+'<div class="scene-fire" aria-hidden="true">'+fire+'</div><div class="scene-orbit" aria-hidden="true">'+orbit+'</div><div class="scene-motes" aria-hidden="true">'+motes+'</div></div></div>';
}
window.TabrikSceneArt={config,layers};
const reduced={matches:false,addEventListener(){}};
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
