/* =====================================================================
   KLAUSURAUFGABEN — Teil A (Windows, 50 P.) und Teil B (Word, 50 P.)
   Jede Aufgabe: id, teil, titel, auftrag[], sim {typ, def}, felder[]
   (optionale Antwortfelder), kriterien[] mit Punkten.
   Ein Kriterium hat entweder pruefe(simZustand, antworten) → true/false
   oder live(kontext) → true/false (wird während der Bearbeitung geprüft
   und gespeichert, sobald es einmal erfüllt war — z. B. Markierungen).
   ===================================================================== */
window.KL = window.KL || {};

(() => {
  "use strict";
  const { norm, simple } = KL.util;
  const fs = KL.fs;
  const D = fs.datei, Z = fs.zip;

  // Vergleich, der Leerzeichen-Kleinigkeiten verzeiht (doppelt, vor
  // Satzzeichen, am Rand)
  const glatt = (t) => norm(t).replace(/\s+/g, " ").replace(/ +([.,!?:;])/g, "$1").trim();
  const gleich = (a, b) => glatt(a) === glatt(b);
  const ohneLeer = (t) => norm(t).replace(/\s+/g, "");
  const text = (st) => glatt(st.absaetze.join("\n"));
  const zeilen = (st) => st.absaetze.map(glatt).filter(Boolean);
  const hatZeile = (st, z) => zeilen(st).some((x) => x === glatt(z));
  const offen = (st, app) => st.fenster[app] && st.fenster[app].offen;

  // Sucht im Teilbaum unter "pfad" nach einem Element mit diesem Namen
  function unter(state, pfad, name) {
    const start = fs.findPath(state, pfad);
    if (!start) return false;
    const walk = (id) => {
      const n = state.nodes[id];
      if (!n) return false;
      if (n.name === name && n.id !== start.id) return true;
      return (n.kinder || []).some(walk);
    };
    return walk(start.id);
  }
  const istOrdner = (state, pfad) => { const n = fs.findPath(state, pfad); return !!n && n.typ === "ordner"; };

  const A = [];
  const B = [];

  /* ================================================================
     TEIL A — WINDOWS
     ================================================================ */

  A.push({
    id: "A1", teil: "A", titel: "Fenster und Taskleiste",
    auftrag: [
      "Öffne den <b>Rechner</b> über das Startmenü.",
      "Minimiere das Fenster <b>Microsoft Edge</b>. Es soll geöffnet bleiben.",
      "Hole den minimierten <b>Editor</b> über die Taskleiste zurück auf den Bildschirm und <b>maximiere</b> ihn.",
      "Schließe <b>Paint</b>.",
      "Lies die Uhrzeit in der Taskleiste ab und trage sie unten ein.",
    ],
    sim: { typ: "fenster", def: { uhr: "10:47", fenster: [
      { app: "edge", zustand: "normal", x: 24, y: 16 },
      { app: "editor", zustand: "min", x: 90, y: 40 },
      { app: "paint", zustand: "normal", x: 230, y: 70 },
    ] } },
    felder: [{ id: "uhr", label: "Uhrzeit laut Taskleiste:", platzhalter: "z. B. 08:15" }],
    kriterien: [
      { text: "Rechner über das Startmenü geöffnet", punkte: 1, pruefe: (s) => offen(s, "rechner") && s.startGeoeffnet.includes("rechner") },
      { text: "Microsoft Edge minimiert (noch geöffnet)", punkte: 1, pruefe: (s) => offen(s, "edge") && s.fenster.edge.min },
      { text: "Editor wieder sichtbar", punkte: 1, pruefe: (s) => offen(s, "editor") && !s.fenster.editor.min },
      { text: "Editor maximiert", punkte: 1, pruefe: (s) => offen(s, "editor") && !s.fenster.editor.min && s.fenster.editor.max },
      { text: "Paint geschlossen", punkte: 1, pruefe: (s) => !offen(s, "paint") },
      { text: "Uhrzeit richtig abgelesen (10:47)", punkte: 1, pruefe: (s, a) => /^10\s*[:.]\s*47(\s*uhr)?$/i.test((a.uhr || "").trim()) },
    ],
  });

  A.push({
    id: "A2", teil: "A", titel: "Navigation im Datei-Explorer",
    auftrag: [
      "Öffne die Datei <b>Aufgabe_Prozent.docx</b>. Sie liegt hier: Dokumente › Schule › Mathe › Hausaufgaben.",
      "In welchem Ordner liegt die Datei <b>Vokabeln_Unit4.xlsx</b>? Trage den Namen dieses Ordners unten ein.",
      "Wechsle zum Schluss in den Ordner <b>Dokumente</b>. Der Explorer soll am Ende diesen Ordner anzeigen.",
    ],
    sim: { typ: "explorer", def: {
      start: "",
      dokumente: {
        Schule: {
          Deutsch: { "Gedicht_Herbst.docx": null, "Lesetagebuch.docx": null },
          Englisch: { "Essay_Entwurf.docx": null, Unit4: { "Vokabeln_Unit4.xlsx": null, "Grammatik_Unit4.pdf": null } },
          Mathe: { Hausaufgaben: { "Aufgabe_Brueche.docx": null, "Aufgabe_Prozent.docx": null }, "Formelsammlung.pdf": null },
        },
        Privat: { "Rezepte.docx": null },
        "Lebenslauf.docx": null,
      },
      downloads: { "Stundenplan.pdf": null },
      bilder: { "Ausflug.jpg": null },
    } },
    felder: [{ id: "ordner", label: "Ordner, in dem „Vokabeln_Unit4.xlsx“ liegt:", platzhalter: "Ordnername" }],
    kriterien: [
      { text: "Aufgabe_Prozent.docx geöffnet", punkte: 2, pruefe: (s) => s.geoeffnet.includes("Dokumente/Schule/Mathe/Hausaufgaben/Aufgabe_Prozent.docx") },
      { text: "Ordner von Vokabeln_Unit4.xlsx richtig angegeben (Unit4)", punkte: 1, pruefe: (s, a) => /^(.*[\\/›>]\s*)?unit\s?4$/i.test((a.ordner || "").trim()) },
      { text: "Explorer zeigt am Ende den Ordner Dokumente", punkte: 1, pruefe: (s) => s.cwd === "dokumente" },
    ],
  });

  A.push({
    id: "A3", teil: "A", titel: "Ordner verwalten",
    auftrag: [
      "Erstelle im Ordner „Dokumente“ einen neuen Ordner mit dem Namen <b>Bewerbungen</b>.",
      "Benenne den Ordner „Neuer Ordner“ in <b>Fotos Klassenfahrt</b> um.",
      "Lösche den Ordner <b>Alt_2023</b>.",
      "Stelle den Ordner <b>Rezepte</b> aus dem Papierkorb wieder her.",
    ],
    sim: { typ: "explorer", def: {
      start: "Dokumente",
      dokumente: {
        "Neuer Ordner": {},
        Alt_2023: { "Notizen_alt.txt": null, "Plan_alt.docx": null },
        "Schülerzeitung": { "Artikel.docx": null },
        "Bewerbung_Entwurf.docx": null,
      },
      papierkorb: {
        Rezepte: { von: "Dokumente", inhalt: { "Pizza.docx": null, "Waffeln.docx": null } },
        "Einkauf.txt": { von: "Desktop", inhalt: null },
      },
    } },
    kriterien: [
      { text: "Ordner Bewerbungen in Dokumente erstellt", punkte: 2, pruefe: (s) => istOrdner(s, "Dokumente/Bewerbungen") },
      { text: "Neuer Ordner in Fotos Klassenfahrt umbenannt", punkte: 2, pruefe: (s) => istOrdner(s, "Dokumente/Fotos Klassenfahrt") && !fs.existiert(s, "Dokumente/Neuer Ordner") },
      { text: "Ordner Alt_2023 gelöscht", punkte: 1, pruefe: (s) => !fs.existiert(s, "Dokumente/Alt_2023") },
      { text: "Ordner Rezepte wiederhergestellt", punkte: 1, pruefe: (s) => fs.existiert(s, "Dokumente/Rezepte/Pizza.docx") },
    ],
  });

  A.push({
    id: "A4", teil: "A", titel: "Dateien verwalten",
    auftrag: [
      "Verschiebe die drei Fotos <b>Foto1.jpg</b>, <b>Foto2.jpg</b> und <b>Foto3.jpg</b> in den Ordner <b>Bilder</b>. Er liegt im Ordner „Schülerzeitung“.",
      "Kopiere die Datei <b>Interview.docx</b> auf den <b>USB-Stick (E:)</b>. Sie soll zusätzlich im Ordner „Schülerzeitung“ bleiben.",
      "Lösche die Datei <b>Entwurf_alt.docx</b>.",
      "Benenne die Datei „Notizen.txt“ in <b>Ideenliste.txt</b> um.",
    ],
    sim: { typ: "explorer", def: {
      start: "Dokumente/Schülerzeitung",
      dokumente: {
        "Schülerzeitung": {
          Bilder: {}, Texte: { "Vorwort.docx": null },
          "Artikel_Sport.docx": null, "Interview.docx": null,
          "Foto1.jpg": null, "Foto2.jpg": null, "Foto3.jpg": null,
          "Notizen.txt": null, "Entwurf_alt.docx": null, "Titelseite.pptx": null,
        },
      },
      usb: { "Playlist.txt": null, "Präsentation_Bio.pptx": null },
    } },
    kriterien: [
      ...["Foto1.jpg", "Foto2.jpg", "Foto3.jpg"].map((f) => ({
        text: `${f} im Ordner Bilder`, punkte: 1,
        pruefe: (s) => fs.existiert(s, `Dokumente/Schülerzeitung/Bilder/${f}`) && !fs.existiert(s, `Dokumente/Schülerzeitung/${f}`),
      })),
      { text: "Interview.docx auf dem USB-Stick", punkte: 1, pruefe: (s) => unter(s, "USB", "Interview.docx") },
      { text: "Interview.docx im Ordner Schülerzeitung geblieben", punkte: 1, pruefe: (s) => fs.existiert(s, "Dokumente/Schülerzeitung/Interview.docx") },
      { text: "Entwurf_alt.docx gelöscht", punkte: 1, pruefe: (s) => !unter(s, "Dokumente", "Entwurf_alt.docx") },
      { text: "Notizen.txt in Ideenliste.txt umbenannt", punkte: 1, pruefe: (s) => fs.existiert(s, "Dokumente/Schülerzeitung/Ideenliste.txt") && !fs.existiert(s, "Dokumente/Schülerzeitung/Notizen.txt") },
    ],
  });

  A.push({
    id: "A5", teil: "A", titel: "Suchen, sortieren, überprüfen",
    auftrag: [
      "Sortiere die Dateien im Ordner „Downloads“ nach <b>Größe</b>, sodass die <b>größte Datei ganz oben</b> steht.",
      "Welche Datei im Ordner „Downloads“ ist die größte? Trage ihren Namen unten ein.",
      "Wann wurde die Datei <b>Stundenplan.pdf</b> (im Ordner „Downloads“) zuletzt geändert? Trage das Datum unten ein.",
      "Die Datei <b>Mietvertrag_Scan.pdf</b> liegt irgendwo im Ordner „Dokumente“. Finde sie und öffne sie.",
    ],
    sim: { typ: "explorer", def: {
      start: "Downloads",
      downloads: {
        "Stundenplan.pdf": D(184, "02.09.2026 07:45"),
        "Bewerbungsfoto.jpg": D(3120, "14.10.2026 18:02"),
        "Ferienvideo.mp4": D(48210, "21.07.2026 20:15"),
        "Rechnung_Handy.pdf": D(96, "05.10.2026 09:30"),
        "Setup_Lernprogramm.exe": D(25400, "11.09.2026 16:40"),
        "Vokabeltest.docx": D(31, "20.10.2026 12:10"),
        "Playlist.mp3": D(6400, "30.08.2026 21:05"),
        "Hausordnung.pdf": D(410, "01.09.2026 10:00"),
        "Präsentation_Klima.pptx": D(8800, "27.10.2026 15:22"),
        "Kochrezept.txt": D(3, "12.06.2026 17:45"),
      },
      dokumente: {
        Privat: {
          Wohnung: { Unterlagen: { "Mietvertrag_Scan.pdf": D(1450, "03.03.2026 11:20"), "Nebenkosten_2025.pdf": null } },
          "Urlaub.docx": null,
        },
        Schule: { "Zeugnis_Kopie.pdf": null, Projekte: { "Plakat.pptx": null } },
        "Lebenslauf.docx": null,
      },
    } },
    felder: [
      { id: "groesste", label: "Größte Datei in „Downloads“:", platzhalter: "Dateiname" },
      { id: "datum", label: "Änderungsdatum von „Stundenplan.pdf“:", platzhalter: "TT.MM.JJJJ" },
    ],
    kriterien: [
      { text: "Downloads nach Größe absteigend sortiert", punkte: 1, pruefe: (s) => s.sort.key === "groesse" && s.sort.dir === -1 },
      { text: "Größte Datei richtig benannt (Ferienvideo.mp4)", punkte: 1, pruefe: (s, a) => /^ferienvideo(\.mp4)?$/i.test((a.groesste || "").trim()) },
      { text: "Änderungsdatum richtig (02.09.2026)", punkte: 1, pruefe: (s, a) => /^0?2\.\s*0?9\.\s*(20)?26$/.test((a.datum || "").trim()) },
      { text: "Mietvertrag_Scan.pdf gefunden und geöffnet", punkte: 2, pruefe: (s) => s.geoeffnet.includes("Dokumente/Privat/Wohnung/Unterlagen/Mietvertrag_Scan.pdf") },
    ],
  });

  A.push({
    id: "A6", teil: "A", titel: "ZIP-Dateien und USB-Stick",
    auftrag: [
      "Entpacke die ZIP-Datei <b>Projektmaterial.zip</b> im Ordner „Downloads“ (Alle extrahieren).",
      "Kopiere die entpackte Datei <b>Logo.png</b> auf den <b>USB-Stick (E:)</b>.",
      "Erstelle aus dem Ordner <b>Präsentation</b> (im Ordner „Dokumente“) eine ZIP-Datei.",
      "Wirf den USB-Stick zum Schluss sicher aus.",
    ],
    sim: { typ: "explorer", def: {
      start: "Downloads",
      downloads: {
        "Projektmaterial.zip": Z(["Vorlage_Plakat.docx", "Logo.png", "Anleitung.pdf"], 2300, "28.10.2026 14:12"),
        "Stundenplan.pdf": null,
      },
      dokumente: { "Präsentation": { "Folien.pptx": null, "Notizen.docx": null, "Quellen.txt": null }, "Brief.docx": null },
      usb: { Backup_Fotos: { "IMG_001.jpg": null } },
    } },
    kriterien: [
      { text: "Projektmaterial.zip in Downloads entpackt", punkte: 1, pruefe: (s) => fs.findPath(s, "Downloads").kinder.some((id) => {
        const n = s.nodes[id];
        return n.typ === "ordner" && fs.kinderNamen(s, "Downloads/" + n.name).includes("Logo.png");
      }) },
      { text: "Logo.png auf den USB-Stick kopiert", punkte: 1, pruefe: (s) => unter(s, "USB", "Logo.png") },
      { text: "ZIP-Datei aus dem Ordner Präsentation erstellt", punkte: 1, pruefe: (s) => fs.findPath(s, "Dokumente").kinder.some((id) => {
        const n = s.nodes[id];
        return n.typ === "zip" && ((n.quelle || []).includes("Präsentation") || /^präsentation/i.test(n.name)) && (n.zipInhalt || []).includes("Folien.pptx");
      }) || unter(s, "Dokumente", "Präsentation.zip") },
      { text: "USB-Stick sicher ausgeworfen", punkte: 1, pruefe: (s) => s.usbAusgeworfen === true },
    ],
  });

  A.push({
    id: "A7", teil: "A", titel: "Speichern unter",
    auftrag: [
      "Öffne in Word über das Menü <b>Datei</b> den Dialog <b>Speichern unter</b>.",
      "Speichere das Dokument im Ordner <b>Dokumente › Bewerbungen</b>.",
      "Dateiname: <b>Lebenslauf_2026</b> — Dateityp: <b>PDF</b>.",
    ],
    sim: { typ: "speichern", def: {
      dokName: "Dokument1",
      text: ["Lebenslauf", "Persönliche Daten: Alex Beispiel, geboren 2008 in Monheim am Rhein", "Schulbildung: seit 2025 Weiterbildungskolleg", "Kenntnisse: Windows, Word, Teamarbeit"],
      fs: {
        dokumente: { Bewerbungen: { "Anschreiben_Bäckerei.docx": null }, Schule: { "Referat.docx": null }, Privat: {} },
        desktop: { "Notizen.txt": null }, downloads: { "Vorlage_Lebenslauf.docx": null },
      },
    } },
    kriterien: [
      { text: "Dateiname Lebenslauf_2026", punkte: 2, pruefe: (s) => !!s.gespeichert && s.gespeichert.name.replace(/\.(pdf|docx?)$/i, "").trim() === "Lebenslauf_2026" },
      { text: "Gespeichert im Ordner Dokumente › Bewerbungen", punkte: 1, pruefe: (s) => !!s.gespeichert && s.gespeichert.ordner === "Dokumente/Bewerbungen" },
      { text: "Dateityp PDF gewählt", punkte: 1, pruefe: (s) => !!s.gespeichert && /pdf/i.test(s.gespeichert.typ) },
    ],
  });

  A.push({
    id: "A8", teil: "A", titel: "Herunterladen und Hochladen",
    auftrag: [
      "Lade auf der Lernplattform die Datei <b>Gedichtsammlung.docx</b> aus dem Bereich „Material“ herunter.",
      "Lade bei „Abgabe“ deine Datei <b>Gedichtanalyse_final.docx</b> hoch. Sie liegt im Ordner Dokumente › Deutsch.",
    ],
    sim: { typ: "browser", def: {
      url: "lernplattform.schule-beispiel.de/kurs/deutsch-9b",
      kurs: "Deutsch – Kurs 9b",
      aufgabeTitel: "Gedichtanalyse",
      material: [
        { name: "Arbeitsblatt_Lyrik.pdf", groesse: "240 KB" },
        { name: "Gedichtsammlung.docx", groesse: "85 KB" },
        { name: "Bildmaterial.zip", groesse: "4,1 MB" },
      ],
      fs: {
        dokumente: {
          Deutsch: { "Gedichtanalyse_Entwurf.docx": null, "Gedichtanalyse_final.docx": null, "Notizen_Gedicht.txt": null },
          Mathe: { "Gedichtanalyse_final.docx": null },
          "Gedichtanalyse_alt.docx": null,
        },
        downloads: { "Stundenplan.pdf": null },
      },
    } },
    kriterien: [
      { text: "Gedichtsammlung.docx heruntergeladen", punkte: 1, pruefe: (s) => s.downloads.includes("Gedichtsammlung.docx") },
      { text: "Richtige Datei (Dokumente › Deutsch › Gedichtanalyse_final.docx) hochgeladen", punkte: 2, pruefe: (s) => !!s.hochgeladen && s.hochgeladen.pfad === "Dokumente/Deutsch/Gedichtanalyse_final.docx" },
    ],
  });

  const QUIZ = [
    { id: "q1", text: "Welche Art von Datei ist „Haushaltsplan.xlsx“?", richtig: "a", optionen: [
      { id: "a", text: "Eine Tabelle (Excel)" }, { id: "b", text: "Ein Textdokument (Word)" }, { id: "c", text: "Eine Präsentation (PowerPoint)" }, { id: "d", text: "Ein Bild" }] },
    { id: "q2", text: "Pfad: <code>C:\\Benutzer\\Lea\\Dokumente\\Schule\\Bio.docx</code> — In welchem Ordner liegt „Bio.docx“ direkt?", richtig: "a", optionen: [
      { id: "a", text: "Schule" }, { id: "b", text: "Dokumente" }, { id: "c", text: "Lea" }, { id: "d", text: "C:" }] },
    { id: "q3", text: "Welche Angabe ist die größte Datenmenge?", richtig: "a", optionen: [
      { id: "a", text: "1 GB" }, { id: "b", text: "800 MB" }, { id: "c", text: "900.000 KB" }, { id: "d", text: "0,5 GB" }] },
    { id: "q4", text: "Welches Passwort ist am sichersten?", richtig: "a", optionen: [
      { id: "a", text: "k7#Rm!q2Vz&9pT" }, { id: "b", text: "Sommer2026" }, { id: "c", text: "123456789" }, { id: "d", text: "Lea2010!" }] },
    { id: "q5", text: "Du bekommst eine E-Mail: „Ihr Konto wird in 24 Stunden gesperrt! Klicken Sie hier und geben Sie Ihr Passwort ein.“ Was machst du?", richtig: "a", optionen: [
      { id: "a", text: "Nicht auf den Link klicken, die Nachricht löschen oder melden" }, { id: "b", text: "Sofort klicken, damit das Konto nicht gesperrt wird" },
      { id: "c", text: "Antworten und nach dem Grund fragen" }, { id: "d", text: "Das Passwort per E-Mail zurückschicken" }] },
    { id: "q6", text: "Du löschst eine Datei auf der Festplatte mit der Entf-Taste. Was passiert normalerweise?", richtig: "a", optionen: [
      { id: "a", text: "Sie kommt in den Papierkorb und kann wiederhergestellt werden" }, { id: "b", text: "Sie ist sofort für immer weg" },
      { id: "c", text: "Sie wird auf den USB-Stick verschoben" }, { id: "d", text: "Sie wird in den Ordner „Downloads“ verschoben" }] },
    { id: "q7", text: "Ein Programm zeigt „Keine Rückmeldung“. Was ist der sinnvollste erste Schritt?", richtig: "a", optionen: [
      { id: "a", text: "Kurz warten und das Programm dann über den Task-Manager beenden" }, { id: "b", text: "Sofort den Stecker ziehen" },
      { id: "c", text: "Windows neu installieren" }, { id: "d", text: "Immer wieder schnell auf das Fenster klicken" }] },
    { id: "q8", text: "Beim Öffnen erscheint: „Die Datei wurde nicht gefunden.“ Was ist die wahrscheinlichste Ursache?", richtig: "a", optionen: [
      { id: "a", text: "Die Datei wurde verschoben, umbenannt oder gelöscht" }, { id: "b", text: "Der Bildschirm ist defekt" },
      { id: "c", text: "Die Tastatur ist nicht angeschlossen" }, { id: "d", text: "Der Computer ist zu laut" }] },
    { id: "q9", text: "Warum ist ein Backup (Sicherungskopie) wichtig?", richtig: "a", optionen: [
      { id: "a", text: "Damit Daten bei Defekt, Verlust oder Schadsoftware nicht verloren sind" }, { id: "b", text: "Damit der Computer schneller startet" },
      { id: "c", text: "Damit Dateien weniger Speicherplatz brauchen" }, { id: "d", text: "Damit niemand die Dateien lesen kann" }] },
    { id: "q10", text: "Eine Datei ist freigegeben mit „Jeder mit dem Link: Kann bearbeiten“. Was bedeutet das?", richtig: "a", optionen: [
      { id: "a", text: "Jede Person mit dem Link kann die Datei ansehen und verändern" }, { id: "b", text: "Nur du kannst die Datei öffnen" },
      { id: "c", text: "Andere können die Datei nur lesen" }, { id: "d", text: "Die Datei wurde gelöscht" }] },
    { id: "q11", text: "Du schließt Word und siehst: „Möchten Sie die Änderungen speichern?“ Du willst deine Arbeit behalten. Was klickst du?", richtig: "a", optionen: [
      { id: "a", text: "Speichern" }, { id: "b", text: "Nicht speichern" }, { id: "c", text: "Abbrechen" }, { id: "d", text: "Hilfe" }] },
  ];
  A.push({
    id: "A9", teil: "A", titel: "Wissensfragen",
    auftrag: ["Wähle bei jeder Frage die <b>eine</b> richtige Antwort aus."],
    sim: { typ: "quiz", def: { fragen: QUIZ } },
    kriterien: QUIZ.map((q, i) => ({
      text: `Frage ${i + 1}: ${q.text.replace(/<[^>]+>/g, "")}`, punkte: 1,
      pruefe: (s) => s.antworten[q.id] === q.richtig,
    })),
  });

  /* ================================================================
     TEIL B — WORD-TEXTBEARBEITUNG
     ================================================================ */

  const B1_TEXT = [
    "Die neue Ausgabe der Schülerzeitung liegt ab Freitag in der Bibliothek aus.",
    "Alle Artikel müssen bis Mittwoch fertig sein.",
    "Bei Fragen hilft die Redaktion gerne weiter.",
  ];
  B.push({
    id: "B1", teil: "B", titel: "Markieren mit der Maus",
    auftrag: [
      "Markiere das Wort <b>Bibliothek</b> mit einem <b>Doppelklick</b>.",
      "Markiere den gesamten <b>zweiten Absatz</b> mit einem <b>Dreifachklick</b>.",
    ],
    hinweis: "Diese Aufgabe wird mit der Maus gelöst. Der Text muss nicht verändert werden.",
    sim: { typ: "word", def: { dokName: "Schülerzeitung", absaetze: B1_TEXT } },
    kriterien: [
      { text: "Wort „Bibliothek“ mit der Maus markiert", punkte: 2, live: (c) => c.methode === "maus" && c.markiert === "Bibliothek" },
      { text: "Zweiten Absatz mit der Maus markiert", punkte: 2, live: (c) => c.methode === "maus" && glatt(c.markiert) === glatt(B1_TEXT[1]) },
    ],
  });

  const B2_TEXT = ["Der Workshop beginnt am Montag um neun Uhr im Raum 204.", "Bitte bringt einen Laptop und gute Laune mit."];
  B.push({
    id: "B2", teil: "B", titel: "Markieren mit der Tastatur",
    auftrag: [
      "Setze den Cursor direkt vor „Montag“. Markiere mit <b>Strg + Umschalt + Pfeil rechts</b> genau die Wörter <b>Montag um</b>.",
      "Setze den Cursor im zweiten Absatz direkt vor „gute“. Markiere mit <b>Umschalt + Ende</b> den Rest der Zeile („gute Laune mit.“).",
      "Markiere mit <b>Strg + A</b> den gesamten Text.",
    ],
    hinweis: "Den Cursor darfst du mit der Maus setzen. Das Markieren selbst erfolgt mit der Tastatur.",
    sim: { typ: "word", def: { dokName: "Workshop", absaetze: B2_TEXT } },
    kriterien: [
      { text: "„Montag um“ mit der Tastatur markiert", punkte: 2, live: (c) => c.methode === "tastatur" && glatt(c.markiert) === "Montag um" },
      { text: "„gute Laune mit.“ mit der Tastatur markiert", punkte: 2, live: (c) => c.methode === "tastatur" && glatt(c.markiert) === "gute Laune mit." },
      { text: "Gesamten Text mit der Tastatur markiert", punkte: 2, live: (c) => c.methode === "tastatur" && glatt(c.markiert) === glatt(c.text) && c.text.length > 20 },
    ],
  });

  B.push({
    id: "B3", teil: "B", titel: "Cursor springen und Text ergänzen",
    auftrag: [
      "Springe mit <b>Strg + Ende</b> an das Ende des Dokuments. Ergänze dort den Satz: <b>Bitte denken Sie an Sportkleidung.</b> (mit einem Leerzeichen davor)",
      "Ergänze im zweiten Absatz vor „Sportfest“ das Wort <b>jährliches</b>.",
    ],
    sim: { typ: "word", def: { dokName: "Elternbrief", absaetze: ["Liebe Eltern,", "am Donnerstag findet unser Sportfest auf dem Schulhof statt.", "Beginn ist um 8 Uhr."] } },
    kriterien: [
      { text: "Strg + Ende verwendet", punkte: 1, pruefe: (s) => s.tasten.includes("strg+end") },
      { text: "Satz am Dokumentende ergänzt", punkte: 2, pruefe: (s) => hatZeile(s, "Beginn ist um 8 Uhr. Bitte denken Sie an Sportkleidung.") },
      { text: "„jährliches“ vor „Sportfest“ ergänzt", punkte: 1, pruefe: (s) => hatZeile(s, "am Donnerstag findet unser jährliches Sportfest auf dem Schulhof statt.") },
    ],
  });

  const B4_ZIEL = "Das Konzert beginnt um 18 Uhr in der Aula.\nDer Eintritt kostet drei Euro.\nWir freuen uns sehr auf euch!";
  B.push({
    id: "B4", teil: "B", titel: "Überschreiben und Löschen",
    auftrag: [
      "Korrigiere die Tippfehler „Konzertt“ (richtig: <b>Konzert</b>) und „Aulla“ (richtig: <b>Aula</b>).",
      "Ersetze „fünf“ durch <b>drei</b>, indem du das Wort markierst und überschreibst.",
      "Lösche das Wort <b>leider</b>.",
      "Lösche das doppelte <b>sehr</b>.",
    ],
    sim: { typ: "word", def: { dokName: "Konzert", absaetze: ["Das Konzertt beginnt um 18 Uhr in der Aulla.", "Der Eintritt kostet leider fünf Euro.", "Wir freuen uns sehr sehr auf euch!"] } },
    kriterien: [
      { text: "„Konzert“ korrigiert", punkte: 1, pruefe: (s) => /Das Konzert beginnt/.test(text(s)) && !/Konzertt/.test(text(s)) },
      { text: "„Aula“ korrigiert", punkte: 1, pruefe: (s) => /in der Aula\./.test(text(s)) && !/Aulla/.test(text(s)) },
      { text: "„fünf“ durch „drei“ ersetzt", punkte: 1, pruefe: (s) => /drei Euro/.test(text(s)) && !/fünf/.test(text(s)) },
      { text: "„leider“ gelöscht", punkte: 1, pruefe: (s) => /Eintritt kostet (drei|fünf) Euro/.test(text(s)) && !/leider/.test(text(s)) },
      { text: "Doppeltes „sehr“ gelöscht", punkte: 1, pruefe: (s) => /freuen uns sehr auf euch/.test(text(s)) && !/sehr sehr/.test(text(s)) },
      { text: "Gesamter Text ist am Ende fehlerfrei", punkte: 1, pruefe: (s) => gleich(s.absaetze.join("\n"), B4_ZIEL) },
    ],
  });

  const B5_START = "Unser Ausflug geht dieses Jahr nach Köln.";
  function b5Folge(s) {
    // Index-Folge im Verlauf: Bonn → (zurück zu) Köln → (wieder) Bonn
    const v = s.verlauf.map(glatt);
    const iBonn = v.findIndex((t) => /nach Bonn/.test(t));
    const iKoeln = iBonn < 0 ? -1 : v.findIndex((t, i) => i > iBonn && t === glatt(B5_START));
    const iWieder = iKoeln < 0 ? -1 : v.findIndex((t, i) => i > iKoeln && /nach Bonn/.test(t));
    return { iBonn, iKoeln, iWieder };
  }
  B.push({
    id: "B5", teil: "B", titel: "Rückgängig und Wiederholen",
    auftrag: [
      "Ersetze „Köln“ durch <b>Bonn</b>.",
      "Mache die Änderung mit <b>Rückgängig (Strg + Z)</b> wieder rückgängig, bis wieder „Köln“ dasteht.",
      "Stelle die Änderung mit <b>Wiederholen (Strg + Y)</b> wieder her, sodass wieder „Bonn“ dasteht.",
      "Ergänze am Ende den Satz: <b>Abfahrt ist um 7 Uhr.</b> (mit einem Leerzeichen davor)",
    ],
    sim: { typ: "word", def: { dokName: "Ausflug", absaetze: [B5_START] } },
    kriterien: [
      { text: "„Köln“ durch „Bonn“ ersetzt", punkte: 1, pruefe: (s) => b5Folge(s).iBonn >= 0 },
      { text: "Mit Rückgängig wieder zu „Köln“ zurückgekehrt", punkte: 1, pruefe: (s) => s.zaehler.rueckgaengig > 0 && b5Folge(s).iKoeln >= 0 },
      { text: "Mit Wiederholen „Bonn“ wiederhergestellt", punkte: 1, pruefe: (s) => s.zaehler.wiederholen > 0 && b5Folge(s).iWieder >= 0 },
      { text: "Endtext korrekt (… nach Bonn. Abfahrt ist um 7 Uhr.)", punkte: 1, pruefe: (s) => gleich(s.absaetze.join("\n"), "Unser Ausflug geht dieses Jahr nach Bonn. Abfahrt ist um 7 Uhr.") },
    ],
  });

  B.push({
    id: "B6", teil: "B", titel: "Ausschneiden und Einfügen",
    auftrag: [
      "Verschiebe mit <b>Ausschneiden und Einfügen</b> den Ausdruck „um 8 Uhr“. Der erste Satz soll lauten: <b>Wir treffen uns um 8 Uhr vor der Schule.</b>",
      "Verschiebe ebenso das Wort „ungefähr“. Der zweite Satz soll lauten: <b>Die Busfahrt dauert ungefähr eine Stunde.</b>",
    ],
    sim: { typ: "word", def: { dokName: "Treffpunkt", absaetze: ["Wir treffen uns vor der Schule um 8 Uhr.", "Die Busfahrt dauert eine Stunde ungefähr."] } },
    kriterien: [
      { text: "Erster Satz richtig umgestellt", punkte: 1, pruefe: (s) => hatZeile(s, "Wir treffen uns um 8 Uhr vor der Schule.") },
      { text: "Zweiter Satz richtig umgestellt", punkte: 1, pruefe: (s) => hatZeile(s, "Die Busfahrt dauert ungefähr eine Stunde.") },
      { text: "Ausschneiden verwendet (mind. 2×)", punkte: 1, pruefe: (s) => s.zaehler.ausschneiden >= 2 },
      { text: "Einfügen verwendet (mind. 2×)", punkte: 1, pruefe: (s) => s.zaehler.einfuegen >= 2 },
    ],
  });

  B.push({
    id: "B7", teil: "B", titel: "Kopieren und Einfügen",
    auftrag: [
      "Kopiere den Ausdruck <b>Haupteingang am Rathaus</b> aus der ersten Zeile.",
      "Füge ihn am Ende der zweiten und am Ende der dritten Zeile ein (jeweils mit einem Leerzeichen nach dem Doppelpunkt).",
      "Die erste Zeile bleibt unverändert.",
    ],
    sim: { typ: "word", def: { dokName: "Treffpunkte", absaetze: ["Treffpunkt: Haupteingang am Rathaus", "Samstag – Treffpunkt:", "Sonntag – Treffpunkt:"] } },
    kriterien: [
      { text: "Zweite Zeile ergänzt", punkte: 1, pruefe: (s) => s.absaetze.some((z) => ohneLeer(z) === ohneLeer("Samstag – Treffpunkt: Haupteingang am Rathaus")) },
      { text: "Dritte Zeile ergänzt", punkte: 1, pruefe: (s) => s.absaetze.some((z) => ohneLeer(z) === ohneLeer("Sonntag – Treffpunkt: Haupteingang am Rathaus")) },
      { text: "Erste Zeile unverändert", punkte: 1, pruefe: (s) => s.absaetze.some((z) => ohneLeer(z) === ohneLeer("Treffpunkt: Haupteingang am Rathaus")) },
      { text: "Kopieren und Einfügen verwendet", punkte: 1, pruefe: (s) => s.zaehler.kopieren >= 1 && s.zaehler.einfuegen >= 2 },
    ],
  });

  const B8_ZIEL = [
    "Hallo Frau Becker,",
    "vielen Dank für Ihre schnelle Antwort.",
    "Ich kann am Montag leider nicht zum Termin kommen, weil ich eine Prüfung habe.",
    "Passt Ihnen auch der Donnerstag um 14 Uhr? Alternativ ginge auch Freitag.",
    "Viele Grüße",
    "Tim Wagner",
  ].join("\n");
  B.push({
    id: "B8", teil: "B", titel: "Praxisaufgabe: E-Mail überarbeiten",
    auftrag: [
      "Schreibe „ihre“ im zweiten Absatz groß: <b>Ihre</b>.",
      "Korrigiere „Termn“ zu <b>Termin</b>.",
      "Lösche das doppelte <b>leider</b>.",
      "Ändere „ein Prüfung“ zu <b>eine Prüfung</b>.",
      "Ersetze „Dienstag“ durch <b>Montag</b>.",
      "Ergänze am Ende des vierten Absatzes den Satz: <b>Alternativ ginge auch Freitag.</b> (mit einem Leerzeichen davor)",
      "Korrigiere „Grüsse“ zu <b>Grüße</b>.",
    ],
    sim: { typ: "word", def: { dokName: "Mail an Frau Becker", absaetze: [
      "Hallo Frau Becker,",
      "vielen Dank für ihre schnelle Antwort.",
      "Ich kann am Dienstag leider leider nicht zum Termn kommen, weil ich ein Prüfung habe.",
      "Passt Ihnen auch der Donnerstag um 14 Uhr?",
      "Viele Grüsse",
      "Tim Wagner",
    ] } },
    kriterien: [
      { text: "„Ihre“ großgeschrieben", punkte: 1, pruefe: (s) => /für Ihre schnelle/.test(text(s)) },
      { text: "„Termin“ korrigiert", punkte: 1, pruefe: (s) => /zum Termin kommen/.test(text(s)) && !/Termn/.test(text(s)) },
      { text: "Doppeltes „leider“ gelöscht", punkte: 1, pruefe: (s) => /leider nicht/.test(text(s)) && !/leider leider/.test(text(s)) },
      { text: "„eine Prüfung“ korrigiert", punkte: 1, pruefe: (s) => /eine Prüfung/.test(text(s)) && !/\bein Prüfung/.test(text(s)) },
      { text: "„Dienstag“ durch „Montag“ ersetzt", punkte: 1, pruefe: (s) => /am Montag/.test(text(s)) && !/Dienstag/.test(text(s)) },
      { text: "Satz „Alternativ ginge auch Freitag.“ ergänzt", punkte: 1, pruefe: (s) => /14 Uhr\? Alternativ ginge auch Freitag\./.test(text(s)) },
      { text: "„Grüße“ korrigiert", punkte: 1, pruefe: (s) => /Viele Grüße/.test(text(s)) },
      { text: "Endfassung vollständig korrekt", punkte: 2, pruefe: (s) => gleich(s.absaetze.join("\n"), B8_ZIEL) },
    ],
  });

  const B9_ZIEL = [
    "Einladung zum Elternabend am 12. November",
    "Der Elternabend findet am 12. November um 18:30 Uhr in der Mensa statt.",
    "Wir sprechen über die Klassenfahrt und das Halbjahreszeugnis.",
    "Bitte geben Sie bis zum 9. November Bescheid.",
    "Ihr Klassenteam",
  ].join("\n");
  B.push({
    id: "B9", teil: "B", titel: "Praxisaufgabe: Einladung überarbeiten",
    auftrag: [
      "Ersetze „19 Uhr“ durch <b>18:30 Uhr</b>.",
      "Ergänze vor „statt“ die Angabe <b>in der Mensa</b> (… um 18:30 Uhr in der Mensa statt.).",
      "Kopiere „12. November“ aus dem zweiten Absatz und füge es am Ende der Überschrift ein. Die Überschrift soll lauten: <b>Einladung zum Elternabend am 12. November</b>",
      "Ersetze im letzten Absatz „5. November“ durch <b>9. November</b>.",
      "Lösche im letzten Absatz das Wort <b>unbedingt</b>.",
      "Füge am Ende des Dokuments eine <b>neue Zeile</b> (Enter) mit dem Text <b>Ihr Klassenteam</b> hinzu.",
    ],
    sim: { typ: "word", def: { dokName: "Einladung Elternabend", absaetze: [
      "Einladung zum Elternabend",
      "Der Elternabend findet am 12. November um 19 Uhr statt.",
      "Wir sprechen über die Klassenfahrt und das Halbjahreszeugnis.",
      "Bitte geben Sie unbedingt bis zum 5. November Bescheid.",
    ] } },
    kriterien: [
      { text: "Uhrzeit 18:30 Uhr eingetragen", punkte: 1, pruefe: (s) => /um 18:30 Uhr/.test(text(s)) && !/19 Uhr/.test(text(s)) },
      { text: "„in der Mensa“ ergänzt", punkte: 1, pruefe: (s) => /in der Mensa statt\./.test(text(s)) },
      { text: "Überschrift ergänzt", punkte: 1, pruefe: (s) => hatZeile(s, "Einladung zum Elternabend am 12. November") },
      { text: "Kopieren und Einfügen verwendet", punkte: 1, pruefe: (s) => s.zaehler.kopieren >= 1 && s.zaehler.einfuegen >= 1 },
      { text: "Datum 9. November eingetragen", punkte: 1, pruefe: (s) => /bis zum 9\. November/.test(text(s)) && !/5\. November/.test(text(s)) },
      { text: "„unbedingt“ gelöscht", punkte: 1, pruefe: (s) => /Sie bis zum/.test(text(s)) && !/unbedingt/.test(text(s)) },
      { text: "Neue Zeile „Ihr Klassenteam“ am Ende", punkte: 1, pruefe: (s) => { const z = zeilen(s); return z[z.length - 1] === "Ihr Klassenteam"; } },
      { text: "Endfassung vollständig korrekt", punkte: 2, pruefe: (s) => gleich(s.absaetze.join("\n"), B9_ZIEL) },
    ],
  });

  // Punkte je Aufgabe aus den Kriterien ableiten
  [...A, ...B].forEach((t) => (t.punkte = t.kriterien.reduce((s, k) => s + k.punkte, 0)));

  KL.AUFGABEN = [...A, ...B];
  KL.TEILE = [
    { id: "A", titel: "Teil A · Windows" },
    { id: "B", titel: "Teil B · Word-Textbearbeitung" },
  ];

  // Bewertung einer Aufgabe aus ihrem gespeicherten Zustand
  // Nie bearbeitete Aufgaben ergeben 0 Punkte (auch Kriterien wie „Zeile
  // bleibt unverändert“ zählen nur, wenn die Aufgabe bearbeitet wurde).
  KL.bewerte = function (task, zustand) {
    const sim = zustand && zustand.beruehrt ? zustand.sim : null;
    const antw = (zustand && zustand.antworten) || {};
    const kriterien = task.kriterien.map((k, i) => {
      let ok = false;
      if (sim) {
        try { ok = k.live ? !!(sim.erreicht && sim.erreicht[i]) : !!k.pruefe(sim, antw); } catch (e) { ok = false; }
      }
      return { text: k.text, max: k.punkte, punkte: ok ? k.punkte : 0, ok };
    });
    return { punkte: kriterien.reduce((s, k) => s + k.punkte, 0), max: task.punkte, kriterien };
  };
})();
