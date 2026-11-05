import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';import {randomUUID,createHash} from 'node:crypto';import {mountCommerce,incomingTransactions} from '../commerce.mjs';

test('Transactions require a real identity, exact amount and timestamp',()=>{assert.equal(incomingTransactions([{id:'1',amount:5}]).length,0);assert.equal(incomingTransactions([{id:'1',amount:5,date:new Date().toISOString(),type:'out'}]).length,0);assert.equal(incomingTransactions([{id:'1',amount:5,date:new Date().toISOString()}]).length,1)});

test('Orders keep price snapshots; payment is verified once; photos and work are private',async()=>{
 const memory=Object.fromEntries(['orders','invoices','assets','commerceSettings','templateOverrides','users','invites','auditLogs'].map(k=>[k,[]]));
 const users={owner:{_id:'owner',role:'user'},other:{_id:'other',role:'user'},staff:{_id:'staff',role:'celebrant'},admin:{_id:'admin',role:'admin'}};
 const all=async(n,f={})=>memory[n].filter(o=>Object.entries(f).every(([k,v])=>o[k]===v));const one=async(n,f)=>(await all(n,f))[0];const insert=async(n,o)=>{const doc={...o,_id:randomUUID()};memory[n].push(doc);return doc};const update=async(n,f,v)=>{const doc=await one(n,f);if(doc)Object.assign(doc,v);return {modifiedCount:doc?1:0}};const id=o=>String(o?._id||''),view=o=>{const {_id,...rest}=o;return {...rest,id:_id}};
 let transactions=[],lastInvoice,statusDoc={};process.env.HAMYON_SHOP_ID='test-shop';process.env.HAMYON_SHOP_KEY='test-key-not-a-production-secret';const app=express();app.use(express.json());const auth=(req,res,next)=>{req.user=users[req.headers.authorization?.replace('Bearer ','')];return req.user?next():res.status(401).json({error:'login'})};const admin=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({error:'admin'});
 await mountCommerce({app,db:null,memory,all,one,insert,update,id,view,key:x=>x,clean:(s,n=160)=>String(s??'').trim().slice(0,n),auth,requireAdmin:admin,templates:[{id:'royal',category:'birthday'},{id:'sketch-test',category:'birthday'}],parseInvite:d=>({...d,type:'birthday'}),paymentProvider:{createPayment:async inv=>{lastInvoice=inv;return {payment_id:'pid-'+id(inv),payment_url:'https://pay.example/checkout/'+id(inv)}},listIncoming:async()=>transactions,getStatus:async()=>statusDoc}});
 app.use((err,req,res,next)=>res.status(500).json({error:err.message}));const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 async function api(path,method='GET',body,as='owner',extra={}){const raw=Buffer.isBuffer(body);const res=await fetch(base+path,{method,headers:{Authorization:'Bearer '+as,...(body?{'Content-Type':raw?'application/octet-stream':'application/json'}:{}),...extra},body:body?(raw?body:JSON.stringify(body)):undefined});return {status:res.status,body:await res.json()}}
 const form={service:'audio',region:'uz',recipient:'Aziza',sender:'Ali',age:30,birthday:'1996-01-01',phone:'+998901234567',relationship:'singlisi',address:'Qarshi',familyStatus:'Oilali',addressing:'siz',callDate:'2026-12-01',callTime:'14:00',consent:true};
 try{
 const config=await api('/api/commerce/config');assert.equal(config.body.audioUz,55000);assert.ok(!('audioUzCost' in config.body));
 assert.equal((await api('/api/admin/commerce','PUT',{audioUz:60000})).status,403);
 const first=await api('/api/orders','POST',form);assert.equal(first.status,201);const orderId=first.body.id;assert.equal(first.body.amount,55000);assert.ok(!('providerCost' in first.body));
 assert.equal((await api('/api/orders/'+orderId,'GET',null,'other')).status,404);
 assert.equal((await api('/api/orders/'+orderId,'GET',null,'staff')).status,404);
 assert.equal((await api('/api/staff/orders/'+orderId,'PATCH',{status:'in_progress'},'staff')).status,409);
 assert.equal((await api('/api/admin/commerce','PUT',{audioUz:60000,videoMinPhotos:29},'admin')).status,400);
 assert.equal((await api('/api/admin/commerce','PUT',{audioUz:60000},'admin')).status,200);
 assert.equal((await api('/api/orders','POST',form)).body.amount,60000);assert.equal((await api('/api/orders/'+orderId)).body.amount,55000);
 const checkout=await api('/api/orders/'+orderId+'/checkout','POST',{});assert.equal(checkout.status,200);assert.ok(checkout.body.amount>55000&&checkout.body.amount<56000);
 const duplicate=await api('/api/orders/'+orderId+'/checkout','POST',{});assert.equal(duplicate.body.id,checkout.body.id);
 // A forged callback never unlocks an order.
 assert.equal((await api('/api/payments/hamyon/webhook','POST',{status:'paid',amount:lastInvoice.amount})).status,403);
 transactions=[{id:'wrong',amount:lastInvoice.amount+1,date:lastInvoice.createdAt}];assert.equal((await api('/api/orders/'+orderId+'/check-payment','POST',{})).body.paymentStatus,'pending');
 transactions=[{id:'real-1',amount:lastInvoice.amount,date:lastInvoice.createdAt}];assert.equal((await api('/api/orders/'+orderId+'/check-payment','POST',{})).body.paymentStatus,'paid');
 assert.equal((await api('/api/orders/'+orderId+'/check-payment','POST',{})).body.status,'paid');assert.equal(memory.invoices.filter(i=>i.transactionId==='hamyon:real-1').length,1);
 assert.equal((await api('/api/staff/orders/'+orderId,'PATCH',{status:'in_progress'},'staff')).status,200);
 assert.equal((await api('/api/staff/orders/'+orderId,'PATCH',{status:'completed'},'staff')).status,200);assert.match((await api('/api/orders/'+orderId)).body.orderNumber,/^TB-/);
 const video=await api('/api/orders','POST',{...form,service:'video'});assert.equal((await api('/api/orders/'+video.body.id+'/checkout','POST',{})).status,400);
 assert.equal((await api('/api/orders/'+video.body.id+'/files','POST',Buffer.from('this is not an image'))).status,400);
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(20)]);assert.equal((await api('/api/orders/'+video.body.id+'/files','POST',png)).status,201);
 const premium=await api('/api/invites','POST',{templateId:'royal',recipient:'Bir inson'});assert.equal(premium.body.requiresPayment,true);assert.equal(memory.invites.find(i=>i._id===premium.body.id).paymentStatus,'pending');
 const free=await api('/api/invites','POST',{templateId:'sketch-test',recipient:'Boshqa inson'});assert.equal(free.body.requiresPayment,false);
 const memoryPath='/api/invites/'+free.body.id+'/memories';assert.equal((await api(memoryPath,'POST',png)).status,400);const memoryPhoto=await api(memoryPath,'POST',png,'owner',{'X-Share-Consent':'yes'});assert.equal(memoryPhoto.status,201);assert.equal((await api(memoryPath,'GET',null,'other')).status,404);assert.equal((await fetch(base+'/api/invite-memories/'+free.body.slug+'/'+memoryPhoto.body.id)).status,200);assert.equal((await api(memoryPath,'POST',png,'owner',{'X-Share-Consent':'yes'})).status,409);
 const pendingMemory=await api('/api/invites/'+premium.body.id+'/memories','POST',png,'owner',{'X-Share-Consent':'yes'});assert.equal(pendingMemory.status,201);assert.equal((await fetch(base+'/api/invite-memories/'+premium.body.slug+'/'+pendingMemory.body.id)).status,404);
 const second=await api('/api/orders','POST',form);await api('/api/orders/'+second.body.id+'/checkout','POST',{});const inv=lastInvoice,pid=inv.providerPaymentId;const body={shop_id:'test-shop',payment_id:pid,amount:String(inv.amount),order_id:id(inv),status:'paid'};body.sign=createHash('md5').update(body.shop_id+pid+body.amount+process.env.HAMYON_SHOP_KEY).digest('hex');
 assert.equal((await api('/api/hamyon/prepare','POST',{...body,sign:'0'.repeat(32)})).status,403);assert.equal((await api('/api/hamyon/prepare','POST',body)).status,200);
 statusDoc={payment_id:pid,order_id:id(inv),shop_id:'test-shop',amount:inv.amount,status:'pending'};assert.equal((await api('/api/hamyon/complete','POST',body)).status,200);assert.equal((await api('/api/orders/'+second.body.id)).body.paymentStatus,'pending');statusDoc.status='paid';assert.equal((await api('/api/hamyon/complete','POST',body)).status,200);assert.equal((await api('/api/orders/'+second.body.id)).body.paymentStatus,'paid');assert.equal((await api('/api/hamyon/complete','POST',body)).status,200);

 }finally{await new Promise(r=>server.close(r))}
});
