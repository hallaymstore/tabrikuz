import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app=express(), PORT=Number(process.env.PORT)||3000;
const JWT_SECRET=process.env.JWT_SECRET||'';
const DB_URL=process.env.MONGODB_URI||'';
const ADMIN_EMAIL=(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
const ADMIN_BOOTSTRAP_KEY=process.env.ADMIN_BOOTSTRAP_KEY||'';
const memory={users:[],invites:[],wishes:[],rsvps:[]};
let db=null;
if(DB_URL){try{const client=new MongoClient(DB_URL,{serverSelectionTimeoutMS:9000});await client.connect();db=client.db(process.env.MONGODB_DB||'tabrikuz');await Promise.all([db.collection('users').createIndex({email:1},{unique:true}),db.collection('invites').createIndex({slug:1},{unique:true}),db.collection('wishes').createIndex({inviteId:1}),db.collection('rsvps').createIndex({inviteId:1})]);console.log('MongoDB connected');}catch(e){console.error('MongoDB connection error:',e.message);process.exit(1);}}
if(!JWT_SECRET||JWT_SECRET.length<32){console.error('JWT_SECRET must be at least 32 characters');process.exit(1);}
const collection=(name)=>db?db.collection(name):null;
const id=(v)=>String(v?._id||v?.id||'');
async function all(name,filter={}){if(db)return collection(name).find(filter).toArray();return memory[name].filter(v=>Object.entries(filter).every(([k,val])=>v[k]===val));}
async function one(name,filter){if(db)return collection(name).findOne(filter);return (await all(name,filter))[0]||null;}
async function insert(name,obj){if(db){const result=await collection(name).insertOne(obj);return {...obj,_id:result.insertedId};}const v={...obj,_id:randomUUID()};memory[name].push(v);return v;}
async function update(name,filter,values){if(db)return collection(name).updateOne(filter,{$set:values});const obj=await one(name,filter);if(obj)Object.assign(obj,values);return {modifiedCount:obj?1:0};}
async function remove(name,filter){if(db)return collection(name).deleteOne(filter);const v=await one(name,filter);if(v)memory[name].splice(memory[name].indexOf(v),1);return {deletedCount:v?1:0};}
const key=(v)=>db?ObjectId.isValid(String(v))?new ObjectId(String(v)):null:String(v);
const clean=(x,n=160)=>String(x??'').trim().slice(0,n);
const safe=(v)=>String(v||'').replace(/[^\p{L}\p{N} -]/gu,'').trim().slice(0,70);
function view(o){if(!o)return null;const {_id,ownerId,...rest}=o;return {...rest,id:id(o),ownerId:ownerId?String(ownerId):undefined};}
function token(user){return jwt.sign({sub:id(user),email:user.email,role:user.role},JWT_SECRET,{expiresIn:'14d'});}
const auth=async(req,res,next)=>{try{const header=req.headers.authorization||'';const data=jwt.verify(header.replace(/^Bearer /,''),JWT_SECRET);const user=await one('users',{_id:key(data.sub)});if(!user)return res.status(401).json({error:'Sessiya topilmadi'});req.user=user;next();}catch{return res.status(401).json({error:'Avtorizatsiya zarur'});}};
function selfInvite(i,u){return i&&String(i.ownerId)===id(u);}
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'180kb'}));
app.use('/api',rateLimit({windowMs:15*60*1000,limit:180,standardHeaders:'draft-7',legacyHeaders:false}));
app.get('/api/health',(_,res)=>res.json({ok:true,database:db?'mongodb':'demo-memory',payments:'not-configured'}));
const templates=[
{id:'rose',name:'Rose Éclat',category:'birthday',tone:'rose',emoji:'🎂',premium:false,description:'Nafis pushti, samimiy va bayramona'},
{id:'lilac',name:'Lavender Dream',category:'birthday',tone:'lavender',emoji:'🎈',premium:false,description:'Shirin xotiralar va yorqin kayfiyat'},
{id:'gold',name:'Golden Moment',category:'birthday',tone:'gold',emoji:'✨',premium:true,description:'Hashamatli oltin aksentlar'},
{id:'midnight',name:'Midnight Spark',category:'birthday',tone:'midnight',emoji:'🎉',premium:true,description:'Yulduzli oqshom bayrami'},
{id:'ivory',name:'Ivory Vows',category:'wedding',tone:'ivory',emoji:'💍',premium:false,description:'Klassik va sokin to‘y taklifnomasi'},
{id:'garden',name:'Botanical Love',category:'wedding',tone:'sage',emoji:'🌿',premium:true,description:'Tabiiy, nafis gul naqshlari'},
{id:'velvet',name:'Velvet Hearts',category:'love',tone:'rose',emoji:'💌',premium:false,description:'Yurakdan chiqqan maktub'},
{id:'ocean',name:'Ocean Breeze',category:'event',tone:'ocean',emoji:'🎓',premium:false,description:'Seminar va korporativ tadbirlar'},
{id:'noir',name:'Noir Gala',category:'event',tone:'midnight',emoji:'🥂',premium:true,description:'Premium gala-kecha dizayni'},
{id:'peach',name:'Peach Blossom',category:'birthday',tone:'peach',emoji:'🧁',premium:false,description:'Iliq va quvnoq tug‘ilgan kun'},
{id:'blue',name:'Blue Horizon',category:'event',tone:'ocean',emoji:'🎊',premium:false,description:'Rasmiy uchrashuvlar uchun'},
{id:'champagne',name:'Champagne Night',category:'wedding',tone:'gold',emoji:'🥂',premium:true,description:'Oltin va shampan tuslarida'}
];
app.get('/api/templates',async(_,res)=>{try{const overrides=await all('templateOverrides');res.json(templates.map(t=>({...t,...(overrides.find(o=>o.templateId===t.id)?.changes||{})})));}catch{res.json(templates);}});
app.post('/api/auth/register',async(req,res)=>{try{const name=clean(req.body.name,90),email=clean(req.body.email,150).toLowerCase(),password=String(req.body.password||'');if(name.length<2||!/^.+@.+\..+$/.test(email)||password.length<8)return res.status(400).json({error:'Ism, email va kamida 8 belgili parol kiriting'});if(await one('users',{email}))return res.status(409).json({error:'Bu email allaqachon mavjud'});const user=await insert('users',{name,email,passwordHash:await bcrypt.hash(password,11),role:'user',plan:'free',createdAt:new Date().toISOString()});res.status(201).json({token:token(user),user:{id:id(user),name,email,role:user.role,plan:user.plan||'free'}});}catch(e){res.status(500).json({error:'Ro‘yxatdan o‘tishda xatolik'});}});
app.post('/api/auth/login',async(req,res)=>{const email=clean(req.body.email,150).toLowerCase();const user=await one('users',{email});if(!user||!await bcrypt.compare(String(req.body.password||''),user.passwordHash))return res.status(401).json({error:'Email yoki parol noto‘g‘ri'});res.json({token:token(user),user:{id:id(user),name:user.name,email,role:user.role,plan:user.plan||'free'}});});
app.get('/api/auth/me',auth,(req,res)=>res.json({id:id(req.user),name:req.user.name,email:req.user.email,role:req.user.role,plan:req.user.plan||'free'}));
app.get('/api/invites/mine',auth,async(req,res)=>res.json((await all('invites',{ownerId:id(req.user)})).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(view)));
function parseInvite(data){
 const type=['birthday','wedding','love','event'].includes(data.type)?data.type:'birthday';
 const template=templates.find(t=>t.id===data.templateId&&t.category===type)||templates.find(t=>t.category===type);
 return {type,templateId:template.id,title:clean(data.title,90)||'Unutilmas kun',recipient:clean(data.recipient,90),sender:clean(data.sender,90),message:clean(data.message,1800),date:clean(data.date,35),time:clean(data.time,15),place:clean(data.place,160),locationUrl:/^https:\/\/(www\.)?(google\.[^/]+\/maps|maps\.app\.goo\.gl|yandex\.[^/]+\/maps)/i.test(String(data.locationUrl||''))?clean(data.locationUrl,500):'',music:!!data.music,publicWishes:data.publicWishes!==false,allowRsvp:data.allowRsvp!==false,sceneEffect:['sparkles','petals','confetti','stardust','bubbles','none'].includes(data.sceneEffect)?data.sceneEffect:'sparkles',introEnabled:data.introEnabled!==false,animationStyle:['cinematic','playful','elegant'].includes(data.animationStyle)?data.animationStyle:'cinematic'};
}
app.post('/api/invites',auth,async(req,res)=>{const mine=await all('invites',{ownerId:id(req.user)});if(mine.length>=30)return res.status(403).json({error:'Maksimal 30 ta taklifnoma'});const item=parseInvite(req.body||{});const selectedTemplate=templates.find(t=>t.id===item.templateId);const override=await one('templateOverrides',{templateId:item.templateId});if((override?.changes?.premium??selectedTemplate?.premium)&&req.user.role!=='admin'&&!['pro','vip'].includes(req.user.plan||'free'))return res.status(403).json({error:'Bu dizayn Pro/VIP tarifida mavjud. Admin orqali Pro faollashtiring.'});let slug;do{slug=safe(item.recipient||item.title).toLowerCase().replace(/\s+/g,'-').slice(0,35)+'-'+randomUUID().slice(0,6);}while(await one('invites',{slug}));const doc=await insert('invites',{...item,slug,ownerId:id(req.user),views:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),paymentStatus:'free-demo'});res.status(201).json(view(doc));});
app.get('/api/invites/:slug',async(req,res)=>{const item=await one('invites',{slug:clean(req.params.slug,100)});if(!item)return res.status(404).json({error:'Taklifnoma topilmadi'});await update('invites',{_id:item._id},{views:(item.views||0)+1});const {ownerId,paymentStatus,...publicData}=view(item);res.json({...publicData,views:(item.views||0)+1});});
app.put('/api/invites/:id',auth,async(req,res)=>{const item=await one('invites',{_id:key(req.params.id)});if(!selfInvite(item,req.user))return res.status(404).json({error:'Topilmadi'});const data=parseInvite(req.body||{});const chosen=templates.find(t=>t.id===data.templateId);const override=await one('templateOverrides',{templateId:data.templateId});if((override?.changes?.premium??chosen?.premium)&&req.user.role!=='admin'&&!['pro','vip'].includes(req.user.plan||'free'))return res.status(403).json({error:'Premium shablon uchun Pro/VIP talab qilinadi'});await update('invites',{_id:item._id},{...data,updatedAt:new Date().toISOString()});res.json({ok:true});});
app.delete('/api/invites/:id',auth,async(req,res)=>{const item=await one('invites',{_id:key(req.params.id)});if(!selfInvite(item,req.user))return res.status(404).json({error:'Topilmadi'});await remove('invites',{_id:item._id});res.json({ok:true});});
app.get('/api/invites/:slug/wishes',async(req,res)=>{const invite=await one('invites',{slug:clean(req.params.slug,100)});if(!invite)return res.status(404).json({error:'Topilmadi'});res.json((await all('wishes',{inviteId:id(invite)})).slice(-100).reverse().map(view));});
app.post('/api/invites/:slug/wishes',async(req,res)=>{const invite=await one('invites',{slug:clean(req.params.slug,100)});if(!invite||!invite.publicWishes)return res.status(404).json({error:'Izohlar yopiq'});const name=clean(req.body.name,60),message=clean(req.body.message,400);if(name.length<2||message.length<2)return res.status(400).json({error:'Ism va tabrik kiriting'});const item=await insert('wishes',{inviteId:id(invite),name,message,createdAt:new Date().toISOString()});res.status(201).json(view(item));});
app.post('/api/invites/:slug/rsvp',async(req,res)=>{const invite=await one('invites',{slug:clean(req.params.slug,100)});if(!invite||!invite.allowRsvp)return res.status(404).json({error:'RSVP yopiq'});const name=clean(req.body.name,65),attending=!!req.body.attending;if(name.length<2)return res.status(400).json({error:'Ism kiriting'});const item=await insert('rsvps',{inviteId:id(invite),name,attending,createdAt:new Date().toISOString()});res.status(201).json(view(item));});
app.get('/api/invites/:id/guests',auth,async(req,res)=>{const invite=await one('invites',{_id:key(req.params.id)});if(!selfInvite(invite,req.user))return res.status(404).json({error:'Topilmadi'});res.json((await all('rsvps',{inviteId:id(invite)})).map(view));});
app.get('/api/admin/stats',auth,async(req,res)=>{if(req.user.role!=='admin')return res.status(403).json({error:'Ruxsat yo‘q'});const [users,invites,wishes,rsvps]=await Promise.all(['users','invites','wishes','rsvps'].map(t=>all(t)));res.json({users:users.length,invites:invites.length,wishes:wishes.length,rsvps:rsvps.length,views:invites.reduce((s,x)=>s+(x.views||0),0),recent:invites.slice(-12).reverse().map(view)});});

const requireAdmin=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({error:'Administrator huquqi talab qilinadi'});
const adminLimiter=rateLimit({windowMs:15*60*1000,limit:12,standardHeaders:'draft-7',legacyHeaders:false});
app.post('/api/admin/bootstrap',adminLimiter,auth,async(req,res)=>{
 if(!ADMIN_EMAIL||!ADMIN_BOOTSTRAP_KEY||ADMIN_BOOTSTRAP_KEY.length<24)return res.status(503).json({error:'ADMIN_EMAIL va ADMIN_BOOTSTRAP_KEY sozlanmagan'});
 if(req.user.email!==ADMIN_EMAIL||String(req.body.key||'')!==ADMIN_BOOTSTRAP_KEY)return res.status(403).json({error:'Tasdiqlash muvaffaqiyatsiz'});
 if(!db)return res.status(503).json({error:'Ma’lumotlar bazasi ulanmagan'});
 await update('users',{_id:req.user._id},{role:'admin'});
 await insert('auditLogs',{actorId:id(req.user),action:'admin.bootstrap',createdAt:new Date().toISOString()});
 res.json({ok:true,message:'Administrator huquqi berildi. Kabinetni yangilang.'});
});
app.get('/api/admin/users',auth,requireAdmin,async(req,res)=>{
 const search=clean(req.query.q,90).toLowerCase();
 const users=(await all('users')).filter(u=>!search||u.email.includes(search)||u.name.toLowerCase().includes(search));
 res.json(users.slice(0,200).map(u=>({id:id(u),name:u.name,email:u.email,role:u.role,plan:u.plan||'free',createdAt:u.createdAt})));
});
app.patch('/api/admin/users/:id/plan',auth,requireAdmin,async(req,res)=>{
 if(!db)return res.status(503).json({error:'Admin o‘zgarishlari uchun MongoDB talab qilinadi'});
 const plan=String(req.body.plan||'');
 if(!['free','pro','vip'].includes(plan))return res.status(400).json({error:'Noto‘g‘ri tarif'});
 const target=await one('users',{_id:key(req.params.id)});
 if(!target)return res.status(404).json({error:'Foydalanuvchi topilmadi'});
 if(target.role==='admin'&&id(target)!==id(req.user))return res.status(403).json({error:'Boshqa administrator tarifini o‘zgartirish mumkin emas'});
 await update('users',{_id:target._id},{plan,planUpdatedAt:new Date().toISOString()});
 await insert('auditLogs',{actorId:id(req.user),targetId:id(target),action:'plan.grant',detail:{from:target.plan||'free',to:plan},createdAt:new Date().toISOString()});
 res.json({ok:true,plan});
});
app.get('/api/admin/invitations',auth,requireAdmin,async(req,res)=>{
 const invites=(await all('invites')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 res.json(invites.slice(0,150).map(i=>({id:id(i),title:i.title,recipient:i.recipient,type:i.type,slug:i.slug,views:i.views||0,createdAt:i.createdAt})));
});
app.get('/api/admin/audit',auth,requireAdmin,async(req,res)=>{
 const records=(await all('auditLogs')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 res.json(records.slice(0,100).map(view));
});
app.get('/api/admin/templates',auth,requireAdmin,async(req,res)=>{
 const overrides=await all('templateOverrides');
 res.json(templates.map(t=>({...t,...(overrides.find(o=>o.templateId===t.id)?.changes||{})})));
});
app.patch('/api/admin/templates/:id',auth,requireAdmin,async(req,res)=>{
 if(!db)return res.status(503).json({error:'MongoDB talab qilinadi'});
 const base=templates.find(t=>t.id===req.params.id);
 if(!base)return res.status(404).json({error:'Shablon topilmadi'});
 const changes={premium:!!req.body.premium};
 const old=await one('templateOverrides',{templateId:base.id});
 if(old)await update('templateOverrides',{_id:old._id},{changes});
 else await insert('templateOverrides',{templateId:base.id,changes});
 await insert('auditLogs',{actorId:id(req.user),action:'template.update',detail:{templateId:base.id,...changes},createdAt:new Date().toISOString()});
 res.json({ok:true,...changes});
});

app.get('/api/payments/status',(_,res)=>res.json({enabled:false,message:'Rasmiy to‘lov provayderi konfiguratsiya qilinmaguncha to‘lovlar o‘chiq'}));
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)),'public'),{maxAge:'1h'}));
app.get('*',(_,res)=>res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)),'public','index.html')));
app.use((err,req,res,next)=>{console.error(err.message);res.status(500).json({error:'Serverda xatolik yuz berdi'});});
app.listen(PORT,'0.0.0.0',()=>console.log('TabrikUZ started on '+PORT+(db?' (MongoDB)':' (demo memory)')));
