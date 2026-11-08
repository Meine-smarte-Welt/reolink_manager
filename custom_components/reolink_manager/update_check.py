# SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): e0306a2d2a64af7d805fdfc9bef365256fa9bb084055f15cb685da459f1e2708
"""Versionsabfrage gegen GitHub (beim Start und alle 12 Stunden)."""
from __future__ import annotations

import asyncio
import logging
import re
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .const import GITHUB_REPO, GITHUB_URL, VERSION

_LOGGER = logging.getLogger(__name__)

_VERSION_RE = re.compile(r"^v?(\d+)\.(\d+)\.(\d+)(?:(a|b|rc)(\d+))?$")
_PRE_ORDER = {"a": 0, "b": 1, "rc": 2, None: 3}
_API = f"https://api.github.com/repos/{GITHUB_REPO}"
_HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "reolink-manager",
}


def parse_version(text: str | None) -> tuple[int, int, int, int, int] | None:
    """Versionsstring in einen vergleichbaren Tupel umwandeln."""
    if not text:
        return None
    match = _VERSION_RE.match(str(text).strip())
    if not match:
        return None
    major, minor, patch, pre, pre_n = match.groups()
    return (int(major), int(minor), int(patch), _PRE_ORDER[pre], int(pre_n or 0))


def is_prerelease(text: str) -> bool:
    """True bei Beta/Alpha/Release Candidate."""
    parsed = parse_version(text)
    return parsed is not None and parsed[3] < 3


async def _get_json(hass: HomeAssistant, url: str) -> tuple[int, Any]:
    session = async_get_clientsession(hass)
    async with asyncio.timeout(15):
        async with session.get(url, headers=_HEADERS) as resp:
            if resp.status != 200:
                return resp.status, None
            return resp.status, await resp.json()


def _safe_url(url: str | None, fallback: str) -> str:
    """Release-Link nur anzeigen, wenn er auf github.com zeigt."""
    if isinstance(url, str) and url.startswith("https://github.com/"):
        return url
    return fallback


async def async_fetch_latest(hass: HomeAssistant) -> dict[str, Any]:
    """Neueste Version auf GitHub ermitteln."""
    fallback_url = f"{GITHUB_URL}/releases"
    result: dict[str, Any] = {
        "latest_version": None,
        "release_url": fallback_url,
        "update_available": False,
        "checked_at": dt_util.utcnow().isoformat(),
        "check_failed": False,
    }
    candidates: list[tuple[tuple[int, int, int, int, int], str, str]] = []
    try:
        if is_prerelease(VERSION):
            status, payload = await _get_json(hass, f"{_API}/releases?per_page=5")
            if status == 200 and isinstance(payload, list):
                for rel in payload:
                    parsed = parse_version(rel.get("tag_name"))
                    if parsed:
                        candidates.append(
                            (parsed, rel["tag_name"], _safe_url(rel.get("html_url"), fallback_url))
                        )
        else:
            status, payload = await _get_json(hass, f"{_API}/releases/latest")
            if status == 200 and isinstance(payload, dict):
                parsed = parse_version(payload.get("tag_name"))
                if parsed:
                    candidates.append(
                        (parsed, payload["tag_name"], _safe_url(payload.get("html_url"), fallback_url))
                    )
            elif status not in (200, 404):
                result["check_failed"] = True
        if not candidates and not result["check_failed"]:
            status, payload = await _get_json(hass, f"{_API}/tags?per_page=30")
            if status == 200 and isinstance(payload, list):
                for tag in payload:
                    parsed = parse_version(tag.get("name"))
                    if parsed and (parsed[3] == 3 or is_prerelease(VERSION)):
                        candidates.append(
                            (parsed, tag["name"], f"{GITHUB_URL}/releases/tag/{tag['name']}")
                        )
            elif status not in (200, 404):
                result["check_failed"] = True
    except (TimeoutError, OSError, ValueError) as err:
        _LOGGER.debug("Versionsprüfung nicht möglich: %s", type(err).__name__)
        result["check_failed"] = True
        return result
    except Exception as err:  # noqa: BLE001 - aiohttp-Fehler sollen nie das Laden stören
        _LOGGER.debug("Versionsprüfung nicht möglich: %s", type(err).__name__)
        result["check_failed"] = True
        return result

    if candidates:
        best = max(candidates, key=lambda c: c[0])
        result["latest_version"] = best[1].lstrip("v")
        result["release_url"] = best[2]
        current = parse_version(VERSION)
        result["update_available"] = bool(current and best[0] > current)
    return result
