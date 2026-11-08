# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 26e2ba20979989c5077ce06707295a0bb55d9d24931e294850b0b650ccc8ad21
"""WebSocket-Schnittstelle für die Karte (Schreiben nur für Administratoren)."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

ACTIONS = ["set_entity", "refresh_device", "rescan", "check_update"]
OPS = ["turn_on", "turn_off", "press", "select"]


def _manager(hass: HomeAssistant, entry_id: str | None):
    """Manager des (geladenen) Eintrags liefern."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is not ConfigEntryState.LOADED:
            continue
        if entry_id and entry.entry_id != entry_id:
            continue
        return entry.runtime_data
    return None


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_details)
    websocket_api.async_register_command(hass, ws_action)
    websocket_api.async_register_command(hass, ws_info)


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/subscribe", vol.Optional("entry_id"): str}
)
@websocket_api.async_response
async def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Reolink Manager ist nicht geladen")
        return

    @callback
    def _forward(kind: str, payload: Any) -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], {"kind": kind, "data": payload})
        )

    connection.subscriptions[msg["id"]] = manager.async_add_listener(_forward)
    connection.send_result(msg["id"])
    _forward("snapshot", manager.data)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/details",
        vol.Required("device"): str,
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.async_response
async def ws_details(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Reolink Manager ist nicht geladen")
        return
    try:
        connection.send_result(msg["id"], manager.details(msg["device"]))
    except Exception as err:  # noqa: BLE001 - Fehlercode an die Karte weitergeben
        connection.send_error(msg["id"], "unknown_device", str(err))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/action",
        vol.Required("action"): vol.In(ACTIONS),
        vol.Optional("entry_id"): str,
        vol.Optional("entity"): str,
        vol.Optional("device"): str,
        vol.Optional("op"): vol.In(OPS),
        vol.Optional("value"): str,
    }
)
@websocket_api.async_response
async def ws_action(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Reolink Manager ist nicht geladen")
        return
    action = msg["action"]
    if action == "refresh_device" and not msg.get("device"):
        connection.send_error(msg["id"], "invalid_format", "device fehlt")
        return
    if action == "set_entity" and not (msg.get("entity") and msg.get("op")):
        connection.send_error(msg["id"], "invalid_format", "entity und op fehlen")
        return
    connection.send_result(msg["id"], {"accepted": True})
    hass.async_create_task(manager.async_run_action(action, msg, connection.context(msg)))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/info", vol.Optional("entry_id"): str}
)
@websocket_api.async_response
async def ws_info(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    manager = _manager(hass, msg.get("entry_id"))
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Reolink Manager ist nicht geladen")
        return
    app = manager.app
    connection.send_result(
        msg["id"],
        {
            "version": app["version"],
            "latest_version": app["latest_version"],
            "update_available": app["update_available"],
            "check_failed": app["check_failed"],
        },
    )
