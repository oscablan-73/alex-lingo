/* Alex-lingo 2 · Conector opcional de nube. No contiene secretos privados. */
(()=>{'use strict';
const CONF='alexlingo_cloud_config_v2',AUTH='alexlingo_cloud_auth_v2';
const getJSON=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const state={config:getJSON(CONF),auth:getJSON(AUTH),profile:null,status:'local',lastSync:0,error:'',busy:false,aiStatus:'',requested:new Set()};
let hooks=null, timer=null, syncTimer=null, syncing=false, changed=false;
const urlOk=s=>/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const stamp=()=>new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
async function request(path,options={}){
 const c=state.config;if(!c||!urlOk(c.url)||!c.key)throw Error('Configura primero URL y clave pública de Supabase.');
 const headers={'apikey':c.key,'content-type':'application/json',...(options.headers||{})};
 if(state.auth?.access_token&&!path.startsWith('/auth/v1/'))headers.authorization='Bearer '+state.auth.access_token;
 const res=await fetch(c.url.replace(/\/$/,'')+path,{...options,headers});
 const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw;}
 if(!res.ok){const msg=data?.msg||data?.message||data?.error_description||data?.error||`HTTP ${res.status}`;throw Error(msg);}
 return data;
}
async function refreshAuth(){
 if(!state.auth?.refresh_token)return false;
 if(Date.now()<(state.auth.expires_at||0)-100000)return true;
 const a=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:state.auth.refresh_token})});
 setAuth(a);return true;
}
function setAuth(a){state.auth={access_token:a.access_token,refresh_token:a.refresh_token,expires_at:Date.now()+(a.expires_in||3600)*1000,user_id:a.user?.id||state.auth?.user_id};localStorage.setItem(AUTH,JSON.stringify(state.auth));}
async function authAction(kind,email,password){
 if(!navigator.onLine)throw Error('Necesitas conexión a Internet para acceder a la liga.');
 email=String(email||'').trim();if(!email.includes('@')||String(password||'').length<8)throw Error('Introduce un correo válido y una contraseña de al menos 8 caracteres.');
 const body=JSON.stringify({email,password});let a;
 if(kind==='signup')a=await request('/auth/v1/signup',{method:'POST',body});
 else a=await request('/auth/v1/token?grant_type=password',{method:'POST',body});
 if(!a?.access_token){state.error='Cuenta creada. Confirma el correo electrónico si Supabase lo solicita; después inicia sesión.';return false;}
 setAuth(a);await loadOwnProfile();return true;
}
async function loadOwnProfile(){
 await refreshAuth();const rows=await request('/rest/v1/alex_profiles?select=user_id,room_code,person,data,updated_at&user_id=eq.'+encodeURIComponent(state.auth.user_id));
 state.profile=rows[0]||null;state.status=state.profile?'online':'unlinked';
 if(state.profile){hooks.setActive(state.profile.person);await pull();startPolling();}hooks?.render();return state.profile;
}
function newCode(){const b=new Uint8Array(16);crypto.getRandomValues(b);return [...b].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();}
async function join(person,room){
 if(!['ines','oscar'].includes(person))throw Error('Selecciona un perfil.');
 await refreshAuth();if(!state.auth?.user_id)throw Error('Primero inicia sesión.');
 room=String(room||'').toUpperCase().replace(/[\s-]/g,'');
 if(!room)room=newCode();
 if(!/^[A-F0-9]{32}$/.test(room))throw Error('El código de liga debe tener 32 caracteres hexadecimales.');
 const db=hooks.getDB();const data=structuredClone(db.users[person]);data.session=null;
 const created=await request('/rest/v1/alex_profiles',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:state.auth.user_id,room_code:room,person,data})});
 if(!created?.length)throw Error('No se pudo vincular la cuenta.');
 state.profile=created[0];state.status='online';
 hooks.setActive(person);await pull();await pushCards();startPolling();hooks?.render();return room;
}
function mergeUser(local,remote){
 if(!remote||typeof remote!=='object'||!Array.isArray(remote.events))return local;
 if(!local||!Array.isArray(local.events))return {...remote,session:null};
 const idOf=(x)=>String(x.eid||[x.ts,x.id,x.bonus,x.points,x.correct].join('|'));
 const events=new Map(remote.events.map(e=>[idOf(e),e]));local.events.forEach(e=>events.set(idOf(e),e));
 const hist={...(remote.history||{})};for(const [id,h] of Object.entries(local.history||{})){if(!hist[id]||(h.last||0)>(hist[id].last||0))hist[id]=h;}
 return {levels:{...local.levels,...remote.levels},language:local.language||remote.language||'en',history:hist,events:[...events.values()].sort((a,b)=>(a.ts||0)-(b.ts||0)).slice(-25000),bonuses:{...remote.bonuses,...local.bonuses},session:local.session||null};
}
async function pull(){
 if(syncing||!state.profile||!navigator.onLine)return;
 syncing=true;
 try{
  await refreshAuth();
  const room=encodeURIComponent(state.profile.room_code);
  const [profiles,cards]=await Promise.all([
   request('/rest/v1/alex_profiles?select=user_id,person,data,updated_at&room_code=eq.'+room),
   request('/rest/v1/alex_cards?select=id,card&room_code=eq.'+room+'&limit=2000')
  ]);
  const db=hooks.getDB();let mergedOwn=false;
  for(const p of profiles){if(!['ines','oscar'].includes(p.person))continue;
   if(p.person===state.profile.person){const before=(db.users[p.person]?.events||[]).length;db.users[p.person]=mergeUser(db.users[p.person],p.data);mergedOwn=db.users[p.person].events.length> (p.data?.events||[]).length || before>(p.data?.events||[]).length;}
   else db.users[p.person]={...p.data,session:null};
  }
  const map=new Map(db.custom.map(c=>[c.id,c]));for(const r of cards){const c=r.card;if(validCard(c))map.set(c.id,c);}
  db.custom=[...map.values()];hooks.saveLocalOnly();state.lastSync=Date.now();state.status='online';state.error='';
  if(mergedOwn)changed=true;
  hooks.render();
 }catch(e){state.status='offline';state.error=e.message;hooks?.render();}
 finally{syncing=false;if(changed){changed=false;queueSave();}}
}
function validCard(c){return c&&typeof c.id==='string'&&['en','fr'].includes(c.lang)&&['A1','A2','B1','B2'].includes(c.level)&&typeof c.question==='string'&&typeof c.correct==='string'&&Array.isArray(c.options)&&c.options.length===4&&c.options.includes(c.correct)&&new Set(c.options).size===4&&typeof c.explanation==='string';}
function queueSave(){if(!state.profile)return;changed=true;clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushOwn(),900);}
async function pushOwn(){if(!state.profile||!navigator.onLine)return;changed=false;
 try{await refreshAuth();const d=hooks.getDB();const data=structuredClone(d.users[state.profile.person]);data.session=null;
 await request('/rest/v1/alex_profiles?user_id=eq.'+encodeURIComponent(state.auth.user_id),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({data,updated_at:new Date().toISOString()})});
 state.lastSync=Date.now();state.status='online';state.error='';
 }catch(e){state.status='offline';state.error=e.message;changed=true;}
 finally{if(changed&&navigator.onLine){clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushOwn(),8000);}hooks?.render();}
}
async function pushCards(){if(!state.profile||!navigator.onLine)return;
 await refreshAuth();const db=hooks.getDB(),cards=db.custom.filter(validCard);
 if(!cards.length)return;
 // On conflict do nothing: no repetir ni sobreescribir tarjetas de otro usuario.
 for(let i=0;i<cards.length;i+=100){
  await request('/rest/v1/alex_cards?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(cards.slice(i,i+100).map(card=>({id:card.id,room_code:state.profile.room_code,created_by:state.auth.user_id,card})))});
 }
}
async function deleteCard(id){if(!state.profile)return;try{await refreshAuth();await request('/rest/v1/alex_cards?id=eq.'+encodeURIComponent(id),{method:'DELETE'});}catch(e){state.error=e.message;}}
async function generate(lang,level,manual=false){
 if(!state.profile||!navigator.onLine)return;
 const key=[new Date().toISOString().slice(0,10),lang,level].join('|');
 if(!manual&&state.requested.has(key))return;
 state.requested.add(key);state.aiStatus='Consultando generador de IA…';hooks.render();
 try{await refreshAuth();const result=await request('/functions/v1/generate-cards',{method:'POST',body:JSON.stringify({lang,level})});
  state.aiStatus=result?.created?`+${result.created} preguntas de IA recibidas hoy`:'Preguntas del día ya actualizadas';
  await pull();
 }catch(e){state.aiStatus='IA pendiente de activar: '+e.message.slice(0,130);}
 finally{hooks.render();}
}
function startPolling(){clearInterval(timer);timer=setInterval(async()=>{if(state.profile&&navigator.onLine){await pull();}},12000);}
async function start(){
 if(!hooks)return;
 if(state.config&&state.auth?.refresh_token){try{state.status='connecting';hooks.render();await loadOwnProfile();}catch(e){state.status='offline';state.error=e.message;hooks.render();}}
}
function disconnect(){clearInterval(timer);clearTimeout(syncTimer);state.auth=null;state.profile=null;state.status='local';localStorage.removeItem(AUTH);hooks.render();}
function configSave(url,key){url=String(url||'').trim().replace(/\/$/,'');key=String(key||'').trim();if(!urlOk(url)||!/^((sb_publishable_[\w-]+)|(eyJ[\w.-]+))$/.test(key))throw Error('Introduce la URL HTTPS de Supabase y su clave PÚBLICA (publishable/anon). Nunca uses una secret/service_role.');
 state.config={url,key};localStorage.setItem(CONF,JSON.stringify(state.config));state.error='';state.status='local';hooks.render();}
function configClear(){disconnect();state.config=null;localStorage.removeItem(CONF);hooks.render();}
function panel(){const p=state.profile;return `<section class="panel cloud-panel" style="margin-top:19px"><h3>Sincronización y preguntas nuevas</h3><p class="panel-sub">Modo ${p?(state.status==='online'?'conectado':'sin conexión temporal'):'local'}. El estudio siempre funciona sin Internet. Para una liga común desde dos dispositivos hay que configurar vuestro propio proyecto Supabase.</p>
 ${!state.config?`<form id="cloud-config" class="form-stack"><div class="field"><label>URL pública del proyecto Supabase</label><input name="url" required placeholder="https://xxxxxxxx.supabase.co" autocomplete="url"></div><div class="field"><label>Clave pública (publishable o anon)</label><input name="key" required placeholder="sb_publishable_..."></div><button class="btn" type="submit">Guardar conexión</button><p class="hint">La clave secreta de la IA nunca se introduce aquí. Consulta INSTRUCCIONES-CONEXION.txt en el ZIP.</p></form>`:
 !state.auth?`<form id="cloud-auth" class="form-stack"><div class="field"><label>Correo electrónico de tu cuenta</label><input name="email" type="email" autocomplete="email" required></div><div class="field"><label>Contraseña (mínimo 8 caracteres)</label><input name="password" type="password" minlength="8" autocomplete="current-password" required></div><div class="section-row"><button class="btn small" type="submit" data-form-action="login">Entrar</button><button class="btn secondary small" type="submit" data-form-action="signup">Crear cuenta</button></div></form>`:
 !p?`<form id="cloud-join" class="form-stack"><p>Cuenta validada. Vincúlala a Inés u Óscar. El primer usuario crea la liga; el segundo introduce el código que le proporciona el primero.</p><div class="field"><label>¿Quién va a usar esta cuenta?</label><select name="person"><option value="oscar">Óscar</option><option value="ines">Inés</option></select></div><div class="field"><label>Código de liga del otro usuario (vacío para crear una liga)</label><input name="room" placeholder="32 caracteres; dejar vacío para crear" maxlength="36" style="text-transform:uppercase"></div><button class="btn" type="submit">Vincular usuario</button></form>`:
 `<div class="statline"><span>Usuario conectado</span><b>${p.person==='oscar'?'Óscar':'Inés'}</b></div><div class="statline"><span>Estado</span><b>${state.status==='online'?'● Sincronizado':'○ Pendiente de sincronizar'}</b></div><div class="statline"><span>Última sincronización</span><b>${state.lastSync?new Date(state.lastSync).toLocaleTimeString('es-ES'):'Sin datos'}</b></div><div class="field"><label>Código para compartir con el otro usuario</label><input readonly value="${esc(p.room_code)}" onclick="this.select()"></div><div class="section-row"><button class="btn small" data-action="cloud-sync">Sincronizar ahora</button></div><p class="hint">Para añadir preguntas sin pagar una API, importa las tandas CSV desde «Tarjetas». Se compartirán con el otro usuario al sincronizar.</p>`}
 ${state.aiStatus?`<p class="hint">${esc(state.aiStatus)}</p>`:''}${state.error?`<p class="hint" style="color:var(--danger)">${esc(state.error)}</p>`:''}
 <div class="section-row" style="margin-top:12px">${state.auth?'<button class="btn flat small" data-action="cloud-logout">Cerrar sesión en la nube</button>':''}${state.config?'<button class="btn flat small" data-action="cloud-clear">Cambiar proyecto</button>':''}</div></section>`;}
function attach(h){hooks=h;start();}
window.ALEXLINGO_CLOUD={state,attach,panel,authAction,join,configSave,configClear,disconnect,pull,queueSave,pushCards,deleteCard,generate};
})();
