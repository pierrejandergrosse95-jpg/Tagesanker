# Tagesanker

*Dein Alltag. Dein Rhythmus. Deine innere Balance.*

Tagesanker ist ein persönlicher Alltags- und Lebensplaner für Android. Die App verbindet
Organisation (Schichten, Termine, Aufgaben, Finanzen, Medikamente, Notizen, Gewohnheiten)
mit einem ruhigen spirituellen Bereich (Geburtsprofil, Sternzeichen, Mondkalender,
Meditation, Tagesimpulse, Tarot, Tagebuch).

- **Offline & privat:** Alle Daten liegen nur auf dem Gerät (IndexedDB). Kein Konto, keine Cloud, keine Tracker.
- **Android zuerst:** Native App über Capacitor, mit echten System-Erinnerungen. iOS und Web sind ohne Neuentwicklung möglich.
- **Deutsch & Englisch:** Sprache automatisch nach Gerät oder wählbar.
- **Jedes Display:** Handy (Hoch-/Querformat) und Tablet, heller und dunkler Modus.
- **Konzept:** Architektur, Datenmodell, Design und Ausbaustufen stehen in [`docs/KONZEPT.md`](docs/KONZEPT.md).

## Funktionsumfang

| Bereich | Inhalt |
| --- | --- |
| Dashboard | Begrüßung, Datum & KW, heutige Schicht, Medikamente, Zahlungen, Aufgaben, Termine, Gewohnheiten, Mondphase, Tagesimpuls, Vorschau der nächsten Tage – Kacheln ein-/ausblendbar und sortierbar |
| Kalender | Monat / Woche / Tag (Zeitleiste), Termine, Arzttermine, Geburtstage, Wiederholungen, Notizen; zeigt Schichten, Aufgaben, Zahlungen und Voll-/Neumond |
| Schichtplan | Früh/Spät/Nacht + eigene Schichten mit Farben, Zeiten, Pausen; Urlaub/Frei/Krank; Schichtmuster ausrollen; Arbeitszeitkonto mit Über-/Minusstunden |
| Aufgaben | Tag/Woche/Monat, Prioritäten, Kategorien, Wiederholungen, Erinnerungen |
| Gesundheit | Medikamente mit Dosis, Hinweisen, Zeiten, Wiederholung; Abhaken; Vorrat & Warnung; Einnahmeverlauf; Arzttermine; Gesundheitsnotizen |
| Finanzen | Einnahmen/Ausgaben, monatliche Fixbeträge, Rechnungen mit Fälligkeit & Erinnerung, wiederkehrende Zahlungen, Raten & Schulden, Budgets, Kategorien, Monats- und Jahresübersicht |
| Notizen | Kategorien, Checklisten (Einkaufsliste), Anheften, Suche, Foto-/Dateianhänge |
| Gewohnheiten | Eigene Gewohnheiten mit Ziel & Einheit, täglich oder x-mal pro Woche, Serien, Wochen-/Monatsquote, 4-Wochen-Ansicht |
| Spiritualität | Geburtsprofil → Sternzeichen, Eigenschaften, Stärken, Entwicklungsthemen; vereinfachtes Geburtshoroskop (Sonne, Mond, Aszendent); Tages-, Wochen-, Monatsimpulse; Mondkalender (astronomisch berechnet) mit Bedeutung, Fragen, Ritualen; geführte Meditationen, Timer, Atemübungen, eigene Audiodateien; Tarot (Tageskarte, Drei-Karten-Legung, Verlauf); Tagebuch mit Reflexionsfragen, Stimmung, Dankbarkeit, PIN-Schutz |
| System | Globale Suche, Benachrichtigungen je Kategorie schaltbar, Hell/Dunkel/System, Backup (optional AES-256-verschlüsselt), Wiederherstellen, alles löschen |

Tagesanker gibt keine medizinischen, finanziellen oder zukunftsbezogenen Ratschläge.
Astrologie, Tarot und Impulse sind als spirituelle Anregungen gekennzeichnet.

## Entwicklung

Voraussetzungen: Node.js 22+, für Android zusätzlich JDK 21 und Android Studio / Android SDK.

```bash
npm install
npm run dev        # Entwicklungsserver im Browser (http://localhost:5173)
npm test           # Unit-Tests (Mondphasen, Arbeitszeit, Finanzen, …)
npm run build      # Typprüfung + Produktions-Build nach dist/
```

### Android-App

```bash
npm run android:sync   # Web-Build + Übernahme ins Android-Projekt
npm run android:open   # Öffnet Android Studio → Gerät wählen → ▶ Ausführen
```

Ohne eigene Entwicklungsumgebung: Der GitHub-Workflow **„Tests & Android-APK“** baut bei
jedem Push eine Debug-APK. Sie liegt im Workflow-Lauf unter *Artifacts →
Tagesanker-debug-apk* und lässt sich direkt auf dem Smartphone installieren
(„Installation aus unbekannten Quellen“ erlauben).

Für eine Veröffentlichung im Play Store wird ein Release-Build mit eigenem Signaturschlüssel benötigt
(`./gradlew bundleRelease` in `android/`).

### App-Icon

Das Original liegt in `assets/icon-original.png`. Alle Android-Icons (klassisch, rund, adaptiv),
Splash-Screens und Web-Icons werden daraus erzeugt:

```bash
python3 scripts/generate-icons.py   # benötigt Pillow
```

### Bereichsbilder

Die Kopf- und Kachelbilder der Bereiche werden aus `assets/areas-original.png` zugeschnitten:

```bash
python3 scripts/generate-areas.py
```

### Tarot-Karten

Die Kartenbilder werden aus `assets/tarot-original.png` zugeschnitten (nur das Motiv; Nummer und Name setzt die App):

```bash
python3 scripts/generate-tarot.py
```

## Projektstruktur

```
src/
  core/        Datenbank, Datum & Wiederholungen, Erinnerungen, Backup, Kryptografie, Astronomie
  content/     Impulse, Mond-Deutungen, Tarot, Meditationen (Texte)
  features/    Ein Ordner pro Bereich (Screens + Fachlogik)
  ui/          Design-System (Tokens, Komponenten)
android/       Natives Android-Projekt (Capacitor)
docs/          Konzept
```
