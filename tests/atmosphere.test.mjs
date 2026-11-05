import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/atmosphere.js',import.meta.url),'utf8');
function boot({reduced=false,saved=null}={}){
 const events={},attrs={},span={},values={},button={setAttribute:(k,v)=>attrs[k]=v,querySelector:()=>span,addEventListener:(name,fn)=>events[name]=fn},root={dataset:{},style:{setProperty:(k,v)=>values[k]=v},classList:{toggle(){}}};
 const context={document:{documentElement:root,body:{},getElementById:id=>id==='atmosphereToggle'?button:{append(){}},createElement:()=>({style:{},append(){},setAttribute(){}}),addEventListener(){},querySelectorAll:()=>[]},localStorage:{getItem:()=>saved,setItem:(k,v)=>{saved=v}},matchMedia:()=>({matches:reduced,addEventListener(){}}),MutationObserver:class{observe(){}},IntersectionObserver:class{observe(){}unobserve(){}},requestAnimationFrame:fn=>{fn();return 1}};
 vm.runInNewContext(source,context);return {root,button,attrs,span,events,saved:()=>saved};
}
test('Atmosphere pause persists and restores without affecting greeting scenes',()=>{
 const env=boot();assert.equal(env.root.dataset.ambientMotion,'running');env.events.click();assert.equal(env.root.dataset.ambientMotion,'paused');assert.equal(env.attrs['aria-pressed'],'false');assert.equal(env.saved(),'paused');assert.equal(env.span.textContent,'Sokin fon');
 const restored=boot({saved:env.saved()});assert.equal(restored.root.dataset.ambientMotion,'paused');restored.events.click();assert.equal(restored.root.dataset.ambientMotion,'running');
});
test('The site toggle, not the system reduce-motion setting, controls motion',()=>{
 const env=boot({saved:'running',reduced:true});assert.equal(env.root.dataset.ambientMotion,'running');assert.equal(env.button.disabled,false);assert.equal(env.attrs['aria-pressed'],'true');
 env.events.click();assert.equal(env.root.dataset.ambientMotion,'paused');assert.equal(env.saved(),'paused');
});
