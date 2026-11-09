| [🇩🇪<br>**Deutsch**](README.md) | 🇬🇧<br>**English** | [🇳🇱<br>**Nederlands**](README.nl.md) |
|:-:|:-:|:-:|

![Reolink Manager](docs/images/reolink_manager.webp)

# Reolink Manager

📖 Blog post: coming soon on [meinesmartewelt.de](https://meinesmartewelt.de) (German)

Reolink Manager is an add-on for Home Assistant. It sits on top of the **official Reolink integration** and shows cameras, the Home Hub and chimes in one card with categories: Cameras, Battery, Detections, Updates, Storage, Controls and Hub.

The manager only reads the devices, entities and states the Reolink integration already provides. It does **not talk to the cameras itself**, so battery cameras (e.g. Argus) are not woken up additionally.

> **Important, version 0.0.2:** Thorsten confirmed overview, sensors and events with 0.0.1 on his installation; they are now **always on**. New are live view, gallery and push notifications. Like controls, PTZ and refresh/wake they are **untested** and **hidden by default** (see [Experimental features](#experimental-features)). The new features have not yet been tested with real cameras or smartphones. Details in [EXPERIMENTELL.md](EXPERIMENTELL.md) (German).

## Features

| Category (tab) | Content | Feature |
|---|---|---|
| Cameras | Status (online, offline, privacy mode), sleep status, battery, Wi-Fi signal | always |
| Battery | Level, state, temperature, warning levels low and critical | always |
| Detections | Motion, person, vehicle, pet, animal, face, package, visitor, baby crying, bicycle, with "last changed" | always |
| Updates | Device firmware updates with installed and new version | always |
| Storage | SD card or hub storage usage, as far as the Reolink integration provides it | always |
| Controls | Privacy mode, recording, push, hub scene, siren, light (writes) | `controls` |
| Gallery | Recordings per camera as an expandable menu, low resolution from the media browser, count set in the options, playback in an overlay | `gallery` |
| Hub | Home Hub with number of connected devices and scene | always |
| Gear | Version, Reolink integration status, selection, options, maintenance, event log, experimental | always |

Always on (confirmed): the categories above, overview sensors (`sensors`) and events on the Home Assistant bus (`events`).

Experimental: live view in the popup (`live`), gallery (`gallery`), push notifications with image on detection (`push`), PTZ control (`ptz`), refresh/wake (`refresh`) and controls (`controls`).

The camera popup now has a visible scrollbar. With `live` it shows a still image at the top right away; a button starts the live stream, and a click on the PTZ controls switches to the stream automatically.

The device selection in the options decides which cameras, hubs and chimes appear at all. Each category has its own switch in the card.

## New in 0.0.2

- Popup: visible scrollbar, the accordions are no longer squashed
- Live view in the popup (`live`): still image right away, stream via button, a PTZ click switches to the stream
- New category Gallery (`gallery`): expandable menu per camera with the latest recordings (low resolution), count set in the options
- Push notifications (`push`): on selected detections a message with the current image goes to one or more smartphones; a tap opens the dashboard with the live view
- Overview, sensors and events are confirmed and always on

0.0.1: First release.

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
3. For experimental features: switch on *Show experimental features* and tick the features you want. A second step follows with the settings for gallery and push.
4. **Gallery:** number of videos per camera (default 5). The card loads only when you expand a camera and uses the low resolution.
5. **Push:** smartphones (`notify.mobile_app_…`, several possible), detection types (default person), lock time (default 60 s) and the dashboard path of the card, e.g. `/lovelace/cameras`. A tap on the message opens that dashboard and the card opens the camera's live view. The gear tab has a test message.

The card is registered as a Lovelace resource automatically (in YAML mode add `/reolink_manager_files/reolink-manager-card.js?v=0.0.2` as a module resource by hand).

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
| `show_cameras`, `show_battery`, `show_detections`, `show_updates`, `show_storage`, `show_gallery`, `show_controls`, `show_hub` | Show category | `true` |
| `live_auto` | Load the still image right when the popup opens (off = button only, spares battery cameras) | `true` |
| `default_tab` | Start tab | `cameras` |
| `max_rows` | Maximum rows | `50` |
| `zoom` | Scaling in percent | `100` |
| `read_only` | Hide all controls | `false` |
| `entry_id` | Only with several Reolink Manager entries | empty |

Without experimental features switched on, the card shows the confirmed categories (Cameras, Battery, Detections, Updates, Storage, Hub) and the gear tab.

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

Always on as long as the option "Send events" is switched on. After start there is a 60 s quiet phase so that no flood of events occurs.

| Event | When |
|---|---|
| `reolink_manager_device_offline` | Device has been offline longer than the offline delay |
| `reolink_manager_device_online` | Device is back online after an offline notice |
| `reolink_manager_battery_low` | Battery below the "low" threshold |
| `reolink_manager_battery_critical` | Battery below the "critical" threshold |
| `reolink_manager_update_available` | Firmware update available |

The data contains `entry_id`, `device_id`, `name`, `model`, `kind`, for battery `battery`, for updates `installed_version` and `latest_version`. Examples: [`examples/`](examples/).

## Sensors

Always on: Devices, Offline, Battery low, Battery critical, Updates available.

## Version display and update notice

The version is shown in the card's gear tab (App version), at the top of the card editor and in the options dialog. The manager asks GitHub for the latest version at start and every 12 hours. If a newer one exists, an orange notice appears. If GitHub is not reachable, everything keeps running ("check not possible"). Until the first release exists on GitHub, the check reports "no release".

## Experimental features

In 0.0.2 live view, gallery, push, controls, PTZ and refresh/wake are untested. There is a master switch (options: *Show experimental features*, card: `show_experimental`) and one switch per feature. While it is off, the card shows none of it, the backend performs no actions, sends no events and creates no sensors. What each feature means and how to test it is in [EXPERIMENTELL.md](EXPERIMENTELL.md) (German).

## Security

- Writing actions of the card (switching, PTZ, refresh, rescan, update check) are for administrators only. The details query is admin-only as well.
- The backend validates every action: only entities the manager manages itself, and only allowed actions.
- Texts in the card are escaped, color values go through an allowlist.
- Risky actions (siren, waking) need two clicks.
- The manager only connects to GitHub (version check). No credentials, no camera access. The diagnostics are anonymized.

## Known limitations

- **New features not tested on real hardware.** Thorsten confirmed overview, sensors and events with 0.0.1. Everything new was only tested against real Home Assistant classes with simulated Reolink entities and in the browser with test data; push not on real smartphones.
- The Reolink integration provides **no preview images** for recordings. The gallery therefore shows the current camera image per camera (for battery cameras only on button press) and a list of recordings.
- Whether a recording plays in the browser depends on the codec (H.265 does not work in every browser). Then use "Open in Home Assistant".
- Push: whether image and tap behave the same on iOS and Android is open. The companion app must be allowed to show notifications.
- The mapping of Reolink entities (`translation_key`, unique ID suffix) is derived from the documentation. Entities that are not recognized show "unassigned" in the popup. Please report these as an issue (without credentials, IPs or serial numbers).
- The polarity of the sleep status (on = sleeping) is assumed.
- The repository `meine-smarte-welt/reolink_manager` used for the version check is assumed.
- The manager only shows what the Reolink integration provides. If something is missing there, it is missing here.
- Translations (German, English, Dutch) have not been checked by native speakers.
- No Notification Center connection.

## Troubleshooting

- **Card not found:** Clear the browser cache (Ctrl+F5), check that the resource `/reolink_manager_files/reolink-manager-card.js` is registered.
- **Camera popup shows no live view:** switch on the `live` feature in the options and `show_experimental` in the card.
- **No push message:** choose the `push` feature, at least one smartphone and one detection type. Send the test message in the gear tab, then check the lock time.
- **No devices:** Is the Reolink entry loaded? Its status is shown in the gear tab. Then *Rescan devices*.
- **Diagnostics:** Settings → Devices & services → Reolink Manager → Download diagnostics (anonymized).

## Version history

| Version | Change |
|---|---|
| **0.0.2** | Popup with scrollbar, live view, gallery, push notifications. Overview, sensors, events confirmed and always on. |
| 0.0.1 | First release. Everything experimental. |

## File integrity

Python, JavaScript and YAML files carry a SHA-256 hash of the content from line 2 on in their first line. Check: `tail -n +2 file.py | sha256sum`. For JSON files this table applies (SHA-256 over the whole file):

| Datei | SHA-256 |
|---|---|
| `hacs.json` | `4e05738d8be8aa023f7d922544ed51f3aefbd0bb5fe89f9b7573e637c505d5ad` |
| `custom_components/reolink_manager/icons.json` | `b67ca9f86968bb7b07e93637b107963721a319cbc429b4c3bc4c9a9bc039f49a` |
| `custom_components/reolink_manager/manifest.json` | `50228b60a216612f0bd8cef69fa8856084cd42aa6e8a3925147efae67a109dab` |
| `custom_components/reolink_manager/strings.json` | `2c05a417e0253758b2698470833ea0545472d5b05c08afde707993709c65ac17` |
| `custom_components/reolink_manager/translations/de.json` | `2c05a417e0253758b2698470833ea0545472d5b05c08afde707993709c65ac17` |
| `custom_components/reolink_manager/translations/en.json` | `54d3cf5665d03ee599607d06613d8d94610f167ba2cc23508fb852bc70da7c5b` |
| `custom_components/reolink_manager/translations/nl.json` | `500de58bc94c634e79ee860ae55aa1d3796acf21a77f2a77d2d48f10193f25cb` |

## License

MIT, see [LICENSE](LICENSE).
