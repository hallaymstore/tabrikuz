import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const manifest=JSON.parse(await readFile(new URL('../assets-manifest.json',import.meta.url),'utf8'));
const dir=new URL('../public/assets/lottie/',import.meta.url);
await mkdir(dir,{recursive:true});
let loaded=0;
for(const [name,asset] of Object.entries(manifest)){
 try{
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),12000);
   let response;
   try{response=await fetch(asset.url,{signal:controller.signal,headers:{'User-Agent':'TabrikUZ-Asset-Installer/1.0'}})}finally{clearTimeout(timeout)}
   if(!response.ok)throw Error('HTTP '+response.status);
   const body=Buffer.from(await response.arrayBuffer());
   if(body.length<200||body.length>3*1024*1024||body.toString('ascii',0,2)!=='PK')throw Error('Invalid dotLottie archive');
   await writeFile(new URL(name+'.lottie',dir),body);
   loaded++;
   console.log('Installed animation '+name+' ('+body.length+' bytes)');
 }catch(e){console.warn('Animation '+name+' unavailable, CDN fallback remains configured: '+e.message)}
}
console.log('Animation assets installed: '+loaded+'/'+Object.keys(manifest).length);
