// frame-buster: Seite darf nicht in fremden Frames laufen (Clickjacking-Schutz)
if(window.top!==window.self){try{window.top.location=window.location}catch(e){document.documentElement.innerHTML=''}}
// Konfiguration des Kunden (Template): alles Kundenspezifische steht hier.
const CLIENT={
 name:'Polsterhaus Muster',rechtsform:'Einzelunternehmen',inhaber:'Max Mustermann',
 strasse:'Wrangelstraße 45',plz:'10997',ort:'Berlin',
 tel:'030 00000000',email:'info@polsterhaus-muster.example',
 ustid:'DE000000000',handelsregister:'',aufsicht:'',
 filialen:['Berlin-Kreuzberg (Wrangelstraße 45)','Berlin-Prenzlauer Berg (Dunckerstraße 30)'],
 oeffnung:'Mo–Fr 9–18 Uhr, Sa 9–13 Uhr',
 versand:'Lieferung ab 29 €, ab 1.500 € versandkostenfrei, Abholung kostenlos',
 widerruf:14,
 wa:'491510000000',
 neubezug:{typen:{'Sessel':280,'Stuhl (pro Stück)':90,'2-Sitzer-Sofa':650,'3-Sitzer-Sofa':850,'Ecksofa':1200,'Bank':500},stoffe:{'Standard-Stoff':1,'Premium-Stoff':1.25,'Samt':1.4,'Leder':1.9}},
 ratenkauf:true,
 demo:true
};
const BUILD='2026-11-26 00:10';

// Automatische Aktualisierung: lädt die Seite neu, wenn eine neuere Version online ist (kein manuelles Cache-Leeren nötig)
(async()=>{try{const t=await (await fetch('config.js?nc='+Date.now(),{cache:'no-store'})).text();const m=t.match(/BUILD='([^']+)'/);if(m&&m[1]!==BUILD&&!sessionStorage.getItem('rl_'+m[1])){sessionStorage.setItem('rl_'+m[1],'1');const u=new URL(location.href);u.searchParams.set('b',m[1]);location.replace(u.toString())}}catch(e){}})();
