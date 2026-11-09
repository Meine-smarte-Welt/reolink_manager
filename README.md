| 🇩🇪<br>**Deutsch** | [🇬🇧<br>**English**](README.en.md) | [🇳🇱<br>**Nederlands**](README.nl.md) |
|:-:|:-:|:-:|

![Reolink Manager](docs/images/reolink_manager.webp)

# Reolink Manager

📖 Blogbeitrag: folgt auf [meinesmartewelt.de](https://meinesmartewelt.de)

Reolink Manager ist eine Ergänzung für Home Assistant. Sie legt sich über die **offizielle Reolink-Integration** und zeigt Kameras, Home Hub und Gongs in einer Karte mit Kategorien: Kameras, Batterie, Erkennungen, Updates, Speicher, Steuerung und Hub.

Der Manager liest nur die Geräte, Entitäten und Zustände, die die Reolink-Integration schon liefert. Er spricht **nicht selbst mit den Kameras**. Dadurch werden Akku-Kameras (z. B. Argus) nicht zusätzlich geweckt.

> **Wichtig, Version 0.0.3:** Übersicht, Sensoren und Ereignisse hat Thorsten mit 0.0.1 auf seiner Installation bestätigt, sie sind jetzt **immer aktiv**. Neu sind Live-Bild, Galerie und Push-Nachrichten. Sie sind, wie Steuerung, PTZ und Aktualisieren/Wecken, **ungeprüft** und standardmäßig **ausgeblendet** (siehe [Experimentelle Funktionen](#experimentelle-funktionen)). Die neuen Funktionen wurden noch nicht an echten Kameras oder Smartphones getestet. Details in [EXPERIMENTELL.md](EXPERIMENTELL.md).

## Funktionsumfang

| Kategorie (Tab) | Inhalt | Funktion |
|---|---|---|
| Kameras | Status (online, offline, Privatmodus), Schlafstatus, Batterie, WLAN-Signal | immer |
| Batterie | Ladestand, Zustand, Temperatur, Warnstufen niedrig und kritisch | immer |
| Erkennungen | Bewegung, Person, Fahrzeug, Haustier, Tier, Gesicht, Paket, Besucher, Babyschreien, Fahrrad, mit „zuletzt geändert“ | immer |
| Updates | Firmware-Updates der Geräte mit installierter und neuer Version | immer |
| Speicher | Belegung der SD-Karte bzw. des Hub-Speichers, soweit die Reolink-Integration sie liefert | immer |
| Steuerung | Privatmodus, Aufnahme, Push, Szene des Hubs, Sirene, Licht (schreibt) | `controls` |
| Galerie | Aufnahmen je Kamera als Aufklapp-Menü, niedrige Auflösung aus dem Medienbrowser, Anzahl in den Optionen, Abspielen im Overlay | `gallery` |
| Hub | Home Hub mit Anzahl der verbundenen Geräte und Szene | immer |
| Zahnrad | Version, Status der Reolink-Integration, Auswahl, Optionen, Wartung, Ereignisprotokoll, Experimentell | immer |

Immer aktiv (geprüft): die Kategorien oben, Übersichts-Sensoren (`sensors`) und Ereignisse auf dem Home-Assistant-Bus (`events`).

Experimentell: Live-Bild im Popup (`live`), Galerie (`gallery`), Push-Nachrichten mit Bild bei Erkennung (`push`), PTZ-Steuerung (`ptz`), Aktualisieren/Wecken (`refresh`) und Steuerung (`controls`).

Das Kamera-Popup hat jetzt einen sichtbaren Scrollbalken. Mit `live` zeigt es oben sofort ein Standbild; ein Knopf startet den Live-Stream, und das Drücken der PTZ-Steuerung schaltet automatisch auf den Stream. Die PTZ-Pfeile bewegen die Kamera nur, solange du sie gedrückt hältst; die Geschwindigkeit wählst du über dem Steuerkreuz.

Die Geräteauswahl in den Optionen bestimmt, welche Kameras, Hubs und Gongs überhaupt erscheinen. Pro Kategorie gibt es in der Karte einen eigenen Schalter.

## Neu in 0.0.3

- PTZ: Die Kamera bewegt sich nur, solange du einen Pfeil gedrückt hältst. Loslassen hält sie an, ein kurzes Tippen bewegt sie nur ein kleines Stück. Dazu gibt es eine Geschwindigkeit (langsam, mittel, schnell) und einen Sicherheits-Stopp nach 8 Sekunden
- Push-Einstellungen (Smartphones, Erkennungen, Sperrzeit) stehen jetzt in der Karte unter *Einstellungen* und nicht mehr in den Optionen der Integration. Die Auswahl wird sofort wirksam
- Dashboard „Reolink Manager“ mit der Karte wird bei eingeschalteter Funktion `push` automatisch angelegt. Der Tipp auf die Push-Nachricht öffnet es und dort das Live-Bild
- Die Lovelace-Ressource der Karte wird jetzt wirklich automatisch eingetragen (in 0.0.2 musste sie von Hand ergänzt werden)

### Zuvor in 0.0.2

- Popup: sichtbarer Scrollbalken, die Aufklapp-Menüs werden nicht mehr gequetscht
- Live-Bild im Popup (`live`): Standbild sofort, Stream per Knopf, PTZ-Klick schaltet auf den Stream
- Neue Kategorie Galerie (`gallery`): Aufklapp-Menü je Kamera mit den neuesten Aufnahmen (niedrige Auflösung), Anzahl in den Optionen
- Push-Nachrichten (`push`): bei gewählten Erkennungen Nachricht mit aktuellem Bild an ein oder mehrere Smartphones; ein Tipp öffnet das Dashboard mit dem Live-Bild
- Übersicht, Sensoren und Ereignisse sind geprüft und immer aktiv

0.0.1: Erste Veröffentlichung.

## Voraussetzungen

- Home Assistant ab 2025.6
- Die offizielle [Reolink-Integration](https://www.home-assistant.io/integrations/reolink) ist eingerichtet. Die Geräte (z. B. Reolink Atlas PT Ultra, Argus 4 Pro, Argus 3 Ultra über den Home Hub) sind dort bereits sichtbar.

## Installation

**HACS:** HACS → Drei-Punkte-Menü → Benutzerdefinierte Repositories → `https://github.com/meine-smarte-welt/reolink_manager` als Kategorie *Integration* → Reolink Manager herunterladen → Home Assistant neu starten.

**Manuell:** Ordner `custom_components/reolink_manager` nach `config/custom_components/` kopieren und Home Assistant neu starten.

Danach: Einstellungen → Geräte & Dienste → Integration hinzufügen → **Reolink Manager**.

## Einrichtung

1. Reolink-Einträge auswählen, die der Manager beobachten soll.
2. Unter *Konfigurieren* die Geräte wählen (leer = alle), Erkennungsarten, Batterie-Schwellen (Standard niedrig 30 %, kritisch 15 %), Offline-Verzögerung (Standard 120 s) und ob Ereignisse gesendet werden.
3. Für Experimentelles: *Experimentelle Funktionen anzeigen* einschalten und die gewünschten Funktionen ankreuzen. Danach folgt ein zweiter Schritt mit der Einstellung für die Galerie.
4. **Galerie:** Anzahl der Videos je Kamera (Standard 5). Die Karte lädt erst beim Aufklappen und nimmt die niedrige Auflösung.
5. **Push:** Funktion `push` einschalten. Smartphones (`notify.mobile_app_…`, mehrere möglich), Erkennungsarten (Standard Person) und Sperrzeit (Standard 60 s) wählst du in der Karte unter *Einstellungen* → *Push-Nachrichten*, dort gibt es auch eine Test-Nachricht. Das Dashboard „Reolink Manager“ mit der Karte legt die Integration selbst an (nur wenn Lovelace im Speichermodus läuft). Ein Tipp auf die Nachricht öffnet es, und die Karte zeigt das Live-Bild der Kamera.

Die Karte wird automatisch als Lovelace-Ressource eingetragen (im YAML-Modus muss `/reolink_manager_files/reolink-manager-card.js?v=0.0.3` als Modul-Ressource von Hand ergänzt werden).

## Die Karte

```yaml
type: custom:reolink-manager-card
title: Reolink Manager
show_experimental: true
default_tab: cameras
```

Alle Optionen lassen sich im grafischen Editor einstellen. Wichtige Schlüssel:

| Schlüssel | Bedeutung | Standard |
|---|---|---|
| `show_experimental` | Experimentelle Funktionen in dieser Karte anzeigen | `false` |
| `show_cameras`, `show_battery`, `show_detections`, `show_updates`, `show_storage`, `show_gallery`, `show_controls`, `show_hub` | Kategorie anzeigen | `true` |
| `live_auto` | Standbild beim Öffnen des Popups sofort laden (aus = nur per Knopf, schont Akku-Kameras) | `true` |
| `default_tab` | Starttab | `cameras` |
| `max_rows` | Maximale Zeilen | `50` |
| `zoom` | Skalierung in Prozent | `100` |
| `read_only` | Alle Bedienelemente ausblenden | `false` |
| `entry_id` | Nur bei mehreren Reolink-Manager-Einträgen | leer |

Ohne eingeschaltete experimentelle Funktionen zeigt die Karte die geprüften Kategorien (Kameras, Batterie, Erkennungen, Updates, Speicher, Hub) und das Zahnrad.

## Farben

Im Editor unter *Farben* oder per `color_*`-Schlüssel. Leer = Theme-Standard. Erlaubt sind Hex, `rgb()`, `hsl()` und `var(--…)`.

| Schlüssel | Bedeutung |
|---|---|
| `color_tab_active` | Aktiver Tab |
| `color_success` / `color_warning` / `color_error` / `color_info` | Grün, Orange, Rot, Blau |
| `color_row_icon` | Zeilensymbole (überschreibt alle Kategorien) |
| `color_live_banner` | Live-Banner |
| `color_icon_<kategorie>` | Symbolfarbe je Kategorie |

## Services

| Service | Wirkung |
|---|---|
| `reolink_manager.rescan` | Liest Geräte und Entitäten der Reolink-Integration neu ein (weckt keine Kamera) |
| `reolink_manager.check_update` | Prüft sofort auf eine neue Version auf GitHub |
| `reolink_manager.refresh_device` | Löst ein Update der Entitäten eines Geräts aus (experimentell `refresh`, weckt Akku-Kameras) |

## Ereignisse

Immer aktiv, solange die Option „Ereignisse senden“ eingeschaltet ist. Beim Start gibt es eine Ruhephase von 60 s, damit keine Ereignisflut entsteht.

| Ereignis | Wann |
|---|---|
| `reolink_manager_device_offline` | Gerät war länger als die Offline-Verzögerung offline |
| `reolink_manager_device_online` | Gerät ist nach einer Offline-Meldung wieder online |
| `reolink_manager_battery_low` | Batterie unter der Schwelle „niedrig“ |
| `reolink_manager_battery_critical` | Batterie unter der Schwelle „kritisch“ |
| `reolink_manager_update_available` | Firmware-Update verfügbar |

Die Daten enthalten `entry_id`, `device_id`, `name`, `model`, `kind`, bei Batterie `battery`, bei Updates `installed_version` und `latest_version`. Beispiele: [`examples/`](examples/).

## Sensoren

Immer aktiv: Geräte, Offline, Batterie niedrig, Batterie kritisch, Updates verfügbar.

## Versionsanzeige und Update-Hinweis

Die Version steht im Zahnrad der Karte (App-Version), oben im Karten-Editor und im Optionen-Dialog. Der Manager fragt beim Start und danach alle 12 Stunden bei GitHub nach der neuesten Version. Gibt es eine neuere, erscheint ein orangefarbener Hinweis. Ist GitHub nicht erreichbar, läuft alles normal weiter („Prüfung nicht möglich“). Bis zum ersten Release auf GitHub meldet die Prüfung „keine Veröffentlichung“.

## Experimentelle Funktionen

In 0.0.2 sind Live-Bild, Galerie, Push, Steuerung, PTZ und Aktualisieren/Wecken ungeprüft. Es gibt einen Hauptschalter (Optionen: *Experimentelle Funktionen anzeigen*, Karte: `show_experimental`) und je Funktion einen eigenen Schalter. Solange er aus ist, zeigt die Karte nichts davon, das Backend führt keine Aktionen aus, sendet keine Ereignisse und legt keine Sensoren an. Welche Funktion was bedeutet und wie du sie prüfst, steht in [EXPERIMENTELL.md](EXPERIMENTELL.md).

## Sicherheit

- Schreibende Aktionen der Karte (Schalten, PTZ, Aktualisieren, Neu einlesen, Update prüfen) nur für Administratoren. Die Details-Abfrage ist ebenfalls Administratoren vorbehalten. Lesen der Übersicht ist für alle angemeldeten Nutzer möglich.
- Das Backend prüft jede Aktion: nur Entitäten, die der Manager selbst verwaltet, und nur erlaubte Aktionen.
- Texte in der Karte werden maskiert, Farbwerte laufen über eine Allowlist.
- Riskante Aktionen (Sirene, Wecken) brauchen zwei Klicks.
- Der Manager verbindet sich nur mit GitHub (Versionsprüfung). Keine Zugangsdaten, keine Kamera-Zugriffe. Die Diagnose ist anonymisiert.

## Bekannte Einschränkungen

- **Neues nicht an echter Hardware getestet.** Übersicht, Sensoren und Ereignisse hat Thorsten mit 0.0.1 bestätigt. Alles Neue wurde nur gegen echte Home-Assistant-Klassen mit simulierten Reolink-Entitäten und im Browser mit Testdaten geprüft, Push nicht auf echten Smartphones.
- PTZ-Geschwindigkeit: Sie wirkt nur, wenn die Reolink-Integration den Dienst `reolink.ptz_move` mit Geschwindigkeit anbietet. Sonst fährt die Kamera mit ihrer eigenen Geschwindigkeit; Halten und Loslassen funktionieren trotzdem.
- Das Dashboard wird nur automatisch angelegt, wenn Lovelace im Speichermodus läuft. Im YAML-Modus bitte selbst ein Dashboard mit der Karte anlegen.
- Die Reolink-Integration liefert für Aufnahmen **keine Vorschaubilder**. Die Galerie zeigt deshalb pro Kamera das aktuelle Kamerabild (bei Akku-Kameras nur auf Knopfdruck) und eine Liste der Aufnahmen.
- Ob eine Aufnahme im Browser abspielt, hängt vom Codec ab (H.265 geht nicht in jedem Browser). Dann hilft „In Home Assistant öffnen“.
- Push: Ob das Bild und der Tipp auf iOS und Android gleich funktionieren, ist offen. Auf dem Smartphone muss die Companion-App Benachrichtigungen erlauben.
- Die Zuordnung der Reolink-Entitäten (`translation_key`, Bezeichnung der Unique-ID) ist aus der Dokumentation abgeleitet. Bei Entitäten, die nicht erkannt werden, steht im Popup „nicht zugeordnet“. Bitte melde diese Fälle als Issue (ohne Zugangsdaten, IPs oder Seriennummern).
- Die Polarität des Schlafstatus (an = schläft) ist angenommen.
- Das Repository `meine-smarte-welt/reolink_manager` für die Versionsprüfung ist angenommen.
- Der Manager zeigt nur, was die Reolink-Integration liefert. Fehlt dort etwas, fehlt es auch hier.
- Übersetzungen (Deutsch, Englisch, Niederländisch) sind nicht von Muttersprachlern geprüft.
- Keine Anbindung an das Notification Center.

## Fehlerbehebung

- **Karte nicht gefunden:** Browser-Cache leeren (Strg+F5), prüfen, ob die Ressource `/reolink_manager_files/reolink-manager-card.js` eingetragen ist.
- **Kamera-Popup zeigt kein Live-Bild:** Funktion `live` in den Optionen und `show_experimental` in der Karte einschalten.
- **Keine Push-Nachricht:** Funktion `push`, mindestens ein Smartphone und eine Erkennungsart wählen. Im Zahnrad die Test-Nachricht senden, dann Sperrzeit prüfen.
- **Keine Geräte:** Ist der Reolink-Eintrag geladen? Im Zahnrad steht sein Status. Dann *Geräte neu einlesen*.
- **Diagnose:** Einstellungen → Geräte & Dienste → Reolink Manager → Diagnose herunterladen (anonymisiert).

## Versionshistorie

| Version | Änderung |
|---|---|
| **0.0.3** | PTZ nur bei gedrückter Taste mit Geschwindigkeit, Push-Einstellungen in der Karte, Dashboard und Lovelace-Ressource automatisch. |
| 0.0.2 | Popup mit Scrollbalken, Live-Bild, Galerie, Push-Nachrichten. Übersicht, Sensoren, Ereignisse geprüft und immer aktiv. |
| 0.0.1 | Erste Veröffentlichung. Alles experimentell. |

## Datei-Integrität

Python-, JavaScript- und YAML-Dateien tragen in der ersten Zeile einen SHA-256-Hash des Inhalts ab Zeile 2. Prüfen: `tail -n +2 datei.py | sha256sum`. Für JSON-Dateien gilt diese Tabelle (SHA-256 über die ganze Datei):

| Datei | SHA-256 |
|---|---|
| `hacs.json` | `4e05738d8be8aa023f7d922544ed51f3aefbd0bb5fe89f9b7573e637c505d5ad` |
| `custom_components/reolink_manager/icons.json` | `b67ca9f86968bb7b07e93637b107963721a319cbc429b4c3bc4c9a9bc039f49a` |
| `custom_components/reolink_manager/manifest.json` | `f3ae5cc2b8e5f3b8996e7ba90bc5593727646fc8b648c5e5855245c14247874a` |
| `custom_components/reolink_manager/strings.json` | `c5bd5662f23bd549b4cb413a59973fed59ff0881da64471599623e456333f64c` |
| `custom_components/reolink_manager/translations/de.json` | `c5bd5662f23bd549b4cb413a59973fed59ff0881da64471599623e456333f64c` |
| `custom_components/reolink_manager/translations/en.json` | `3fb9a5f6fb603bbd670d5cc62ad6965f52fda0326d2168b13533de28cb4cfe32` |
| `custom_components/reolink_manager/translations/nl.json` | `996e2002b72cf84a76fc8c3ab0bc579befe2f4b7e12fb15754dfa7442bbf639e` |

## Lizenz

MIT, siehe [LICENSE](LICENSE).
