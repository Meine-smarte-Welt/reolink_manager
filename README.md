| 🇩🇪<br>**Deutsch** | [🇬🇧<br>**English**](README.en.md) | [🇳🇱<br>**Nederlands**](README.nl.md) |
|:-:|:-:|:-:|

![Reolink Manager](docs/images/reolink_manager.webp)

# Reolink Manager

📖 Blogbeitrag: folgt auf [meinesmartewelt.de](https://meinesmartewelt.de)

Reolink Manager ist eine Ergänzung für Home Assistant. Sie legt sich über die **offizielle Reolink-Integration** und zeigt Kameras, Home Hub und Gongs in einer Karte mit Kategorien: Kameras, Batterie, Erkennungen, Updates, Speicher, Steuerung und Hub.

Der Manager liest nur die Geräte, Entitäten und Zustände, die die Reolink-Integration schon liefert. Er spricht **nicht selbst mit den Kameras**. Dadurch werden Akku-Kameras (z. B. Argus) nicht zusätzlich geweckt.

> **Wichtig, Version 0.0.1:** Alles an dieser Version ist neu und **ungeprüft**. Die Funktionen sind deshalb standardmäßig **ausgeblendet** und müssen bewusst eingeschaltet werden (siehe [Experimentelle Funktionen](#experimentelle-funktionen)). Nichts wurde an echten Kameras getestet. Details in [EXPERIMENTELL.md](EXPERIMENTELL.md).

## Funktionsumfang

| Kategorie (Tab) | Inhalt | Funktion |
|---|---|---|
| Kameras | Status (online, offline, Privatmodus), Schlafstatus, Batterie, WLAN-Signal | `overview` |
| Batterie | Ladestand, Zustand, Temperatur, Warnstufen niedrig und kritisch | `overview` |
| Erkennungen | Bewegung, Person, Fahrzeug, Haustier, Tier, Gesicht, Paket, Besucher, Babyschreien, Fahrrad, mit „zuletzt geändert“ | `overview` |
| Updates | Firmware-Updates der Geräte mit installierter und neuer Version | `overview` |
| Speicher | Belegung der SD-Karte bzw. des Hub-Speichers, soweit die Reolink-Integration sie liefert | `overview` |
| Steuerung | Privatmodus, Aufnahme, Push, Szene des Hubs, Sirene, Licht (schreibt) | `controls` |
| Hub | Home Hub mit Anzahl der verbundenen Geräte und Szene | `overview` |
| Zahnrad | Version, Status der Reolink-Integration, Auswahl, Optionen, Wartung, Ereignisprotokoll, Experimentell | immer |

Zusätzlich (alle experimentell): PTZ-Steuerung (`ptz`), Aktualisieren/Wecken (`refresh`), Übersichts-Sensoren (`sensors`), Ereignisse auf dem Home-Assistant-Bus (`events`).

Die Geräteauswahl in den Optionen bestimmt, welche Kameras, Hubs und Gongs überhaupt erscheinen. Pro Kategorie gibt es in der Karte einen eigenen Schalter.

## Neu in 0.0.1

Erste Veröffentlichung. Alle Funktionen sind neu und experimentell.

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
3. Für Experimentelles: *Experimentelle Funktionen anzeigen* einschalten und die gewünschten Funktionen ankreuzen.

Die Karte wird automatisch als Lovelace-Ressource eingetragen (im YAML-Modus muss `/reolink_manager_files/reolink-manager-card.js?v=0.0.1` als Modul-Ressource von Hand ergänzt werden).

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
| `show_cameras`, `show_battery`, `show_detections`, `show_updates`, `show_storage`, `show_controls`, `show_hub` | Kategorie anzeigen | `true` |
| `default_tab` | Starttab | `cameras` |
| `max_rows` | Maximale Zeilen | `50` |
| `zoom` | Skalierung in Prozent | `100` |
| `read_only` | Alle Bedienelemente ausblenden | `false` |
| `entry_id` | Nur bei mehreren Reolink-Manager-Einträgen | leer |

Ohne eingeschaltete experimentelle Funktionen zeigt die Karte nur das Zahnrad mit Version und Hinweisen.

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

Nur mit eingeschalteter Funktion `events` und Option „Ereignisse senden“. Beim Start gibt es eine Ruhephase von 60 s, damit keine Ereignisflut entsteht.

| Ereignis | Wann |
|---|---|
| `reolink_manager_device_offline` | Gerät war länger als die Offline-Verzögerung offline |
| `reolink_manager_device_online` | Gerät ist nach einer Offline-Meldung wieder online |
| `reolink_manager_battery_low` | Batterie unter der Schwelle „niedrig“ |
| `reolink_manager_battery_critical` | Batterie unter der Schwelle „kritisch“ |
| `reolink_manager_update_available` | Firmware-Update verfügbar |

Die Daten enthalten `entry_id`, `device_id`, `name`, `model`, `kind`, bei Batterie `battery`, bei Updates `installed_version` und `latest_version`. Beispiele: [`examples/`](examples/).

## Sensoren

Nur mit eingeschalteter Funktion `sensors`: Geräte, Offline, Batterie niedrig, Batterie kritisch, Updates verfügbar.

## Versionsanzeige und Update-Hinweis

Die Version steht im Zahnrad der Karte (App-Version), oben im Karten-Editor und im Optionen-Dialog. Der Manager fragt beim Start und danach alle 12 Stunden bei GitHub nach der neuesten Version. Gibt es eine neuere, erscheint ein orangefarbener Hinweis. Ist GitHub nicht erreichbar, läuft alles normal weiter („Prüfung nicht möglich“). Bis zum ersten Release auf GitHub meldet die Prüfung „keine Veröffentlichung“.

## Experimentelle Funktionen

Alles in 0.0.1 ist ungeprüft. Es gibt einen Hauptschalter (Optionen: *Experimentelle Funktionen anzeigen*, Karte: `show_experimental`) und je Funktion einen eigenen Schalter. Solange er aus ist, zeigt die Karte nichts davon, das Backend führt keine Aktionen aus, sendet keine Ereignisse und legt keine Sensoren an. Welche Funktion was bedeutet und wie du sie prüfst, steht in [EXPERIMENTELL.md](EXPERIMENTELL.md).

## Sicherheit

- Schreibende Aktionen der Karte (Schalten, PTZ, Aktualisieren, Neu einlesen, Update prüfen) nur für Administratoren. Die Details-Abfrage ist ebenfalls Administratoren vorbehalten. Lesen der Übersicht ist für alle angemeldeten Nutzer möglich.
- Das Backend prüft jede Aktion: nur Entitäten, die der Manager selbst verwaltet, und nur erlaubte Aktionen.
- Texte in der Karte werden maskiert, Farbwerte laufen über eine Allowlist.
- Riskante Aktionen (Sirene, Wecken) brauchen zwei Klicks.
- Der Manager verbindet sich nur mit GitHub (Versionsprüfung). Keine Zugangsdaten, keine Kamera-Zugriffe. Die Diagnose ist anonymisiert.

## Bekannte Einschränkungen

- **Nicht an echter Hardware getestet.** Getestet wurde gegen echte Home-Assistant-Klassen mit simulierten Reolink-Entitäten und im Browser mit Testdaten.
- Die Zuordnung der Reolink-Entitäten (`translation_key`, Bezeichnung der Unique-ID) ist aus der Dokumentation abgeleitet. Bei Entitäten, die nicht erkannt werden, steht im Popup „nicht zugeordnet“. Bitte melde diese Fälle als Issue (ohne Zugangsdaten, IPs oder Seriennummern).
- Die Polarität des Schlafstatus (an = schläft) ist angenommen.
- Das Repository `meine-smarte-welt/reolink_manager` für die Versionsprüfung ist angenommen.
- Der Manager zeigt nur, was die Reolink-Integration liefert. Fehlt dort etwas, fehlt es auch hier.
- Übersetzungen (Deutsch, Englisch, Niederländisch) sind nicht von Muttersprachlern geprüft.
- Keine Anbindung an das Notification Center in 0.0.1.

## Fehlerbehebung

- **Karte nicht gefunden:** Browser-Cache leeren (Strg+F5), prüfen, ob die Ressource `/reolink_manager_files/reolink-manager-card.js` eingetragen ist.
- **Karte zeigt nur das Zahnrad:** `show_experimental` und die Funktion `overview` in den Optionen einschalten.
- **Keine Geräte:** Ist der Reolink-Eintrag geladen? Im Zahnrad steht sein Status. Dann *Geräte neu einlesen*.
- **Diagnose:** Einstellungen → Geräte & Dienste → Reolink Manager → Diagnose herunterladen (anonymisiert).

## Versionshistorie

| Version | Änderung |
|---|---|
| **0.0.1** | Erste Veröffentlichung. Alles experimentell. |

## Datei-Integrität

Python-, JavaScript- und YAML-Dateien tragen in der ersten Zeile einen SHA-256-Hash des Inhalts ab Zeile 2. Prüfen: `tail -n +2 datei.py | sha256sum`. Für JSON-Dateien gilt diese Tabelle (SHA-256 über die ganze Datei):

| Datei | SHA-256 |
|---|---|
| `hacs.json` | `4e05738d8be8aa023f7d922544ed51f3aefbd0bb5fe89f9b7573e637c505d5ad` |
| `custom_components/reolink_manager/icons.json` | `b67ca9f86968bb7b07e93637b107963721a319cbc429b4c3bc4c9a9bc039f49a` |
| `custom_components/reolink_manager/manifest.json` | `adecb6bd3db697fd4ffe862dcff9e214408747f368adaabd26793e628ab709e9` |
| `custom_components/reolink_manager/strings.json` | `9d167cb254f8212b46400e2a57cf7404bdae23391b2031a92d6e56f7c5ea378f` |
| `custom_components/reolink_manager/translations/de.json` | `9d167cb254f8212b46400e2a57cf7404bdae23391b2031a92d6e56f7c5ea378f` |
| `custom_components/reolink_manager/translations/en.json` | `f8be351f6e762ca73e01c712bed1d739e32173090166db1f827d1b37b527d321` |
| `custom_components/reolink_manager/translations/nl.json` | `cbaffb96d5f8b898ee0ed2ec0756fff0559d4a43f15242519f63e8a2b854b4fd` |

## Lizenz

MIT, siehe [LICENSE](LICENSE).
