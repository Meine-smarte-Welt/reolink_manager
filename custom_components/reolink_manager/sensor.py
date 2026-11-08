# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 8ecd6adf4815917587b20f51fd4072afe28dd0a5063ef278629fc50cfbbcf503
"""Übersichts-Sensoren (experimentell: Funktion „sensors“)."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, NAME, VERSION
from .manager import ReolinkManager

# key, Statistikfeld, Symbol
SENSORS: tuple[tuple[str, str, str], ...] = (
    ("devices", "total", "mdi:cctv"),
    ("offline", "offline", "mdi:lan-disconnect"),
    ("battery_low", "battery_low", "mdi:battery-alert-variant-outline"),
    ("battery_critical", "battery_critical", "mdi:battery-alert"),
    ("updates", "updates", "mdi:update"),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager: ReolinkManager = entry.runtime_data
    if not manager.feature_enabled("sensors"):
        # Experimentell ausgeschaltet: nichts anlegen, Altbestand entfernen.
        ent_reg = er.async_get(hass)
        for reg_entry in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
            if reg_entry.domain == "sensor":
                ent_reg.async_remove(reg_entry.entity_id)
        dev_reg = dr.async_get(hass)
        device = dev_reg.async_get_device(identifiers={(DOMAIN, entry.entry_id)})
        if device is not None:
            dev_reg.async_remove_device(device.id)
        return
    async_add_entities(
        ReolinkManagerSensor(manager, entry, key, field, icon) for key, field, icon in SENSORS
    )


class ReolinkManagerSensor(SensorEntity):
    """Zählt Geräte nach Zustand."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self, manager: ReolinkManager, entry: ConfigEntry, key: str, field: str, icon: str
    ) -> None:
        self._manager = manager
        self._field = field
        self._attr_translation_key = key
        self._attr_icon = icon
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=NAME,
            manufacturer="Meine smarte Welt",
            model=NAME,
            sw_version=VERSION,
            entry_type=dr.DeviceEntryType.SERVICE,
        )

    @property
    def native_value(self) -> int | None:
        stats: dict[str, Any] = self._manager.data.get("stats", {})
        return stats.get(self._field)

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._manager.async_add_listener(self._handle_update))

    @callback
    def _handle_update(self, kind: str, _payload: Any) -> None:
        if kind == "snapshot":
            self.async_write_ha_state()
