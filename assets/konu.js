(function(){
const SALT=new TextEncoder().encode('cgakademi-konu-v1'),IT=150000,LS='cga-kod';
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(code){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:SALT,iterations:IT,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['decrypt']);}
async function dec(k,s){const b=b64(s);const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},k,b.slice(12));return new TextDecoder().decode(p);}
async function tryCode(code){code=(code||'').trim().toUpperCase();if(!code)return null;const lock=document.querySelector('.k-lock');try{const k=await key(code);if(lock&&lock.dataset.check){const t=await dec(k,lock.dataset.check);if(t!=='CGA-OK')return null;}return k;}catch(e){return null;}}
async function unlock(k){for(const a of document.querySelectorAll('[data-enc]')){a.innerHTML=await dec(k,a.dataset.enc);a.removeAttribute('data-enc');}
document.querySelectorAll('.k-lock:not([data-index])').forEach(l=>l.remove());document.querySelectorAll('.k-ok').forEach(e=>e.hidden=false);
document.querySelectorAll('.k-side a, .k-areas a').forEach(a=>a.textContent=a.textContent.replace('🔒 ',''));}
document.addEventListener('DOMContentLoaded',async()=>{let saved=null;try{saved=localStorage.getItem(LS)}catch(e){}
if(saved){const k=await tryCode(saved);if(k)await unlock(k);}
document.querySelectorAll('.k-code').forEach(f=>f.addEventListener('submit',async ev=>{ev.preventDefault();const v=f.querySelector('input').value;const err=f.querySelector('.k-err');err.hidden=true;const k=await tryCode(v);
if(!k){err.hidden=false;return;}try{localStorage.setItem(LS,v.trim().toUpperCase())}catch(e){}await unlock(k);}));});
})();