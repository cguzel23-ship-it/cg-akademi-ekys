(function(){
const SALT=new TextEncoder().encode('cgakademi-konu-v1'),IT=150000,LS='cga-kod';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const L='ABCDE';const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])).split(String.fromCharCode(10)).join('<br>');
function quiz(el,Q){let i=0,ok=0,ans=[];el.innerHTML='';
const draw=()=>{if(i>=Q.length){try{const K="cg-ekys-testler",sl=location.pathname.split("/").filter(Boolean).pop()||"konu",h=document.querySelector("h1"),o=JSON.parse(localStorage.getItem(K)||"{}"),p=o[sl]||{n:0,best:0},now=Date.now();o[sl]={ad:(h?h.textContent:sl).trim().slice(0,90),son:ok,top:Q.length,best:Math.max(p.best||0,ok),n:(p.n||0)+1,t:now};localStorage.setItem(K,JSON.stringify(o));const G="cg-ekys-gunler",g=JSON.parse(localStorage.getItem(G)||"{}"),d=new Date(),dk=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");g[dk]=(g[dk]||0)+Q.length;localStorage.setItem(G,JSON.stringify(g))}catch(_){}el.innerHTML=`<div class="t-end"><div class="t-score">${ok} / ${Q.length}</div><p>${ok>=16?'Harika! Bu konu sağlam.':ok>=12?'İyi gidiyor; yanlışlarını tekrar et.':'Konu anlatımını bir kez daha oku, sonra tekrar dene.'}</p><div class="hero-cta" style="justify-content:center"><button class="btn primary" type="button">Testi tekrar çöz</button></div><div class="t-rev">${Q.map((q,j)=>`<div class="t-ri ${ans[j]===q.a?'ok':'no'}"><b>${j+1}.</b> ${ans[j]===q.a?'✓':'✗'} Doğru: ${L[q.a]}${ans[j]!==q.a&&ans[j]!=null?' · Senin: '+L[ans[j]]:''}</div>`).join('')}</div></div>`;
el.querySelector('button').onclick=()=>{i=0;ok=0;ans=[];draw();};return;}
const q=Q[i];el.innerHTML=`<div class="t-head"><span>Soru ${i+1} / ${Q.length}</span><span>Doğru: ${ok}</span></div><div class="t-bar"><i style="width:${i/Q.length*100}%"></i></div><p class="t-q">${esc(q.t)}</p><div class="t-opts">${q.o.map((o,k)=>`<button type="button" class="t-o" data-k="${k}"><b>${L[k]})</b> ${esc(o)}</button>`).join('')}</div><div class="t-ex" hidden></div><div class="t-nav" hidden><button type="button" class="btn primary t-next">${i+1<Q.length?'Sonraki soru →':'Sonucu gör'}</button></div>`;
el.querySelectorAll('.t-o').forEach(b=>b.onclick=()=>{if(ans[i]!=null)return;const k=+b.dataset.k;ans[i]=k;if(k===q.a)ok++;
el.querySelectorAll('.t-o').forEach(x=>{const kk=+x.dataset.k;x.disabled=true;if(kk===q.a)x.classList.add('ok');else if(kk===k)x.classList.add('no');});
const ex=el.querySelector('.t-ex');ex.hidden=false;ex.innerHTML=`<b>${k===q.a?'Doğru!':'Yanlış. Doğru cevap '+L[q.a]+'.'}</b> ${esc(q.e||'')}`;el.querySelector('.t-nav').hidden=false;
el.querySelector('.t-next').onclick=()=>{i++;draw();el.scrollIntoView({block:'start',behavior:'smooth'});};});};draw();}
let KEYS=null;async function keys(){if(!KEYS){const r=await fetch('/assets/konu-keys.json',{cache:'no-cache'});KEYS=await r.json();}return KEYS;}
async function pb(code){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:SALT,iterations:IT,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['decrypt']);}
async function dec(k,s){const b=b64(s);return crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},k,b.slice(12));}
async function tryCode(code){code=(code||'').trim().toUpperCase();if(!code)return null;try{const id=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('cga-id:'+code))).slice(0,16);const K=await keys();if(!K[id])return null;
const raw=await dec(await pb(code),K[id]);return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);}catch(e){return null;}}
async function unlock(k){for(const a of document.querySelectorAll('[data-enc]')){const t=new TextDecoder().decode(await dec(k,a.dataset.enc));a.removeAttribute('data-enc');if(a.classList.contains('t-quiz'))quiz(a,JSON.parse(t));else a.innerHTML=t;}
document.querySelectorAll('.k-lock:not([data-index])').forEach(l=>l.remove());document.querySelectorAll('.k-ok').forEach(e=>e.hidden=false);
document.querySelectorAll('.k-side a, .k-areas a, .k-tests a').forEach(a=>a.textContent=a.textContent.replace('🔒 ',''));}
document.addEventListener('DOMContentLoaded',async()=>{document.querySelectorAll('.t-quiz[data-q]').forEach(e=>quiz(e,JSON.parse(e.dataset.q)));let saved=null;try{saved=localStorage.getItem(LS)}catch(e){}
if(saved){const k=await tryCode(saved);if(k)await unlock(k);else try{localStorage.removeItem(LS)}catch(e){}}
document.querySelectorAll('.k-code').forEach(f=>f.addEventListener('submit',async ev=>{ev.preventDefault();const v=f.querySelector('input').value;const err=f.querySelector('.k-err');err.hidden=true;const k=await tryCode(v);
if(!k){err.hidden=false;return;}try{localStorage.setItem(LS,v.trim().toUpperCase())}catch(e){}await unlock(k);}));});
})();