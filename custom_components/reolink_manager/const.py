# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 11fc907ab41f9d72fb5a7f5e46af3a7d57a8c11cbcc328730c3e06954256eca1
"""Konstanten des Reolink Managers."""
from __future__ import annotations

DOMAIN = "reolink_manager"
NAME = "Reolink Manager"
VERSION = "0.0.2"
GITHUB_REPO = "meine-smarte-welt/reolink_manager"
GITHUB_URL = f"https://github.com/{GITHUB_REPO}"
REOLINK_DOMAIN = "reolink"

CARD_FILENAME = "reolink-manager-card.js"
CARD_URL_BASE = f"/{DOMAIN}_files"

# Konfiguration (Einrichtung = data, Optionen = options)
CONF_REOLINK_ENTRIES = "reolink_entries"
CONF_DEVICES = "devices"
CONF_DETECTION_TYPES = "detection_types"
CONF_BATTERY_LOW = "battery_low"
CONF_BATTERY_CRITICAL = "battery_critical"
CONF_OFFLINE_DELAY = "offline_delay"
CONF_EVENTS_ENABLED = "events_enabled"
CONF_EXPERIMENTAL_ENABLED = "experimental_enabled"
CONF_EXPERIMENTAL_FEATURES = "experimental_features"
CONF_GALLERY_COUNT = "gallery_count"
CONF_PUSH_TARGETS = "push_targets"
CONF_PUSH_DETECTIONS = "push_detections"
CONF_PUSH_COOLDOWN = "push_cooldown"
CONF_PUSH_PATH = "push_path"

DEFAULT_BATTERY_LOW = 30
DEFAULT_BATTERY_CRITICAL = 15
DEFAULT_OFFLINE_DELAY = 120
DEFAULT_GALLERY_COUNT = 5
DEFAULT_PUSH_DETECTIONS = ["person"]
DEFAULT_PUSH_COOLDOWN = 60

DETECTION_KINDS = [
    "motion",
    "person",
    "vehicle",
    "pet",
    "animal",
    "face",
    "package",
    "visitor",
    "baby_cry",
    "bicycle",
]

# Von Thorsten bestätigt (2026-11-09, Version 0.0.2): standardmäßig aktiv, kein Schalter.
CHECKED_FEATURES = ("overview", "sensors", "events")

# Experimentelle Funktionen (Regeln 07, Abschnitt 2). Alles Neue ist zuerst
# experimentell und standardmäßig ausgeblendet, bis Thorsten es bestätigt.
EXPERIMENTAL_FEATURES: dict[str, dict[str, str]] = {
    "controls": {"since": "0.0.1", "icon": "mdi:tune-variant"},
    "ptz": {"since": "0.0.1", "icon": "mdi:pan"},
    "refresh": {"since": "0.0.1", "icon": "mdi:sync"},
    "live": {"since": "0.0.2", "icon": "mdi:video-outline"},
    "gallery": {"since": "0.0.2", "icon": "mdi:filmstrip"},
    "push": {"since": "0.0.2", "icon": "mdi:cellphone-message"},
}

GALLERY_MAX_COUNT = 20
GALLERY_MAX_DAYS = 7
GALLERY_CACHE_SECONDS = 60
GALLERY_TIMEOUT = 25

FLUSH_DELAY = 0.5
RESCAN_DELAY = 5
QUIET_SECONDS = 60
EVENT_LOG_SIZE = 100
UPDATE_CHECK_INTERVAL_HOURS = 12

# Ereignisse auf dem Home-Assistant-Bus
EVENT_NAMES = {
    "offline": f"{DOMAIN}_device_offline",
    "online": f"{DOMAIN}_device_online",
    "battery_low": f"{DOMAIN}_battery_low",
    "battery_critical": f"{DOMAIN}_battery_critical",
    "update_available": f"{DOMAIN}_update_available",
}
