(()=>{const B='https://raw.githubusercontent.com/cguzel23-ship-it/cg-akademi-ekys/cga-videolar/';
const S=ms=>new Promise(r=>setTimeout(r,ms));
window.__up=async function(i){const meta=await (await fetch(B+'yt.json?'+Date.now())).json();const [f,t,d,k]=meta[i];
 let inp=null;for(let j=0;j<20&&!inp;j++){inp=document.querySelector('input[type=file][name=Filedata]')||document.querySelector('ytcp-uploads-file-picker input[type=file]');if(!inp)await S(500);}
 const b=await (await fetch(B+f)).blob();const file=new File([b],f,{type:'video/mp4'});const dt=new DataTransfer();dt.items.add(file);inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));
 for(let j=0;j<30;j++){await S(500);if(document.querySelectorAll('ytcp-uploads-dialog #textbox').length>=2)break;}await S(1500);
 const fill=(n,x)=>{const tb=document.querySelectorAll('ytcp-uploads-dialog #textbox')[n];tb.focus();document.execCommand('selectAll');document.execCommand('insertText',false,x);};fill(0,t);fill(1,d);
 const kb=await (await fetch(B+k)).blob();const ti=document.querySelector('ytcp-uploads-dialog input#file-loader');const dt2=new DataTransfer();dt2.items.add(new File([kb],k,{type:'image/jpeg'}));ti.files=dt2.files;ti.dispatchEvent(new Event('change',{bubbles:true}));
 await S(1500);const a=[...document.querySelectorAll('ytcp-uploads-dialog a')].map(x=>x.href).find(h=>/youtu\.be/.test(h));return f+' '+b.size+' '+a;};
window.__finish=async function(){const D=()=>document.querySelector('ytcp-uploads-dialog');
 const kid=[...D().querySelectorAll('tp-yt-paper-radio-button')].find(x=>/çocuklara özel değil/.test(x.innerText)); if(kid) kid.click(); await S(500);
 const pl=D().querySelector('ytcp-video-metadata-playlists ytcp-dropdown-trigger')||[...D().querySelectorAll('[aria-label]')].find(x=>/Oynatma listelerini seçin/.test(x.getAttribute('aria-label')));
 pl.click(); await S(1500);
 const cb=[...document.querySelectorAll('ytcp-checkbox-lit')].find(x=>/AGS Mevzuat \| Konu/.test(x.parentElement.innerText||''))||[...document.querySelectorAll('#checkbox-label,li')].find(x=>/AGS Mevzuat \| Konu/.test(x.innerText||''));
 if(cb) cb.click(); await S(700);
 const done=[...document.querySelectorAll('ytcp-button,button')].find(x=>/^Bitti$/.test((x.innerText||'').trim())); if(done) done.click(); await S(1000);
 for(let k=0;k<3;k++){document.querySelector('#next-button').click(); await S(1800);}
 document.querySelector('tp-yt-paper-radio-button[name=UNLISTED]').click(); await S(700);
 document.querySelector('#done-button').click(); await S(3000);
 const y=[...document.querySelectorAll('ytcp-button,button')].find(x=>/Yine de yayınla/.test(x.innerText||'')); if(y) y.click(); await S(3000);
 const t=document.body.innerText; return 'kid:'+!!kid+' pl:'+!!pl+' cb:'+!!cb+' done:'+!!done+' '+(/Video yayınlandı|Video kaydedildi/.test(t)?'SAVED':'?');};
window.__close=function(){const c=[...document.querySelectorAll('ytcp-button,button')].find(x=>/^Kapat$/.test((x.innerText||'').trim())); if(c){c.click();return 'closed'} return 'noclose'};
})();
