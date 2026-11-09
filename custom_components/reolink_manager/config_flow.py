# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 2e345d8043e934bf75391e4c5b26600b23171469b36208895deeb6228de91970
"""Einrichtung, Neu-Konfigurieren und Optionen des Reolink Managers."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

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
    DEFAULT_BATTERY_CRITICAL,
    DEFAULT_BATTERY_LOW,
    DEFAULT_GALLERY_COUNT,
    DEFAULT_OFFLINE_DELAY,
    DEFAULT_PUSH_COOLDOWN,
    DEFAULT_PUSH_DETECTIONS,
    DETECTION_KINDS,
    DOMAIN,
    EXPERIMENTAL_FEATURES,
    GALLERY_MAX_COUNT,
    REOLINK_DOMAIN,
    VERSION,
)

_UPDATE_TEXTS = {
    "de": {
        "new": "Neue Version {v} auf GitHub. Aktualisiere über HACS und starte Home Assistant neu.",
        "ok": "Du hast die neueste Version.",
        "failed": "Prüfung auf neue Version nicht möglich.",
        "none": "Noch keine Veröffentlichung auf GitHub gefunden.",
    },
    "en": {
        "new": "New version {v} on GitHub. Update via HACS and restart Home Assistant.",
        "ok": "You have the latest version.",
        "failed": "Checking for a new version is not possible.",
        "none": "No release found on GitHub yet.",
    },
    "nl": {
        "new": "Nieuwe versie {v} op GitHub. Werk bij via HACS en herstart Home Assistant.",
        "ok": "Je hebt de nieuwste versie.",
        "failed": "Controle op een nieuwe versie is niet mogelijk.",
        "none": "Nog geen release op GitHub gevonden.",
    },
}


def _reolink_choices(hass: HomeAssistant) -> list[SelectOptionDict]:
    return [
        SelectOptionDict(value=entry.entry_id, label=entry.title or entry.entry_id)
        for entry in hass.config_entries.async_entries(REOLINK_DOMAIN)
    ]


def _entries_schema(hass: HomeAssistant, default: list[str]) -> vol.Schema:
    choices = _reolink_choices(hass)
    valid = {c["value"] for c in choices}
    return vol.Schema(
        {
            vol.Required(
                CONF_REOLINK_ENTRIES, default=[d for d in default if d in valid] or sorted(valid)
            ): SelectSelector(
                SelectSelectorConfig(options=choices, multiple=True, mode=SelectSelectorMode.LIST)
            )
        }
    )


def _device_choices(hass: HomeAssistant, entry_ids: list[str]) -> list[SelectOptionDict]:
    dev_reg = dr.async_get(hass)
    result: list[SelectOptionDict] = []
    for entry_id in entry_ids:
        for dev in dr.async_entries_for_config_entry(dev_reg, entry_id):
            if dev.disabled_by is not None:
                continue
            name = dev.name_by_user or dev.name or dev.id
            label = f"{name} ({dev.model})" if dev.model else name
            result.append(SelectOptionDict(value=dev.id, label=label))
    return sorted(result, key=lambda c: c["label"].lower())


def _update_info(hass: HomeAssistant, entry: Any) -> str:
    lang = hass.config.language.split("-")[0]
    texts = _UPDATE_TEXTS.get(lang, _UPDATE_TEXTS["en"])
    manager = getattr(entry, "runtime_data", None)
    if manager is None:
        return ""
    app = manager.app
    if app["update_available"]:
        return texts["new"].format(v=app["latest_version"])
    if app["check_failed"]:
        return texts["failed"]
    if app["latest_version"] is None:
        return texts["none"]
    return texts["ok"]


class ReolinkManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Einrichtung: welche Reolink-Einträge verwaltet werden."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        if not self.hass.config_entries.async_entries(REOLINK_DOMAIN):
            return self.async_abort(reason="no_reolink")
        errors: dict[str, str] = {}
        if user_input is not None:
            if user_input[CONF_REOLINK_ENTRIES]:
                await self.async_set_unique_id(DOMAIN)
                return self.async_create_entry(
                    title="Reolink Manager",
                    data={CONF_REOLINK_ENTRIES: user_input[CONF_REOLINK_ENTRIES]},
                )
            errors["base"] = "no_selection"
        return self.async_show_form(
            step_id="user", data_schema=_entries_schema(self.hass, []), errors=errors
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            if user_input[CONF_REOLINK_ENTRIES]:
                return self.async_update_reload_and_abort(
                    entry, data_updates={CONF_REOLINK_ENTRIES: user_input[CONF_REOLINK_ENTRIES]}
                )
            errors["base"] = "no_selection"
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_entries_schema(self.hass, list(entry.data.get(CONF_REOLINK_ENTRIES, []))),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: Any) -> OptionsFlow:
        return ReolinkManagerOptionsFlow()


class ReolinkManagerOptionsFlow(OptionsFlow):
    """Optionen: Kameras, Erkennungsarten, Schwellen, Ereignisse, Experimentelles."""

    def __init__(self) -> None:
        self._base: dict[str, Any] = {}

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        entry = self.config_entry
        opts = entry.options
        errors: dict[str, str] = {}
        if user_input is not None:
            low = int(user_input[CONF_BATTERY_LOW])
            critical = int(user_input[CONF_BATTERY_CRITICAL])
            if critical > low:
                errors["base"] = "critical_above_low"
            else:
                self._base = {
                    CONF_DEVICES: list(user_input.get(CONF_DEVICES, [])),
                    CONF_DETECTION_TYPES: list(user_input.get(CONF_DETECTION_TYPES, [])),
                    CONF_BATTERY_LOW: low,
                    CONF_BATTERY_CRITICAL: critical,
                    CONF_OFFLINE_DELAY: int(user_input[CONF_OFFLINE_DELAY]),
                    CONF_EVENTS_ENABLED: bool(user_input[CONF_EVENTS_ENABLED]),
                    CONF_EXPERIMENTAL_ENABLED: bool(user_input[CONF_EXPERIMENTAL_ENABLED]),
                }
                if self._base[CONF_EXPERIMENTAL_ENABLED]:
                    return await self.async_step_experimental()
                return self._finish({})

        choices = _device_choices(self.hass, list(entry.data.get(CONF_REOLINK_ENTRIES, [])))
        valid = {c["value"] for c in choices}
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_DEVICES, default=[d for d in opts.get(CONF_DEVICES, []) if d in valid]
                ): SelectSelector(
                    SelectSelectorConfig(options=choices, multiple=True, mode=SelectSelectorMode.DROPDOWN)
                ),
                vol.Optional(
                    CONF_DETECTION_TYPES, default=opts.get(CONF_DETECTION_TYPES, DETECTION_KINDS)
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=DETECTION_KINDS,
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        translation_key="detection_types",
                    )
                ),
                vol.Required(
                    CONF_BATTERY_LOW, default=opts.get(CONF_BATTERY_LOW, DEFAULT_BATTERY_LOW)
                ): NumberSelector(
                    NumberSelectorConfig(min=1, max=100, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="%")
                ),
                vol.Required(
                    CONF_BATTERY_CRITICAL,
                    default=opts.get(CONF_BATTERY_CRITICAL, DEFAULT_BATTERY_CRITICAL),
                ): NumberSelector(
                    NumberSelectorConfig(min=1, max=100, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="%")
                ),
                vol.Required(
                    CONF_OFFLINE_DELAY, default=opts.get(CONF_OFFLINE_DELAY, DEFAULT_OFFLINE_DELAY)
                ): NumberSelector(
                    NumberSelectorConfig(min=0, max=3600, step=10, mode=NumberSelectorMode.BOX, unit_of_measurement="s")
                ),
                vol.Required(
                    CONF_EVENTS_ENABLED, default=opts.get(CONF_EVENTS_ENABLED, True)
                ): BooleanSelector(),
                vol.Required(
                    CONF_EXPERIMENTAL_ENABLED, default=opts.get(CONF_EXPERIMENTAL_ENABLED, False)
                ): BooleanSelector(),
            }
        )
        return self.async_show_form(
            step_id="init",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "version": VERSION,
                "update_info": _update_info(self.hass, entry),
            },
        )

    async def async_step_experimental(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Zweiter Schritt, nur bei eingeschaltetem Hauptschalter."""
        opts = self.config_entry.options
        if user_input is not None:
            return self._finish(
                {
                    CONF_EXPERIMENTAL_FEATURES: [
                        f for f in user_input.get(CONF_EXPERIMENTAL_FEATURES, []) if f in EXPERIMENTAL_FEATURES
                    ],
                    CONF_GALLERY_COUNT: int(user_input[CONF_GALLERY_COUNT]),
                    CONF_PUSH_TARGETS: list(user_input.get(CONF_PUSH_TARGETS, [])),
                    CONF_PUSH_DETECTIONS: list(user_input.get(CONF_PUSH_DETECTIONS, [])),
                    CONF_PUSH_COOLDOWN: int(user_input[CONF_PUSH_COOLDOWN]),
                    CONF_PUSH_PATH: str(user_input.get(CONF_PUSH_PATH, "")).strip(),
                }
            )
        notify = self.hass.services.async_services().get("notify", {})
        targets = sorted(name for name in notify if name.startswith("mobile_app_"))
        chosen = [t for t in opts.get(CONF_PUSH_TARGETS, []) if t in targets]
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_EXPERIMENTAL_FEATURES,
                    default=[f for f in opts.get(CONF_EXPERIMENTAL_FEATURES, []) if f in EXPERIMENTAL_FEATURES],
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=list(EXPERIMENTAL_FEATURES),
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        translation_key="experimental_features",
                    )
                ),
                vol.Required(
                    CONF_GALLERY_COUNT, default=opts.get(CONF_GALLERY_COUNT, DEFAULT_GALLERY_COUNT)
                ): NumberSelector(
                    NumberSelectorConfig(min=1, max=GALLERY_MAX_COUNT, step=1, mode=NumberSelectorMode.BOX)
                ),
                vol.Optional(CONF_PUSH_TARGETS, default=chosen): SelectSelector(
                    SelectSelectorConfig(options=targets, multiple=True, mode=SelectSelectorMode.DROPDOWN)
                ),
                vol.Optional(
                    CONF_PUSH_DETECTIONS,
                    default=opts.get(CONF_PUSH_DETECTIONS, DEFAULT_PUSH_DETECTIONS),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=DETECTION_KINDS,
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        translation_key="detection_types",
                    )
                ),
                vol.Required(
                    CONF_PUSH_COOLDOWN, default=opts.get(CONF_PUSH_COOLDOWN, DEFAULT_PUSH_COOLDOWN)
                ): NumberSelector(
                    NumberSelectorConfig(min=0, max=3600, step=5, mode=NumberSelectorMode.BOX, unit_of_measurement="s")
                ),
                vol.Optional(
                    CONF_PUSH_PATH, default=opts.get(CONF_PUSH_PATH, "")
                ): TextSelector(),
            }
        )
        return self.async_show_form(step_id="experimental", data_schema=schema)

    def _finish(self, experimental: dict[str, Any]) -> ConfigFlowResult:
        """Gespeicherte experimentelle Werte bleiben erhalten, auch bei ausgeschaltetem Hauptschalter."""
        old = self.config_entry.options
        kept = {
            key: old[key]
            for key in (
                CONF_EXPERIMENTAL_FEATURES,
                CONF_GALLERY_COUNT,
                CONF_PUSH_TARGETS,
                CONF_PUSH_DETECTIONS,
                CONF_PUSH_COOLDOWN,
                CONF_PUSH_PATH,
            )
            if key in old
        }
        return self.async_create_entry(title="", data={**kept, **self._base, **experimental})
