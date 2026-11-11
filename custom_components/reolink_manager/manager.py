# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): aeac82f3824b3c7657da437636bc26d107c2b2bb066e4422de5bfee1a647c76b
"""Datenmodell, Zwischenspeicher, Aktionen und Ereignisse des Reolink Managers.

Der Manager spricht nie selbst mit den Kameras. Er liest nur Geräte-, Entitäts-
und Zustandsspeicher von Home Assistant, die die offizielle Reolink-Integration
befüllt. Dadurch weckt das Lesen keine Akku-Kameras.
"""
from __future__ import annotations

import asyncio
import logging
import time
from collections import deque
from collections.abc import Callable
from datetime import date, timedelta
from functools import partial
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Context, Event, HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_BATTERY_CRITICAL,
    CONF_BATTERY_LOW,
    CONF_DETECTION_TYPES,
    CONF_DEVICES,
    CONF_EVENTS_ENABLED,
    CONF_EXPERIMENTAL_ENABLED,
    CONF_EXPERIMENTAL_FEATURES,
    CONF_GALLERY_COUNT,
    CONF_OFFLINE_DELAY,
    CONF_PUSH_COOLDOWN,
    CONF_PUSH_DETECTIONS,
    CONF_PUSH_PATH,
    CONF_PUSH_TARGETS,
    CONF_REOLINK_ENTRIES,
    CHECKED_FEATURES,
    DEFAULT_BATTERY_CRITICAL,
    DEFAULT_BATTERY_LOW,
    DEFAULT_GALLERY_COUNT,
    DEFAULT_OFFLINE_DELAY,
    DEFAULT_PUSH_COOLDOWN,
    DEFAULT_PUSH_DETECTIONS,
    DETECTION_KINDS,
    DOMAIN,
    EVENT_LOG_SIZE,
    EVENT_NAMES,
    EXPERIMENTAL_FEATURES,
    FLUSH_DELAY,
    GALLERY_CACHE_SECONDS,
    GALLERY_MAX_COUNT,
    GALLERY_MAX_DAYS,
    GALLERY_TIMEOUT,
    QUIET_SECONDS,
    REOLINK_DOMAIN,
    RESCAN_DELAY,
    UPDATE_CHECK_INTERVAL_HOURS,
    VERSION,
    DASHBOARD_PUSH_PATH,
    LIVE_OPTION_KEYS,
    PTZ_FAILSAFE_SECONDS,
    PTZ_MIN_MOVE_SECONDS,
    PTZ_SPEED_DEFAULT,
    PTZ_SPEED_MAX,
    PTZ_SPEED_MIN,
)
from .update_check import async_fetch_latest

_LOGGER = logging.getLogger(__name__)

_PUSH_TEXTS = {
    "de": ("erkannt", {"motion": "Bewegung", "person": "Person", "vehicle": "Fahrzeug", "pet": "Haustier",
                       "animal": "Tier", "face": "Gesicht", "package": "Paket", "visitor": "Besucher",
                       "baby_cry": "Babyschreien", "bicycle": "Fahrrad"}, "Test-Nachricht von Reolink Manager"),
    "en": ("detected", {"motion": "Motion", "person": "Person", "vehicle": "Vehicle", "pet": "Pet",
                        "animal": "Animal", "face": "Face", "package": "Package", "visitor": "Visitor",
                        "baby_cry": "Baby crying", "bicycle": "Bicycle"}, "Test message from Reolink Manager"),
    "nl": ("gedetecteerd", {"motion": "Beweging", "person": "Persoon", "vehicle": "Voertuig", "pet": "Huisdier",
                            "animal": "Dier", "face": "Gezicht", "package": "Pakket", "visitor": "Bezoeker",
                            "baby_cry": "Babygehuil", "bicycle": "Fiets"}, "Testbericht van Reolink Manager"),
}

PTZ_ACTIONS = ("stop", "left", "right", "up", "down", "zoom_in", "zoom_out")

# Rollen, deren Zustandsänderungen der Manager mitverfolgt.
_TRACKED_EXACT = {
    "update", "sleep", "tamper", "battery", "battery_temp", "battery_state", "wifi",
    "storage", "privacy", "record", "push", "ptz_preset", "scene", "siren", "light", "switch",
}


class FeatureDisabled(HomeAssistantError):
    """Eine experimentelle Funktion ist nicht eingeschaltet."""


class ActionError(HomeAssistantError):
    """Eine Aktion wurde abgelehnt (Code in args[0])."""


# --------------------------------------------------------------------------
# Klassifizierung der Reolink-Entitäten (reine Funktionen, einzeln testbar)
# --------------------------------------------------------------------------
def _tail(unique_id: str | None) -> str:
    """Schlüsselteil der Reolink-unique_id ohne Geräte-UID und Kanalnummer."""
    parts = (unique_id or "").lower().split("_")[1:]
    if parts and parts[0].isdigit():
        parts = parts[1:]
    return "_".join(parts)


def detection_kind(ident: str) -> str | None:
    """Erkennungsart aus dem Entitätsschlüssel ableiten."""
    for kind, words in (
        ("visitor", ("visitor", "doorbell")),
        ("baby_cry", ("baby", "cry")),
        ("package", ("package",)),
        ("face", ("face",)),
        ("bicycle", ("bicycle", "non_motor")),
        ("vehicle", ("vehicle",)),
        ("person", ("person",)),
        ("pet", ("pet",)),
        ("animal", ("animal",)),
        ("motion", ("motion",)),
    ):
        if any(word in ident for word in words):
            return kind
    return None


def classify_entity(
    domain: str, key: str | None, unique_id: str | None, device_class: str | None = None
) -> str:
    """Rolle einer Reolink-Entität bestimmen."""
    tkey = (key or "").lower()
    tail = _tail(unique_id)
    names = {n for n in (tkey, tail) if n}
    ident = f"{tkey}|{tail}"
    dclass = (device_class or "").lower()

    def has(*words: str) -> bool:
        return any(word in ident for word in words)

    if domain == "update":
        return "update"
    if domain == "binary_sensor":
        if has("sleep"):
            return "sleep"
        if has("tamper"):
            return "tamper"
        if has("crossline", "intrusion", "linger", "forgotten", "taken", "io_input", "ioinput"):
            return "smart"
        kind = detection_kind(ident)
        return f"detect:{kind}" if kind else "binary_other"
    if domain == "sensor":
        if has("battery") or dclass == "battery":
            if has("temp") or dclass == "temperature":
                return "battery_temp"
            if has("state", "status", "charg"):
                return "battery_state"
            return "battery"
        if dclass == "signal_strength" or has("wifi"):
            return "wifi"
        if has("hdd", "storage", "sd_card"):
            return "storage"
        return "sensor_other"
    if domain == "switch":
        if has("privacy") and not has("mask"):
            return "privacy"
        if has("record") and not has("audio", "pre_record", "prerecord", "manual"):
            return "record"
        if has("push"):
            return "push"
        return "switch"
    if domain == "light":
        return "light"
    if domain == "siren":
        return "siren"
    if domain == "select":
        if "ptz_preset" in names or has("ptz_preset"):
            return "ptz_preset"
        if has("scene"):
            return "scene"
        return "select"
    if domain == "button":
        for action in PTZ_ACTIONS:
            if f"ptz_{action}" in names:
                return f"ptz:{action}"
        return "button"
    if domain == "number":
        return "number"
    if domain == "camera":
        return "camera"
    return "other"


def _num(state: Any) -> float | None:
    try:
        return float(state.state)
    except (AttributeError, TypeError, ValueError):
        return None


class ReolinkManager:
    """Hält Zustand und Ereignisse je Config Entry."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.data: dict[str, Any] = {}
        self._listeners: list[Callable[[str, Any], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._state_unsub: CALLBACK_TYPE | None = None
        self._flush_handle: CALLBACK_TYPE | None = None
        self._rescan_handle: CALLBACK_TYPE | None = None
        self._devices: dict[str, dict[str, Any]] = {}
        self._entities: dict[str, dict[str, Any]] = {}
        self._prev: dict[str, dict[str, Any]] = {}
        self._offline_timers: dict[str, CALLBACK_TYPE] = {}
        self._offline_notified: set[str] = set()
        self._log: deque[dict[str, str]] = deque(maxlen=EVENT_LOG_SIZE)
        self._quiet_until = time.monotonic() + QUIET_SECONDS
        self._stopped = False
        self._gallery_cache: dict[str, tuple[float, dict[str, Any]]] = {}
        self._push_last: dict[tuple[str, str], float] = {}
        self._ptz_locks: dict[str, asyncio.Lock] = {}
        self._ptz_started: dict[str, float] = {}
        self._ptz_failsafe: dict[str, CALLBACK_TYPE] = {}
        self.dashboard_ready = False
        self.options_sig: dict[str, Any] = {}
        self.app: dict[str, Any] = {
            "version": VERSION,
            "latest_version": None,
            "release_url": None,
            "update_available": False,
            "checked_at": None,
            "check_failed": False,
        }

    # ------------------------------------------------------------------
    # Optionen
    # ------------------------------------------------------------------
    @property
    def selected_reolink_entries(self) -> list[str]:
        """Auswahl aus den Optionen (nachträglich änderbar), sonst aus der Einrichtung."""
        chosen = self.entry.options.get(CONF_REOLINK_ENTRIES)
        if chosen:
            return list(chosen)
        return list(self.entry.data.get(CONF_REOLINK_ENTRIES, []))

    @property
    def battery_low(self) -> int:
        return int(self.entry.options.get(CONF_BATTERY_LOW, DEFAULT_BATTERY_LOW))

    @property
    def battery_critical(self) -> int:
        return min(
            int(self.entry.options.get(CONF_BATTERY_CRITICAL, DEFAULT_BATTERY_CRITICAL)),
            self.battery_low,
        )

    @property
    def offline_delay(self) -> int:
        return int(self.entry.options.get(CONF_OFFLINE_DELAY, DEFAULT_OFFLINE_DELAY))

    @property
    def detection_types(self) -> list[str]:
        return list(self.entry.options.get(CONF_DETECTION_TYPES, DETECTION_KINDS))

    @property
    def gallery_count(self) -> int:
        value = int(self.entry.options.get(CONF_GALLERY_COUNT, DEFAULT_GALLERY_COUNT))
        return max(1, min(GALLERY_MAX_COUNT, value))

    @property
    def push_targets(self) -> list[str]:
        """Namen der notify-Dienste (ohne „notify.“), z. B. mobile_app_pixel."""
        out: list[str] = []
        for t in self.entry.options.get(CONF_PUSH_TARGETS, []):
            if isinstance(t, str):
                name = t.removeprefix("notify.")
                if name and name not in out:
                    out.append(name)
        return out

    @property
    def push_available(self) -> list[str]:
        """Alle vorhandenen Mobile-App-Dienste."""
        notify = self.hass.services.async_services().get("notify", {})
        return sorted(name for name in notify if name.startswith("mobile_app_"))

    @property
    def push_detections(self) -> list[str]:
        return list(self.entry.options.get(CONF_PUSH_DETECTIONS, DEFAULT_PUSH_DETECTIONS))

    @property
    def push_cooldown(self) -> int:
        return max(0, int(self.entry.options.get(CONF_PUSH_COOLDOWN, DEFAULT_PUSH_COOLDOWN)))

    @property
    def push_path(self) -> str:
        """Automatisch angelegtes Dashboard; ersatzweise ein alter, von Hand gesetzter Pfad."""
        if self.dashboard_ready:
            return DASHBOARD_PUSH_PATH
        path = str(self.entry.options.get(CONF_PUSH_PATH, "") or "").strip()
        return path if path.startswith("/") else f"/{path}" if path else DASHBOARD_PUSH_PATH

    def feature_enabled(self, key: str) -> bool:
        """Geprüfte Funktionen sind immer aktiv, experimentelle nur mit Hauptschalter UND Einzelschalter."""
        if key in CHECKED_FEATURES:
            return True
        if key not in EXPERIMENTAL_FEATURES:
            return False
        if not self.entry.options.get(CONF_EXPERIMENTAL_ENABLED, False):
            return False
        return key in self.entry.options.get(CONF_EXPERIMENTAL_FEATURES, [])

    def _require_feature(self, key: str) -> None:
        if not self.feature_enabled(key):
            raise FeatureDisabled("experimental_disabled")

    # ------------------------------------------------------------------
    # Lebenszyklus
    # ------------------------------------------------------------------
    async def async_start(self) -> None:
        self._scan()
        self._rebuild()
        self._unsubs.append(
            self.hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, self._handle_registry)
        )
        self._unsubs.append(
            self.hass.bus.async_listen(dr.EVENT_DEVICE_REGISTRY_UPDATED, self._handle_registry)
        )
        self._unsubs.append(
            async_track_time_interval(
                self.hass,
                self._async_interval_check,
                timedelta(hours=UPDATE_CHECK_INTERVAL_HOURS),
            )
        )
        self.entry.async_create_background_task(
            self.hass, self.async_check_update(), "reolink_manager_update_check"
        )

    async def async_stop(self) -> None:
        self._stopped = True
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        for handle in (self._state_unsub, self._flush_handle, self._rescan_handle):
            if handle:
                handle()
        for handle in self._offline_timers.values():
            handle()
        self._offline_timers.clear()
        for handle in self._ptz_failsafe.values():
            handle()
        self._ptz_failsafe.clear()
        self._listeners.clear()

    async def _async_interval_check(self, _now: Any) -> None:
        await self.async_check_update()

    async def async_check_update(self) -> None:
        result = await async_fetch_latest(self.hass)
        self.app.update(result)
        self.app["version"] = VERSION
        self._schedule_flush()

    # ------------------------------------------------------------------
    # Listener
    # ------------------------------------------------------------------
    @callback
    def async_add_listener(self, cb: Callable[[str, Any], None]) -> CALLBACK_TYPE:
        self._listeners.append(cb)

        @callback
        def _remove() -> None:
            if cb in self._listeners:
                self._listeners.remove(cb)

        return _remove

    @callback
    def _notify(self, kind: str, payload: Any) -> None:
        for cb in list(self._listeners):
            try:
                cb(kind, payload)
            except Exception:  # noqa: BLE001 - ein defekter Listener darf andere nicht stören
                _LOGGER.debug("Listener-Fehler", exc_info=True)

    @callback
    def _schedule_flush(self) -> None:
        if self._stopped or self._flush_handle is not None:
            return
        self._flush_handle = async_call_later(self.hass, FLUSH_DELAY, self._flush)

    @callback
    def _flush(self, _now: Any) -> None:
        self._flush_handle = None
        if self._stopped:
            return
        self._rebuild()
        self._notify("snapshot", self.data)

    @callback
    def _handle_state(self, event: Event) -> None:
        self._maybe_push(event)
        self._schedule_flush()

    @callback
    def _maybe_push(self, event: Event) -> None:
        """Push-Nachricht bei einer neuen Erkennung (nur Wechsel aus → an)."""
        if not self.feature_enabled("push") or not self.push_targets:
            return
        info = self._entities.get(event.data.get("entity_id", ""))
        new, old = event.data.get("new_state"), event.data.get("old_state")
        if info is None or not info["role"].startswith("detect:") or new is None or old is None:
            return
        if new.state != STATE_ON or old.state != STATE_OFF:
            return
        kind = info["role"].split(":", 1)[1]
        if kind not in self.push_detections or kind not in self.detection_types:
            return
        now = time.monotonic()
        if now < self._quiet_until:
            return
        key = (info["device"], kind)
        if now - self._push_last.get(key, -1e9) < self.push_cooldown:
            return
        self._push_last[key] = now
        self.entry.async_create_background_task(
            self.hass, self._async_push(info["device"], kind), "reolink_manager_push"
        )

    def _push_lang(self) -> tuple[str, dict[str, str], str]:
        lang = (self.hass.config.language or "en").split("-")[0]
        return _PUSH_TEXTS.get(lang, _PUSH_TEXTS["en"])

    def _camera_entity(self, device_id: str) -> str | None:
        """Bevorzugt die flüssige (Sub-)Kamera, dann Haupt, sonst irgendeine vorhandene."""
        info = self._devices.get(device_id)
        if info is None:
            return None
        cams = [
            e for e in info["entities"]
            if e["domain"] == "camera" and self.hass.states.get(e["entity_id"]) is not None
        ]
        for wanted in ("sub", "main"):
            for ent in cams:
                if ent["key"] == wanted:
                    return ent["entity_id"]
        return cams[0]["entity_id"] if cams else None

    async def _async_push(self, device_id: str, kind: str | None, test: bool = False) -> int:
        """Nachricht mit aktuellem Bild an die gewählten Smartphones senden."""
        info = self._devices.get(device_id)
        if info is None:
            return 0
        detected, kinds, test_text = self._push_lang()
        camera = self._camera_entity(device_id)
        sep = "&" if "?" in self.push_path else "?"
        url = f"{self.push_path}{sep}reolink_live={device_id}&reolink_t={int(time.time())}"
        payload: dict[str, Any] = {
            "image": f"/api/camera_proxy/{camera}" if camera else None,
            "clickAction": url,
            "url": url,
            "tag": f"reolink_manager_{device_id}",
            "group": "reolink_manager",
            "push": {"category": "camera"},
        }
        if camera:
            payload["entity_id"] = camera
            payload["attachment"] = {"url": f"/api/camera_proxy/{camera}", "content-type": "jpeg"}
        payload = {k: v for k, v in payload.items() if v is not None}
        message = test_text if test else f"{kinds.get(kind or '', kind)} {detected}"
        sent = 0
        available = self.hass.services.async_services().get("notify", {})
        for target in self.push_targets:
            if target not in available:
                _LOGGER.debug("Push-Ziel nicht vorhanden, übersprungen")
                continue
            try:
                await self.hass.services.async_call(
                    "notify",
                    target,
                    {"title": info["name"], "message": message, "data": payload},
                    blocking=True,
                )
                sent += 1
            except HomeAssistantError:
                _LOGGER.warning("Push-Nachricht konnte nicht gesendet werden")
        return sent

    @callback
    def _handle_registry(self, event: Event) -> None:
        """Registeränderungen gebündelt verarbeiten (Reolink legt beim Start viele an)."""
        if self._rescan_handle is not None or self._stopped:
            return
        data = event.data
        if data.get("action") == "update" and "changes" in data:
            changes = set(data["changes"])
            if not changes & {"name", "name_by_user", "disabled_by", "via_device_id", "model", "device_id"}:
                return
        self._rescan_handle = async_call_later(self.hass, RESCAN_DELAY, self._do_rescan)

    @callback
    def _do_rescan(self, _now: Any) -> None:
        self._rescan_handle = None
        if self._stopped:
            return
        self._scan()
        self._schedule_flush()

    @callback
    def async_rescan(self) -> None:
        self._scan()
        self._schedule_flush()

    # ------------------------------------------------------------------
    # Geräte und Entitäten einlesen
    # ------------------------------------------------------------------
    def _scan(self) -> None:
        hass = self.hass
        dev_reg = dr.async_get(hass)
        ent_reg = er.async_get(hass)
        wanted = set(self.entry.options.get(CONF_DEVICES) or [])

        candidates: dict[str, dr.DeviceEntry] = {}
        for entry_id in self.selected_reolink_entries:
            for dev in dr.async_entries_for_config_entry(dev_reg, entry_id):
                if dev.disabled_by is None:
                    candidates[dev.id] = dev
        children: dict[str, int] = {}
        for dev in candidates.values():
            if dev.via_device_id:
                children[dev.via_device_id] = children.get(dev.via_device_id, 0) + 1

        devices: dict[str, dict[str, Any]] = {}
        entities: dict[str, dict[str, Any]] = {}
        for dev in candidates.values():
            if wanted and dev.id not in wanted:
                continue
            model = dev.model or ""
            lower = model.lower()
            if dev.id in children:
                kind = "hub"
            elif "chime" in lower:
                kind = "chime"
            elif ("hub" in lower or "nvr" in lower) and not dev.via_device_id:
                kind = "hub"
            else:
                kind = "camera"
            via = dev_reg.async_get(dev.via_device_id) if dev.via_device_id else None
            ents: list[dict[str, Any]] = []
            for ent in er.async_entries_for_device(ent_reg, dev.id, include_disabled_entities=True):
                if ent.platform != REOLINK_DOMAIN:
                    continue
                role = classify_entity(
                    ent.domain,
                    ent.translation_key,
                    ent.unique_id,
                    ent.device_class or ent.original_device_class,
                )
                if ent.disabled_by is not None and role != "storage":
                    continue  # Deaktiviertes bleibt unsichtbar, nur Speichersensoren (standardmäßig aus) zählen
                info = {
                    "entity_id": ent.entity_id,
                    "domain": ent.domain,
                    "role": role,
                    "key": ent.translation_key or _tail(ent.unique_id),
                    "name": ent.name or ent.original_name or ent.translation_key or ent.entity_id,
                    "disabled": ent.disabled_by is not None,
                }
                ents.append(info)
                entities[ent.entity_id] = {**info, "device": dev.id}
            devices[dev.id] = {
                "id": dev.id,
                "name": dev.name_by_user or dev.name or dev.id,
                "model": model,
                "kind": kind,
                "hub": (via.name_by_user or via.name) if via else None,
                "children": children.get(dev.id, 0),
                "entities": ents,
            }
        self._devices = devices
        self._entities = entities

        tracked = [
            eid
            for eid, info in entities.items()
            if info["role"] in _TRACKED_EXACT or info["role"].startswith("detect:")
        ]
        if self._state_unsub:
            self._state_unsub()
            self._state_unsub = None
        if tracked:
            self._state_unsub = async_track_state_change_event(hass, tracked, self._handle_state)

    # ------------------------------------------------------------------
    # Ansichten bauen
    # ------------------------------------------------------------------
    def _device_view(self, info: dict[str, Any]) -> dict[str, Any]:
        hass = self.hass
        states = {e["entity_id"]: hass.states.get(e["entity_id"]) for e in info["entities"]}
        by_role: dict[str, list[dict[str, Any]]] = {}
        for ent in info["entities"]:
            by_role.setdefault(ent["role"], []).append(ent)

        def first(role: str) -> tuple[dict[str, Any] | None, Any]:
            for ent in by_role.get(role, []):
                return ent, states.get(ent["entity_id"])
            return None, None

        def usable(state: Any) -> bool:
            return state is not None and state.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN)

        present = [s for s in states.values() if s is not None]
        _, privacy_state = first("privacy")
        if not present:
            status = "unknown"
        elif privacy_state is not None and privacy_state.state == STATE_ON:
            status = "privacy"
        elif all(s.state == STATE_UNAVAILABLE for s in present):
            status = "offline"
        else:
            status = "online"

        _, sleep_state = first("sleep")
        sleeping = None if not usable(sleep_state) else sleep_state.state == STATE_ON

        battery = None
        b_ent, b_state = first("battery")
        if b_ent is not None:
            percent = _num(b_state)
            level = None
            if percent is not None:
                if percent <= self.battery_critical:
                    level = "critical"
                elif percent <= self.battery_low:
                    level = "low"
                else:
                    level = "ok"
            _, t_state = first("battery_temp")
            _, s_state = first("battery_state")
            battery = {
                "entity": b_ent["entity_id"],
                "percent": percent,
                "level": level,
                "temperature": _num(t_state),
                "state": s_state.state if usable(s_state) else None,
            }

        def simple(role: str) -> dict[str, Any] | None:
            ent, st = first(role)
            if ent is None:
                return None
            return {
                "entity": ent["entity_id"],
                "value": st.state if usable(st) else None,
                "unit": st.attributes.get("unit_of_measurement") if st is not None else None,
            }

        allowed = set(self.detection_types)
        detections: list[dict[str, Any]] = []
        for ent in info["entities"]:
            if not ent["role"].startswith("detect:"):
                continue
            kind = ent["role"].split(":", 1)[1]
            if kind not in allowed:
                continue
            st = states.get(ent["entity_id"])
            if st is None:
                continue
            detections.append(
                {
                    "kind": kind,
                    "entity": ent["entity_id"],
                    "on": st.state == STATE_ON,
                    "available": st.state != STATE_UNAVAILABLE,
                    "changed": st.last_changed.isoformat(),
                }
            )
        detections.sort(key=lambda d: DETECTION_KINDS.index(d["kind"]) if d["kind"] in DETECTION_KINDS else 99)

        update = None
        u_ent, u_state = first("update")
        if u_ent is not None and u_state is not None:
            update = {
                "entity": u_ent["entity_id"],
                "available": u_state.state == STATE_ON,
                "installed": u_state.attributes.get("installed_version"),
                "latest": u_state.attributes.get("latest_version"),
            }

        view: dict[str, Any] = {
            "device": info["id"],
            "name": info["name"],
            "model": info["model"],
            "kind": info["kind"],
            "hub": info["hub"],
            "children": info["children"],
            "status": status,
            "sleeping": sleeping,
            "battery": battery,
            "wifi": simple("wifi"),
            "storage": self._storage_view(info, simple("storage")),
            "detections": detections,
            "detecting": [d["kind"] for d in detections if d["on"]],
            "update": update,
            "entity_count": len(info["entities"]),
            "unclassified": sum(
                1
                for e in info["entities"]
                if e["role"] in ("other", "binary_other", "sensor_other")
            ),
        }

        if self.feature_enabled("controls"):
            quick: dict[str, Any] = {}
            for role in ("privacy", "record", "push"):
                ent, st = first(role)
                if ent is not None and st is not None:
                    quick[role] = {
                        "entity": ent["entity_id"],
                        "on": st.state == STATE_ON,
                        "available": st.state != STATE_UNAVAILABLE,
                    }
            view["controls"] = quick
            scene_ent, scene_state = first("scene")
            if scene_ent is not None and scene_state is not None:
                view["scene"] = {
                    "entity": scene_ent["entity_id"],
                    "current": scene_state.state,
                    "options": list(scene_state.attributes.get("options", [])),
                }
        if self.feature_enabled("ptz"):
            buttons = {
                role.split(":", 1)[1]: ents[0]["entity_id"]
                for role, ents in by_role.items()
                if role.startswith("ptz:")
            }
            p_ent, p_state = first("ptz_preset")
            if buttons or p_ent is not None:
                view["ptz"] = {
                    "buttons": buttons,
                    "preset": {
                        "entity": p_ent["entity_id"],
                        "current": p_state.state if p_state is not None else None,
                        "options": list(p_state.attributes.get("options", [])) if p_state is not None else [],
                    }
                    if p_ent is not None
                    else None,
                }
        if self.feature_enabled("refresh"):
            view["refreshable"] = self._refresh_entity(info) is not None
        if info["kind"] == "camera" and (
            self.feature_enabled("live") or self.feature_enabled("gallery")
        ):
            camera = self._camera_entity(info["id"])
            if camera is not None:
                if self.feature_enabled("live"):
                    view["live"] = {"entity": camera}
                if self.feature_enabled("gallery"):
                    view["gallery"] = {"entity": camera}
        return view

    @staticmethod
    def _storage_view(info: dict[str, Any], base: dict[str, Any] | None) -> dict[str, Any] | None:
        """Speicher: auch ohne Wert anzeigen (Speichersensoren sind bei Reolink standardmäßig deaktiviert)."""
        ents = [e for e in info["entities"] if e["role"] == "storage"]
        if base is None:
            return {"entity": None, "value": None, "unit": None, "disabled": False} if info["kind"] == "hub" else None
        base["disabled"] = bool(ents) and all(e["disabled"] for e in ents)
        return base

    @staticmethod
    def _refresh_entity(info: dict[str, Any]) -> str | None:
        """Entität für homeassistant.update_entity (Doku: z. B. der Bewegungssensor)."""
        fallback = None
        for ent in info["entities"]:
            if ent["domain"] != "binary_sensor":
                continue
            if ent["role"] == "detect:motion":
                return ent["entity_id"]
            if fallback is None:
                fallback = ent["entity_id"]
        return fallback

    def _reolink_status(self) -> list[dict[str, Any]]:
        result = []
        for entry_id in self.selected_reolink_entries:
            entry = self.hass.config_entries.async_get_entry(entry_id)
            result.append(
                {
                    "entry_id": entry_id,
                    "title": entry.title if entry else entry_id,
                    "state": entry.state.value if entry else "missing",
                }
            )
        return result

    def _rebuild(self) -> None:
        views = [self._device_view(info) for info in self._devices.values()]
        stats = {
            "total": len(views),
            "cameras": sum(1 for v in views if v["kind"] == "camera"),
            "hubs": sum(1 for v in views if v["kind"] == "hub"),
            "chimes": sum(1 for v in views if v["kind"] == "chime"),
            "offline": sum(1 for v in views if v["status"] == "offline"),
            "privacy": sum(1 for v in views if v["status"] == "privacy"),
            "battery_low": sum(
                1 for v in views if v["battery"] and v["battery"]["level"] in ("low", "critical")
            ),
            "battery_critical": sum(
                1 for v in views if v["battery"] and v["battery"]["level"] == "critical"
            ),
            "updates": sum(1 for v in views if v["update"] and v["update"]["available"]),
            "detecting": sum(1 for v in views if v["detecting"]),
        }
        self._check_events(views)
        overview = self.feature_enabled("overview")
        enabled = bool(self.entry.options.get(CONF_EXPERIMENTAL_ENABLED, False))
        self.data = {
            "app": dict(self.app),
            "experimental": {
                "enabled": enabled,
                "features": [k for k in EXPERIMENTAL_FEATURES if self.feature_enabled(k)],
                "available": [{"key": k, "icon": v["icon"]} for k, v in EXPERIMENTAL_FEATURES.items()],
                "checked": list(CHECKED_FEATURES),
            },
            "options": {
                "battery_low": self.battery_low,
                "battery_critical": self.battery_critical,
                "offline_delay": self.offline_delay,
                "events_enabled": bool(self.entry.options.get(CONF_EVENTS_ENABLED, True)),
                "detection_types": self.detection_types,
                "devices_selected": len(self.entry.options.get(CONF_DEVICES) or []),
                "gallery_count": self.gallery_count,
                "push_targets": self.push_targets,
                "push_available": self.push_available,
                "push_detections": self.push_detections,
                "detection_kinds": list(DETECTION_KINDS),
                "push_cooldown": self.push_cooldown,
                "push_path": self.push_path,
            },
            "reolink": self._reolink_status(),
            "stats": stats,
            "devices": views if overview else [],
            "events": list(self._log) if overview else [],
        }

    # ------------------------------------------------------------------
    # Ereignisse (beim Start nur Ausgangszustand, keine Flut)
    # ------------------------------------------------------------------
    def _check_events(self, views: list[dict[str, Any]]) -> None:
        quiet = time.monotonic() < self._quiet_until
        seen = set()
        for view in views:
            dev_id = view["device"]
            seen.add(dev_id)
            now = {
                "status": view["status"],
                "level": view["battery"]["level"] if view["battery"] else None,
                "update": bool(view["update"] and view["update"]["available"]),
            }
            prev = self._prev.get(dev_id)
            self._prev[dev_id] = now
            if prev is None or quiet:
                if now["status"] == "offline" and dev_id not in self._offline_timers and not quiet:
                    self._start_offline_timer(view)
                continue
            if now["status"] == "offline" and prev["status"] != "offline":
                self._start_offline_timer(view)
            elif now["status"] != "offline" and prev["status"] == "offline":
                self._cancel_offline_timer(dev_id)
                if dev_id in self._offline_notified:
                    self._offline_notified.discard(dev_id)
                    self._emit("online", view)
            if now["level"] != prev["level"]:
                if now["level"] == "critical":
                    self._emit("battery_critical", view)
                elif now["level"] == "low" and prev["level"] in (None, "ok"):
                    self._emit("battery_low", view)
            if now["update"] and not prev["update"]:
                self._emit("update_available", view)
        for gone in set(self._prev) - seen:
            self._prev.pop(gone, None)
            self._cancel_offline_timer(gone)
            self._offline_notified.discard(gone)

    def _start_offline_timer(self, view: dict[str, Any]) -> None:
        dev_id = view["device"]
        self._cancel_offline_timer(dev_id)
        if self.offline_delay <= 0:
            self._offline_notified.add(dev_id)
            self._emit("offline", view)
            return
        self._offline_timers[dev_id] = async_call_later(
            self.hass, self.offline_delay, partial(self._offline_confirm, dev_id)
        )

    def _cancel_offline_timer(self, dev_id: str) -> None:
        handle = self._offline_timers.pop(dev_id, None)
        if handle:
            handle()

    @callback
    def _offline_confirm(self, dev_id: str, _now: Any) -> None:
        self._offline_timers.pop(dev_id, None)
        info = self._devices.get(dev_id)
        if info is None or self._stopped:
            return
        view = self._device_view(info)
        if view["status"] == "offline":
            self._offline_notified.add(dev_id)
            self._emit("offline", view)
            self._schedule_flush()

    def _emit(self, kind: str, view: dict[str, Any]) -> None:
        self._log.appendleft(
            {"t": dt_util.utcnow().isoformat(), "type": kind, "name": view["name"]}
        )
        if not (
            self.feature_enabled("events") and self.entry.options.get(CONF_EVENTS_ENABLED, True)
        ):
            return
        payload: dict[str, Any] = {
            "entry_id": self.entry.entry_id,
            "device_id": view["device"],
            "name": view["name"],
            "model": view["model"],
            "kind": view["kind"],
        }
        if kind.startswith("battery") and view["battery"]:
            payload["battery"] = view["battery"]["percent"]
        if kind == "update_available" and view["update"]:
            payload["installed_version"] = view["update"]["installed"]
            payload["latest_version"] = view["update"]["latest"]
        self.hass.bus.async_fire(EVENT_NAMES[kind], payload)

    # ------------------------------------------------------------------
    # Details für das Popup (nur Admin)
    # ------------------------------------------------------------------
    def details(self, device_id: str) -> dict[str, Any]:
        info = self._devices.get(device_id)
        if info is None:
            raise ActionError("unknown_device")
        entities = []
        for ent in info["entities"]:
            st = self.hass.states.get(ent["entity_id"])
            item = {
                "entity": ent["entity_id"],
                "name": ent["name"],
                "domain": ent["domain"],
                "role": ent["role"],
                "key": ent["key"],
                "state": st.state if st is not None else None,
                "unit": st.attributes.get("unit_of_measurement") if st is not None else None,
            }
            if ent["domain"] == "select" and st is not None:
                item["options"] = list(st.attributes.get("options", []))
            entities.append(item)
        return {"device": device_id, "entities": entities}

    # ------------------------------------------------------------------
    # Aktionen (nur Admin, siehe websocket_api.py)
    # ------------------------------------------------------------------
    @callback
    def respond(self, topic: str, status: str, error: str | None = None) -> None:
        self._notify("response", {"topic": topic, "status": status, "error": error})

    async def async_run_action(
        self, action: str, msg: dict[str, Any], context: Context | None
    ) -> None:
        """Aktion im Hintergrund ausführen, Ergebnis als response-Ereignis."""
        try:
            if action == "set_entity":
                await self._async_set_entity(msg, context)
            elif action == "refresh_device":
                await self._async_refresh_device(msg["device"], context)
            elif action == "rescan":
                self.async_rescan()
            elif action == "check_update":
                await self.async_check_update()
            elif action == "test_push":
                await self._async_test_push(msg.get("device"))
            elif action == "ptz":
                await self._async_ptz(msg, context)
            elif action == "enable_storage":
                self._async_enable_storage(msg.get("device"))
            else:
                raise ActionError("not_allowed")
        except FeatureDisabled as err:
            self.respond(action, "error", str(err))
        except ActionError as err:
            self.respond(action, "error", str(err))
        except HomeAssistantError as err:
            _LOGGER.warning("Aktion %s fehlgeschlagen: %s", action, type(err).__name__)
            self.respond(action, "error", "call_failed")
        else:
            if action != "ptz":  # Halten-Bewegung erzeugt viele Aufrufe, nur Fehler melden
                self.respond(action, "ok")

    def _async_enable_storage(self, device_id: str | None) -> None:
        """Deaktivierte Speichersensoren des Geräts aktivieren (Reolink liefert sie standardmäßig abgeschaltet)."""
        self._require_feature("controls")
        info = self._devices.get(device_id or "")
        if info is None:
            raise ActionError("unknown_device")
        ent_reg = er.async_get(self.hass)
        changed = 0
        for ent in info["entities"]:
            if ent["role"] != "storage" or not ent["disabled"]:
                continue
            reg = ent_reg.async_get(ent["entity_id"])
            if reg is not None and reg.disabled_by is not None:
                ent_reg.async_update_entity(ent["entity_id"], disabled_by=None)
                changed += 1
        if not changed:
            raise ActionError("not_allowed")

    async def _async_test_push(self, device_id: str | None) -> None:
        self._require_feature("push")
        if not self.push_targets:
            raise ActionError("no_push_target")
        if device_id is None:
            device_id = next(
                (i["id"] for i in self._devices.values() if i["kind"] == "camera"), None
            )
        if device_id is None or device_id not in self._devices:
            raise ActionError("unknown_device")
        if await self._async_push(device_id, None, test=True) == 0:
            raise ActionError("call_failed")

    async def async_gallery(self, device_id: str, count: int | None = None) -> dict[str, Any]:
        """Neueste Aufnahmen (niedrige Auflösung) aus der Medienquelle der Reolink-Integration."""
        self._require_feature("gallery")
        info = self._devices.get(device_id)
        if info is None or info["kind"] != "camera":
            raise ActionError("unknown_device")
        count = max(1, min(int(count), GALLERY_MAX_COUNT)) if count else self.gallery_count
        cached = self._gallery_cache.get(device_id)
        if cached and time.monotonic() - cached[0] < GALLERY_CACHE_SECONDS and cached[1]["count"] == count:
            return cached[1]
        cams = {e["entity_id"] for e in info["entities"] if e["domain"] == "camera"}
        try:
            async with asyncio.timeout(GALLERY_TIMEOUT):
                result = await self._async_collect_gallery(cams, count)
        except ActionError:
            raise
        except (TimeoutError, HomeAssistantError, ValueError, KeyError, AttributeError):
            _LOGGER.debug("Galerie konnte nicht geladen werden", exc_info=True)
            raise ActionError("gallery_failed") from None
        result["device"] = device_id
        self._gallery_cache[device_id] = (time.monotonic(), result)
        return result

    async def _async_collect_gallery(self, cams: set[str], count: int) -> dict[str, Any]:
        from homeassistant.components import media_source  # noqa: PLC0415 - nur bei Bedarf

        root = await media_source.async_browse_media(self.hass, f"media-source://{REOLINK_DOMAIN}")
        cam_node = None
        for child in root.children or []:
            thumb = (child.thumbnail or "").split("?")[0]
            if thumb.rsplit("/", 1)[-1] in cams and (child.identifier or "").startswith("CAM|"):
                cam_node = child
                break
        if cam_node is None:
            raise ActionError("gallery_unavailable")
        _, entry_id, channel = cam_node.identifier.split("|", 2)
        days_node = await media_source.async_browse_media(
            self.hass, f"media-source://{REOLINK_DOMAIN}/RES|{entry_id}|{channel}|sub"
        )

        def day_key(node: Any) -> tuple[int, ...]:
            parts = (node.identifier or "").split("|")[4:7]
            return tuple(int(p) for p in parts if p.isdigit())

        days = sorted(
            (c for c in days_node.children or [] if c.can_expand and (c.identifier or "").startswith("DAY|")),
            key=day_key,
            reverse=True,
        )
        items: list[dict[str, Any]] = []
        for day in days[:GALLERY_MAX_DAYS]:
            node = await media_source.async_browse_media(self.hass, day.media_content_id)
            files = sorted((c for c in node.children or [] if c.can_play), key=lambda c: c.title, reverse=True)
            y, m, d = (day_key(day) + (0, 0, 0))[:3]
            for file in files:
                items.append(
                    {
                        "id": file.media_content_id,
                        "title": file.title,
                        "day": f"{y:04d}-{m:02d}-{d:02d}",
                        "start": self._epoch(y, m, d, file.title),
                        "thumbnail": file.thumbnail,
                    }
                )
                if len(items) >= count:
                    return {"count": count, "items": items}
        return {"count": count, "items": items}

    @staticmethod
    def _epoch(y: int, m: int, d: int, title: str) -> int | None:
        """Startzeit (Unix-Sekunden, Zeitzone von Home Assistant) aus Tag und Titel „HH:MM:SS …“."""
        try:
            hh, mm, ss = (int(x) for x in (title or "").split(" ", 1)[0].split(".")[0].split(":")[:3])
            local = dt_util.start_of_local_day(date(y, m, d)) + timedelta(
                hours=hh, minutes=mm, seconds=ss
            )
            return int(local.timestamp())
        except (ValueError, TypeError):
            return None

    async def async_download(self, device_id: str, day: str, title: str) -> dict[str, Any]:
        """Hochauflösende Aufnahme (Hauptstream) zur Aufnahme der Galerie finden und Download-Adresse liefern."""
        self._require_feature("gallery")
        info = self._devices.get(device_id)
        if info is None or info["kind"] != "camera":
            raise ActionError("unknown_device")
        start = (title or "").split(" ", 1)[0]
        try:
            y, m, d = (int(x) for x in day.split("-"))
        except ValueError:
            raise ActionError("download_failed") from None
        cams = {e["entity_id"] for e in info["entities"] if e["domain"] == "camera"}
        from homeassistant.components import media_source  # noqa: PLC0415

        try:
            async with asyncio.timeout(GALLERY_TIMEOUT):
                root = await media_source.async_browse_media(self.hass, f"media-source://{REOLINK_DOMAIN}")
                cam_node = next(
                    (
                        c
                        for c in root.children or []
                        if (c.thumbnail or "").split("?")[0].rsplit("/", 1)[-1] in cams
                        and (c.identifier or "").startswith("CAM|")
                    ),
                    None,
                )
                if cam_node is None:
                    raise ActionError("gallery_unavailable")
                _, entry_id, channel = cam_node.identifier.split("|", 2)
                node = await media_source.async_browse_media(
                    self.hass,
                    f"media-source://{REOLINK_DOMAIN}/DAY|{entry_id}|{channel}|main|{y}|{m}|{d}",
                )
                match = next(
                    (c for c in node.children or [] if c.can_play and (c.title or "").startswith(start)), None
                )
                if match is None:
                    raise ActionError("download_not_found")
                play = await media_source.async_resolve_media(self.hass, match.media_content_id, None)
        except ActionError:
            raise
        except (TimeoutError, HomeAssistantError, ValueError, KeyError, AttributeError):
            _LOGGER.debug("Download konnte nicht vorbereitet werden", exc_info=True)
            raise ActionError("download_failed") from None
        return {"url": play.url, "mime_type": play.mime_type, "title": match.title, "id": match.media_content_id}

    async def async_refresh_device(self, device_id: str, context: Context | None = None) -> None:
        """Für den Service refresh_device."""
        await self._async_refresh_device(device_id, context)

    async def _async_refresh_device(self, device_id: str, context: Context | None) -> None:
        self._require_feature("refresh")
        info = self._devices.get(device_id)
        if info is None:
            raise ActionError("unknown_device")
        entity_id = self._refresh_entity(info)
        if entity_id is None:
            raise ActionError("not_allowed")
        await self.hass.services.async_call(
            "homeassistant",
            "update_entity",
            {"entity_id": entity_id},
            blocking=True,
            context=context,
        )

    async def _async_set_entity(self, msg: dict[str, Any], context: Context | None) -> None:
        entity_id = msg.get("entity")
        info = self._entities.get(entity_id or "")
        if info is None:
            raise ActionError("unknown_entity")
        role, domain = info["role"], info["domain"]
        if role.startswith("ptz:") or role == "ptz_preset":
            self._require_feature("ptz")
        elif domain in ("switch", "light", "siren", "select"):
            self._require_feature("controls")
        else:
            raise ActionError("not_allowed")

        op = msg.get("op")
        value = msg.get("value")
        service: str
        data: dict[str, Any] = {"entity_id": entity_id}
        if domain == "button" and role.startswith("ptz:") and op == "press":
            service = "press"
        elif domain in ("switch", "light", "siren") and op in ("turn_on", "turn_off"):
            service = op
        elif domain == "select" and op == "select":
            state = self.hass.states.get(entity_id)
            options = list(state.attributes.get("options", [])) if state else []
            if value not in options:
                raise ActionError("bad_value")
            service = "select_option"
            data["option"] = value
        else:
            raise ActionError("not_allowed")
        await self.hass.services.async_call(domain, service, data, blocking=True, context=context)

    # ------------------------------------------------------------------
    # PTZ: Bewegung solange gehalten wird, mit einstellbarer Geschwindigkeit
    # ------------------------------------------------------------------
    def _ptz_stop_entity(self, device_id: str) -> str | None:
        for entity_id, info in self._entities.items():
            if info["device"] == device_id and info["role"] == "ptz:stop":
                return entity_id
        return None

    async def _ptz_press(self, entity_id: str, speed: int | None, context: Context | None) -> None:
        """Mit Geschwindigkeit über reolink.ptz_move, sonst als einfacher Tastendruck."""
        if speed is not None and self.hass.services.has_service("reolink", "ptz_move"):
            try:
                await self.hass.services.async_call(
                    "reolink", "ptz_move", {"entity_id": entity_id, "speed": speed},
                    blocking=True, context=context,
                )
                return
            except HomeAssistantError:
                _LOGGER.debug("reolink.ptz_move nicht möglich, nutze den Tastendruck")
        await self.hass.services.async_call(
            "button", "press", {"entity_id": entity_id}, blocking=True, context=context
        )

    def _cancel_ptz_failsafe(self, device_id: str) -> None:
        handle = self._ptz_failsafe.pop(device_id, None)
        if handle:
            handle()

    async def _async_ptz(self, msg: dict[str, Any], context: Context | None) -> None:
        """op=move: Bewegung starten; op=stop: anhalten. Je Gerät streng nacheinander."""
        self._require_feature("ptz")
        entity_id = msg.get("entity")
        info = self._entities.get(entity_id or "")
        if info is None:
            raise ActionError("unknown_entity")
        if info["domain"] != "button" or not str(info["role"]).startswith("ptz:"):
            raise ActionError("not_allowed")
        op = msg.get("op")
        if op not in ("move", "stop"):
            raise ActionError("not_allowed")
        device_id = info["device"]
        speed = PTZ_SPEED_DEFAULT
        if msg.get("value") not in (None, ""):
            try:
                speed = int(str(msg["value"]))
            except ValueError as err:
                raise ActionError("bad_value") from err
            speed = max(PTZ_SPEED_MIN, min(PTZ_SPEED_MAX, speed))
        lock = self._ptz_locks.setdefault(device_id, asyncio.Lock())
        async with lock:
            if op == "move" and info["role"] != "ptz:stop":
                self._ptz_started[device_id] = time.monotonic()
                await self._ptz_press(entity_id, speed, context)
                self._cancel_ptz_failsafe(device_id)
                self._ptz_failsafe[device_id] = async_call_later(
                    self.hass, PTZ_FAILSAFE_SECONDS, partial(self._ptz_failsafe_stop, device_id)
                )
                return
            stop = entity_id if info["role"] == "ptz:stop" else self._ptz_stop_entity(device_id)
            if stop is None:
                raise ActionError("unknown_entity")
            started = self._ptz_started.pop(device_id, None)
            if started is not None:
                wait = PTZ_MIN_MOVE_SECONDS - (time.monotonic() - started)
                if wait > 0:
                    await asyncio.sleep(wait)
            self._cancel_ptz_failsafe(device_id)
            await self._ptz_press(stop, None, context)

    @callback
    def _ptz_failsafe_stop(self, device_id: str, _now: Any) -> None:
        """Bleibt der Stopp-Befehl aus (Verbindung weg), hält die Kamera nach kurzer Zeit selbst an."""
        self._ptz_failsafe.pop(device_id, None)
        stop = self._ptz_stop_entity(device_id)
        if stop is None or self._stopped:
            return
        self.entry.async_create_background_task(
            self.hass, self._ptz_press(stop, None, None), "reolink_manager_ptz_failsafe"
        )

    # ------------------------------------------------------------------
    # Push-Einstellungen aus der Karte (ohne Neuladen der Integration)
    # ------------------------------------------------------------------
    def async_set_push(self, targets: list[str], detections: list[str], cooldown: int) -> None:
        self._require_feature("push")
        clean_targets: list[str] = []
        for t in targets:
            name = str(t).removeprefix("notify.")
            if not name.startswith("mobile_app_") or not name.replace("_", "").isalnum():
                raise ActionError("bad_value")
            if name not in clean_targets:
                clean_targets.append(name)
        if any(d not in DETECTION_KINDS for d in detections):
            raise ActionError("bad_value")
        options = {
            **self.entry.options,
            CONF_PUSH_TARGETS: clean_targets,
            CONF_PUSH_DETECTIONS: sorted(set(detections), key=DETECTION_KINDS.index),
            CONF_PUSH_COOLDOWN: max(0, min(3600, int(cooldown))),
        }
        self.hass.config_entries.async_update_entry(self.entry, options=options)

    @staticmethod
    def options_signature(options: Any) -> dict[str, Any]:
        """Optionen ohne die live änderbaren (Entscheidung Neuladen ja/nein)."""
        return {k: v for k, v in dict(options).items() if k not in LIVE_OPTION_KEYS}

    @callback
    def async_options_changed(self) -> None:
        """Live änderbare Optionen gespeichert: Ansicht neu aufbauen, kein Neuladen."""
        self._rebuild()
        self._notify("snapshot", self.data)

    # ------------------------------------------------------------------
    # Diagnose (anonymisiert)
    # ------------------------------------------------------------------
    def diagnostics(self) -> dict[str, Any]:
        roles: dict[str, int] = {}
        unclassified: set[str] = set()
        devices = []
        for index, info in enumerate(self._devices.values(), start=1):
            counts: dict[str, int] = {}
            for ent in info["entities"]:
                counts[ent["role"]] = counts.get(ent["role"], 0) + 1
                roles[ent["role"]] = roles.get(ent["role"], 0) + 1
                if ent["role"] in ("other", "binary_other", "sensor_other", "select", "number", "button"):
                    unclassified.add(f"{ent['domain']}:{ent['key']}")
            devices.append(
                {"ref": f"device_{index}", "kind": info["kind"], "model": info["model"], "roles": counts}
            )
        stats = self.data.get("stats", {}) if self.data else {}
        return {
            "version": VERSION,
            "options": {
                "battery_low": self.battery_low,
                "battery_critical": self.battery_critical,
                "offline_delay": self.offline_delay,
                "events_enabled": bool(self.entry.options.get(CONF_EVENTS_ENABLED, True)),
                "experimental_enabled": bool(self.entry.options.get(CONF_EXPERIMENTAL_ENABLED, False)),
                "experimental_features": list(self.entry.options.get(CONF_EXPERIMENTAL_FEATURES, [])),
                "gallery_count": self.gallery_count,
                "push_targets": len(self.push_targets),
                "push_detections": self.push_detections,
                "push_cooldown": self.push_cooldown,
                "detection_types": self.detection_types,
                "devices_selected": len(self.entry.options.get(CONF_DEVICES) or []),
                "reolink_entries": len(self.selected_reolink_entries),
            },
            "stats": stats,
            "role_counts": dict(sorted(roles.items())),
            "entity_keys_not_classified": sorted(unclassified),
            "devices": devices,
            "app": {k: v for k, v in self.app.items() if k != "release_url"},
        }
