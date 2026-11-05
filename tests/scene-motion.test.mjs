import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../public/scene-art.js',import.meta.url),'utf8');
function boot(reduced=false){
 const listeners={},nodes=[],observed=new Set(),unobserved=[];let mutation,intersection;
 const document={body:{},addEventListener:(name,fn)=>listeners[name]=fn,querySelectorAll:()=>nodes};
 const context={window:{},document,matchMedia:()=>({matches:reduced,addEventListener(){}}),requestAnimationFrame:fn=>{fn();return 1},IntersectionObserver:class{constructor(fn){intersection=fn}observe(el){observed.add(el)}unobserve(el){unobserved.push(el)}},MutationObserver:class{constructor(fn){mutation=fn}observe(){}}};
 vm.runInNewContext(source,context);
 return {api:context.window.TabrikSceneArt,listeners,nodes,observed,unobserved,mutate:()=>mutation(),intersect:entries=>intersection(entries)};
}
function fakeArt(){const classes=new Set(),styles={};return {dataset:{motion:'running'},style:{setProperty:(k,v)=>styles[k]=v},styles,isConnected:true,classList:{toggle:(k,value)=>{const yes=value??!classes.has(k);yes?classes.add(k):classes.delete(k);return yes},contains:k=>classes.has(k)}}}
test('Live birthday uses separate flame and balloon layers; gallery stays a light poster',()=>{
 const {api}=boot();const live=api.layers({id:'rose'},true),poster=api.layers({id:'rose'},false);
 assert.match(live,/birthday-clean.webp/);assert.equal((live.match(/class="candle-flame"/g)||[]).length,3);assert.equal((live.match(/balloon-bouquet.webp/g)||[]).length,2);
 assert.match(poster,/birthday-palace.webp/);assert.doesNotMatch(poster,/candle-flame|scene-mote/);assert.equal(api.layers({id:'unknown'},true),null);
 assert.match(api.layers({id:'ivory'},true),/wedding-rings.webp/);assert.match(api.layers({id:'midnight'},true),/midnight-palace.webp/);assert.match(api.layers({id:'garden'},true),/garden-palace.webp/);
});
test('Pause and candle controls change only their own scene',()=>{
 const {listeners}=boot();const art=fakeArt(),other=fakeArt(),status={textContent:''},button={setAttribute(k,v){this[k]=v}};
 const scene={querySelector:q=>q==='[data-scene-status]'?status:art};
 const event=kind=>({target:{closest:q=>q==='[data-birthday-scene]'?scene:q===kind?button:null}});
 listeners.click(event('[data-motion-toggle]'));assert.equal(art.dataset.motion,'paused');assert.equal(button['aria-pressed'],'false');assert.equal(other.dataset.motion,'running');
 listeners.click(event('[data-motion-toggle]'));assert.equal(art.dataset.motion,'running');assert.equal(button['aria-pressed'],'true');
 listeners.click(event('[data-candle-toggle]'));assert.equal(art.classList.contains('candles-out'),true);assert.match(status.textContent,/o‘chirildi/);
 listeners.click(event('[data-candle-toggle]'));assert.equal(art.classList.contains('candles-out'),false);assert.match(status.textContent,/yondi/);
});
test('Reduced motion, offscreen pause and observer cleanup work after redraw',()=>{
 const env=boot(true),art=fakeArt();env.nodes.push(art);env.mutate();assert.equal(art.dataset.motion,'paused');assert.ok(env.observed.has(art));
 env.intersect([{target:art,isIntersecting:false}]);assert.ok(art.classList.contains('motion-offscreen'));
 env.intersect([{target:art,isIntersecting:true}]);assert.equal(art.classList.contains('motion-offscreen'),false);
 art.isConnected=false;env.nodes.length=0;env.mutate();assert.deepEqual(env.unobserved,[art]);
});
test('All twelve catalog designs have live scene artwork, including love and event designs',()=>{
 const {api}=boot();const ids=['rose','lilac','gold','midnight','ivory','garden','velvet','ocean','noir','peach','blue','champagne'];
 for(const id of ids){const html=api.layers({id},true);assert.ok(html,id+' needs live artwork');assert.match(html,/data-scene-art=/);assert.doesNotMatch(html,/dotlottie/)}
 assert.match(api.layers({id:'velvet'},true),/scene-hearts/);assert.match(api.layers({id:'noir'},true),/scene-spotlights/);
});
