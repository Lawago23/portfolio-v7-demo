// Gemeinsamer Datenspeicher (Demo: localStorage; Produktiv: Server/CMS)
const KEY='polster_demo_v2';
const DEFAULT={
 aktion:{aktiv:true,text:'Frühjahrsaktion: 15 % auf alle Polsterservice-Aufträge bis 31.03.',link:'#polsterei'},
 hero:{titel:'Polstermöbel, die zu Ihnen passen.',text:'Sofas, Sessel und Betten aus unserer Ausstellung – und die eigene Polsterei für Neubezug und Reparatur.',bild:'img/hero.jpg'},
 produkte:[
  {id:1,name:'Sofa Lindau 3-Sitzer',kat:'Sofas',preis:1290,farbe:'#6b7f6a',form:'sofa',neu:true,bild:''},
  {id:2,name:'Sofa Arnsberg 2-Sitzer',kat:'Sofas',preis:890,farbe:'#9a6b4f',form:'sofa',neu:false,bild:''},
  {id:3,name:'Ecksofa Kassel',kat:'Ecksofas',preis:1890,farbe:'#4d5a6b',form:'eck',neu:true,bild:''},
  {id:4,name:'Ecksofa Weimar mit Bettfunktion',kat:'Ecksofas',preis:2190,farbe:'#8a8578',form:'eck',neu:false,bild:''},
  {id:5,name:'Ohrensessel Rudolstadt',kat:'Sessel',preis:540,farbe:'#a24b3c',form:'sessel',neu:false,bild:''},
  {id:6,name:'Relaxsessel Gera',kat:'Sessel',preis:690,farbe:'#3f4a44',form:'sessel',neu:true,bild:''},
  {id:7,name:'Polsterbett Jena 180×200',kat:'Betten',preis:1190,farbe:'#b3a898',form:'bett',neu:false,bild:''},
  {id:8,name:'Hocker Pößneck',kat:'Sessel',preis:190,farbe:'#c4a05a',form:'hocker',neu:false,bild:''}
 ],
 visits:[]
};
const FILIALEN=['Saalfeld (Musterstraße 1)','Rudolstadt (Beispielweg 5)'];
const STEPS=['Bestellung eingegangen','Wird vorbereitet','Versandt','In Zustellung','Zugestellt'];
function jl(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
const cart={get:()=>jl('polster_cart',[]),set:c=>localStorage.setItem('polster_cart',JSON.stringify(c))};
const user={get:()=>jl('polster_user',null),set:u=>localStorage.setItem('polster_user',JSON.stringify(u)),out:()=>localStorage.removeItem('polster_user')};
const orders={all:()=>jl('polster_orders',[]),add:o=>{const a=orders.all();a.unshift(o);localStorage.setItem('polster_orders',JSON.stringify(a))},save:a=>localStorage.setItem('polster_orders',JSON.stringify(a))};
// Demo-Tracking: Status schreitet je 20 Sekunden fort (echt: Versanddienstleister-API)
function stepOf(o){if(o.manual!=null)return o.manual;return Math.min(STEPS.length-1,Math.floor((Date.now()-o.t)/20000))}
function laden(){try{const r=JSON.parse(localStorage.getItem(KEY));if(r&&r.produkte)return r}catch(e){}return JSON.parse(JSON.stringify(DEFAULT))}
function speichern(d){localStorage.setItem(KEY,JSON.stringify(d))}
function reset(){localStorage.removeItem(KEY)}
function shade(h,a){const n=parseInt(h.slice(1),16);let r=(n>>16)+a,g=(n>>8&255)+a,b=(n&255)+a;const c=x=>Math.max(0,Math.min(255,x));return'#'+((1<<24)+(c(r)<<16)+(c(g)<<8)+c(b)).toString(16).slice(1)}
// Illustration (SVG) je Form, falls kein Foto hochgeladen
function svg(p){const c=p.farbe,d=shade(c,-35),l=shade(c,28);const f=p.form;let s='';
 if(f==='sofa')s=`<rect x="40" y="70" width="220" height="60" rx="14" fill="${c}"/><rect x="30" y="85" width="34" height="60" rx="12" fill="${d}"/><rect x="236" y="85" width="34" height="60" rx="12" fill="${d}"/><rect x="62" y="96" width="176" height="36" rx="10" fill="${l}"/><rect x="48" y="60" width="204" height="44" rx="16" fill="${c}"/><rect x="60" y="145" width="8" height="12" fill="#3a2f28"/><rect x="232" y="145" width="8" height="12" fill="#3a2f28"/>`;
 else if(f==='eck')s=`<rect x="30" y="64" width="240" height="46" rx="14" fill="${c}"/><rect x="30" y="64" width="64" height="94" rx="14" fill="${d}"/><rect x="90" y="96" width="170" height="40" rx="10" fill="${l}"/><rect x="40" y="108" width="52" height="40" rx="10" fill="${c}"/><rect x="262" y="76" width="22" height="64" rx="10" fill="${d}"/><rect x="44" y="156" width="8" height="10" fill="#3a2f28"/><rect x="250" y="146" width="8" height="10" fill="#3a2f28"/>`;
 else if(f==='sessel')s=`<rect x="92" y="38" width="116" height="92" rx="34" fill="${c}"/><rect x="72" y="80" width="30" height="62" rx="12" fill="${d}"/><rect x="198" y="80" width="30" height="62" rx="12" fill="${d}"/><rect x="100" y="104" width="100" height="34" rx="10" fill="${l}"/><rect x="102" y="146" width="7" height="16" fill="#3a2f28"/><rect x="191" y="146" width="7" height="16" fill="#3a2f28"/>`;
 else if(f==='bett')s=`<rect x="44" y="40" width="212" height="60" rx="12" fill="${d}"/><rect x="40" y="96" width="220" height="46" rx="8" fill="${c}"/><rect x="54" y="84" width="92" height="26" rx="10" fill="${l}"/><rect x="154" y="84" width="92" height="26" rx="10" fill="${l}"/><rect x="40" y="142" width="10" height="16" fill="#3a2f28"/><rect x="250" y="142" width="10" height="16" fill="#3a2f28"/>`;
 else s=`<ellipse cx="150" cy="92" rx="62" ry="30" fill="${c}"/><rect x="88" y="92" width="124" height="38" rx="10" fill="${c}"/><ellipse cx="150" cy="92" rx="62" ry="26" fill="${l}"/><rect x="104" y="128" width="7" height="22" fill="#3a2f28"/><rect x="190" y="128" width="7" height="22" fill="#3a2f28"/>`;
 return `<svg viewBox="0 0 300 180" role="img" aria-label="${p.name}"><ellipse cx="150" cy="166" rx="120" ry="7" fill="rgba(0,0,0,.12)"/>${s}</svg>`}
function bildHTML(p){if(p.bild)return `<img src="${p.bild}" alt="${p.name}">`;if(p.id<=8){window.__sv=window.__sv||{};window.__sv[p.id]=svg(p);return `<img src="img/p${p.id}.jpg" alt="${p.name}" loading="lazy" onerror="this.outerHTML=window.__sv[${p.id}]">`}return svg(p)}
// Einwilligung (DSGVO): Statistik erst nach Klick
function consent(){try{return JSON.parse(localStorage.getItem('polster_consent'))}catch(e){return null}}
function trackVisit(){const d=laden();d.visits.push({t:Date.now(),p:location.pathname.split('/').pop()||'index'});if(d.visits.length>500)d.visits.shift();speichern(d)}
