(function(){
const SALT=new TextEncoder().encode('cgakademi-konu-v1'),IT=150000,LS='cga-kod';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
let KEYS=null;async function keys(){if(!KEYS){const r=await fetch('/assets/konu-keys.json',{cache:'no-cache'});KEYS=await r.json();}return KEYS;}
async function pb(code){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:SALT,iterations:IT,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['decrypt']);}
async function dec(k,s){const b=b64(s);return crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},k,b.slice(12));}
async function tryCode(code){code=(code||'').trim().toUpperCase();if(!code)return null;try{const id=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('cga-id:'+code))).slice(0,16);const K=await keys();if(!K[id])return null;
const raw=await dec(await pb(code),K[id]);return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);}catch(e){return null;}}
async function unlock(k){for(const a of document.querySelectorAll('[data-enc]')){a.innerHTML=new TextDecoder().decode(await dec(k,a.dataset.enc));a.removeAttribute('data-enc');}
document.querySelectorAll('.k-lock:not([data-index])').forEach(l=>l.remove());document.querySelectorAll('.k-ok').forEach(e=>e.hidden=false);
document.querySelectorAll('.k-side a, .k-areas a').forEach(a=>a.textContent=a.textContent.replace('🔒 ',''));}
document.addEventListener('DOMContentLoaded',async()=>{let saved=null;try{saved=localStorage.getItem(LS)}catch(e){}
if(saved){const k=await tryCode(saved);if(k)await unlock(k);else try{localStorage.removeItem(LS)}catch(e){}}
document.querySelectorAll('.k-code').forEach(f=>f.addEventListener('submit',async ev=>{ev.preventDefault();const v=f.querySelector('input').value;const err=f.querySelector('.k-err');err.hidden=true;const k=await tryCode(v);
if(!k){err.hidden=false;return;}try{localStorage.setItem(LS,v.trim().toUpperCase())}catch(e){}await unlock(k);}));});
})();