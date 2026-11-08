| [🇩🇪<br>**Deutsch**](README.md) | 🇬🇧<br>**English** | [🇳🇱<br>**Nederlands**](README.nl.md) |
|:-:|:-:|:-:|

![Reolink Manager](docs/images/reolink_manager.webp)

# Reolink Manager

📖 Blog post: coming soon on [meinesmartewelt.de](https://meinesmartewelt.de) (German)

Reolink Manager is an add-on for Home Assistant. It sits on top of the **official Reolink integration** and shows cameras, the Home Hub and chimes in one card with categories: Cameras, Battery, Detections, Updates, Storage, Controls and Hub.

The manager only reads the devices, entities and states the Reolink integration already provides. It does **not talk to the cameras itself**, so battery cameras (e.g. Argus) are not woken up additionally.

> **Important, version 0.0.1:** Everything in this version is new and **untested**. All features are therefore **hidden by default** and have to be switched on deliberately (see [Experimental features](#experimental-features)). Nothing has been tested with real cameras. Details in [EXPERIMENTELL.md](EXPERIMENTELL.md) (German).

## Features

| Category (tab) | Content | Feature |
|---|---|---|
| Cameras | Status (online, offline, privacy mode), sleep status, battery, Wi-Fi signal | `overview` |
| Battery | Level, state, temperature, warning levels low and critical | `overview` |
| Detections | Motion, person, vehicle, pet, animal, face, package, visitor, baby crying, bicycle, with "last changed" | `overview` |
| Updates | Device firmware updates with installed and new version | `overview` |
| Storage | SD card or hub storage usage, as far as the Reolink integration provides it | `overview` |
| Controls | Privacy mode, recording, push, hub scene, siren, light (writes) | `controls` |
| Hub | Home Hub with number of connected devices and scene | `overview` |
| Gear | Version, Reolink integration status, selection, options, maintenance, event log, experimental | always |

Additionally (all experimental): PTZ control (`ptz`), refresh/wake (`refresh`), overview sensors (`sensors`), events on the Home Assistant bus (`events`).

The device selection in the options decides which cameras, hubs and chimes appear at all. Each category has its own switch in the card.

## New in 0.0.1

First release. All features are new and experimental.

## Requirements

- Home Assistant 2025.6 or newer
- The official [Reolink integration](https://www.home-assistant.io/integrations/reolink) is set up. Your devices (e.g. Reolink Atlas PT Ultra, Argus 4 Pro, Argus 3 Ultra via the Home Hub) are already visible there.

## Installation

**HACS:** HACS → three-dot menu → Custom repositories → `https://github.com/meine-smarte-welt/reolink_manager` as category *Integration* → download Reolink Manager → restart Home Assistant.

**Manual:** Copy the folder `custom_components/reolink_manager` to `config/custom_components/` and restart Home Assistant.

Then: Settings → Devices & services → Add integration → **Reolink Manager**.

## Setup

1. Select the Reolink entries the manager should watch.
2. Under *Configure* choose the devices (empty = all), detection types, battery thresholds (default low 30 %, critical 15 %), offline delay (default 120 s) and whether events are sent.
3. For experimental features: switch on *Show experimental features* and tick the features you want.

The card is registered as a Lovelace resource automatically (in YAML mode add `/reolink_manager_files/reolink-manager-card.js?v=0.0.1` as a module resource by hand).

## The card

```yaml
type: custom:reolink-manager-card
title: Reolink Manager
show_experimental: true
default_tab: cameras
```

Everything can be set in the graphical editor. Important keys:

| Key | Meaning | Default |
|---|---|---|
| `show_experimental` | Show experimental features in this card | `false` |
| `show_cameras`, `show_battery`, `show_detections`, `show_updates`, `show_storage`, `show_controls`, `show_hub` | Show category | `true` |
| `default_tab` | Start tab | `cameras` |
| `max_rows` | Maximum rows | `50` |
| `zoom` | Scaling in percent | `100` |
| `read_only` | Hide all controls | `false` |
| `entry_id` | Only with several Reolink Manager entries | empty |

Without experimental features switched on, the card shows only the gear tab with version and hints.

## Colors

In the editor under *Colors* or via `color_*` keys. Empty = theme default. Allowed: hex, `rgb()`, `hsl()` and `var(--…)`.

| Key | Meaning |
|---|---|
| `color_tab_active` | Active tab |
| `color_success` / `color_warning` / `color_error` / `color_info` | Green, orange, red, blue |
| `color_row_icon` | Row icons (overrides all categories) |
| `color_live_banner` | Live banner |
| `color_icon_<category>` | Icon color per category |

## Services

| Service | Effect |
|---|---|
| `reolink_manager.rescan` | Re-reads devices and entities of the Reolink integration (wakes no camera) |
| `reolink_manager.check_update` | Checks GitHub for a new version right away |
| `reolink_manager.refresh_device` | Triggers an entity update for a device (experimental `refresh`, wakes battery cameras) |

## Events

Only with the `events` feature on and the option "Send events". After start there is a 60 s quiet phase so that no flood of events occurs.

| Event | When |
|---|---|
| `reolink_manager_device_offline` | Device has been offline longer than the offline delay |
| `reolink_manager_device_online` | Device is back online after an offline notice |
| `reolink_manager_battery_low` | Battery below the "low" threshold |
| `reolink_manager_battery_critical` | Battery below the "critical" threshold |
| `reolink_manager_update_available` | Firmware update available |

The data contains `entry_id`, `device_id`, `name`, `model`, `kind`, for battery `battery`, for updates `installed_version` and `latest_version`. Examples: [`examples/`](examples/).

## Sensors

Only with the `sensors` feature on: Devices, Offline, Battery low, Battery critical, Updates available.

## Version display and update notice

The version is shown in the card's gear tab (App version), at the top of the card editor and in the options dialog. The manager asks GitHub for the latest version at start and every 12 hours. If a newer one exists, an orange notice appears. If GitHub is not reachable, everything keeps running ("check not possible"). Until the first release exists on GitHub, the check reports "no release".

## Experimental features

Everything in 0.0.1 is untested. There is a master switch (options: *Show experimental features*, card: `show_experimental`) and one switch per feature. While it is off, the card shows none of it, the backend performs no actions, sends no events and creates no sensors. What each feature means and how to test it is in [EXPERIMENTELL.md](EXPERIMENTELL.md) (German).

## Security

- Writing actions of the card (switching, PTZ, refresh, rescan, update check) are for administrators only. The details query is admin-only as well.
- The backend validates every action: only entities the manager manages itself, and only allowed actions.
- Texts in the card are escaped, color values go through an allowlist.
- Risky actions (siren, waking) need two clicks.
- The manager only connects to GitHub (version check). No credentials, no camera access. The diagnostics are anonymized.

## Known limitations

- **Not tested on real hardware.** Tested against real Home Assistant classes with simulated Reolink entities and in the browser with test data.
- The mapping of Reolink entities (`translation_key`, unique ID suffix) is derived from the documentation. Entities that are not recognized show "unassigned" in the popup. Please report these as an issue (without credentials, IPs or serial numbers).
- The polarity of the sleep status (on = sleeping) is assumed.
- The repository `meine-smarte-welt/reolink_manager` used for the version check is assumed.
- The manager only shows what the Reolink integration provides. If something is missing there, it is missing here.
- Translations (German, English, Dutch) have not been checked by native speakers.
- No Notification Center connection in 0.0.1.

## Troubleshooting

- **Card not found:** Clear the browser cache (Ctrl+F5), check that the resource `/reolink_manager_files/reolink-manager-card.js` is registered.
- **Card shows only the gear:** Switch on `show_experimental` and the `overview` feature in the options.
- **No devices:** Is the Reolink entry loaded? Its status is shown in the gear tab. Then *Rescan devices*.
- **Diagnostics:** Settings → Devices & services → Reolink Manager → Download diagnostics (anonymized).

## Version history

| Version | Change |
|---|---|
| **0.0.1** | First release. Everything experimental. |

## File integrity

Python, JavaScript and YAML files carry a SHA-256 hash of the content from line 2 on in their first line. Check: `tail -n +2 file.py | sha256sum`. For JSON files this table applies (SHA-256 over the whole file):

| Datei | SHA-256 |
|---|---|
| `hacs.json` | `4e05738d8be8aa023f7d922544ed51f3aefbd0bb5fe89f9b7573e637c505d5ad` |
| `custom_components/reolink_manager/icons.json` | `b67ca9f86968bb7b07e93637b107963721a319cbc429b4c3bc4c9a9bc039f49a` |
| `custom_components/reolink_manager/manifest.json` | `adecb6bd3db697fd4ffe862dcff9e214408747f368adaabd26793e628ab709e9` |
| `custom_components/reolink_manager/strings.json` | `9d167cb254f8212b46400e2a57cf7404bdae23391b2031a92d6e56f7c5ea378f` |
| `custom_components/reolink_manager/translations/de.json` | `9d167cb254f8212b46400e2a57cf7404bdae23391b2031a92d6e56f7c5ea378f` |
| `custom_components/reolink_manager/translations/en.json` | `f8be351f6e762ca73e01c712bed1d739e32173090166db1f827d1b37b527d321` |
| `custom_components/reolink_manager/translations/nl.json` | `cbaffb96d5f8b898ee0ed2ec0756fff0559d4a43f15242519f63e8a2b854b4fd` |

## License

MIT, see [LICENSE](LICENSE).
