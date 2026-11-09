# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 72c0834fec0953c41473db96369c9c16b5697b8b2f1f4608666d17c1710fd520
"""Reolink Manager: Übersicht und Steuerung für die offizielle Reolink-Integration."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import (
    CARD_FILENAME,
    CARD_URL_BASE,
    DASHBOARD_URL_PATH,
    DASHBOARD_VIEW_PATH,
    DOMAIN,
    VERSION,
)
from .manager import ActionError, FeatureDisabled, ReolinkManager
from .websocket_api import async_register_websocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type ReolinkManagerConfigEntry = ConfigEntry[ReolinkManager]


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Karte, WebSocket und Services einmalig bereitstellen."""
    await _async_register_card(hass)
    async_register_websocket(hass)
    _async_register_services(hass)
    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    path = Path(__file__).parent / "www" / CARD_FILENAME
    base = f"{CARD_URL_BASE}/{CARD_FILENAME}"
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(base, str(path), cache_headers=False)]
        )
    except RuntimeError:
        _LOGGER.debug("Statischer Pfad der Karte ist bereits registriert")
    url = f"{base}?v={VERSION}"
    try:
        await _async_register_resource(hass, base, url)
    except Exception:  # noqa: BLE001 - die Karte darf das Laden der Integration nie verhindern
        _LOGGER.warning(
            "Lovelace-Ressource konnte nicht eingetragen werden. Trage %s manuell als JavaScript-Modul ein",
            url,
        )


async def _async_register_resource(hass: HomeAssistant, base: str, url: str) -> None:
    """Karte als Lovelace-Ressource eintragen (nur im Speichermodus der Ressourcen möglich)."""
    lovelace = _lovelace_data(hass)
    if lovelace is None:
        _LOGGER.info("Lovelace nicht verfügbar: Trage %s manuell als JavaScript-Modul ein", url)
        return
    # Home Assistant nennt das Feld resource_mode, ältere Versionen mode
    mode = getattr(lovelace, "resource_mode", None) or getattr(lovelace, "mode", None)
    resources = getattr(lovelace, "resources", None)
    if mode != "storage" or resources is None:
        _LOGGER.info("Lovelace-Ressourcen im YAML-Modus: Trage %s manuell als JavaScript-Modul ein", url)
        return
    if not getattr(resources, "loaded", True):
        await resources.async_load()
        resources.loaded = True
    for item in resources.async_items():
        if str(item.get("url", "")).split("?")[0] == base:
            if item["url"] != url:
                await resources.async_update_item(item["id"], {"res_type": "module", "url": url})
            return
    await resources.async_create_item({"res_type": "module", "url": url})


def _lovelace_data(hass: HomeAssistant) -> Any:
    try:
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        return hass.data.get(LOVELACE_DATA)
    except ImportError:
        return hass.data.get("lovelace")


def _dashboard_config(title: str) -> dict[str, Any]:
    return {
        "title": title,
        "views": [
            {
                "title": title,
                "path": DASHBOARD_VIEW_PATH,
                "icon": "mdi:cctv",
                "type": "panel",
                "cards": [
                    {
                        "type": "custom:reolink-manager-card",
                        "title": title,
                        "show_experimental": True,
                        "default_tab": "cameras",
                    }
                ],
            }
        ],
    }


async def async_ensure_dashboard(hass: HomeAssistant) -> bool:
    """Dashboard „Reolink Manager“ mit der Karte anlegen, falls es fehlt. Bestehendes bleibt unangetastet.

    Der Tipp auf eine Push-Nachricht öffnet dieses Dashboard. Gibt True zurück, wenn es danach existiert.
    """
    lovelace = _lovelace_data(hass)
    if lovelace is None or not hasattr(lovelace, "dashboards"):
        return False
    try:
        from homeassistant.components import frontend
        from homeassistant.components.lovelace import dashboard as ll_dashboard
        from homeassistant.components.lovelace.const import ConfigNotFound

        title = "Reolink Manager"
        existing = lovelace.dashboards.get(DASHBOARD_URL_PATH)
        if existing is None:
            collection = ll_dashboard.DashboardsCollection(hass)
            await collection.async_load()
            item = next(
                (i for i in collection.async_items() if i.get("url_path") == DASHBOARD_URL_PATH), None
            )
            if item is None:
                item = await collection.async_create_item(
                    {
                        "url_path": DASHBOARD_URL_PATH,
                        "title": title,
                        "icon": "mdi:cctv",
                        "show_in_sidebar": True,
                        "require_admin": False,
                    }
                )
            existing = ll_dashboard.LovelaceStorage(hass, item)
            lovelace.dashboards[DASHBOARD_URL_PATH] = existing
            frontend.async_register_built_in_panel(
                hass,
                "lovelace",
                frontend_url_path=DASHBOARD_URL_PATH,
                require_admin=bool(item.get("require_admin", False)),
                sidebar_title=item.get("title", title),
                sidebar_icon=item.get("icon", "mdi:cctv"),
                config={"mode": "storage"},
                update=True,
            )
        try:
            await existing.async_load(False)
        except ConfigNotFound:
            await existing.async_save(_dashboard_config(title))
    except Exception:  # noqa: BLE001 - das Dashboard ist Komfort, die Integration muss trotzdem laufen
        _LOGGER.warning(
            "Dashboard konnte nicht automatisch angelegt werden. Lege ein Dashboard mit der Karte "
            "custom:reolink-manager-card selbst an",
            exc_info=True,
        )
        return False
    return True


def _loaded_managers(hass: HomeAssistant, entry_id: str | None) -> list[ReolinkManager]:
    managers = [
        entry.runtime_data
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is ConfigEntryState.LOADED and (not entry_id or entry.entry_id == entry_id)
    ]
    if not managers:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="no_entry")
    return managers


def _async_register_services(hass: HomeAssistant) -> None:
    entry_field = {vol.Optional("entry_id"): cv.string}

    async def rescan(call: ServiceCall) -> None:
        for manager in _loaded_managers(hass, call.data.get("entry_id")):
            manager.async_rescan()

    async def check_update(call: ServiceCall) -> None:
        for manager in _loaded_managers(hass, call.data.get("entry_id")):
            await manager.async_check_update()

    async def refresh_device(call: ServiceCall) -> None:
        device_id = call.data["device_id"]
        last: Exception | None = None
        for manager in _loaded_managers(hass, call.data.get("entry_id")):
            try:
                await manager.async_refresh_device(device_id, call.context)
                return
            except FeatureDisabled as err:
                raise ServiceValidationError(
                    translation_domain=DOMAIN, translation_key="experimental_disabled"
                ) from err
            except ActionError as err:
                last = err
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="unknown_device"
        ) from last

    hass.services.async_register(DOMAIN, "rescan", rescan, vol.Schema(entry_field))
    hass.services.async_register(DOMAIN, "check_update", check_update, vol.Schema(entry_field))
    hass.services.async_register(
        DOMAIN,
        "refresh_device",
        refresh_device,
        vol.Schema({**entry_field, vol.Required("device_id"): cv.string}),
    )


async def async_setup_entry(hass: HomeAssistant, entry: ReolinkManagerConfigEntry) -> bool:
    manager = ReolinkManager(hass, entry)
    manager.options_sig = ReolinkManager.options_signature(entry.options)
    if manager.feature_enabled("push"):
        manager.dashboard_ready = await async_ensure_dashboard(hass)
    await manager.async_start()
    entry.runtime_data = manager
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def _async_update_listener(hass: HomeAssistant, entry: ReolinkManagerConfigEntry) -> None:
    manager = entry.runtime_data
    sig = ReolinkManager.options_signature(entry.options)
    if sig == manager.options_sig:
        # Nur Push-Einstellungen aus der Karte: kein Neuladen, die Karte bekommt sofort die neue Ansicht
        manager.async_options_changed()
        return
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ReolinkManagerConfigEntry) -> bool:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_stop()
    return unloaded
