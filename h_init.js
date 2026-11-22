(async()=>{
const s=document.querySelector('mat-select'); s.click(); await new Promise(r=>setTimeout(r,700));
const o=[...document.querySelectorAll('mat-option')].find(x=>x.textContent.includes('16:9')); if(o) o.click(); await new Promise(r=>setTimeout(r,500));
window.imgs=()=>[...document.querySelectorAll('img')].filter(i=>(i.src.startsWith('blob:')||i.src.startsWith('data:image'))&&i.naturalWidth>500);
window.seen=new Set();
window.gen=async(prompt,name)=>{
 imgs().forEach(i=>seen.add(i.src));
 const ta=[...document.querySelectorAll('textarea')].find(e=>e.offsetParent);
 ta.focus(); ta.value=prompt; ta.dispatchEvent(new Event('input',{bubbles:true})); await new Promise(r=>setTimeout(r,400));
 const run=[...document.querySelectorAll('button')].find(b=>/Run/.test(b.textContent)&&b.offsetParent&&!b.disabled); if(!run) return 'norun'; run.click();
 const t0=Date.now(); let img=null;
 while(Date.now()-t0<43000){ await new Promise(r=>setTimeout(r,1500)); const c=imgs().filter(i=>!seen.has(i.src)); if(c.length){img=c[c.length-1].src;break;} }
 if(!img) return 'timeout';
 seen.add(img); const a=document.createElement('a'); a.href=img; a.download=name+'.png'; document.body.appendChild(a); a.click(); a.remove(); return 'ok';};
window.P=await (await fetch('https://raw.githubusercontent.com/cguzel23-ship-it/cg-akademi-ekys/zd-gorseller/h_prompts.json?x='+Date.now())).json();
window.genk=async(i)=>{const [k,p]=P.scenes[i]; return k+':'+await gen(p+'. '+P.style,k)};
window._ready=s.textContent.trim();
})();
