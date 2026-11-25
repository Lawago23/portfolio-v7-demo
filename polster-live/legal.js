// Rechtstexte als Vorlage. Aufbau angelehnt an übliche Händler-Seiten (Impressum, Datenschutz in 12 Abschnitten, AGB, Widerruf, Rückgabe).
// Der Wortlaut ist eigen formuliert; vor dem Echtbetrieb vom Händler bzw. einem Rechtsdienst (IT-Recht Kanzlei, eRecht24) prüfen lassen.
const C=CLIENT,adr=`${C.strasse}, ${C.plz} ${C.ort}`;
const hint=C.demo?'<p class="note">Demo-Text mit erfundenen Beispielangaben. Vorlage, keine Rechtsberatung. Vor dem Echtbetrieb prüfen lassen.</p>':'';
const L={
impressum:{t:'Impressum',h:()=>`${hint}<h3>Angaben gemäß § 5 DDG</h3><p><b>${C.name}</b><br>${C.rechtsform}, Inhaber: ${C.inhaber}<br>${adr}</p>
<h3>Kontakt</h3><p>Telefon: ${C.tel}<br>E-Mail: ${C.email}</p>
<h3>Umsatzsteuer</h3><p>Umsatzsteuer-Identifikationsnummer: ${C.ustid}</p>${C.handelsregister?`<h3>Handelsregister</h3><p>${C.handelsregister}</p>`:''}
<h3>Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)</h3><p>${C.inhaber}, ${adr}</p>
<h3>Verbraucherstreitbeilegung</h3><p>Wir sind weder bereit noch verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
<h3>Haftung für Links</h3><p>Für Inhalte externer Seiten, auf die wir verweisen, sind ausschließlich deren Betreiber verantwortlich.</p>`},
datenschutz:{t:'Datenschutzerklärung',h:()=>`${hint}
<h3>1. Worum es hier geht</h3><p>Diese Erklärung zeigt, welche personenbezogenen Daten wir beim Besuch dieser Seite und beim Einkauf verarbeiten und welche Rechte Sie haben.</p>
<h3>2. Verantwortlicher</h3><p>${C.name}, ${C.inhaber}, ${adr}, ${C.email}, Tel. ${C.tel}.</p>
<h3>3. Ihre Kontrolle</h3><p>Sie entscheiden, welche Angaben Sie machen. Die Auswahl zu optionalen Cookies können Sie jederzeit unter „Cookie-Einstellungen“ ändern.</p>
<h3>4. Welche Daten wir wann verarbeiten</h3><ul><li><b>Seitenaufruf:</b> technische Logdaten (IP-Adresse, Zeitpunkt, Browser) beim Hosting.</li><li><b>Konto:</b> Name, E-Mail, Passwort (verschlüsselt gespeichert).</li><li><b>Bestellung:</b> Name, Adresse, Telefon, Bestellinhalt, Zahlungsart, Status.</li><li><b>Musteranfrage und Beratungstermin:</b> Ihre Angaben aus dem Formular.</li><li><b>Bewertungen:</b> Name und Text, den Sie eingeben.</li></ul>
<h3>5. Zwecke und Rechtsgrundlagen</h3><p>Vertragsabwicklung (Art. 6 Abs. 1 lit. b DSGVO), gesetzliche Aufbewahrungspflichten (lit. c), berechtigtes Interesse an sicherem Betrieb (lit. f), Statistik nur mit Einwilligung (Art. 6 Abs. 1 lit. a, § 25 TDDDG).</p>
<h3>6. Cookies und lokale Speicherung</h3><p>Notwendig: Warenkorb, Anmeldung, Merkzettel, Ihre Cookie-Auswahl. Optional: anonyme Besucherzählung, erst nach Ihrer Einwilligung.</p>
<h3>7. Schutz Ihrer Daten</h3><p>Verschlüsselte Übertragung (HTTPS), Zugriffsregeln in der Datenbank, getrennter Admin-Zugang.</p>
<h3>8. Sicherheit und Missbrauchsvermeidung</h3><p>Wir verarbeiten Daten auch, um Angriffe und Missbrauch zu erkennen (Art. 6 Abs. 1 lit. f DSGVO).</p>
<h3>9. Empfänger und Drittländer</h3><p>Hosting der Seite: GitHub Pages (GitHub Inc., USA). Datenbank, Anmeldung und Bilder: Supabase. Zahlungsdienstleister und Versanddienstleister, sobald aktiviert. Übermittlungen in die USA stützen sich auf das EU-US Data Privacy Framework bzw. Standardvertragsklauseln.</p>
<h3>10. Speicherdauer</h3><p>Wir speichern Daten nur so lange, wie es für den Zweck nötig ist. Bestelldaten bis zum Ende der gesetzlichen Aufbewahrungsfristen (bis zu 10 Jahre), Anfragen bis zur Erledigung.</p>
<h3>11. Ihre Rechte</h3><p>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Widerruf einer Einwilligung. Beschwerde bei einer Datenschutz-Aufsichtsbehörde.</p>
<h3>12. Kontakt zum Datenschutz</h3><p>${C.email}</p>`},
agb:{t:'Allgemeine Geschäftsbedingungen',h:()=>`${hint}
<h3>1. Geltungsbereich</h3><p>Diese Bedingungen gelten für Bestellungen in diesem Online-Shop von ${C.name}.</p>
<h3>2. Vertragsschluss</h3><p>Die Darstellung der Waren ist unverbindlich. Mit „Kostenpflichtig bestellen“ geben Sie ein Angebot ab. Wir bestätigen den Eingang; der Vertrag kommt mit unserer Auftragsbestätigung oder Lieferung zustande.</p>
<h3>3. Preise und Versandkosten</h3><p>Alle Preise inkl. gesetzlicher Umsatzsteuer. ${C.versand}.</p>
<h3>4. Zahlung</h3><p>Kreditkarte, PayPal, Rechnung oder Barzahlung bei Abholung. Bei Rechnung ist der Betrag innerhalb von 14 Tagen nach Lieferung fällig.</p>
<h3>5. Lieferung und Abholung</h3><p>Die Lieferzeit steht bei jedem Möbelstück. Bei Abholung informieren wir Sie, sobald die Ware bereitsteht. Teillieferungen sind zulässig, wenn sie zumutbar sind.</p>
<h3>6. Eigentumsvorbehalt</h3><p>Die Ware bleibt bis zur vollständigen Zahlung unser Eigentum.</p>
<h3>7. Mängelrechte</h3><p>Es gelten die gesetzlichen Mängelrechte.</p>
<h3>8. Haftung</h3><p>Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper, Gesundheit. Bei einfacher Fahrlässigkeit nur für wesentliche Vertragspflichten und vorhersehbare Schäden.</p>
<h3>9. Anwendbares Recht</h3><p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts; zwingende Verbraucherschutzvorschriften Ihres Aufenthaltsstaates bleiben unberührt.</p>`},
widerruf:{t:'Widerrufsbelehrung',h:()=>`${hint}
<h3>Widerrufsrecht</h3><p>Sie haben das Recht, binnen ${C.widerruf} Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Frist beträgt ${C.widerruf} Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Ware erhalten haben.</p>
<p>Um Ihr Widerrufsrecht auszuüben, teilen Sie uns (${C.name}, ${adr}, E-Mail ${C.email}, Tel. ${C.tel}) mittels einer eindeutigen Erklärung Ihren Entschluss mit. Sie können das folgende Muster-Formular verwenden, es ist aber nicht vorgeschrieben.</p>
<h3>Folgen des Widerrufs</h3><p>Wir erstatten alle Zahlungen einschließlich Lieferkosten (ausgenommen Mehrkosten einer anderen als der günstigsten Standardlieferung) unverzüglich, spätestens binnen ${C.widerruf} Tagen ab Eingang Ihres Widerrufs. Wir können die Rückzahlung verweigern, bis wir die Ware zurückerhalten haben oder Sie den Nachweis der Rücksendung erbracht haben.</p>
<p>Die Waren sind unverzüglich, spätestens binnen ${C.widerruf} Tagen nach der Mitteilung des Widerrufs, an uns zurückzusenden oder zu übergeben. Die unmittelbaren Kosten der Rücksendung tragen Sie. Für einen Wertverlust haften Sie nur, wenn er auf einen zur Prüfung nicht notwendigen Umgang zurückzuführen ist.</p>
<h3>Ausschluss</h3><p>Kein Widerrufsrecht besteht bei Waren, die nach Kundenspezifikation angefertigt werden (z. B. Maßanfertigung, Neubezug nach Wunsch).</p>
<h3>Muster-Widerrufsformular</h3><p>An ${C.name}, ${adr}, ${C.email}: Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren: ______ . Bestellt am / erhalten am: ______ . Name: ______ . Anschrift: ______ . Datum, Unterschrift (nur bei Mitteilung auf Papier): ______</p>`},
rueckgabe:{t:'Rückgabe & Reklamation',h:()=>`${hint}
<h3>Rückgabe: So geht es</h3><p>Sie können Waren innerhalb der Widerrufsfrist von ${C.widerruf} Tagen zurückgeben. Wählen Sie: <b>Rückgabe im Geschäft</b> (${C.filialen.join(' oder ')}), <b>Abholung durch uns</b> (nach Absprache) oder <b>Rücksendung per Spedition</b>.</p>
<h3>Was Sie beachten sollten</h3><ul><li>Bitte Ware möglichst in der Originalverpackung zurückgeben.</li><li>Gebrauchsspuren über das Prüfen hinaus können den Erstattungsbetrag mindern.</li><li>Nach Maß angefertigte Möbel und Neubezüge sind vom Widerruf ausgenommen.</li></ul>
<h3>Reklamation</h3><p>Ist die Ware mangelhaft, melden Sie uns den Mangel mit Foto per E-Mail (${C.email}) oder im Geschäft. Es gelten die gesetzlichen Mängelrechte (Nacherfüllung, Rücktritt, Minderung).</p>
<h3>Häufige Fragen</h3><p><b>Wann bekomme ich mein Geld zurück?</b> Innerhalb von ${C.widerruf} Tagen nach Eingang Ihres Widerrufs.<br><b>Kann ich Stoffmuster testen?</b> Ja, kostenlos beim jeweiligen Möbelstück.</p>`}
};
(function(){const k=document.body.dataset.legal;if(!k||!L[k])return;document.title=L[k].t+' – '+C.name;document.getElementById('lg').innerHTML=`<p><a href="index.html">← zurück</a></p><h1>${L[k].t}</h1>`+L[k].h()})();
