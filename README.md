# Klausur: Digitale Grundkompetenzen (Windows & Word)

Browserbasierte Klausur (90 Minuten, 100 Punkte) zu den Inhalten der Lern-Apps
**EDV-Grundkompetenzen**, **ms-word-lernapp-textedition** und
**ms-word-lernapp-textedition-2**. Alle Aufgaben sind neu. Die Klausur enthält
keine Erklärungen, keine Tipps und gibt während der Bearbeitung keine
Rückmeldung. Am Ende erzeugen die Schülerinnen und Schüler einen PDF-Bericht
und schicken ihn per E-Mail.

Statische Seite ohne Server, Konten, Tracking oder externe Inhalte: läuft
direkt auf GitHub Pages. Alle Dateien liegen flach im Hauptordner, damit sie
sich über „Add file → Upload files“ hochladen lassen.

## Inhalt

| Teil | Aufgabe | Punkte |
|---|---|---|
| A | A1 Fenster und Taskleiste (Startmenü, minimieren, maximieren, schließen, Uhrzeit) | 6 |
| A | A2 Navigation im Datei-Explorer | 4 |
| A | A3 Ordner verwalten (erstellen, umbenennen, löschen, wiederherstellen) | 6 |
| A | A4 Dateien verwalten (Mehrfachauswahl, verschieben, auf USB kopieren, löschen, umbenennen) | 7 |
| A | A5 Suchen, sortieren, Änderungsdatum ablesen | 5 |
| A | A6 ZIP entpacken und erstellen, USB-Stick auswerfen | 4 |
| A | A7 Speichern unter (Ort, Name, Dateityp) | 4 |
| A | A8 Herunterladen und Hochladen (Lernplattform) | 3 |
| A | A9 Wissensfragen (Dateitypen, Pfade, Größen, Passwörter, Phishing, Fehler, Backup, Freigaben) | 11 |
| B | B1 Markieren mit der Maus (Doppel-, Dreifachklick) | 4 |
| B | B2 Markieren mit der Tastatur (Strg+Umschalt+→, Umschalt+Ende, Strg+A) | 6 |
| B | B3 Cursor springen (Strg+Ende) und ergänzen | 4 |
| B | B4 Überschreiben und Löschen | 6 |
| B | B5 Rückgängig und Wiederholen | 4 |
| B | B6 Ausschneiden und Einfügen | 4 |
| B | B7 Kopieren und Einfügen | 4 |
| B | B8 Praxisaufgabe: E-Mail überarbeiten | 9 |
| B | B9 Praxisaufgabe: Einladung überarbeiten | 9 |

Jede Aufgabe wird über einzelne Kriterien mit Teilpunkten bewertet (siehe
`aufgaben.js`). Nicht bearbeitete Aufgaben ergeben 0 Punkte.

## Ablauf für die Lehrkraft

**Vorher**
1. In `config.js` den Wert `GEHEIMNIS` ändern (beliebige Zeichenfolge). Bei
   Bedarf auch Dauer, Notenschlüssel und Abgabehinweis anpassen.
2. Alle Dateien ins Repository hochladen, unter *Settings → Pages* „Deploy from
   branch → main → / (root)“ wählen.
3. Einmal selbst durchspielen. Mit `index.html?reset=1` lässt sich der
   gespeicherte Stand auf einem Gerät löschen.

**Während der Klausur**
- Der Stand wird laufend im Browser gespeichert. Ein Neuladen oder ein
  Browserabsturz kostet nichts. Die Zeit läuft dabei weiter.
- Nach 90 Minuten wird automatisch abgegeben.
- Wechsel in andere Fenster oder Tabs (ab 2 Sekunden) werden gezählt und
  stehen im Bericht.

**Nachher**
1. `lehrkraft.html` öffnen und alle eingegangenen PDF-Dateien hineinziehen.
2. Die Tabelle zeigt Punkte, Note, Teilergebnisse, Bearbeitungszeit,
   Fensterwechsel und ob der Prüfcode gültig ist. Ein Klick auf eine Zeile
   zeigt alle Kriterien.
3. „Notenliste als CSV“ lädt die Ergebnisse für Excel herunter (mit
   Semikolon getrennt).

## Notenschlüssel (Standard)

50 % = 4,0. Darüber in 5-%-Schritten bis 1,0 ab 95 %. Unter 50 % gibt es 5,0,
unter 20 % 6,0. Änderbar in `config.js`.

## Prüfcode und Manipulationsschutz

Der Bericht enthält einen Prüfcode (Ergebnis plus Signatur). Er steht sichtbar
am Ende des Berichts und zusätzlich in den Metadaten der PDF-Datei.

- Werden Punkte im PDF überschrieben, ändert das nicht den Code.
  `lehrkraft.html` rechnet immer aus dem Code.
- Wird der Code selbst verändert, passt die Signatur nicht mehr. Der Bericht
  wird dann als **ungültig** markiert.
- Die PDF-Inhalte sind komprimiert, also nicht mit einem einfachen Texteditor
  änderbar.

**Grenzen (ehrlich):** Die Klausur läuft komplett im Browser. Wer den
Quellcode liest, sieht dort Aufgaben, Bewertungsregeln und das Geheimnis. Das
Repository deshalb erst kurz vor der Klausur veröffentlichen und das Geheimnis
für jede Klausur neu setzen. Aufsicht oder ein Prüfungsbrowser (z. B. Safe Exam
Browser) bleiben sinnvoll. Ein Neustart über `?reset=1` ist möglich, fällt
aber durch Beginn und Dauer im Bericht auf.

## Dateien

```
index.html        Klausur
lehrkraft.html    Auswertung der PDF-Berichte (+ lehrkraft.js)
config.js         Einstellungen (Dauer, Notenschlüssel, Geheimnis …)
aufgaben.js       Alle Aufgaben und Bewertungskriterien
app.js            Ablauf: Start, Navigation, Timer, Speichern, Abgabe
bericht.js        Aufbau des PDF-Berichts
pdf.js            Eigener kleiner PDF-Erzeuger (keine externe Bibliothek)
util.js           Hilfsfunktionen, SHA-256, Prüfcode
sim-explorer.js   Datei-Explorer mit veränderbarem Dateisystem
sim-fenster.js    Desktop mit Startmenü, Taskleiste, Fenstern
sim-dialoge.js    Speichern-unter-Dialog in Word, Lernplattform (Up-/Download)
sim-quiz.js       Wissensfragen
sim-word.js       Word-Textbearbeitung (Engine aus dem Word-Kompetenztrainer)
style.css         Gestaltung
```

## Bewusste Vereinfachungen

- Das Dateisystem ist simuliert und für jede Aufgabe klein und fest vorgegeben.
- Ziehen auf ein anderes Laufwerk (USB-Stick) kopiert, innerhalb desselben
  Laufwerks wird verschoben, wie in Windows.
- Word: Formatierungen (fett, kursiv …) sind in dieser Klausur gesperrt. Ob
  ein Schritt mit Maus oder Tastatur erfolgte, wird wie in den Lern-Apps über
  die Art des letzten Eingabeereignisses erkannt.
- Nach einem Neuladen kann in Word nicht mehr über den Neuladezeitpunkt hinaus
  rückgängig gemacht werden. Der Text selbst bleibt erhalten.
