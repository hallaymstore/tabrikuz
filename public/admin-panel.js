window.TabrikAdmin=(()=>{
const root=()=>document.getElementById('app');
const esc=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const api=async(path,method='GET',body)=>{const r=await fetch('/api'+path,{method,headers:{Authorization:'Bearer '+(localStorage.token||''),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error||'API xatosi');return d};
let tab='users';
async function render(){
root().innerHTML='<section class="page-head"><div class="shell"><div class="eyebrow">HALLAYM CONTROL CENTER</div><h1>TabrikUZ Admin</h1><p>Foydalanuvchilar, premium tariflar va shablonlar.</p></div></section><section class="workspace"><div class="shell"><div class="admin-grid" id="adminStats"></div><div class="tabstrip" id="adminTabs"></div><div id="adminContent"></div><button class="btn btn-outline" id="backToAccount">Kabinetga qaytish</button></div></section>';
document.getElementById('backToAccount').onclick=()=>window.history.back();
const names={users:'Foydalanuvchilar',templates:'Shablonlar',invites:'Taklifnomalar',audit:'Audit'};
document.getElementById('adminTabs').innerHTML=Object.entries(names).map(([v,n])=>'<button data-tab="'+v+'">'+n+'</button>').join('');
document.getElementById('adminTabs').onclick=e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;load()}};
try{const s=await api('/admin/stats');document.getElementById('adminStats').innerHTML=Object.entries({Foydalanuvchilar:s.users,Taklifnomalar:s.invites,Tabriklar:s.wishes,Ko_rishlar:s.views}).map(([n,v])=>'<div class="admin-card"><strong>'+Number(v||0)+'</strong><span>'+n+'</span></div>').join('')}catch(e){document.getElementById('adminStats').textContent=e.message}
load();
}
async function load(){
document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
const el=document.getElementById('adminContent');if(!el)return;el.textContent='Yuklanmoqda...';
try{
if(tab==='users'){
const data=await api('/admin/users');
el.innerHTML='<div class="panel"><h3>Foydalanuvchilar va Pro/VIP</h3><p class="muted small">Tarifni tanlang. Barcha o‘zgarishlar auditga yoziladi.</p><div style="overflow:auto"><table class="admin-table"><tr><th>Ism</th><th>Email</th><th>Huquq</th><th>Tarif</th></tr>'+data.map(u=>'<tr><td>'+esc(u.name)+'</td><td>'+esc(u.email)+'</td><td>'+esc(u.role)+'</td><td><select data-user="'+esc(u.id)+'">'+['free','pro','vip'].map(p=>'<option value="'+p+'" '+(p===u.plan?'selected':'')+'>'+p.toUpperCase()+'</option>').join('')+'</select></td></tr>').join('')+'</table></div></div>';
el.querySelectorAll('[data-user]').forEach(x=>x.onchange=async()=>{if(!confirm('Tarifni '+x.value.toUpperCase()+' qilish tasdiqlansinmi?'))return load();try{await api('/admin/users/'+x.dataset.user+'/plan','PATCH',{plan:x.value});load()}catch(e){alert(e.message);load()}});
}
if(tab==='templates'){
const data=await api('/admin/templates');
el.innerHTML='<div class="template-grid">'+data.map(t=>'<div class="template-card"><div class="template-art tone-'+esc(t.tone)+'" style="height:145px"><strong>'+esc(t.name)+'</strong></div><div class="template-info"><h4>'+esc(t.name)+'</h4><p>'+esc(t.category)+'</p><label><input type="checkbox" data-template="'+t.id+'" '+(t.premium?'checked':'')+'> Pro/VIP</label></div></div>').join('')+'</div>';
el.querySelectorAll('[data-template]').forEach(x=>x.onchange=async()=>{try{await api('/admin/templates/'+x.dataset.template,'PATCH',{premium:x.checked})}catch(e){alert(e.message);load()}});
}
if(tab==='invites'){
const data=await api('/admin/invitations');
el.innerHTML='<div class="panel" style="overflow:auto"><table class="admin-table"><tr><th>Taklifnoma</th><th>Tur</th><th>Ko‘rishlar</th><th>Havola</th></tr>'+data.map(i=>'<tr><td>'+esc(i.recipient||i.title)+'</td><td>'+esc(i.type)+'</td><td>'+Number(i.views||0)+'</td><td><a href="/i/'+encodeURIComponent(i.slug)+'" target="_blank">Ochish</a></td></tr>').join('')+'</table></div>';
}
if(tab==='audit'){
const data=await api('/admin/audit');
el.innerHTML='<div class="panel" style="overflow:auto"><table class="admin-table"><tr><th>Vaqt</th><th>Amal</th><th>Admin</th></tr>'+data.map(a=>'<tr><td>'+esc(a.createdAt)+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.actorId)+'</td></tr>').join('')+'</table></div>';
}
}catch(e){el.innerHTML='<div class="notice">'+esc(e.message)+'</div>'}
}
return {render};
})();