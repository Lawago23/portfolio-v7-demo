const SB=supabase.createClient('https://jthmekehipiolsxtjavb.supabase.co','sb_publishable__YUQh9Vgtda2nPwyxn-hTw_oMXZDe5-');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeHex=h=>/^#[0-9a-fA-F]{6}$/.test(h||'')?h:'#888888';
const safeUrl=u=>/^(https:\/\/[a-z0-9.-]+\.supabase\.co\/|img\/|models\/|data:image\/(jpeg|png|webp);base64,)/i.test(u||'')?u:'';
const FILIALEN=(typeof CLIENT!=='undefined'&&CLIENT.filialen)||['Filiale 1'];
const STEPS=['Bestellung eingegangen','Wird vorbereitet','Versandt','In Zustellung','Zugestellt'];
function jl(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
const cart={get:()=>jl('polster_cart',[]),set:c=>localStorage.setItem('polster_cart',JSON.stringify(c))};
let _u=null;const user={get:()=>_u,set:u=>{_u=u},out:()=>{_u=null;return SB.auth.signOut()}};
async function initAuth(){const{data}=await SB.auth.getSession();const s=data.session;_u=s?{id:s.user.id,email:s.user.email,name:(s.user.user_metadata||{}).name||s.user.email}:null;return _u}
async function loadData(){const[p,s]=await Promise.all([SB.from('products').select('*').order('sort').order('id'),SB.from('settings').select('*').eq('id',1).single()]);
 const set=s.data||{aktion:{aktiv:false,text:''},hero:{titel:'',text:'',bild:''}};return{aktion:set.aktion,hero:set.hero,produkte:(p.data||[]).map(r=>({...r,preis:+r.preis,aktion:+r.aktion||0,farben:r.farben||[],bild:''}))}}
function isDE(){return true}
function trackVisit(){SB.from('visits').insert({path:location.pathname.split('/').pop()||'index'}).then(()=>{})}
function stepOf(o){return o.status||0}
function shade(h,a){const n=parseInt(h.slice(1),16);let r=(n>>16)+a,g=(n>>8&255)+a,b=(n&255)+a;const c=x=>Math.max(0,Math.min(255,x));return'#'+((1<<24)+(c(r)<<16)+(c(g)<<8)+c(b)).toString(16).slice(1)}
// Illustration (SVG) je Form, falls kein Foto hochgeladen
function svg(p){const c=p.farbe||'#8a7f72',d=shade(c,-35),l=shade(c,28);const f=p.form;let s='';
 if(f==='sofa')s=`<rect x="40" y="70" width="220" height="60" rx="14" fill="${c}"/><rect x="30" y="85" width="34" height="60" rx="12" fill="${d}"/><rect x="236" y="85" width="34" height="60" rx="12" fill="${d}"/><rect x="62" y="96" width="176" height="36" rx="10" fill="${l}"/><rect x="48" y="60" width="204" height="44" rx="16" fill="${c}"/><rect x="60" y="145" width="8" height="12" fill="#3a2f28"/><rect x="232" y="145" width="8" height="12" fill="#3a2f28"/>`;
 else if(f==='eck')s=`<rect x="30" y="64" width="240" height="46" rx="14" fill="${c}"/><rect x="30" y="64" width="64" height="94" rx="14" fill="${d}"/><rect x="90" y="96" width="170" height="40" rx="10" fill="${l}"/><rect x="40" y="108" width="52" height="40" rx="10" fill="${c}"/><rect x="262" y="76" width="22" height="64" rx="10" fill="${d}"/><rect x="44" y="156" width="8" height="10" fill="#3a2f28"/><rect x="250" y="146" width="8" height="10" fill="#3a2f28"/>`;
 else if(f==='sessel')s=`<rect x="92" y="38" width="116" height="92" rx="34" fill="${c}"/><rect x="72" y="80" width="30" height="62" rx="12" fill="${d}"/><rect x="198" y="80" width="30" height="62" rx="12" fill="${d}"/><rect x="100" y="104" width="100" height="34" rx="10" fill="${l}"/><rect x="102" y="146" width="7" height="16" fill="#3a2f28"/><rect x="191" y="146" width="7" height="16" fill="#3a2f28"/>`;
 else if(f==='bett')s=`<rect x="44" y="40" width="212" height="60" rx="12" fill="${d}"/><rect x="40" y="96" width="220" height="46" rx="8" fill="${c}"/><rect x="54" y="84" width="92" height="26" rx="10" fill="${l}"/><rect x="154" y="84" width="92" height="26" rx="10" fill="${l}"/><rect x="40" y="142" width="10" height="16" fill="#3a2f28"/><rect x="250" y="142" width="10" height="16" fill="#3a2f28"/>`;
 else s=`<ellipse cx="150" cy="92" rx="62" ry="30" fill="${c}"/><rect x="88" y="92" width="124" height="38" rx="10" fill="${c}"/><ellipse cx="150" cy="92" rx="62" ry="26" fill="${l}"/><rect x="104" y="128" width="7" height="22" fill="#3a2f28"/><rect x="190" y="128" width="7" height="22" fill="#3a2f28"/>`;
 return `<svg viewBox="0 0 300 180" role="img" aria-label="${esc(p.name)}"><ellipse cx="150" cy="166" rx="120" ry="7" fill="rgba(0,0,0,.12)"/>${s}</svg>`}
function fImg(p,ci){const f=(p.farben||[])[ci||0];if(f&&f.bild)return f.bild;if(p.bild)return p.bild;return ''}
function bildHTML(p,ci){const u=fImg(p,ci);if(u)return `<img src="${esc(safeUrl(u))}" alt="${esc(p.name)}" loading="lazy">`;return svg({...p,farbe:((p.farben||[])[ci||0]||{}).hex||'#8a7f72'})}
// Farbe ohne eigenes Foto: Stoff per Canvas umfärben. Das Möbel wird über den Unterschied zum Hintergrund gefunden,
// so funktioniert es auch bei hellen Sofas. Die Durchschnittsfarbe entspricht danach genau der gewählten Farbe.
function hsl(hex){const n=parseInt(hex.slice(1),16);return rgb2hsl(n>>16,n>>8&255,n&255)}
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const m=Math.max(r,g,b),n=Math.min(r,g,b),l=(m+n)/2;let h=0,s=0;if(m!==n){const d=m-n;s=l>.5?d/(2-m-n):d/(m+n);h=m===r?(g-b)/d+(g<b?6:0):m===g?(b-r)/d+2:(r-g)/d+4;h/=6}return[h,s,l]}
function hsl2rgb(h,s,l){const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p};if(!s)return[l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return[f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255]}
function loadImg(src,cb){const im=new Image();im.crossOrigin='anonymous';im.onload=()=>cb(im);im.onerror=()=>cb(null);im.src=src}
function maskOf(a,w,h){const px=(x,y)=>{const i=(y*w+x)*4;return[a[i],a[i+1],a[i+2]]};const pts=[[2,2],[w-3,2],[Math.floor(w/2),2],[2,Math.floor(h*.3)],[w-3,Math.floor(h*.3)],[2,h-3],[w-3,h-3]];let bg=[0,0,0];pts.forEach(p=>{const c=px(p[0],p[1]);bg=bg.map((v,k)=>v+c[k]/pts.length)});
 const m=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const d=Math.abs(a[i]-bg[0])+Math.abs(a[i+1]-bg[1])+Math.abs(a[i+2]-bg[2]);if(d>70&&y<h*.88)m[y*w+x]=1}return m}
const COLCACHE={};
function realHex(src,cb){if(COLCACHE[src])return cb(COLCACHE[src]);loadImg(src,im=>{if(!im)return cb(null);const w=120,h=Math.round(120*im.height/im.width),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(im,0,0,w,h);let d;try{d=x.getImageData(0,0,w,h).data}catch(e){return cb(null)}const m=maskOf(d,w,h);let r=0,g=0,b=0,n=0;for(let i=0;i<w*h;i++)if(m[i]){r+=d[i*4];g+=d[i*4+1];b+=d[i*4+2];n++}if(n<50)return cb(null);const hx='#'+[r/n,g/n,b/n].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');COLCACHE[src]=hx;cb(hx)})}
function recolor(src,hex,cb){loadImg(src,im=>{if(!im)return cb(src);const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);let id;try{id=x.getImageData(0,0,c.width,c.height)}catch(e){return cb(src)}const a=id.data,w=c.width,h=c.height;const m=maskOf(a,w,h);
 let sh=0,ss=0,sl=0,n=0;for(let i=0;i<w*h;i++)if(m[i]){const q=rgb2hsl(a[i*4],a[i*4+1],a[i*4+2]);ss+=q[1];sl+=q[2];n++}ss/=n||1;sl/=n||1;const t=hsl(hex);const kl=Math.max(.35,Math.min(3.8,t[2]/(sl||.5)));
 for(let i=0;i<w*h;i++)if(m[i]){const q=rgb2hsl(a[i*4],a[i*4+1],a[i*4+2]);const l=Math.max(0,Math.min(1,q[2]*kl));const s=Math.max(0,Math.min(1,t[1]*(.55+.45*(q[1]/(ss||.2)))));const o=hsl2rgb(t[0],s,l);a[i*4]=o[0];a[i*4+1]=o[1];a[i*4+2]=o[2]}
 x.putImageData(id,0,0);cb(c.toDataURL('image/jpeg',.88))})}
function preisHTML(p){return p.aktion?`<span style="color:#b3261e">${p.aktion.toLocaleString('de-DE')} €</span> <s style="color:var(--mut);font-size:14px;font-weight:400">${p.preis.toLocaleString('de-DE')} €</s>`:`${p.preis.toLocaleString('de-DE')} €`}
function preisNum(p){return p.aktion||p.preis}
