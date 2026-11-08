# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 49c3344ea09660c1ef49f2fe363afe90f9f56f501d1383268da804209cfa5081
"""Anonymisierter Diagnose-Download."""
from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Keine Namen, IDs, Adressen oder Zugangsdaten, nur Zähler und Rollen."""
    return entry.runtime_data.diagnostics()
