# KlarTakt – Technisches und gestalterisches Konzept

> *Dein Alltag. Dein Rhythmus. Deine innere Balance.*

Dieses Dokument beschreibt die Architektur, das Datenmodell, die Gestaltung und die
Ausbaustufen von KlarTakt. Es ist die Grundlage für die Implementierung in diesem
Repository und wird mit der App weitergepflegt.

---

## 1. Leitprinzipien

| Prinzip | Bedeutung für die Umsetzung |
| --- | --- |
| **Offline first** | Alle Daten liegen lokal auf dem Gerät (IndexedDB). Keine Funktion benötigt Internet, kein Konto, keine Bankanbindung. |
| **Privat by default** | Keine Telemetrie, keine Cloud. Tagebuch per PIN geschützt, Backups optional mit Passwort verschlüsselt (AES‑GCM). |
| **Ein Guss** | Ein gemeinsames Design-System (Tokens, Karten, Listen, Tabs) für alle Bereiche. Der spirituelle Bereich nutzt dieselben Bausteine mit „kosmischer“ Variante. |
| **Modular** | Jeder Bereich ist ein eigenes Feature-Modul (Daten, Logik, Screens). Neue Bereiche lassen sich ergänzen, ohne andere anzufassen. |
| **Organisation, keine Beratung** | Gesundheits- und Finanzbereich dokumentieren nur. Keine Diagnosen, keine Dosierungs- oder Anlageempfehlungen. Astrologie, Tarot und Impulse werden als spirituelle Anregung zur Selbstreflexion gekennzeichnet. |
| **KI optional** | Alle Funktionen arbeiten ohne KI. Eine spätere KI-Unterstützung ist in den Einstellungen abschaltbar vorgesehen. |

---

## 2. Technologie-Entscheidung

**Web-Technologie + Capacitor** (React, TypeScript, Vite, Dexie/IndexedDB, Capacitor 8).

Begründung:

- **Android zuerst, iOS und Web später ohne Neuentwicklung:** Derselbe Code läuft als
  native Android-App (Capacitor-WebView mit nativen Plugins), später als iOS-App
  (`npx cap add ios`) und direkt im Browser.
- **Echte native Benachrichtigungen:** `@capacitor/local-notifications` plant Erinnerungen
  im Android-System – sie kommen auch, wenn die App geschlossen ist.
- **Offline vollständig:** Die App-Dateien sind im APK gebündelt, die Daten in IndexedDB
  im privaten App-Speicher.
- **Schnelle Iteration & Testbarkeit:** Logik (Arbeitszeit, Mondphasen, Sternzeichen,
  Finanzbilanz …) ist reines TypeScript und mit Vitest getestet.

Verworfene Alternativen: *Flutter* (gute Wahl, aber Web-Ziel schwächer und zweite Sprache),
*natives Kotlin* (kein iOS/Web ohne Neuentwicklung).

---

## 3. Architektur

```
src/
├── main.tsx / App.tsx        Einstieg, Router, Theme, Onboarding-Weiche
├── core/                     Querschnitt – kennt keine Feature-Module
│   ├── db.ts                 Dexie-Datenbank, alle Tabellen + Schema-Versionen
│   ├── types.ts              Datenmodell (TypeScript-Interfaces)
│   ├── dates.ts              Datumshilfen (lokal, ISO-Tage "YYYY-MM-DD", KW)
│   ├── recurrence.ts         Wiederholungsregeln (täglich, wöchentlich, monatlich …)
│   ├── notifications.ts      Erinnerungs-Planer (Capacitor nativ / Web-Fallback)
│   ├── backup.ts             Export, Import, Verschlüsselung, Komplettlöschung
│   ├── crypto.ts             PBKDF2 + AES-GCM (WebCrypto), PIN-Hash
│   └── settings.ts           Einstellungen lesen/schreiben (Hook)
├── ui/                       Design-System: Tokens (CSS), Icons, Karten, Tabs, Sheets …
└── features/
    ├── dashboard/            Startseite mit konfigurierbaren Kacheln
    ├── calendar/             Monat / Woche / Tag, Termine, Geburtstage
    ├── shifts/               Schichtarten, Schichtplan, Muster, Arbeitszeitkonto
    ├── tasks/                Aufgaben (Tag/Woche/Monat), Prioritäten, Wiederholung
    ├── health/               Medikamente, Einnahmen, Vorrat, Historie, Gesundheitsnotizen
    ├── finance/              Buchungen, Zahlungen, Raten/Schulden, Budgets, Grafiken
    ├── notes/                Notizen, Listen, Dokumente, Anhänge, Suche
    ├── habits/               Gewohnheiten, Ziele, Fortschritt, Statistiken
    ├── spirit/               Profil, Sternzeichen, Horoskop, Mond, Meditation,
    │                         Tagesimpuls, Tarot, Tagebuch
    ├── search/               Globale Suche über alle Bereiche
    └── settings/             Profil, Design, Benachrichtigungen, Datensicherung
```

**Datenfluss:** Screens lesen Daten reaktiv über `useLiveQuery` (Dexie). Jede Änderung in
der Datenbank aktualisiert automatisch alle betroffenen Ansichten (z. B. das Dashboard).
Schreibende Aktionen laufen über kleine Service-Funktionen pro Feature, die danach den
Erinnerungs-Planer neu berechnen lassen.

**Erinnerungen:** Ein zentraler `rescheduleAll()` berechnet aus allen Quellen
(Schichten, Medikamente, Zahlungen, Aufgaben, Termine, Geburtstage, Gewohnheiten,
Meditation, Tagesimpuls) die Erinnerungen der nächsten 14 Tage und übergibt sie dem
Betriebssystem. Jede Kategorie ist in den Einstellungen einzeln schaltbar. Android
erlaubt nur eine begrenzte Zahl geplanter Benachrichtigungen – daher das rollierende
Fenster, das bei jedem App-Start und jeder Änderung erneuert wird.

---

## 4. Datenmodell (IndexedDB über Dexie)

| Tabelle | Wichtige Felder |
| --- | --- |
| `settings` | Name, Theme, Wochen-Sollstunden, Benachrichtigungs-Schalter, Dashboard-Kacheln, KI-Schalter, Tagebuch-PIN-Hash |
| `profile` | Geburtsdatum, -zeit, -ort, Koordinaten |
| `shiftTypes` | Name, Kürzel, Farbe, Beginn, Ende, Pause (min), Art (Arbeit/Urlaub/Frei/Krank) |
| `shifts` | Datum, shiftTypeId, abweichende Zeiten/Pause, Notiz, Erinnerung |
| `shiftPatterns` | Name, Folge von shiftTypeIds (Rotationsmuster) |
| `tasks` | Titel, Notiz, Bereich (Tag/Woche/Monat), Fälligkeit, Priorität, Kategorie, Wiederholung, Erinnerung, erledigt |
| `events` | Titel, Datum, Uhrzeit, Ende, Art (Termin/Geburtstag/Arzt), Notiz, Wiederholung, Erinnerung |
| `meds` | Name, Dosis, Hinweise, Einnahmezeiten, Wiederholung, Vorrat, Menge pro Einnahme, Warnschwelle, aktiv |
| `medIntakes` | medId, Datum, geplante Uhrzeit, Zeitpunkt der Einnahme |
| `healthNotes` | Datum, Titel, Text |
| `finance` | Art (Einnahme/Ausgabe), Betrag, Kategorie, Datum, Notiz, monatlich wiederkehrend |
| `bills` | Titel, Betrag, Kategorie, Fälligkeit, Wiederholung, Vorlauf-Erinnerung, bezahlt-am |
| `debts` | Titel, Gläubiger, Gesamtbetrag, Rate, Fälligkeitstag, getilgte Zahlungen |
| `budgets` | Kategorie, Monatsbudget |
| `notes` | Titel, Text, Kategorie, Checkliste, angeheftet, Anhänge (Blobs) |
| `habits` | Name, Symbol, Farbe, Einheit, Tagesziel, Frequenz (täglich / x pro Woche), Erinnerung |
| `habitLogs` | habitId, Datum, Wert |
| `journal` | Datum, Art, Stimmung, Gefühle, Dankbarkeit, Reflexionsfrage + Antwort, Text |
| `tarotDraws` | Datum, Legung, Frage, Karten (Index + umgekehrt) |
| `meditations` | Datum, Art, Dauer (Sitzungs-Historie) |
| `audio` | eigene Meditations-Audiodateien (Blob) |

Geldbeträge werden in **Cent (Integer)** gespeichert, um Rundungsfehler zu vermeiden.
Datumswerte als ISO-Tag `YYYY-MM-DD`, Uhrzeiten als `HH:MM` (lokale Zeit).

---

## 5. Fachlogik (Auszug)

- **Arbeitszeit:** Dauer = Ende − Beginn (über Mitternacht korrekt) − Pause.
  Soll = Wochen-Sollstunden ÷ Arbeitstage pro Woche × Arbeitstage im Zeitraum;
  Urlaub und Krank zählen als erfüllte Sollzeit. Saldo = Ist − Soll → Über-/Minusstunden.
- **Schichtmuster:** Ein Muster (z. B. F F S S N N – –) wird ab einem Startdatum über
  einen Zeitraum ausgerollt; bestehende Einträge können überschrieben werden.
- **Medikamente:** „Heute fällig“ ergibt sich aus Wiederholungsregel × Einnahmezeiten.
  Abhaken erzeugt einen Historien-Eintrag und reduziert den Vorrat; Rückgängig stellt
  ihn wieder her. Reichweite in Tagen = Vorrat ÷ Tagesbedarf → Warnung unter Schwelle.
- **Zahlungen:** Wiederkehrende Rechnungen erzeugen beim Bezahlen die nächste Fälligkeit.
  Status: überfällig / bald fällig (≤ 7 Tage) / offen / bezahlt.
- **Bilanz:** Einnahmen − Ausgaben je Monat (inkl. bezahlter Rechnungen und Raten),
  Budget-Auslastung je Kategorie, Jahresverlauf als Balkendiagramm.
- **Mondphasen:** Astronomische Berechnung nach Jean Meeus, *Astronomical Algorithms*
  (Kap. 47–49): exakte Zeitpunkte von Neumond, erstem Viertel, Vollmond, letztem Viertel
  (Genauigkeit im Minutenbereich) sowie Beleuchtungsgrad aus der Elongation Sonne–Mond.
- **Sternzeichen:** Tropischer Tierkreis aus dem Geburtsdatum. **Geburtshoroskop**
  (optional, mit Zeit + Ort): Sonnen-, Mond- und Aszendentenzeichen aus Sonnen-/
  Mondlänge (Meeus, niedrige Präzision) und lokaler Sternzeit; Ort aus integrierter
  Städteliste oder manuellen Koordinaten (offline, ohne Geocoding-Dienst).
- **Tagesimpuls:** Deterministische Auswahl pro Tag aus einer kuratierten Bibliothek,
  gewichtet nach Element des Sternzeichens und aktueller Mondphase; die letzten
  30 Impulse werden nicht wiederholt.

---

## 6. Gestaltung

**Farbwelt** (Tokens in `src/ui/theme.css`):

| Token | Hell | Nacht |
| --- | --- | --- |
| Waldgrün (Primär) | `#1F3A2E` | `#A9C6A8` |
| Salbei | `#A9BFA3` | `#6F8C6E` |
| Creme (Hintergrund) | `#F4EFE4` | `#141A16` |
| Karte | `#FBF8F1` | `#1D2520` |
| Gold (Akzent) | `#C9A55C` | `#D9B873` |

- **Typografie:** Serifenschrift für Überschriften (ruhig, hochwertig), klare
  Sans-Serif für Inhalte. Systemschriften als Fallback – offline verfügbar.
- **Formen:** Karten mit 18 px Radius, weiche Schatten, Pillen-Tabs (Segment-Control)
  wie im Entwurf, große Touch-Ziele (≥ 44 px).
- **Spiritueller Bereich:** gleiche Komponenten, aber dunkler „Nachthimmel“-Verlauf,
  dezente Sterne, Gold statt Grün als Akzent.
- **Bewegung:** nur kurze Übergänge (150–250 ms), Atemkreis in der Atemübung;
  `prefers-reduced-motion` wird respektiert.
- **Nachtmodus:** System / Hell / Dunkel, umschaltbar in den Einstellungen.

**Navigation** (Bottom-Bar, wie gefordert): Dashboard · Kalender · Finanzen · Gesundheit ·
Spiritualität. Aufgaben, Schichtplan, Notizen, Gewohnheiten, Suche und Einstellungen
über die Dashboard-Kacheln und das Menü „Bereiche“ (Raster-Symbol oben). Ein
„+“-Schnellzugriff legt Aufgabe, Termin, Schicht, Ausgabe oder Notiz an.

---

## 7. Datenschutz & Sicherheit

- Daten verlassen das Gerät nur durch einen bewusst ausgelösten Export.
- Auf Android liegt IndexedDB im privaten App-Verzeichnis (für andere Apps unzugänglich);
  Android-Auto-Backup ist deaktiviert (`allowBackup=false`), damit keine Kopie ungefragt
  in die Cloud wandert.
- **Tagebuch-Sperre:** PIN, gespeichert nur als PBKDF2-Hash (150 000 Iterationen, Salt).
- **Verschlüsselte Backups:** AES-256-GCM, Schlüssel per PBKDF2 aus Passwort.
- **Vollständiges Löschen:** Ein Schalter löscht die gesamte Datenbank und alle
  geplanten Erinnerungen.
- Ausbaustufe: Verschlüsselung der sensibelsten Tabellen im Ruhezustand mit
  Android-Keystore (Plugin), biometrische Entsperrung.

---

## 8. Ausbaustufen

| Phase | Inhalt | Stand |
| --- | --- | --- |
| **1 – Grundsystem** | App-Struktur, Dashboard, Navigation, Kalender, Schichtplan, Aufgaben | ✅ umgesetzt |
| **2 – Persönliche Verwaltung** | Medikamente, Erinnerungen, Finanzen, Notizen, Gewohnheiten | ✅ umgesetzt |
| **3 – Spiritualität** | Geburtsprofil, Sternzeichen, Mondkalender, Meditation, Tagesimpulse, Tarot, Tagebuch | ✅ umgesetzt |
| **4 – Erweiterungen** | Datensicherung ✅, Statistiken ✅, Personalisierung ✅ (Kacheln, Farben, Theme); Synchronisierung (Google Kalender), KI-Tagesübersicht, biometrische Sperre | teilweise – siehe Roadmap |

**Roadmap Phase 4 (offen):**
1. Google-Kalender-Sync (OAuth, nur lesend → später bidirektional).
2. Optionale Geräte-Synchronisierung über verschlüsselte Backup-Datei (z. B. in eigener Cloud).
3. KI-Tagesübersicht (abschaltbar, nur mit ausdrücklicher Zustimmung; ohne KI bleibt alles nutzbar).
4. Biometrische Sperre & Keystore-Verschlüsselung.
5. Vollständiges 78-Karten-Tarot-Deck, weitere geführte Meditationen mit Audio.
