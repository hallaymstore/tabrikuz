/* TabrikUZ Studio V2 experience layer — responsive game-stage UI */
(()=>{'use strict';
const app=document.getElementById('app');
const motionReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let queued=false;
const colors=['#ffb1d8','#ffe89a','#9feaf4','#d3aeff','#fff'];
function shower(stage){
 if(motionReduced)return;
 const rect=stage.getBoundingClientRect();
 for(let i=0;i<55;i++){
  const s=document.createElement('span');
  s.style.cssText='position:fixed;pointer-events:none;z-index:400;width:9px;height:15px;border-radius:3px;background:'+colors[i%5]+';left:'+(rect.left+Math.random()*rect.width)+'px;top:'+(rect.top+Math.random()*rect.height*.5)+'px;';
  const move=s.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:'translate('+(Math.random()*350-175)+'px,'+(200+Math.random()*550)+'px) rotate('+(Math.random()*900)+'deg)',opacity:0}],{duration:1300+Math.random()*1600,easing:'cubic-bezier(.2,.6,.4,1)'});
  document.body.append(s);move.onfinish=()=>s.remove();
 }
}
function studio(){
 const path=location.pathname;
 const enabled=path==='/create'||path.startsWith('/edit/');
 document.body.classList.toggle('studio-v2',enabled);
 if(!enabled)return;
 const stage=document.getElementById('livePreview');
 if(!stage||stage.dataset.stageVersion)return;
 stage.dataset.stageVersion='2';
 const hud=document.createElement('div');
 hud.className='stage-hud';
 hud.innerHTML='<div class="hud-top"><span class="hud-label"><span></span> LIVE PREVIEW</span><span class="hud-label">✦ CELEBRATION STUDIO</span></div>';
 stage.append(hud);
 const stars=document.createElement('div');stars.className='stage-stars';
 for(let i=0;i<27;i++){
  const el=document.createElement('i');
  el.style.left=(4+(i*41)%91)+'%';el.style.top=(5+(i*37)%87)+'%';
  el.style.setProperty('--t',(1.8+i%5*.6)+'s');
  el.style.animationDelay=-(i*.37)+'s';stars.append(el);
 }
 stage.prepend(stars);
 for(const [name,text] of [['one',''],['two',''],['three','']]){
  const el=document.createElement('div');el.className='stage-flare '+name;stage.append(el);
 }
 const actions=document.createElement('div');actions.className='stage-actions';
 actions.innerHTML='<button type="button" id="stageConfetti">✦ Bayram effekti</button><button type="button" id="stageFullscreen">⛶ Katta ekranda ko‘rish</button>';
 stage.append(actions);
 actions.querySelector('#stageConfetti').addEventListener('click',()=>shower(stage));
 actions.querySelector('#stageFullscreen').addEventListener('click',()=>{
  const full=stage.classList.toggle('stage-fullscreen');
  actions.querySelector('#stageFullscreen').textContent=full?'✕ Oynani yopish':'⛶ Katta ekranda ko‘rish';
  document.body.style.overflow=full?'hidden':'';
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&stage.classList.contains('stage-fullscreen')){
   stage.classList.remove('stage-fullscreen');document.body.style.overflow='';
  }
 },{once:false});
}
const obs=new MutationObserver(()=>{
 if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;studio()});
});
if(app)obs.observe(app,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',studio);else studio();
})();
