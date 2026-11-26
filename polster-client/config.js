// frame-buster: Seite darf nicht in fremden Frames laufen (Clickjacking-Schutz)
if(window.top!==window.self){try{window.top.location=window.location}catch(e){document.documentElement.innerHTML=''}}
// Konfiguration des Kunden (Template): alles Kundenspezifische steht hier.
const CLIENT={
 name:'Polsterhaus Muster',rechtsform:'Einzelunternehmen',inhaber:'Max Mustermann',
 strasse:'Wrangelstraße 45',plz:'10997',ort:'Berlin',
 tel:'030 00000000',email:'info@polsterhaus-muster.example',
 ustid:'DE000000000',steuernr:'',kleinunternehmer:false,handelsregister:'',aufsicht:'',
 filialen:['Berlin-Kreuzberg (Wrangelstraße 45)','Berlin-Prenzlauer Berg (Dunckerstraße 30)'],
 oeffnung:'Mo–Fr 9–18 Uhr, Sa 9–13 Uhr',
 versand:'Lieferung ab 29 €, ab 1.500 € versandkostenfrei, Abholung kostenlos',
 widerruf:14,
 wa:'491510000000',
 neubezug:{typen:{'Sessel':280,'Stuhl (pro Stück)':90,'2-Sitzer-Sofa':650,'3-Sitzer-Sofa':850,'Ecksofa':1200,'Bank':500},stoffe:{'Standard-Stoff':1,'Premium-Stoff':1.25,'Samt':1.4,'Leder':1.9}},
 ratenkauf:false,
 demo:false
};
const SUPA_URL='https://jthmekehipiolsxtjavb.supabase.co',SUPA_KEY='sb_publishable__YUQh9Vgtda2nPwyxn-hTw_oMXZDe5-';
const BUILD='2026-11-26 07:00';

// Automatische Aktualisierung: lädt die Seite neu, wenn eine neuere Version online ist (kein manuelles Cache-Leeren nötig)
(async()=>{try{const t=await (await fetch('config.js?nc='+Date.now(),{cache:'no-store'})).text();const m=t.match(/BUILD='([^']+)'/);if(m&&m[1]!==BUILD&&!sessionStorage.getItem('rl_'+m[1])){sessionStorage.setItem('rl_'+m[1],'1');const u=new URL(location.href);u.searchParams.set('b',m[1]);location.replace(u.toString())}}catch(e){}})();

// Fehlerprotokoll: JavaScript-Fehler werden (begrenzt) an die Datenbank gemeldet, der Inhaber sieht sie im Admin unter „Sicherheit & Wartung“
(function(){let n=0;const send=m=>{if(n++>5)return;try{fetch(SUPA_URL+'/rest/v1/errors',{method:'POST',headers:{apikey:SUPA_KEY,'Content-Type':'application/json'},body:JSON.stringify({page:location.pathname.split('/').pop()||'index',msg:String(m).slice(0,400),ua:navigator.userAgent.slice(0,160)}),keepalive:true})}catch(e){}};
 window.addEventListener('error',e=>send((e.message||'error')+' @'+(e.filename||'').split('/').pop()+':'+(e.lineno||0)));window.addEventListener('unhandledrejection',e=>send('promise: '+((e.reason&&e.reason.message)||e.reason)))})();
