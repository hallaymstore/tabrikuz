import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

const port=34000+Math.floor(Math.random()*2000);
const base='http://127.0.0.1:'+port;
const child=spawn(process.execPath,['server.js'],{
 env:{...process.env,PORT:String(port),MONGODB_URI:'',JWT_SECRET:'test-only-secret-abcdefghijklmnopqrstuvwxyz-0123456789',ADMIN_EMAIL:'admin@example.com',ADMIN_BOOTSTRAP_KEY:'test-bootstrapping-key-abcdefghijklmnopqrstuvwxyz'},
 stdio:['ignore','pipe','pipe']
});
let output='';
child.stdout.on('data',d=>output+=String(d));
child.stderr.on('data',d=>output+=String(d));
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(){
 for(let i=0;i<60;i++){
  if(child.exitCode!==null)throw Error('Server exited: '+output);
  try{const r=await fetch(base+'/api/health');if(r.ok)return;}catch{}
  await pause(200);
 }
 throw Error('Health endpoint did not respond: '+output);
}
async function call(url,method='GET',body,token){
 const response=await fetch(base+url,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
 return {status:response.status,body:await response.json().catch(()=>({}))};
}
test('TabrikUZ API and frontend smoke test',async()=>{
 try{
 await ready();
 let home=await fetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/game.js/);
 const assets=await fetch(base+'/game.js');assert.equal(assets.status,200);
 const health=await call('/api/health');assert.equal(health.body.ok,true);
 let templates=await call('/api/templates');assert.equal(templates.status,200);assert.ok(templates.body.length>=12);
 const reg=await call('/api/auth/register','POST',{name:'Sample User',email:'admin@example.com',password:'securetestpass123'});assert.equal(reg.status,201);
 assert.equal(reg.body.user.role,'user','An email address alone must never grant admin');
 assert.equal(reg.body.user.plan,'free');
 const token=reg.body.token;
 let forbidden=await call('/api/admin/users','GET',null,token);assert.equal(forbidden.status,403);
 const premium=await call('/api/invites','POST',{type:'birthday',templateId:'gold',recipient:'Pro'},token);assert.equal(premium.status,403);
 const invite=await call('/api/invites','POST',{type:'birthday',templateId:'rose',recipient:'Birthday Guest',sender:'Friend',message:'Have a wonderful birthday!',sceneEffect:'petals',introEnabled:false},token);
 assert.equal(invite.status,201);assert.ok(invite.body.slug);
 const slug=encodeURIComponent(invite.body.slug);
 const publicInvite=await call('/api/invites/'+slug);assert.equal(publicInvite.status,200);assert.equal(publicInvite.body.introEnabled,false);assert.equal(publicInvite.body.sceneEffect,'petals');
 const wish=await call('/api/invites/'+slug+'/wishes','POST',{name:'Guest',message:'Best wishes!'});assert.equal(wish.status,201);
 const rsvp=await call('/api/invites/'+slug+'/rsvp','POST',{name:'Guest',attending:true});assert.equal(rsvp.status,201);
 const mine=await call('/api/invites/mine','GET',null,token);assert.equal(mine.status,200);assert.equal(mine.body.length,1);
 }finally{child.kill('SIGTERM');}
});
