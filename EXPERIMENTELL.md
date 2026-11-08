# Experimentelle Funktionen – Reolink Manager

Stand: 2026-11-08 · Version: 0.0.1

Diese Funktionen sind **ungeprüft** und standardmäßig ausgeblendet.
Einschalten: Einstellungen → Geräte & Dienste → Reolink Manager → Konfigurieren → „Experimentelle Funktionen anzeigen“ und die gewünschten Funktionen auswählen. In der Karte: Editor → „Experimentell“ → „Experimentelle Funktionen anzeigen“.

Allgemein gilt für alle Zeilen: Es gibt Tests gegen echte Home-Assistant-Klassen mit simulierten Reolink-Entitäten und einen Browsertest der Karte mit Testdaten. Es gab **keinen** Test mit echten Kameras und nicht gegen die echte Reolink-Integration. Insbesondere die Zuordnung der Reolink-Entitäten (`translation_key`) ist aus der Dokumentation abgeleitet und nicht an echten Entitäten bestätigt.

## Offen (noch zu prüfen)

| Funktion | Schlüssel | Seit | Warum experimentell | Was zu prüfen ist | Status |
|---|---|---|---|---|---|
| Übersicht (nur Lesen): Tabs Kameras, Batterie, Erkennungen, Updates, Speicher, Hub, Ereignisprotokoll | `overview` | 0.0.1 | Neu gebaut. Die Zuordnung der Reolink-Entitäten zu Rollen ist aus der Dokumentation geraten. Die Polarität des Schlafstatus (an = schläft) ist angenommen. | 1) Optionen: Hauptschalter und „overview“ einschalten, Karte mit `show_experimental: true`. 2) Atlas PT Ultra, Argus 4 Pro, Argus 3 Ultra und Home Hub erscheinen mit richtigem Typ. 3) Batterie-Prozent bei den Argus-Kameras stimmt mit der Reolink-App überein. 4) Schlafende Kamera zeigt „Schläft“, wache nicht. 5) Im Popup unter „Entitäten und Diagnose“ steht bei möglichst wenigen Entitäten „nicht zugeordnet“. | offen |
| Übersichts-Sensoren (Geräte, Offline, Batterie niedrig, Batterie kritisch, Updates) | `sensors` | 0.0.1 | Neu gebaut, nur gegen simulierte Daten geprüft. | 1) „sensors“ einschalten, 5 Sensoren am Dienst „Reolink Manager“ erscheinen. 2) Werte stimmen mit der Karte überein. 3) „sensors“ ausschalten: Sensoren und Gerät verschwinden. | offen |
| Ereignisse auf dem HA-Bus (`reolink_manager_device_offline`, `_device_online`, `_battery_low`, `_battery_critical`, `_update_available`) | `events` | 0.0.1 | Neu gebaut. Timing (60 s Ruhephase nach dem Start, Offline-Verzögerung) nur mit simulierter Zeit geprüft. | 1) „events“ einschalten, Beispiel-Automation aus `examples/` anlegen. 2) Batterie-Schwelle testweise über dem aktuellen Wert setzen: Ereignis `_battery_low` kommt einmal. 3) Kamera vom Strom/WLAN trennen: nach der Verzögerung kommt `_device_offline`, danach `_device_online`. 4) Nach einem HA-Neustart kommt keine Ereignisflut. | offen |
| Steuerung (schreibt): Schalter für Privatmodus, Aufnahme, Push, Szene des Hubs, Sirene, Licht | `controls` | 0.0.1 | Schreibt in Entitäten der Reolink-Integration. Nur gegen simulierte Dienste geprüft. | 1) „controls“ einschalten, Tab „Steuerung“ erscheint. 2) Privatmodus an/aus einer Kamera schalten, Reolink-App bestätigt. 3) Szene am Hub wechseln. 4) Sirene: erster Klick fragt nach, zweiter löst aus (Vorsicht, laut). 5) Als Nicht-Administrator wird die Aktion abgelehnt. | offen |
| PTZ (schreibt): Richtungstasten, Stopp, Zoom, Positionen der Atlas PT Ultra | `ptz` | 0.0.1 | Schreibt in PTZ-Entitäten. Die Tasten bewegen die Kamera, bis „Stopp“ gedrückt wird. Nur simuliert geprüft. | 1) „ptz“ einschalten, Popup der Atlas PT Ultra öffnen. 2) Pfeil nach links, danach „Stopp“: Kamera bewegt sich und hält an. 3) Zoom ± funktioniert. 4) Eine gespeicherte Position anfahren. | offen |
| Aktualisieren/Wecken (schreibt): löst `homeassistant.update_entity` für ein Gerät aus | `refresh` | 0.0.1 | Weckt eine Akku-Kamera und verbraucht Batterie. Nur simuliert geprüft. | 1) „refresh“ einschalten. 2) Popup einer Akku-Kamera: Knopf zeigt beim ersten Klick die Warnung, beim zweiten wird ausgelöst. 3) Die Werte der Kamera werden aktuell. 4) Prüfen, wie stark es die Batterie belastet. | offen |
| Update-Prüfung gegen GitHub (kein Schalter, immer aktiv) | – | 0.0.1 | Das Repository `meine-smarte-welt/reolink_manager` ist angenommen. Bis zum ersten Release gibt es keine Veröffentlichung. | Nach dem ersten Release: Einstellungen-Tab zeigt „Aktuell“. Bei neuerer Version: orange Hinweis. | offen |

## Geprüft (Historie)

| Funktion | Geprüft am | In Version | Bestätigt von |
|---|---|---|---|
| – | – | – | – |
