// SHA256 (Inhalt ab Zeile 2, d.h. dieser Datei ohne diese erste Zeile): 71ffb14018aa9e526d3d1662fce3fc0acc7292fbe53673b53950d3f1180ddba5
/* Reolink Manager – Karte für Home Assistant (Meine smarte Welt) */
const CARD_VERSION = "0.0.4";
const TAG = "reolink-manager-card";
const WS = "reolink_manager";
const DEEP_LIVE_MAX_AGE = 90; // Sekunden: jünger = Livebild, älter = passende Aufnahme aus der Galerie

/* Reolink-Logo: farbig für den Kartentitel, einfarbig als Home-Assistant-Iconset „reolink_manager:logo“ */
const LOGO_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='512' height='512'%3E%3Ccircle cx='256' cy='256' r='256' fill='%23fff'/%3E%3Cpath fill='%233b6642' fill-rule='evenodd' d='M256 0a256 256 0 1 0 0 512a256 256 0 1 0 0-512zM256 15a241 241 0 1 1 0 482a241 241 0 1 1 0-482z'/%3E%3Cpath fill='%233b6642' fill-rule='evenodd' d='M247.5 78a182.5 187.5 0 1 0 0 375a182.5 187.5 0 1 0 0-375zM247.5 129a132.5 136.5 0 1 1 0 273a132.5 136.5 0 1 1 0-273z'/%3E%3Cellipse cx='247.5' cy='265.5' rx='71.5' ry='73.5' fill='%232e5034'/%3E%3Cellipse cx='207.5' cy='224.5' rx='27' ry='28' fill='%23ed8c2a'/%3E%3Ccircle cx='390' cy='117' r='60' fill='%233b6642'/%3E%3Cellipse cx='390' cy='117' rx='49.5' ry='50.5' fill='%23ed8c2a'/%3E%3C/svg%3E";
const LOGO_PATH = "M23.96 11.02 23.73 9.47 23.30 7.96 22.67 6.52 22.29 5.83 21.82 5.11 21.84 5.72 21.75 6.30 22.29 7.34 22.76 8.54 23.04 9.62 23.24 10.89 23.30 12 23.24 13.11 23.11 14.02 22.86 15.10 22.44 16.32 21.96 17.33 21.29 18.43 20.61 19.31 19.86 20.12 19.02 20.85 17.97 21.59 17 22.13 15.63 22.70 14.92 22.91 14.02 23.11 13.11 23.24 12.37 23.29 11.45 23.28 10.71 23.22 9.98 23.11 9.08 22.91 8.37 22.70 7.51 22.36 6.67 21.96 6.03 21.59 5.27 21.07 4.69 20.61 3.88 19.86 3.27 19.17 2.61 18.28 2.04 17.33 1.56 16.32 1.19 15.28 0.92 14.20 0.78 13.29 0.71 12.37 0.73 11.26 0.85 10.16 1.09 9.08 1.43 8.02 1.87 7 2.31 6.19 2.93 5.27 3.63 4.41 4.28 3.75 5.12 3.04 5.88 2.51 6.67 2.04 7.68 1.56 8.72 1.19 9.62 0.96 10.53 0.80 11.45 0.72 12.37 0.71 13.29 0.78 14.38 0.96 15.46 1.24 16.49 1.64 17.34 2.05 17.93 1.94 18.53 1.93 17.66 1.42 16.77 0.99 15.86 0.64 14.92 0.36 13.95 0.16 12.98 0.04 12 0 11.02 0.04 9.85 0.19 8.70 0.46 7.59 0.84 6.52 1.33 5.50 1.91 4.54 2.60 3.65 3.38 2.85 4.24 2.13 5.17 1.51 6.17 0.99 7.23 0.58 8.33 0.27 9.47 0.08 10.63 0 11.80 0.04 12.98 0.19 14.15 0.46 15.30 0.84 16.41 1.33 17.48 1.91 18.50 2.60 19.46 3.38 20.35 4.24 21.15 5.17 21.87 6.17 22.49 7.23 23.01 8.33 23.42 9.47 23.73 10.63 23.92 11.80 24 12.98 23.96 14.15 23.81 15.30 23.54 16.41 23.16 17.48 22.67 18.50 22.09 19.46 21.40 20.35 20.62 21.15 19.76 21.87 18.83 22.49 17.83 23.01 16.77 23.42 15.67 23.73 14.53 23.92 13.37 24 12.20zM20.13 11.73 20.04 11.01 19.90 10.31 19.70 9.62 19.41 8.86 18.69 9.02 17.99 9.03 17.25 8.89 16.57 8.61 17.17 9.62 17.57 10.69 17.78 11.82 17.79 12.97 17.60 14.10 17.22 15.18 16.65 16.17 15.92 17.04 15.05 17.77 14.53 18.09 13.98 18.36 12.91 18.70 11.80 18.84 10.69 18.77 9.61 18.50 8.58 18.04 7.66 17.39 7.21 16.97 6.80 16.50 6.44 16 6.12 15.46 5.86 14.89 5.66 14.30 5.43 13.18 5.39 12.55 5.41 11.92 5.49 11.30 5.63 10.69 6.03 9.62 6.33 9.07 6.67 8.55 7.07 8.07 7.51 7.63 7.98 7.24 8.50 6.90 9.04 6.62 9.61 6.39 10.69 6.12 11.30 6.05 11.91 6.05 13.01 6.21 13.60 6.39 14.16 6.62 15.16 7.20 14.87 6.52 14.73 5.78 14.74 5.08 14.91 4.34 13.95 3.99 12.86 3.75 11.74 3.66 10.76 3.70 9.93 3.83 9.12 4.03 8.33 4.33 7.57 4.69 6.85 5.14 6.17 5.65 5.55 6.23 4.99 6.87 4.49 7.56 4.06 8.30 3.70 9.08 3.42 9.89 3.21 10.73 3.09 11.58 3.05 12.45 3.09 13.31 3.21 14.16 3.42 15 3.70 15.81 4.06 16.59 4.49 17.33 4.99 18.02 5.55 18.66 6.17 19.24 6.85 19.75 7.57 20.20 8.33 20.57 9.12 20.86 9.93 21.07 10.76 21.19 11.60 21.23 12.44 21.19 13.27 21.07 14.08 20.86 14.88 20.57 15.51 20.26 16.24 19.83 16.92 19.33 17.55 18.76 18.12 18.13 18.64 17.45 19.08 16.71 19.45 15.94 19.75 15.13 19.96 14.30 20.10 13.45 20.16 12.59zM14.95 12.22 14.84 11.55 14.61 10.92 14.26 10.35 13.81 9.85 13.28 9.46 12.68 9.18 12.04 9.03 11.38 9.01 10.83 9.09 11.10 9.36 11.30 9.66 11.44 10.02 11.50 10.37 11.49 10.76 11.41 11.11 11.27 11.44 11.07 11.73 10.76 12.01 10.44 12.20 10.07 12.32 9.70 12.35 9.29 12.30 8.94 12.16 8.62 11.96 8.34 11.67 8.26 12.16 8.26 12.67 8.36 13.34 8.60 13.97 8.94 14.54 9.39 15.04 9.93 15.43 10.52 15.71 11.16 15.86 11.82 15.88 12.47 15.77 13.08 15.54 13.64 15.18 14.12 14.72 14.50 14.17 14.78 13.55 14.92 12.90zM10.99 10.46 10.87 9.96 10.58 9.55 10.15 9.29 9.66 9.21 9.19 9.34 8.79 9.64 8.53 10.08 8.46 10.59 8.58 11.08 8.88 11.50 9.30 11.76 9.79 11.83 10.27 11.71 10.66 11.40 10.92 10.97zM21.09 5.44 21.03 4.89 20.86 4.37 20.59 3.88 20.24 3.46 19.81 3.12 19.31 2.87 18.78 2.72 18.24 2.67 17.69 2.74 17.16 2.90 16.68 3.17 16.26 3.53 15.92 3.96 15.67 4.45 15.51 4.98 15.47 5.53 15.53 6.08 15.70 6.60 15.97 7.08 16.33 7.51 16.76 7.85 17.25 8.10 17.78 8.25 18.33 8.30 18.88 8.23 19.40 8.06 19.88 7.80 20.30 7.44 20.65 7.01 20.90 6.52 21.05 5.99z";
(function registerIconset() {
  try {
    const get = async (name) => (["logo", "reolink", "reolink_manager"].includes(name) ? { path: LOGO_PATH } : undefined);
    window.customIconsets = window.customIconsets || {};
    if (!window.customIconsets.reolink_manager) window.customIconsets.reolink_manager = get;
    window.customIcons = window.customIcons || {};
    if (!window.customIcons.reolink_manager) {
      window.customIcons.reolink_manager = { getIcon: get, getIconList: async () => [{ name: "logo", keywords: ["reolink", "kamera", "camera", "manager"] }] };
    }
  } catch (_) { /* Iconset optional */ }
})();

const TAB_ORDER = ["cameras", "battery", "detections", "updates", "storage", "gallery", "controls", "hub", "bridge"];
const TAB_META = {
  cameras: { icon: "mdi:cctv", label: "tab_cameras", exp: null },
  battery: { icon: "mdi:battery-70", label: "tab_battery", exp: null },
  detections: { icon: "mdi:motion-sensor", label: "tab_detections", exp: null },
  updates: { icon: "mdi:update", label: "tab_updates", exp: null },
  storage: { icon: "mdi:sd", label: "tab_storage", exp: null },
  gallery: { icon: "mdi:filmstrip", label: "tab_gallery", exp: "gallery" },
  controls: { icon: "mdi:tune-variant", label: "tab_controls", exp: "controls" },
  hub: { icon: "mdi:router-wireless", label: "tab_hub", exp: null },
  bridge: { icon: "mdi:cog", label: "tab_bridge", exp: null },
};
const CATEGORY_ICON_COLOR_KEYS = Object.fromEntries(TAB_ORDER.map((k) => [k, `color_icon_${k}`]));
const DET_ICON = {
  motion: "mdi:motion-sensor", person: "mdi:account", vehicle: "mdi:car", pet: "mdi:paw",
  animal: "mdi:dog-side", face: "mdi:face-recognition", package: "mdi:package-variant-closed",
  visitor: "mdi:doorbell", baby_cry: "mdi:baby-face-outline", bicycle: "mdi:bike",
};
const PTZ_SPEEDS = { slow: 5, mid: 15, fast: 32 };
const KIND_ICON = { camera: "mdi:cctv", hub: "mdi:router-wireless", chime: "mdi:bell-ring" };
const EXP_ICON = {
  controls: "mdi:tune-variant", ptz: "mdi:pan", refresh: "mdi:sync",
  live: "mdi:video-outline", gallery: "mdi:filmstrip", push: "mdi:cellphone-message",
};

const COLOR_CONFIG_KEYS = {
  tab_active: { cssVar: "--rm-color-tab-active", fallback: "var(--primary-color, #03a9f4)" },
  success: { cssVar: "--rm-color-success", fallback: "var(--success-color, #43a047)" },
  warning: { cssVar: "--rm-color-warning", fallback: "var(--warning-color, #ff9800)" },
  error: { cssVar: "--rm-color-error", fallback: "var(--error-color, #db4437)" },
  info: { cssVar: "--rm-color-info", fallback: "var(--info-color, #039be5)" },
  row_icon: { cssVar: "--rm-color-row-icon", fallback: "var(--secondary-text-color, #727272)" },
  live_banner: { cssVar: "--rm-color-live-banner", fallback: "var(--state-icon-active-color, #03a9f4)" },
};
const SAFE_COLOR_RE = /^[a-zA-Z0-9#(),.%\-\s]+$/;
function sanitizeColor(v) {
  const t = String(v || "").trim();
  return t && SAFE_COLOR_RE.test(t) ? t : "";
}

const DEFAULTS = {
  title: "Reolink Manager", show_title: true, entry_id: "", default_tab: "cameras", max_rows: 50, zoom: 100,
  show_stats: true, show_search: true, show_filter_bar: true, default_sort: "name",
  show_col_model: true, show_col_hub: true, show_col_battery: true, show_col_wifi: true, show_col_last: true,
  read_only: false, show_experimental: false, live_auto: true, show_icon: true, icon: "",
};
TAB_ORDER.forEach((k) => { DEFAULTS[`show_${k}`] = true; });

const I18N = {
  de: {
    tab_cameras: "Kameras", tab_battery: "Batterie", tab_detections: "Erkennungen", tab_updates: "Updates",
    tab_storage: "Speicher", tab_controls: "Steuerung", tab_hub: "Hub", tab_bridge: "Einstellungen",
    stat_total: "Gesamt", stat_offline: "Offline", stat_battery: "Batterie niedrig", stat_updates: "Updates",
    search: "Suchen …", sort_name: "Name", sort_status: "Status", sort_battery: "Batterie",
    status_online: "Online", status_offline: "Offline", status_privacy: "Privatmodus", status_unknown: "Unbekannt",
    kind_camera: "Kamera", kind_hub: "Hub", kind_chime: "Gong",
    badge_sleeping: "Schläft", badge_update: "Update", badge_detecting: "Erkennung", badge_low: "Akku niedrig",
    badge_critical: "Akku kritisch", badge_experimental: "Experimentell",
    det_motion: "Bewegung", det_person: "Person", det_vehicle: "Fahrzeug", det_pet: "Haustier", det_animal: "Tier",
    det_face: "Gesicht", det_package: "Paket", det_visitor: "Besucher", det_baby_cry: "Babyschreien", det_bicycle: "Fahrrad",
    det_active: "aktiv", det_idle: "ruhig",
    ago_now: "gerade eben", ago_s: "vor {n} Sek.", ago_m: "vor {n} Min.", ago_h: "vor {n} Std.", ago_d: "vor {n} Tg.",
    empty_list: "Keine Geräte in dieser Ansicht.", empty_filter: "Kein Gerät passt zum Filter.",
    more_rows: "… {n} weitere (max_rows)", connecting: "Verbinde mit dem Reolink Manager …",
    err_connection: "Keine Verbindung zum Reolink Manager: {e}",
    warn_reolink: "Reolink-Eintrag „{t}“ ist nicht geladen ({s}).",
    hint_experimental_off: "Experimentelle Funktionen sind ausgeschaltet. Einschalten: Einstellungen → Geräte & Dienste → Reolink Manager → Konfigurieren → „Experimentelle Funktionen anzeigen“ und Funktionen wählen. In der Karte: Editor → Experimentell.",
    hint_card_exp_off: "Im Backend sind experimentelle Funktionen aktiv, in dieser Karte aber ausgeblendet. Editor → Experimentell → „Experimentelle Funktionen anzeigen“.",
    battery_state_charging: "lädt", battery_state_discharging: "entlädt", battery_state_charge_complete: "voll",
    wifi: "WLAN", storage: "Speicher", temperature: "Temperatur", last_change: "Zuletzt geändert",
    sleeping: "Schläft", awake: "Wach", unknown: "unbekannt",
    update_available: "Update verfügbar", update_current: "Aktuell", update_versions: "Installiert {a} → neu {b}",
    updates_none: "Keine Firmware-Updates verfügbar.",
    ctl_privacy: "Privatmodus", ctl_record: "Aufnahme", ctl_push: "Push",
    hub_cameras: "{n} Geräte", hub_scene: "Szene", hub_no_scene: "keine Szene",
    acc_info: "Informationen", acc_detections: "Erkennungen", acc_update: "Firmware", acc_ptz: "PTZ",
    acc_controls: "Steuerung", acc_refresh: "Aktualisieren", acc_entities: "Entitäten und Diagnose",
    acc_version: "App-Version", acc_reolink: "Reolink-Integration", acc_selection: "Auswahl",
    acc_options: "Optionen", acc_maintenance: "Wartung", acc_events: "Ereignisse", acc_experimental: "Experimentell",
    info_model: "Modell", info_kind: "Typ", info_hub: "Hub", info_status: "Status", info_sleep: "Schlafstatus",
    info_battery: "Batterie", info_entities: "Entitäten", info_unclassified: "Nicht zugeordnet",
    open_device: "Gerät öffnen", open_entity: "Details", copy: "Kopieren", copied: "Kopiert",
    loading: "Lade …", no_details: "Details sind nur für Administratoren verfügbar.",
    ptz_stop: "Stopp", ptz_zoom_in: "Zoom +", ptz_zoom_out: "Zoom −", ptz_preset: "Position",
    ptz_hint: "Halte einen Pfeil gedrückt, solange sich die Kamera bewegen soll. Loslassen hält sie an. Ein kurzes Tippen bewegt sie nur ein kleines Stück.",
    refresh_btn: "Jetzt aktualisieren", refresh_confirm: "Wirklich? Das weckt die Kamera.",
    refresh_hint: "Löst ein vollständiges Update der Reolink-Entitäten aus. Eine Akku-Kamera wird dabei geweckt und verbraucht Batterie.",
    siren_on: "Sirene an", siren_off: "Sirene aus", siren_confirm: "Wirklich? Laute Sirene!",
    on: "An", off: "Aus", role_unclassified: "nicht zugeordnet",
    ver_integration: "Integration", ver_card: "Karte", ver_latest: "Neueste Version", ver_checked: "Zuletzt geprüft",
    ver_none: "keine gefunden", ver_check_now: "Jetzt prüfen", ver_release: "Release ansehen",
    ver_update_avail: "Neue Version verfügbar. Aktualisiere über HACS und starte Home Assistant neu. Danach Browser neu laden (Strg+F5).",
    ver_mismatch: "Karte und Integration haben unterschiedliche Versionen. Browser-Cache leeren (Strg+F5).",
    ver_check_failed: "Prüfung nicht möglich", ver_ok: "Aktuell", ver_no_release: "Auf GitHub gibt es noch keine Veröffentlichung.",
    rl_none: "Kein Reolink-Eintrag ausgewählt.", rl_state_loaded: "geladen", rl_state_missing: "fehlt",
    rl_state_not_loaded: "nicht geladen", rl_state_setup_retry: "wartet", rl_state_setup_error: "Fehler",
    sel_cameras: "Kameras", sel_hubs: "Hubs", sel_chimes: "Gongs", sel_filtered: "Auf {n} ausgewählte Geräte beschränkt",
    sel_all: "Alle Geräte der gewählten Einträge", sel_hint: "Ändern unter Einstellungen → Geräte & Dienste → Reolink Manager → Konfigurieren.",
    opt_battery_low: "Batterie niedrig ab", opt_battery_critical: "Batterie kritisch ab", opt_offline_delay: "Offline-Meldung nach",
    opt_events: "Ereignisse senden", opt_detections: "Erkennungsarten", opt_read_only: "Nur lesen (Karte)",
    maint_rescan: "Geräte neu einlesen", maint_rescan_hint: "Liest Geräte und Entitäten der Reolink-Integration neu ein. Weckt keine Kamera.",
    events_empty: "Seit dem Start gab es keine Ereignisse.",
    ev_offline: "offline", ev_online: "wieder online", ev_battery_low: "Batterie niedrig",
    ev_battery_critical: "Batterie kritisch", ev_update_available: "Update verfügbar",
    exp_state_on: "aktiv", exp_state_off: "aus",
    exp_controls: "Steuerung (schreibt)", exp_ptz: "PTZ (schreibt)", exp_refresh: "Aktualisieren/Wecken (schreibt)",
    exp_intro: "Diese Funktionen sind ungeprüft. Sie sind nur sichtbar, wenn der Hauptschalter und die jeweilige Funktion eingeschaltet sind.",
    resp_ok: "Erledigt", resp_error: "Fehlgeschlagen: {e}",
    err_experimental_disabled: "Funktion ist experimentell und nicht aktiviert", err_unknown_entity: "Entität wird nicht verwaltet",
    err_unknown_device: "Gerät wird nicht verwaltet", err_not_allowed: "Aktion nicht erlaubt", err_bad_value: "Ungültiger Wert",
    err_call_failed: "Home Assistant hat den Aufruf abgelehnt", err_no_admin: "Nur Administratoren dürfen das",
    ed_title: "Titel", ed_show_title: "Titel anzeigen", ed_entry_id: "Eintrags-ID (nur bei mehreren Einträgen)",
    ed_group_categories: "Kategorien", ed_group_display: "Darstellung", ed_group_columns: "Spalten",
    ed_group_edit: "Bearbeiten", ed_group_colors: "Farben", ed_group_experimental: "Experimentell",
    ed_show_cat: "Kategorie „{c}“ anzeigen", ed_default_tab: "Starttab", ed_max_rows: "Maximale Zeilen",
    ed_zoom: "Zoom (%)", ed_show_stats: "Statistik-Chips anzeigen", ed_show_search: "Suchfeld anzeigen",
    ed_show_filter_bar: "Filter- und Sortierleiste anzeigen", ed_default_sort: "Standard-Sortierung",
    ed_col_model: "Spalte Modell", ed_col_hub: "Spalte Hub", ed_col_battery: "Spalte Batterie",
    ed_col_wifi: "Spalte WLAN", ed_col_last: "Spalte Zuletzt geändert",
    ed_read_only: "Nur lesen (alle Bedienelemente ausblenden)", ed_show_experimental: "Experimentelle Funktionen anzeigen",
    ed_exp_hint: "Ungeprüfte Funktionen. Im Backend müssen sie zusätzlich in den Optionen eingeschaltet sein.",
    ed_version: "Karte {c} · Integration {i}", ed_version_unknown: "Karte {c} · Integration nicht erreichbar",
    ed_update_warn: "Neue Version {v} verfügbar. Aktualisiere über HACS.", ed_mismatch_warn: "Karte und Integration haben unterschiedliche Versionen. Browser-Cache leeren (Strg+F5).",
    ed_colors_reset: "Alle Farben zurücksetzen", ed_colors_hint: "Leer = Theme-Standard. Erlaubt: Hex, rgb(), hsl(), var(--…).",
    ed_color_tab_active: "Aktiver Tab", ed_color_success: "Erfolg (grün)", ed_color_warning: "Warnung (orange)",
    ed_color_error: "Fehler (rot)", ed_color_info: "Info (blau)", ed_color_row_icon: "Zeilensymbole (alle)",
    ed_color_live_banner: "Live-Banner", ed_color_icon: "Symbolfarbe {c}",
    tab_gallery: "Galerie",
    exp_live: "Live-Bild (weckt Akku-Kameras)", exp_gallery: "Galerie der Aufnahmen", exp_push: "Push-Nachricht mit Bild",
    acc_live: "Live-Bild", live_refresh: "Standbild aktualisieren", live_start: "Live-Stream starten", live_stop: "Stream beenden",
    live_loading: "Lade Bild …", live_stream_loading: "Starte Stream …", live_error: "Bild nicht verfügbar", live_unavailable: "Kamera nicht erreichbar",
    live_battery_hint: "Akku-Kamera: Ein Bild weckt die Kamera und verbraucht Batterie.", live_stream_failed: "Stream konnte nicht gestartet werden, zeige Einzelbilder.",
    gal_empty: "Keine Aufnahmen gefunden.", gal_loading: "Lade Aufnahmen …", gal_open_hint: "Zum Laden der Aufnahmen aufklappen.",
    gal_error: "Aufnahmen konnten nicht geladen werden: {e}", gal_reload: "Neu laden", gal_count: "{n} Aufnahmen", gal_limit: "Anzahl in den Optionen der Integration einstellbar (aktuell {n}).",
    gal_no_thumb: "Die Reolink-Integration liefert für Aufnahmen keine Vorschaubilder. Oben siehst du das aktuelle Kamerabild.", gal_snapshot: "Aktuelles Kamerabild", gal_snapshot_load: "Kamerabild laden",
    gal_play_loading: "Lade Video …", gal_play_failed: "Video lässt sich hier nicht abspielen.", gal_open_ha: "In Home Assistant öffnen", gal_close: "Schließen",
    ed_show_icon: "Icon vor dem Titel anzeigen", ed_icon: "Icon (leer = Reolink-Logo, z. B. mdi:cctv oder reolink_manager:logo)",
    gal_download: "Hochauflösendes Video herunterladen", gal_dl_busy: "Suche hochauflösende Aufnahme …", gal_dl_started: "Download gestartet.",
    gal_dl_hls: "Direkter Download ist für diese Kamera nicht möglich. Die hochauflösende Aufnahme öffnet sich im Player.",
    gal_deep_none: "Die passende Aufnahme ist noch nicht in der Galerie. Sie erscheint, sobald die Kamera sie gespeichert hat.",
    storage_hint: "Reolink liefert die Speichersensoren (SD-Karte, Festplatte) standardmäßig deaktiviert. „Aktivieren“ schaltet sie ein. Home Assistant lädt die Reolink-Integration danach neu, die Werte erscheinen nach kurzer Zeit.",
    storage_enable: "Aktivieren", storage_disabled: "Sensor deaktiviert", storage_none: "Kein Speichersensor",
    ctl_tab_hint: "Schnellschalter je Gerät. Alle Einstellungen stehen im Popup.", ctl_open_full: "Alle Steuerungen",
    err_download_failed: "Aufnahme konnte nicht für den Download vorbereitet werden", err_download_not_found: "Die hochauflösende Aufnahme wurde nicht gefunden",
    err_gallery_failed: "Aufnahmen konnten nicht geladen werden", err_gallery_unavailable: "Für diese Kamera gibt es keine Aufnahmen (keine SD-Karte oder Wiedergabe nicht unterstützt)", err_no_push_target: "Kein Smartphone ausgewählt",
    acc_push: "Push-Nachrichten", push_targets: "Smartphones", push_detections: "Erkennungen", push_cooldown: "Sperrzeit", push_path: "Dashboard-Pfad",
    push_test: "Test-Nachricht senden", push_test_hint: "Sendet eine Nachricht mit aktuellem Bild an die gewählten Smartphones. Der Tipp darauf öffnet das Live-Bild.",
    push_none: "Kein Smartphone gewählt. Wähle unten eines aus.", opt_gallery_count: "Galerie-Videos pro Kamera",
    ptz_speed: "Geschwindigkeit", ptz_speed_slow: "Langsam", ptz_speed_mid: "Mittel", ptz_speed_fast: "Schnell",
    push_select_hint: "Wähle die Smartphones, die eine Nachricht mit aktuellem Bild bekommen. Sie stammen aus der Companion-App (notify.mobile_app_…).",
    push_no_app: "Kein Smartphone gefunden. Installiere die Home-Assistant-App und erlaube Benachrichtigungen.", push_gone: "nicht mehr vorhanden",
    push_saved: "Push-Einstellungen gespeichert", push_path_auto: "automatisch (Dashboard „Reolink Manager“)", push_det_hint: "Bei welchen Erkennungen soll eine Nachricht kommen?",
    push_cooldown_hint: "Sekunden, in denen dieselbe Kamera für dieselbe Erkennung keine zweite Nachricht sendet (0 = keine Sperre).",
    push_test_sent: "Test-Nachricht wird gesendet …",
    ed_live_auto: "Standbild beim Öffnen des Popups automatisch laden",
  },
  en: {
    tab_cameras: "Cameras", tab_battery: "Battery", tab_detections: "Detections", tab_updates: "Updates",
    tab_storage: "Storage", tab_controls: "Controls", tab_hub: "Hub", tab_bridge: "Settings",
    stat_total: "Total", stat_offline: "Offline", stat_battery: "Battery low", stat_updates: "Updates",
    search: "Search …", sort_name: "Name", sort_status: "Status", sort_battery: "Battery",
    status_online: "Online", status_offline: "Offline", status_privacy: "Privacy mode", status_unknown: "Unknown",
    kind_camera: "Camera", kind_hub: "Hub", kind_chime: "Chime",
    badge_sleeping: "Sleeping", badge_update: "Update", badge_detecting: "Detection", badge_low: "Battery low",
    badge_critical: "Battery critical", badge_experimental: "Experimental",
    det_motion: "Motion", det_person: "Person", det_vehicle: "Vehicle", det_pet: "Pet", det_animal: "Animal",
    det_face: "Face", det_package: "Package", det_visitor: "Visitor", det_baby_cry: "Baby crying", det_bicycle: "Bicycle",
    det_active: "active", det_idle: "idle",
    ago_now: "just now", ago_s: "{n} s ago", ago_m: "{n} min ago", ago_h: "{n} h ago", ago_d: "{n} d ago",
    empty_list: "No devices in this view.", empty_filter: "No device matches the filter.",
    more_rows: "… {n} more (max_rows)", connecting: "Connecting to Reolink Manager …",
    err_connection: "No connection to Reolink Manager: {e}",
    warn_reolink: "Reolink entry \"{t}\" is not loaded ({s}).",
    hint_experimental_off: "Experimental features are switched off. Enable them: Settings → Devices & services → Reolink Manager → Configure → \"Show experimental features\" and pick features. In the card: editor → Experimental.",
    hint_card_exp_off: "Experimental features are active in the backend but hidden in this card. Editor → Experimental → \"Show experimental features\".",
    battery_state_charging: "charging", battery_state_discharging: "discharging", battery_state_charge_complete: "full",
    wifi: "Wi-Fi", storage: "Storage", temperature: "Temperature", last_change: "Last changed",
    sleeping: "Sleeping", awake: "Awake", unknown: "unknown",
    update_available: "Update available", update_current: "Up to date", update_versions: "Installed {a} → new {b}",
    updates_none: "No firmware updates available.",
    ctl_privacy: "Privacy mode", ctl_record: "Recording", ctl_push: "Push",
    hub_cameras: "{n} devices", hub_scene: "Scene", hub_no_scene: "no scene",
    acc_info: "Information", acc_detections: "Detections", acc_update: "Firmware", acc_ptz: "PTZ",
    acc_controls: "Controls", acc_refresh: "Refresh", acc_entities: "Entities and diagnostics",
    acc_version: "App version", acc_reolink: "Reolink integration", acc_selection: "Selection",
    acc_options: "Options", acc_maintenance: "Maintenance", acc_events: "Events", acc_experimental: "Experimental",
    info_model: "Model", info_kind: "Type", info_hub: "Hub", info_status: "Status", info_sleep: "Sleep status",
    info_battery: "Battery", info_entities: "Entities", info_unclassified: "Unassigned",
    open_device: "Open device", open_entity: "Details", copy: "Copy", copied: "Copied",
    loading: "Loading …", no_details: "Details are only available to administrators.",
    ptz_stop: "Stop", ptz_zoom_in: "Zoom +", ptz_zoom_out: "Zoom −", ptz_preset: "Position",
    ptz_hint: "Hold an arrow for as long as the camera should move. Releasing it stops the camera. A short tap moves it only a little.",
    refresh_btn: "Refresh now", refresh_confirm: "Sure? This wakes the camera.",
    refresh_hint: "Triggers a full update of the Reolink entities. A battery camera is woken and uses battery.",
    siren_on: "Siren on", siren_off: "Siren off", siren_confirm: "Sure? Loud siren!",
    on: "On", off: "Off", role_unclassified: "unassigned",
    ver_integration: "Integration", ver_card: "Card", ver_latest: "Latest version", ver_checked: "Last checked",
    ver_none: "none found", ver_check_now: "Check now", ver_release: "View release",
    ver_update_avail: "New version available. Update via HACS and restart Home Assistant. Then reload the browser (Ctrl+F5).",
    ver_mismatch: "Card and integration have different versions. Clear the browser cache (Ctrl+F5).",
    ver_check_failed: "Check not possible", ver_ok: "Up to date", ver_no_release: "There is no release on GitHub yet.",
    rl_none: "No Reolink entry selected.", rl_state_loaded: "loaded", rl_state_missing: "missing",
    rl_state_not_loaded: "not loaded", rl_state_setup_retry: "waiting", rl_state_setup_error: "error",
    sel_cameras: "Cameras", sel_hubs: "Hubs", sel_chimes: "Chimes", sel_filtered: "Limited to {n} selected devices",
    sel_all: "All devices of the selected entries", sel_hint: "Change under Settings → Devices & services → Reolink Manager → Configure.",
    opt_battery_low: "Battery low from", opt_battery_critical: "Battery critical from", opt_offline_delay: "Offline notice after",
    opt_events: "Send events", opt_detections: "Detection types", opt_read_only: "Read only (card)",
    maint_rescan: "Rescan devices", maint_rescan_hint: "Reads the devices and entities of the Reolink integration again. Wakes no camera.",
    events_empty: "No events since start.",
    ev_offline: "offline", ev_online: "back online", ev_battery_low: "battery low",
    ev_battery_critical: "battery critical", ev_update_available: "update available",
    exp_state_on: "active", exp_state_off: "off",
    exp_controls: "Controls (writes)", exp_ptz: "PTZ (writes)", exp_refresh: "Refresh/wake (writes)",
    exp_intro: "These features are untested. They are only visible when the master switch and the individual feature are on.",
    resp_ok: "Done", resp_error: "Failed: {e}",
    err_experimental_disabled: "Feature is experimental and not enabled", err_unknown_entity: "Entity is not managed",
    err_unknown_device: "Device is not managed", err_not_allowed: "Action not allowed", err_bad_value: "Invalid value",
    err_call_failed: "Home Assistant rejected the call", err_no_admin: "Administrators only",
    ed_title: "Title", ed_show_title: "Show title", ed_entry_id: "Entry ID (only with several entries)",
    ed_group_categories: "Categories", ed_group_display: "Display", ed_group_columns: "Columns",
    ed_group_edit: "Editing", ed_group_colors: "Colors", ed_group_experimental: "Experimental",
    ed_show_cat: "Show category \"{c}\"", ed_default_tab: "Start tab", ed_max_rows: "Maximum rows",
    ed_zoom: "Zoom (%)", ed_show_stats: "Show statistic chips", ed_show_search: "Show search field",
    ed_show_filter_bar: "Show filter and sort bar", ed_default_sort: "Default sorting",
    ed_col_model: "Model column", ed_col_hub: "Hub column", ed_col_battery: "Battery column",
    ed_col_wifi: "Wi-Fi column", ed_col_last: "Last changed column",
    ed_read_only: "Read only (hide all controls)", ed_show_experimental: "Show experimental features",
    ed_exp_hint: "Untested features. They also have to be switched on in the backend options.",
    ed_version: "Card {c} · Integration {i}", ed_version_unknown: "Card {c} · Integration not reachable",
    ed_update_warn: "New version {v} available. Update via HACS.", ed_mismatch_warn: "Card and integration have different versions. Clear the browser cache (Ctrl+F5).",
    ed_colors_reset: "Reset all colors", ed_colors_hint: "Empty = theme default. Allowed: hex, rgb(), hsl(), var(--…).",
    ed_color_tab_active: "Active tab", ed_color_success: "Success (green)", ed_color_warning: "Warning (orange)",
    ed_color_error: "Error (red)", ed_color_info: "Info (blue)", ed_color_row_icon: "Row icons (all)",
    ed_color_live_banner: "Live banner", ed_color_icon: "Icon color {c}",
    tab_gallery: "Gallery",
    exp_live: "Live view (wakes battery cameras)", exp_gallery: "Recording gallery", exp_push: "Push notification with image",
    acc_live: "Live view", live_refresh: "Refresh still image", live_start: "Start live stream", live_stop: "Stop stream",
    live_loading: "Loading image …", live_stream_loading: "Starting stream …", live_error: "Image not available", live_unavailable: "Camera not reachable",
    live_battery_hint: "Battery camera: an image wakes the camera and uses battery.", live_stream_failed: "Stream could not be started, showing still images.",
    gal_empty: "No recordings found.", gal_loading: "Loading recordings …", gal_open_hint: "Expand to load the recordings.",
    gal_error: "Recordings could not be loaded: {e}", gal_reload: "Reload", gal_count: "{n} recordings", gal_limit: "Number can be set in the integration options (currently {n}).",
    gal_no_thumb: "The Reolink integration provides no preview images for recordings. Above you see the current camera image.", gal_snapshot: "Current camera image", gal_snapshot_load: "Load camera image",
    gal_play_loading: "Loading video …", gal_play_failed: "The video cannot be played here.", gal_open_ha: "Open in Home Assistant", gal_close: "Close",
    ed_show_icon: "Show icon before the title", ed_icon: "Icon (empty = Reolink logo, e.g. mdi:cctv or reolink_manager:logo)",
    gal_download: "Download high-resolution video", gal_dl_busy: "Looking for the high-resolution recording …", gal_dl_started: "Download started.",
    gal_dl_hls: "Direct download is not possible for this camera. The high-resolution recording opens in the player.",
    gal_deep_none: "The matching recording is not in the gallery yet. It appears as soon as the camera has saved it.",
    storage_hint: "Reolink delivers the storage sensors (SD card, hard disk) disabled by default. “Enable” turns them on. Home Assistant then reloads the Reolink integration, the values appear shortly after.",
    storage_enable: "Enable", storage_disabled: "Sensor disabled", storage_none: "No storage sensor",
    ctl_tab_hint: "Quick switches per device. All settings are in the popup.", ctl_open_full: "All controls",
    err_download_failed: "The recording could not be prepared for download", err_download_not_found: "The high-resolution recording was not found",
    err_gallery_failed: "Recordings could not be loaded", err_gallery_unavailable: "No recordings for this camera (no SD card or playback not supported)", err_no_push_target: "No smartphone selected",
    acc_push: "Push notifications", push_targets: "Smartphones", push_detections: "Detections", push_cooldown: "Lock time", push_path: "Dashboard path",
    push_test: "Send test message", push_test_hint: "Sends a message with the current image to the selected smartphones. Tapping it opens the live view.",
    push_none: "No smartphone selected. Choose one below.", opt_gallery_count: "Gallery videos per camera",
    ptz_speed: "Speed", ptz_speed_slow: "Slow", ptz_speed_mid: "Medium", ptz_speed_fast: "Fast",
    push_select_hint: "Choose the smartphones that get a message with the current image. They come from the companion app (notify.mobile_app_…).",
    push_no_app: "No smartphone found. Install the Home Assistant app and allow notifications.", push_gone: "no longer available",
    push_saved: "Push settings saved", push_path_auto: "automatic (dashboard \"Reolink Manager\")", push_det_hint: "Which detections should send a message?",
    push_cooldown_hint: "Seconds during which the same camera sends no second message for the same detection (0 = no lock).",
    push_test_sent: "Sending test message …",
    ed_live_auto: "Load still image automatically when the popup opens",
  },
  nl: {
    tab_cameras: "Camera's", tab_battery: "Batterij", tab_detections: "Detecties", tab_updates: "Updates",
    tab_storage: "Opslag", tab_controls: "Bediening", tab_hub: "Hub", tab_bridge: "Instellingen",
    stat_total: "Totaal", stat_offline: "Offline", stat_battery: "Batterij laag", stat_updates: "Updates",
    search: "Zoeken …", sort_name: "Naam", sort_status: "Status", sort_battery: "Batterij",
    status_online: "Online", status_offline: "Offline", status_privacy: "Privémodus", status_unknown: "Onbekend",
    kind_camera: "Camera", kind_hub: "Hub", kind_chime: "Gong",
    badge_sleeping: "Slaapt", badge_update: "Update", badge_detecting: "Detectie", badge_low: "Accu laag",
    badge_critical: "Accu kritiek", badge_experimental: "Experimenteel",
    det_motion: "Beweging", det_person: "Persoon", det_vehicle: "Voertuig", det_pet: "Huisdier", det_animal: "Dier",
    det_face: "Gezicht", det_package: "Pakket", det_visitor: "Bezoeker", det_baby_cry: "Babygehuil", det_bicycle: "Fiets",
    det_active: "actief", det_idle: "rustig",
    ago_now: "zojuist", ago_s: "{n} sec. geleden", ago_m: "{n} min. geleden", ago_h: "{n} uur geleden", ago_d: "{n} d. geleden",
    empty_list: "Geen apparaten in deze weergave.", empty_filter: "Geen apparaat past bij het filter.",
    more_rows: "… {n} meer (max_rows)", connecting: "Verbinden met Reolink Manager …",
    err_connection: "Geen verbinding met Reolink Manager: {e}",
    warn_reolink: "Reolink-item \"{t}\" is niet geladen ({s}).",
    hint_experimental_off: "Experimentele functies staan uit. Inschakelen: Instellingen → Apparaten en diensten → Reolink Manager → Configureren → \"Experimentele functies tonen\" en functies kiezen. In de kaart: editor → Experimenteel.",
    hint_card_exp_off: "Experimentele functies zijn in de backend actief, maar in deze kaart verborgen. Editor → Experimenteel → \"Experimentele functies tonen\".",
    battery_state_charging: "laadt", battery_state_discharging: "ontlaadt", battery_state_charge_complete: "vol",
    wifi: "Wifi", storage: "Opslag", temperature: "Temperatuur", last_change: "Laatst gewijzigd",
    sleeping: "Slaapt", awake: "Wakker", unknown: "onbekend",
    update_available: "Update beschikbaar", update_current: "Actueel", update_versions: "Geïnstalleerd {a} → nieuw {b}",
    updates_none: "Geen firmware-updates beschikbaar.",
    ctl_privacy: "Privémodus", ctl_record: "Opname", ctl_push: "Push",
    hub_cameras: "{n} apparaten", hub_scene: "Scène", hub_no_scene: "geen scène",
    acc_info: "Informatie", acc_detections: "Detecties", acc_update: "Firmware", acc_ptz: "PTZ",
    acc_controls: "Bediening", acc_refresh: "Verversen", acc_entities: "Entiteiten en diagnose",
    acc_version: "App-versie", acc_reolink: "Reolink-integratie", acc_selection: "Selectie",
    acc_options: "Opties", acc_maintenance: "Onderhoud", acc_events: "Gebeurtenissen", acc_experimental: "Experimenteel",
    info_model: "Model", info_kind: "Type", info_hub: "Hub", info_status: "Status", info_sleep: "Slaapstatus",
    info_battery: "Batterij", info_entities: "Entiteiten", info_unclassified: "Niet toegewezen",
    open_device: "Apparaat openen", open_entity: "Details", copy: "Kopiëren", copied: "Gekopieerd",
    loading: "Laden …", no_details: "Details zijn alleen beschikbaar voor beheerders.",
    ptz_stop: "Stop", ptz_zoom_in: "Zoom +", ptz_zoom_out: "Zoom −", ptz_preset: "Positie",
    ptz_hint: "Houd een pijl ingedrukt zolang de camera moet bewegen. Loslaten stopt de camera. Kort tikken beweegt hem maar een klein stukje.",
    refresh_btn: "Nu verversen", refresh_confirm: "Zeker? Dit wekt de camera.",
    refresh_hint: "Start een volledige update van de Reolink-entiteiten. Een accu-camera wordt gewekt en kost batterij.",
    siren_on: "Sirene aan", siren_off: "Sirene uit", siren_confirm: "Zeker? Harde sirene!",
    on: "Aan", off: "Uit", role_unclassified: "niet toegewezen",
    ver_integration: "Integratie", ver_card: "Kaart", ver_latest: "Nieuwste versie", ver_checked: "Laatst gecontroleerd",
    ver_none: "geen gevonden", ver_check_now: "Nu controleren", ver_release: "Release bekijken",
    ver_update_avail: "Nieuwe versie beschikbaar. Werk bij via HACS en herstart Home Assistant. Laad daarna de browser opnieuw (Ctrl+F5).",
    ver_mismatch: "Kaart en integratie hebben verschillende versies. Wis de browsercache (Ctrl+F5).",
    ver_check_failed: "Controle niet mogelijk", ver_ok: "Actueel", ver_no_release: "Er is nog geen release op GitHub.",
    rl_none: "Geen Reolink-item gekozen.", rl_state_loaded: "geladen", rl_state_missing: "ontbreekt",
    rl_state_not_loaded: "niet geladen", rl_state_setup_retry: "wacht", rl_state_setup_error: "fout",
    sel_cameras: "Camera's", sel_hubs: "Hubs", sel_chimes: "Gongs", sel_filtered: "Beperkt tot {n} gekozen apparaten",
    sel_all: "Alle apparaten van de gekozen items", sel_hint: "Wijzigen onder Instellingen → Apparaten en diensten → Reolink Manager → Configureren.",
    opt_battery_low: "Batterij laag vanaf", opt_battery_critical: "Batterij kritiek vanaf", opt_offline_delay: "Offline-melding na",
    opt_events: "Gebeurtenissen verzenden", opt_detections: "Detectiesoorten", opt_read_only: "Alleen lezen (kaart)",
    maint_rescan: "Apparaten opnieuw inlezen", maint_rescan_hint: "Leest apparaten en entiteiten van de Reolink-integratie opnieuw in. Wekt geen camera.",
    events_empty: "Sinds de start geen gebeurtenissen.",
    ev_offline: "offline", ev_online: "weer online", ev_battery_low: "batterij laag",
    ev_battery_critical: "batterij kritiek", ev_update_available: "update beschikbaar",
    exp_state_on: "actief", exp_state_off: "uit",
    exp_controls: "Bediening (schrijft)", exp_ptz: "PTZ (schrijft)", exp_refresh: "Verversen/wekken (schrijft)",
    exp_intro: "Deze functies zijn ongetest. Ze zijn alleen zichtbaar als de hoofdschakelaar en de functie zelf aan staan.",
    resp_ok: "Klaar", resp_error: "Mislukt: {e}",
    err_experimental_disabled: "Functie is experimenteel en niet ingeschakeld", err_unknown_entity: "Entiteit wordt niet beheerd",
    err_unknown_device: "Apparaat wordt niet beheerd", err_not_allowed: "Actie niet toegestaan", err_bad_value: "Ongeldige waarde",
    err_call_failed: "Home Assistant heeft de aanroep geweigerd", err_no_admin: "Alleen beheerders",
    ed_title: "Titel", ed_show_title: "Titel tonen", ed_entry_id: "Item-ID (alleen bij meerdere items)",
    ed_group_categories: "Categorieën", ed_group_display: "Weergave", ed_group_columns: "Kolommen",
    ed_group_edit: "Bewerken", ed_group_colors: "Kleuren", ed_group_experimental: "Experimenteel",
    ed_show_cat: "Categorie \"{c}\" tonen", ed_default_tab: "Starttab", ed_max_rows: "Maximaal aantal rijen",
    ed_zoom: "Zoom (%)", ed_show_stats: "Statistiekchips tonen", ed_show_search: "Zoekveld tonen",
    ed_show_filter_bar: "Filter- en sorteerbalk tonen", ed_default_sort: "Standaardsortering",
    ed_col_model: "Kolom model", ed_col_hub: "Kolom hub", ed_col_battery: "Kolom batterij",
    ed_col_wifi: "Kolom wifi", ed_col_last: "Kolom laatst gewijzigd",
    ed_read_only: "Alleen lezen (alle bedieningselementen verbergen)", ed_show_experimental: "Experimentele functies tonen",
    ed_exp_hint: "Ongeteste functies. Ze moeten ook in de backend-opties zijn ingeschakeld.",
    ed_version: "Kaart {c} · Integratie {i}", ed_version_unknown: "Kaart {c} · Integratie niet bereikbaar",
    ed_update_warn: "Nieuwe versie {v} beschikbaar. Werk bij via HACS.", ed_mismatch_warn: "Kaart en integratie hebben verschillende versies. Wis de browsercache (Ctrl+F5).",
    ed_colors_reset: "Alle kleuren resetten", ed_colors_hint: "Leeg = themastandaard. Toegestaan: hex, rgb(), hsl(), var(--…).",
    ed_color_tab_active: "Actieve tab", ed_color_success: "Succes (groen)", ed_color_warning: "Waarschuwing (oranje)",
    ed_color_error: "Fout (rood)", ed_color_info: "Info (blauw)", ed_color_row_icon: "Rijpictogrammen (alle)",
    ed_color_live_banner: "Live-banner", ed_color_icon: "Pictogramkleur {c}",
    tab_gallery: "Galerij",
    exp_live: "Live-beeld (wekt accu-camera's)", exp_gallery: "Galerij van opnames", exp_push: "Pushmelding met beeld",
    acc_live: "Live-beeld", live_refresh: "Stilstaand beeld verversen", live_start: "Livestream starten", live_stop: "Stream stoppen",
    live_loading: "Beeld laden …", live_stream_loading: "Stream starten …", live_error: "Beeld niet beschikbaar", live_unavailable: "Camera niet bereikbaar",
    live_battery_hint: "Accu-camera: een beeld wekt de camera en kost batterij.", live_stream_failed: "Stream kon niet starten, losse beelden worden getoond.",
    gal_empty: "Geen opnames gevonden.", gal_loading: "Opnames laden …", gal_open_hint: "Uitklappen om de opnames te laden.",
    gal_error: "Opnames konden niet worden geladen: {e}", gal_reload: "Opnieuw laden", gal_count: "{n} opnames", gal_limit: "Aantal instelbaar in de opties van de integratie (nu {n}).",
    gal_no_thumb: "De Reolink-integratie levert geen voorbeeldbeelden voor opnames. Hierboven zie je het actuele camerabeeld.", gal_snapshot: "Actueel camerabeeld", gal_snapshot_load: "Camerabeeld laden",
    gal_play_loading: "Video laden …", gal_play_failed: "De video kan hier niet worden afgespeeld.", gal_open_ha: "Openen in Home Assistant", gal_close: "Sluiten",
    ed_show_icon: "Pictogram vóór de titel tonen", ed_icon: "Pictogram (leeg = Reolink-logo, bijv. mdi:cctv of reolink_manager:logo)",
    gal_download: "Video in hoge resolutie downloaden", gal_dl_busy: "Opname in hoge resolutie zoeken …", gal_dl_started: "Download gestart.",
    gal_dl_hls: "Direct downloaden is voor deze camera niet mogelijk. De opname in hoge resolutie opent in de speler.",
    gal_deep_none: "De bijbehorende opname staat nog niet in de galerij. Ze verschijnt zodra de camera haar heeft opgeslagen.",
    storage_hint: "Reolink levert de opslagsensoren (SD-kaart, harde schijf) standaard uitgeschakeld. “Inschakelen” zet ze aan. Home Assistant laadt de Reolink-integratie daarna opnieuw, de waarden verschijnen kort daarna.",
    storage_enable: "Inschakelen", storage_disabled: "Sensor uitgeschakeld", storage_none: "Geen opslagsensor",
    ctl_tab_hint: "Snelschakelaars per apparaat. Alle instellingen staan in de popup.", ctl_open_full: "Alle bediening",
    err_download_failed: "De opname kon niet voor download worden voorbereid", err_download_not_found: "De opname in hoge resolutie is niet gevonden",
    err_gallery_failed: "Opnames konden niet worden geladen", err_gallery_unavailable: "Geen opnames voor deze camera (geen SD-kaart of afspelen niet ondersteund)", err_no_push_target: "Geen smartphone gekozen",
    acc_push: "Pushmeldingen", push_targets: "Smartphones", push_detections: "Detecties", push_cooldown: "Blokkeertijd", push_path: "Dashboardpad",
    push_test: "Testbericht verzenden", push_test_hint: "Verstuurt een bericht met het actuele beeld naar de gekozen smartphones. Tikken erop opent het live-beeld.",
    push_none: "Geen smartphone gekozen. Kies er hieronder een.", opt_gallery_count: "Galerijvideo's per camera",
    ptz_speed: "Snelheid", ptz_speed_slow: "Langzaam", ptz_speed_mid: "Gemiddeld", ptz_speed_fast: "Snel",
    push_select_hint: "Kies de smartphones die een bericht met het actuele beeld krijgen. Ze komen uit de companion-app (notify.mobile_app_…).",
    push_no_app: "Geen smartphone gevonden. Installeer de Home Assistant-app en sta meldingen toe.", push_gone: "niet meer beschikbaar",
    push_saved: "Push-instellingen opgeslagen", push_path_auto: "automatisch (dashboard „Reolink Manager”)", push_det_hint: "Bij welke detecties moet een bericht komen?",
    push_cooldown_hint: "Seconden waarin dezelfde camera voor dezelfde detectie geen tweede bericht stuurt (0 = geen blokkering).",
    push_test_sent: "Testbericht wordt verzonden …",
    ed_live_auto: "Stilstaand beeld automatisch laden bij openen van de popup",
  },
};

/* Sprach-Tag nie blind kürzen: Tags mit Schriftvariante (sr-Latn, zh-Hant) bleiben erhalten. */
function pickLang(code) {
  const c = String(code || "en");
  if (I18N[c]) return c;
  const m = c.match(/^([a-zA-Z]{2,3})(?:-([A-Za-z]{4}))?/);
  if (m) {
    const base = m[1].toLowerCase();
    if (m[2]) {
      const full = `${base}-${m[2][0].toUpperCase()}${m[2].slice(1).toLowerCase()}`;
      if (I18N[full]) return full;
    }
    if (I18N[base]) return base;
  }
  return "en";
}
function tr(lang, key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function jsonEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const CSS = `
:host{display:block;container-type:inline-size;container-name:rm}
ha-card{padding:0 0 12px;overflow:hidden}
*{box-sizing:border-box}
.header{display:flex;align-items:center;gap:10px;padding:14px 16px 4px;font-size:1.25rem;font-weight:500}
.hicon{width:30px;height:30px;flex:none;--mdc-icon-size:30px;object-fit:contain;color:var(--rm-tab)}
.banner{margin:8px 12px 0;padding:8px 12px;border-radius:8px;font-size:.88rem;border:1px solid var(--c);color:var(--primary-text-color);background:color-mix(in srgb,var(--c) 14%,transparent);display:flex;gap:8px;align-items:flex-start}
.banner ha-icon{--mdc-icon-size:20px;color:var(--c);flex:none}
.banner.error{--c:var(--rm-error)}.banner.warning{--c:var(--rm-warning)}.banner.info{--c:var(--rm-live)}
.tabs{display:flex;gap:2px;margin:8px 8px 0;border-bottom:1px solid var(--divider-color);overflow-x:auto}
.tab{position:relative;display:flex;align-items:center;gap:6px;padding:8px 10px;border:0;background:none;cursor:pointer;color:var(--secondary-text-color);border-bottom:2px solid transparent;font:inherit;font-size:.9rem;white-space:nowrap}
.tab ha-icon{--mdc-icon-size:20px;color:var(--ic,var(--rm-rowicon))}
.tab.active{color:var(--primary-text-color);border-bottom-color:var(--rm-tab)}
.badge{min-width:18px;padding:0 5px;border-radius:9px;font-size:.7rem;line-height:18px;text-align:center;color:#fff;background:var(--c)}
@container rm (max-width:700px){.tab:not(.active) .lbl{display:none}.tab{padding:8px}}
.stats{display:flex;gap:8px;padding:10px 12px 0;flex-wrap:wrap}
.chip{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:16px;border:1px solid var(--divider-color);background:none;cursor:pointer;font:inherit;font-size:.85rem;color:var(--primary-text-color)}
.chip b{font-weight:600;color:var(--c,inherit)}
.chip.on{border-color:var(--c,var(--rm-tab));background:color-mix(in srgb,var(--c,var(--rm-tab)) 12%,transparent)}
.bar{display:flex;gap:8px;padding:10px 12px 0;align-items:center}
.bar input,.bar select,.sel{flex:1;min-width:0;padding:7px 10px;border-radius:6px;border:1px solid var(--divider-color);background:var(--card-background-color,#fff);color:var(--primary-text-color);font:inherit;font-size:.9rem}
.bar select{flex:none}
.list{margin-top:6px}
.row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-top:1px solid var(--divider-color);cursor:pointer}
.row:first-child{border-top:0}
.row:hover{background:color-mix(in srgb,var(--primary-text-color) 5%,transparent)}
.ico{position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex:none}
.ico ha-icon{--mdc-icon-size:26px;color:var(--ic,var(--rm-rowicon))}
.dot{position:absolute;right:0;bottom:2px;width:10px;height:10px;border-radius:50%;background:var(--c);border:2px solid var(--card-background-color,#fff)}
.main{flex:1;min-width:0}
.name{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-weight:500}
.sub{font-size:.8rem;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pill{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:10px;font-size:.75rem;border:1px solid var(--c,var(--divider-color));color:var(--c,var(--primary-text-color));background:color-mix(in srgb,var(--c,transparent) 10%,transparent);white-space:nowrap}
.pill ha-icon{--mdc-icon-size:14px}
.pill.btnp{cursor:pointer;font:inherit;font-size:.75rem}
.pills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:55%}
.batbar{display:inline-block;width:56px;height:8px;border-radius:4px;background:var(--divider-color);overflow:hidden;vertical-align:middle}
.batbar i{display:block;height:100%;background:var(--c)}
.empty{padding:20px 16px;text-align:center;color:var(--secondary-text-color)}
.more{padding:8px 16px;text-align:center;font-size:.8rem;color:var(--secondary-text-color)}
.btn{padding:6px 12px;border-radius:6px;border:1px solid var(--divider-color);background:var(--card-background-color,#fff);color:var(--primary-text-color);cursor:pointer;font:inherit;font-size:.85rem;display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--rm-tab)}
.btn.primary{background:var(--rm-tab);border-color:var(--rm-tab);color:#fff}
.btn.danger{border-color:var(--rm-error);color:var(--rm-error)}
.btn.confirm{background:var(--rm-warning);border-color:var(--rm-warning);color:#fff}
.btn.small{padding:3px 8px;font-size:.78rem}
.btn.icon{padding:6px}
.btn[disabled]{opacity:.4;cursor:default}
.settings{padding:8px 12px 0;display:flex;flex-direction:column;gap:8px}
.settings-accordion{border:1px solid var(--divider-color);border-radius:8px;overflow:hidden}
.settings-accordion.update{border-color:var(--rm-warning)}
.settings-accordion.danger{border-color:var(--rm-error)}
.settings-accordion-summary{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;list-style:none;font-weight:500}
.settings-accordion-summary::-webkit-details-marker{display:none}
.settings-accordion-summary ha-icon{--mdc-icon-size:20px;color:var(--rm-rowicon)}
.settings-accordion.update .settings-accordion-summary ha-icon{color:var(--rm-warning)}
.settings-accordion-summary .grow{flex:1}
.settings-accordion-summary .meta{font-size:.78rem;color:var(--secondary-text-color);font-weight:400}
.settings-accordion-summary::after{content:"";width:7px;height:7px;border-right:2px solid var(--secondary-text-color);border-bottom:2px solid var(--secondary-text-color);transform:rotate(45deg);margin:0 4px 3px;transition:transform .15s}
.settings-accordion[open]>.settings-accordion-summary::after{transform:rotate(225deg);margin-bottom:-3px}
.settings-accordion-body{padding:4px 12px 12px;border-top:1px solid var(--divider-color)}
.settings-line{display:flex;justify-content:space-between;gap:12px;padding:5px 0;font-size:.88rem;align-items:center}
.settings-line .lbl{color:var(--secondary-text-color)}
.settings-line .val{font-weight:600;text-align:right;word-break:break-word}
.note{font-size:.82rem;color:var(--secondary-text-color);margin:6px 0}
.note.warn{color:var(--rm-warning)}.note.err{color:var(--rm-error)}.note.ok{color:var(--rm-success)}
.btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.pad{display:grid;grid-template-columns:repeat(3,52px);gap:6px;justify-content:center;margin:4px 0}
.pad .btn{justify-content:center;height:44px}
.ptzpanel{border:1px solid var(--divider-color);border-radius:8px;padding:6px 10px}
.ptzrow{display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap}
.ptzside{display:flex;flex-direction:column;gap:6px;min-width:120px;flex:1;max-width:220px}
.ptzlbl{display:flex;flex-direction:column;gap:2px;font-size:.75rem;color:var(--secondary-text-color)}
.ptzpanel .note{margin:2px 0 0;font-size:.74rem}
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:12px}
.popup{width:100%;max-width:440px;max-height:86vh;display:flex;flex-direction:column;border-radius:12px;background:var(--card-background-color,#fff);color:var(--primary-text-color);box-shadow:0 8px 32px rgba(0,0,0,.35)}
.phead{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--divider-color)}
.phead .t{flex:1;font-weight:600;font-size:1.05rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pbody{padding:12px;overflow-y:scroll;overflow-x:hidden;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin;scrollbar-color:var(--rm-rowicon) transparent;-webkit-overflow-scrolling:touch}
.pbody>*{flex:none}
.pbody::-webkit-scrollbar{width:8px}
.pbody::-webkit-scrollbar-thumb{background:var(--rm-rowicon);border-radius:4px}
.live{display:flex;flex-direction:column;gap:6px}
.livebox{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center}
.livebox img,.livebox video,.livebox>*{width:100%;height:100%;object-fit:contain;display:block}
.livemsg{color:#ddd;font-size:.85rem;padding:8px;text-align:center}
.livemsg.err{color:#ffb4ab}
.livebar{display:flex;gap:8px;flex-wrap:wrap}
.settings-accordion{flex:none}
.galsnap{display:flex;gap:10px;align-items:center;margin:6px 0}
.galsnap img{width:96px;aspect-ratio:16/9;object-fit:cover;border-radius:6px;background:#000}
.galsnap span{font-size:.8rem;color:var(--secondary-text-color)}
.galrow{display:flex;gap:10px;align-items:center;padding:6px 0;border-top:1px solid var(--divider-color);cursor:pointer}
.galthumb{width:72px;aspect-ratio:16/9;border-radius:6px;background:color-mix(in srgb,var(--primary-text-color) 10%,transparent);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none}
.galthumb img{width:100%;height:100%;object-fit:cover}
.galthumb ha-icon{--mdc-icon-size:26px;color:var(--rm-rowicon)}
.player{max-width:720px}
[data-ptz]{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.btn.ptz:active{background:var(--rm-tab);border-color:var(--rm-tab);color:#fff}
.chk{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.9rem;cursor:pointer}
.chk input{width:18px;height:18px;accent-color:var(--rm-tab)}
.chips{display:flex;flex-wrap:wrap;gap:2px 16px}
.ent{display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid var(--divider-color);font-size:.82rem}
.ent:first-child{border-top:0}
.ent .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}
.ent .r{color:var(--secondary-text-color);font-size:.72rem}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 16px;border-radius:8px;background:#323232;color:#fff;z-index:60;font-size:.9rem;box-shadow:0 4px 16px rgba(0,0,0,.3)}
.toast.err{background:var(--rm-error)}
.expbadge{font-size:.65rem;padding:1px 6px;border-radius:8px;background:var(--rm-warning);color:#fff;font-weight:500}
`;

class ReolinkManagerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._data = null;
    this._err = null;
    this._unsub = null;
    this._last = "";
    this._popLast = "";
    this._toast = null;
    this._toastTimer = null;
    this._live = null;
    this._deepDone = null;
    this._ui = { tab: null, filter: "all", sort: null, search: "", popup: null, acc: {}, confirm: null, details: {}, detailsAt: 0, detailsErr: null, gal: {}, player: null };
    const root = this.shadowRoot;
    root.innerHTML = `<style>${CSS}</style><style id="colors"></style><div id="main"></div><div id="pop"></div><div id="ov"></div>`;
    this._elMain = root.getElementById("main");
    this._elColors = root.getElementById("colors");
    this._elPop = root.getElementById("pop");
    this._elOv = root.getElementById("ov");
    root.addEventListener("click", (e) => this._onClick(e));
    root.addEventListener("input", (e) => this._onInput(e));
    root.addEventListener("change", (e) => this._onChange(e));
    root.addEventListener("toggle", (e) => this._onToggle(e), true);
    this._keyHandler = (e) => {
      if (e.key !== "Escape") return;
      if (this._ui.player) this._closePlayer();
      else if (this._ui.popup) this._closePopup();
    };
    this._locHandler = () => this._checkDeepLink();
    this._ptzHeld = null;
    root.addEventListener("pointerdown", (e) => {
      const el = e.target.closest && e.target.closest("[data-ptz]");
      if (!el || (e.button !== undefined && e.button > 0)) return;
      e.preventDefault();
      this._ptzDown(el.dataset.ptz);
    });
    root.addEventListener("keydown", (e) => {
      const el = e.target.closest && e.target.closest("[data-ptz]");
      if (el && (e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); this._ptzDown(el.dataset.ptz); }
    });
    root.addEventListener("keyup", (e) => { if (this._ptzHeld && (e.key === " " || e.key === "Enter")) this._ptzUp(); });
    root.addEventListener("contextmenu", (e) => { if (e.target.closest && e.target.closest("[data-ptz]")) e.preventDefault(); });
    this._ptzRelease = () => this._ptzUp();
    this._ptzVis = () => { if (document.hidden) this._ptzUp(); };
  }

  static getConfigElement() { return document.createElement("reolink-manager-card-editor"); }
  static getStubConfig() { return { type: `custom:${TAG}` }; }
  getCardSize() { return 6; }

  setConfig(config) {
    this._config = Object.assign({}, DEFAULTS, config || {});
    if (!this._ui.sort) this._ui.sort = this._config.default_sort;
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    const langChanged = this._hass && this._hass.language !== hass.language;
    this._hass = hass;
    if (this._live && this._live.card) this._live.card.hass = hass;
    if (first) this._subscribe();
    else if (langChanged) this._render();
  }

  connectedCallback() {
    document.addEventListener("keydown", this._keyHandler);
    window.addEventListener("location-changed", this._locHandler);
    window.addEventListener("popstate", this._locHandler);
    window.addEventListener("pointerup", this._ptzRelease);
    window.addEventListener("pointercancel", this._ptzRelease);
    window.addEventListener("blur", this._ptzRelease);
    document.addEventListener("visibilitychange", this._ptzVis);
    this._timer = setInterval(() => this._tick(), 30000);
    if (this._hass) this._subscribe();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._keyHandler);
    window.removeEventListener("location-changed", this._locHandler);
    window.removeEventListener("popstate", this._locHandler);
    window.removeEventListener("pointerup", this._ptzRelease);
    window.removeEventListener("pointercancel", this._ptzRelease);
    window.removeEventListener("blur", this._ptzRelease);
    document.removeEventListener("visibilitychange", this._ptzVis);
    this._ptzUp();
    clearInterval(this._timer);
    this._closePopup();
    this._closePlayer();
    if (this._unsub) { try { this._unsub(); } catch (_) { /* ignorieren */ } this._unsub = null; }
  }

  async _subscribe() {
    if (this._unsub || this._subscribing || !this._hass || !this._config) return;
    this._subscribing = true;
    try {
      const msg = { type: `${WS}/subscribe` };
      if (this._config.entry_id) msg.entry_id = this._config.entry_id;
      this._unsub = await this._hass.connection.subscribeMessage((ev) => this._onEvent(ev), msg);
      this._err = null;
    } catch (e) {
      this._err = String((e && (e.message || e.code)) || e);
      this._render();
    } finally {
      this._subscribing = false;
    }
  }

  _onEvent(ev) {
    if (!ev) return;
    if (ev.kind === "snapshot") {
      this._data = ev.data;
      if (this._ui.popup) this._loadDetails(this._ui.popup, false);
      this._render();
      this._checkDeepLink();
    } else if (ev.kind === "response") {
      const p = ev.data || {};
      if (p.status === "ok") this._showToast(this._t("resp_ok"), false);
      else this._showToast(this._t("resp_error", { e: this._errText(p.error) }), true);
    }
  }

  get _lang() { return pickLang(this._hass && this._hass.language); }
  _t(key, vars) { return tr(this._lang, key, vars); }
  _errText(code) {
    const k = `err_${code}`;
    return I18N.en[k] ? this._t(k) : esc(code || "?");
  }

  _showToast(text, isErr) {
    this._toast = { text, isErr };
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toast = null; this._render(); }, 5000);
    this._render();
  }

  /* ---------- Hilfen ---------- */
  _exp(feature) {
    const d = this._data;
    if (!d || !d.experimental) return false;
    if ((d.experimental.checked || []).includes(feature)) return true;
    return !!(this._config.show_experimental && d.experimental.features.includes(feature));
  }
  _tabAvailable(tab) {
    const m = TAB_META[tab];
    if (this._config[`show_${tab}`] === false) return false;
    return m.exp ? this._exp(m.exp) : true;
  }
  _visibleTabs() {
    const v = TAB_ORDER.filter((t) => this._tabAvailable(t));
    return v.length ? v : ["bridge"];
  }
  _currentTab() {
    const v = this._visibleTabs();
    if (this._ui.tab && v.includes(this._ui.tab)) return this._ui.tab;
    if (v.includes(this._config.default_tab)) return this._config.default_tab;
    return v[0];
  }
  _canWrite() { return !this._config.read_only; }
  _color(kind) {
    return { online: "var(--rm-success)", offline: "var(--rm-error)", privacy: "var(--rm-warning)", unknown: "var(--rm-rowicon)" }[kind] || "var(--rm-rowicon)";
  }
  _levelColor(level) {
    return { ok: "var(--rm-success)", low: "var(--rm-warning)", critical: "var(--rm-error)" }[level] || "var(--rm-rowicon)";
  }
  _rel(iso) {
    if (!iso) return "–";
    const sec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (sec < 10) return this._t("ago_now");
    if (sec < 60) return this._t("ago_s", { n: sec });
    if (sec < 3600) return this._t("ago_m", { n: Math.floor(sec / 60) });
    if (sec < 86400) return this._t("ago_h", { n: Math.floor(sec / 3600) });
    return this._t("ago_d", { n: Math.floor(sec / 86400) });
  }
  _ts(iso) { return iso ? `<span data-ts="${esc(iso)}">${esc(this._rel(iso))}</span>` : "–"; }
  _tick() {
    this.shadowRoot.querySelectorAll("[data-ts]").forEach((el) => { el.textContent = this._rel(el.dataset.ts); });
  }
  _ico(name) { return `<ha-icon icon="${esc(name)}"></ha-icon>`; }

  /* ---------- Rendern ---------- */
  _render() {
    if (!this._config) return;
    const root = this.shadowRoot;
    const vars = this._colorVars();
    if (vars !== this._elColors.textContent) this._elColors.textContent = vars;
    const html = this._html();
    if (html !== this._last) {
      const ae = root.activeElement;
      const fk = ae && ae.dataset ? ae.dataset.fk : null;
      const ss = ae && typeof ae.selectionStart === "number" ? [ae.selectionStart, ae.selectionEnd] : null;
      const scrolls = [...this._elMain.querySelectorAll("[data-scroll]")].map((e) => [e.dataset.scroll, e.scrollTop]);
      this._elMain.innerHTML = html;
      this._last = html;
      scrolls.forEach(([k, top]) => { const el = this._elMain.querySelector(`[data-scroll="${k}"]`); if (el) el.scrollTop = top; });
      if (fk) {
        const el = this._elMain.querySelector(`[data-fk="${fk}"]`);
        if (el) { el.focus(); if (ss && el.setSelectionRange) { try { el.setSelectionRange(ss[0], ss[1]); } catch (_) { /* ignorieren */ } } }
      }
    }
    this._syncPopup();
  }

  _colorVars() {
    const c = this._config;
    const get = (k) => sanitizeColor(c[`color_${k}`]) || COLOR_CONFIG_KEYS[k].fallback;
    const vars = {
      "--rm-tab": get("tab_active"), "--rm-success": get("success"), "--rm-warning": get("warning"),
      "--rm-error": get("error"), "--rm-info": get("info"), "--rm-rowicon": sanitizeColor(c.color_row_icon) || COLOR_CONFIG_KEYS.row_icon.fallback,
      "--rm-live": get("live_banner"),
    };
    return `:host{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";")}}`;
  }
  _catIconColor(tab) {
    return sanitizeColor(this._config.color_row_icon) || sanitizeColor(this._config[CATEGORY_ICON_COLOR_KEYS[tab]]) || "";
  }

  _html() {
    const c = this._config;
    const zoom = Math.min(200, Math.max(50, Number(c.zoom) || 100)) / 100;
    let body = "";
    if (!this._data) {
      body = this._err
        ? `<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div>${esc(this._t("err_connection", { e: this._err }))}</div></div>`
        : `<div class="empty">${esc(this._t("connecting"))}</div>`;
    } else {
      body = this._banners() + this._tabsHtml() + this._contentHtml();
    }
    const icon = this._headerIcon();
    const showTitle = c.show_title !== false && c.title;
    const head = icon || showTitle ? `<div class="header">${icon}${showTitle ? `<span>${esc(c.title)}</span>` : ""}</div>` : "";
    return `<ha-card style="zoom:${zoom}">${head}${body}</ha-card>${this._toast ? `<div class="toast${this._toast.isErr ? " err" : ""}">${esc(this._toast.text)}</div>` : ""}`;
  }

  _headerIcon() {
    const c = this._config;
    if (c.show_icon === false) return "";
    const name = String(c.icon || "").trim();
    if (/^[a-z0-9_-]+:[a-z0-9_-]+$/i.test(name)) return `<ha-icon class="hicon" icon="${esc(name)}"></ha-icon>`;
    return `<img class="hicon" alt="" src="${esc(LOGO_URI)}">`;
  }

  _banners() {
    const d = this._data;
    let h = "";
    if (this._err) h += `<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div>${esc(this._t("err_connection", { e: this._err }))}</div></div>`;
    for (const r of d.reolink || []) {
      if (r.state !== "loaded") {
        h += `<div class="banner warning"><ha-icon icon="mdi:alert-outline"></ha-icon><div>${esc(this._t("warn_reolink", { t: r.title, s: this._t(`rl_state_${r.state}`) }))}</div></div>`;
      }
    }
    return h;
  }

  _tabsHtml() {
    const tabs = this._visibleTabs();
    if (tabs.length <= 1) return "";
    const cur = this._currentTab();
    const s = this._data.stats;
    const badge = (tab) => {
      if (tab === "cameras" && s.offline) return [s.offline, "var(--rm-error)"];
      if (tab === "battery" && s.battery_low) return [s.battery_low, "var(--rm-warning)"];
      if (tab === "updates" && s.updates) return [s.updates, "var(--rm-info)"];
      if (tab === "bridge" && this._data.app.update_available) return ["↑", "var(--rm-warning)"];
      return null;
    };
    return `<div class="tabs">${tabs.map((t) => {
      const b = badge(t);
      const ic = this._catIconColor(t);
      return `<button class="tab${t === cur ? " active" : ""}" data-act="tab" data-tab="${t}" title="${esc(this._t(TAB_META[t].label))}"${ic ? ` style="--ic:${esc(ic)}"` : ""}>${this._ico(TAB_META[t].icon)}<span class="lbl">${esc(this._t(TAB_META[t].label))}</span>${b ? `<span class="badge" style="--c:${b[1]}">${esc(b[0])}</span>` : ""}</button>`;
    }).join("")}</div>`;
  }

  _contentHtml() {
    const tab = this._currentTab();
    if (tab === "bridge") return this._settingsHtml();
    if (tab === "gallery") return this._barHtml() + this._galleryHtml();
    if (tab === "controls") return this._barHtml() + this._controlsTabHtml();
    if (tab === "storage") return this._statsHtml() + this._barHtml() + this._storageNoteHtml() + this._listHtml(tab);
    return this._statsHtml() + this._barHtml() + this._listHtml(tab);
  }

  _statsHtml() {
    if (!this._config.show_stats) return "";
    const s = this._data.stats;
    const f = this._ui.filter;
    const chip = (key, label, val, color) => `<button class="chip${f === key ? " on" : ""}" data-act="filter" data-filter="${key}"${color ? ` style="--c:${color}"` : ""}>${esc(label)} <b>${val}</b></button>`;
    return `<div class="stats">${chip("all", this._t("stat_total"), s.total)}${chip("offline", this._t("stat_offline"), s.offline, "var(--rm-error)")}${chip("battery", this._t("stat_battery"), s.battery_low, "var(--rm-warning)")}${chip("updates", this._t("stat_updates"), s.updates, "var(--rm-info)")}</div>`;
  }

  _barHtml() {
    const c = this._config;
    if (!c.show_search && !c.show_filter_bar) return "";
    const sort = this._ui.sort;
    const search = c.show_search ? `<input type="search" data-fk="search" data-role="search" placeholder="${esc(this._t("search"))}" value="${esc(this._ui.search)}">` : "";
    const sel = c.show_filter_bar ? `<select data-role="sort" data-fk="sort">${["name", "status", "battery"].map((k) => `<option value="${k}"${sort === k ? " selected" : ""}>${esc(this._t(`sort_${k}`))}</option>`).join("")}</select>` : "";
    return `<div class="bar">${search}${sel}</div>`;
  }

  _devicesFor(tab) {
    const f = this._ui.filter;
    const q = this._ui.search.trim().toLowerCase();
    let list = (this._data.devices || []).filter((d) => {
      if (tab === "cameras") return d.kind !== "hub";
      if (tab === "hub") return d.kind === "hub";
      if (tab === "battery") return !!d.battery;
      if (tab === "detections") return d.detections.length > 0;
      if (tab === "updates") return !!d.update;
      if (tab === "storage") return !!d.storage;
      if (tab === "gallery") return !!d.gallery;
      if (tab === "controls") return (!!d.controls && Object.keys(d.controls).length > 0) || !!d.scene;
      return true;
    });
    if (f === "offline") list = list.filter((d) => d.status === "offline");
    else if (f === "battery") list = list.filter((d) => d.battery && ["low", "critical"].includes(d.battery.level));
    else if (f === "updates") list = list.filter((d) => d.update && d.update.available);
    if (q) list = list.filter((d) => `${d.name} ${d.model} ${d.hub || ""}`.toLowerCase().includes(q));
    const order = { offline: 0, privacy: 1, unknown: 2, online: 3 };
    const sort = this._ui.sort;
    list = [...list].sort((a, b) => {
      if (sort === "status") return (order[a.status] - order[b.status]) || a.name.localeCompare(b.name);
      if (sort === "battery" || tab === "battery") {
        const pa = a.battery && a.battery.percent != null ? a.battery.percent : 999;
        const pb = b.battery && b.battery.percent != null ? b.battery.percent : 999;
        return (pa - pb) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
    return list;
  }

  _listHtml(tab) {
    const all = this._devicesFor(tab);
    const max = Math.max(1, Number(this._config.max_rows) || 50);
    if (!all.length) {
      const anyFilter = this._ui.filter !== "all" || this._ui.search.trim();
      return `<div class="list"><div class="empty">${esc(this._t(anyFilter ? "empty_filter" : "empty_list"))}</div></div>`;
    }
    const rows = all.slice(0, max).map((d) => this._rowHtml(d, tab)).join("");
    const more = all.length > max ? `<div class="more">${esc(this._t("more_rows", { n: all.length - max }))}</div>` : "";
    return `<div class="list" data-scroll="list">${rows}${more}</div>`;
  }

  _storageNoteHtml() {
    const list = (this._data.devices || []).filter((d) => d.storage && d.storage.value == null);
    return list.length ? `<div class="note" style="margin:8px 14px 0">${esc(this._t("storage_hint"))}</div>` : "";
  }

  /* Steuerung: Schnellschalter je Gerät als Akkordeon (nicht mehr dieselbe Liste wie „Kameras“) */
  _controlsTabHtml() {
    const t = (k, v) => this._t(k, v);
    const list = this._devicesFor("controls");
    if (!list.length) {
      const anyFilter = this._ui.filter !== "all" || this._ui.search.trim();
      return `<div class="list"><div class="empty">${esc(t(anyFilter ? "empty_filter" : "empty_list"))}</div></div>`;
    }
    const labels = { privacy: "ctl_privacy", record: "ctl_record", push: "ctl_push" };
    const canW = this._canWrite();
    let h = `<div class="settings" data-scroll="list"><div class="note">${esc(t("ctl_tab_hint"))}</div>`;
    for (const d of list) {
      let body = "";
      for (const [role, x] of Object.entries(d.controls || {})) {
        const col = x.on ? (role === "privacy" ? "var(--rm-warning)" : "var(--rm-success)") : "var(--rm-rowicon)";
        const label = esc(t(x.on ? "on" : "off"));
        const val = canW && x.available
          ? `<button class="pill btnp" style="--c:${col}" data-act="toggle" data-ent="${esc(x.entity)}" data-on="${x.on ? 0 : 1}">${label}</button>`
          : `<span class="pill" style="--c:${col}">${label}</span>`;
        body += `<div class="settings-line"><span class="lbl">${esc(t(labels[role] || role))}</span><span class="val">${val}</span></div>`;
      }
      if (d.scene) {
        body += canW
          ? `<div class="settings-line"><span class="lbl">${esc(t("hub_scene"))}</span><select class="sel" style="max-width:55%" data-role="select" data-ent="${esc(d.scene.entity)}">${d.scene.options.map((o) => `<option${o === d.scene.current ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`
          : this._line(t("hub_scene"), esc(d.scene.current));
      }
      body += `<div class="btns"><button class="btn small" data-act="open" data-dev="${esc(d.device)}">${this._ico("mdi:open-in-new")}${esc(t("ctl_open_full"))}</button></div>`;
      const n = Object.keys(d.controls || {}).length + (d.scene ? 1 : 0);
      h += this._acc(`c:${d.device}`, KIND_ICON[d.kind] || "mdi:cctv", d.name, body, { open: list.length === 1, meta: esc(String(n)) });
    }
    return `${h}</div>`;
  }

  _statusPill(d) {
    return `<span class="pill" style="--c:${this._color(d.status)}">${esc(this._t(`status_${d.status}`))}</span>`;
  }

  _batteryPill(b) {
    if (!b || b.percent == null) return "";
    const col = this._levelColor(b.level);
    return `<span class="pill" style="--c:${col}"><span class="batbar" style="--c:${col}"><i style="width:${Math.max(0, Math.min(100, b.percent))}%"></i></span>${Math.round(b.percent)} %</span>`;
  }

  _rowHtml(d, tab) {
    const c = this._config;
    const ic = this._catIconColor(tab);
    const flags = [];
    if (d.sleeping) flags.push(`<span class="pill" style="--c:var(--rm-info)">${esc(this._t("badge_sleeping"))}</span>`);
    if (d.update && d.update.available) flags.push(`<span class="pill" style="--c:var(--rm-info)">${esc(this._t("badge_update"))}</span>`);
    if (d.detecting.length) flags.push(`<span class="pill" style="--c:var(--rm-warning)">${esc(this._t("badge_detecting"))}</span>`);
    if (d.battery && d.battery.level === "critical") flags.push(`<span class="pill" style="--c:var(--rm-error)">${esc(this._t("badge_critical"))}</span>`);
    else if (d.battery && d.battery.level === "low") flags.push(`<span class="pill" style="--c:var(--rm-warning)">${esc(this._t("badge_low"))}</span>`);

    const sub = [];
    if (tab === "updates" && d.update) sub.push(d.update.available ? this._t("update_versions", { a: d.update.installed ?? "?", b: d.update.latest ?? "?" }) : `${this._t("update_current")}${d.update.installed ? ` · ${d.update.installed}` : ""}`);
    else if (tab === "hub") sub.push(this._t("hub_cameras", { n: d.children }), d.scene ? `${this._t("hub_scene")}: ${d.scene.current}` : "");
    else {
      if (c.show_col_model && d.model) sub.push(d.model);
      if (c.show_col_hub && d.hub) sub.push(d.hub);
    }
    let pills = "";
    if (tab === "battery") {
      pills = this._batteryPill(d.battery) + (d.battery.state ? `<span class="pill">${esc(I18N.en[`battery_state_${d.battery.state}`] ? this._t(`battery_state_${d.battery.state}`) : d.battery.state)}</span>` : "")
        + (d.battery.temperature != null ? `<span class="pill">${esc(d.battery.temperature)} °</span>` : "");
    } else if (tab === "detections") {
      pills = d.detections.map((x) => `<span class="pill" title="${esc(this._t(`det_${x.kind}`))}" style="--c:${x.on ? "var(--rm-warning)" : "var(--rm-rowicon)"}">${this._ico(DET_ICON[x.kind] || "mdi:eye")}${esc(this._t(`det_${x.kind}`))}</span>`).join("");
      if (c.show_col_last) {
        const newest = d.detections.map((x) => x.changed).sort().pop();
        sub.push(`${this._t("last_change")}: ${this._ts(newest)}`);
      }
    } else if (tab === "updates") {
      pills = `<span class="pill" style="--c:${d.update.available ? "var(--rm-info)" : "var(--rm-success)"}">${esc(this._t(d.update.available ? "update_available" : "update_current"))}</span>`;
    } else if (tab === "storage") {
      const st = d.storage;
      if (st.value != null) pills = `<span class="pill">${esc(st.value)}${st.unit ? ` ${esc(st.unit)}` : ""}</span>`;
      else if (st.disabled) {
        pills = this._canWrite() && this._exp("controls")
          ? `<button class="pill btnp" style="--c:var(--rm-warning)" data-act="enablestorage" data-dev="${esc(d.device)}">${esc(this._t("storage_enable"))}</button>`
          : `<span class="pill" style="--c:var(--rm-warning)">${esc(this._t("storage_disabled"))}</span>`;
      } else if (!st.entity) pills = `<span class="pill">${esc(this._t("storage_none"))}</span>`;
      else pills = `<span class="pill">${esc(this._t("unknown"))}</span>`;
    } else if (tab === "controls") {
      const labels = { privacy: "ctl_privacy", record: "ctl_record", push: "ctl_push" };
      pills = Object.entries(d.controls).map(([role, x]) => {
        const col = x.on ? (role === "privacy" ? "var(--rm-warning)" : "var(--rm-success)") : "var(--rm-rowicon)";
        const label = `${esc(this._t(labels[role]))}: ${esc(this._t(x.on ? "on" : "off"))}`;
        return this._canWrite() && x.available
          ? `<button class="pill btnp" style="--c:${col}" data-act="toggle" data-ent="${esc(x.entity)}" data-on="${x.on ? 0 : 1}">${label}</button>`
          : `<span class="pill" style="--c:${col}">${label}</span>`;
      }).join("");
    } else if (tab === "hub") {
      pills = this._statusPill(d);
    } else {
      pills = this._statusPill(d);
      if (c.show_col_battery) pills += this._batteryPill(d.battery);
      if (c.show_col_wifi && d.wifi && d.wifi.value != null) pills += `<span class="pill">${this._ico("mdi:wifi")}${esc(d.wifi.value)}${d.wifi.unit ? ` ${esc(d.wifi.unit)}` : ""}</span>`;
    }
    const subHtml = sub.filter(Boolean).map((x, i) => (i === 0 ? x : ` · ${x}`)).join("");
    const iconName = KIND_ICON[d.kind] || "mdi:cctv";
    return `<div class="row" data-act="open" data-dev="${esc(d.device)}">
<div class="ico"${ic ? ` style="--ic:${esc(ic)}"` : ""}>${this._ico(iconName)}<span class="dot" style="--c:${this._color(d.status)}"></span></div>
<div class="main"><div class="name">${esc(d.name)}${tab === "cameras" ? flags.join("") : ""}</div><div class="sub">${tab === "detections" || tab === "updates" || tab === "hub" || subHtml ? subHtml : esc(this._t(`kind_${d.kind}`))}</div></div>
<div class="pills">${pills}</div></div>`;
  }

  /* ---------- Akkordeon ---------- */
  _acc(key, icon, title, body, opts = {}) {
    const open = key in this._ui.acc ? this._ui.acc[key] : !!opts.open;
    return `<details class="settings-accordion${opts.variant ? ` ${opts.variant}` : ""}" data-k="${esc(key)}"${open ? " open" : ""}><summary class="settings-accordion-summary">${this._ico(icon)}<span class="grow">${esc(title)}</span>${opts.meta ? `<span class="meta">${opts.meta}</span>` : ""}</summary><div class="settings-accordion-body">${body}</div></details>`;
  }
  _line(label, valueHtml) { return `<div class="settings-line"><span class="lbl">${esc(label)}</span><span class="val">${valueHtml}</span></div>`; }

  /* ---------- Einstellungen (Zahnrad) ---------- */
  _settingsHtml() {
    const d = this._data;
    const a = d.app;
    const t = (k, v) => this._t(k, v);
    const upd = !!a.update_available;
    const mism = a.version !== CARD_VERSION;
    let status;
    if (upd) status = `<div class="note warn">${esc(t("ver_update_avail"))}</div>`;
    else if (mism) status = `<div class="note warn">${esc(t("ver_mismatch"))}</div>`;
    else if (a.check_failed) status = `<div class="note err">${esc(t("ver_check_failed"))}</div>`;
    else if (!a.latest_version) status = `<div class="note">${esc(t("ver_no_release"))}</div>`;
    else status = `<div class="note ok">${esc(t("ver_ok"))}</div>`;
    const relUrl = a.release_url && String(a.release_url).startsWith("https://github.com/") ? a.release_url : "https://github.com/meine-smarte-welt/reolink_manager/releases";
    const canAct = this._canWrite();
    let h = "";
    h += this._acc("app", "mdi:tag-outline", t("acc_version"),
      this._line(t("ver_integration"), esc(a.version)) + this._line(t("ver_card"), esc(CARD_VERSION)) +
      this._line(t("ver_latest"), esc(a.latest_version || t("ver_none"))) + this._line(t("ver_checked"), this._ts(a.checked_at)) + status +
      `<div class="btns">${canAct ? `<button class="btn" data-act="checkupd">${this._ico("mdi:refresh")}${esc(t("ver_check_now"))}</button>` : ""}<a class="btn" href="${esc(relUrl)}" target="_blank" rel="noopener noreferrer">${this._ico("mdi:github")}${esc(t("ver_release"))}</a></div>`,
      { open: true, variant: upd || mism ? "update" : "", meta: esc(a.version) });

    const rl = d.reolink || [];
    h += this._acc("reolink", "mdi:cctv", t("acc_reolink"),
      rl.length ? rl.map((r) => this._line(r.title, `<span class="pill" style="--c:${r.state === "loaded" ? "var(--rm-success)" : "var(--rm-warning)"}">${esc(t(`rl_state_${r.state}`))}</span>`)).join("") : `<div class="note">${esc(t("rl_none"))}</div>`,
      { open: true });

    const s = d.stats;
    h += this._acc("selection", "mdi:format-list-checks", t("acc_selection"),
      this._line(t("sel_cameras"), s.cameras) + this._line(t("sel_hubs"), s.hubs) + this._line(t("sel_chimes"), s.chimes) +
      `<div class="note">${esc(d.options.devices_selected ? t("sel_filtered", { n: d.options.devices_selected }) : t("sel_all"))}</div><div class="note">${esc(t("sel_hint"))}</div>`);

    const o = d.options;
    h += this._acc("options", "mdi:tune", t("acc_options"),
      this._line(t("opt_battery_low"), `${o.battery_low} %`) + this._line(t("opt_battery_critical"), `${o.battery_critical} %`) +
      this._line(t("opt_offline_delay"), `${o.offline_delay} s`) + this._line(t("opt_events"), esc(t(o.events_enabled ? "on" : "off"))) +
      this._line(t("opt_detections"), o.detection_types.map((k) => esc(t(`det_${k}`))).join(", ") || "–") +
      this._line(t("opt_read_only"), esc(t(this._config.read_only ? "on" : "off"))) +
      (o.gallery_count != null ? this._line(t("opt_gallery_count"), String(o.gallery_count)) : ""));

    if (canAct) {
      h += this._acc("maintenance", "mdi:wrench", t("acc_maintenance"),
        `<div class="note">${esc(t("maint_rescan_hint"))}</div><div class="btns"><button class="btn" data-act="rescan">${this._ico("mdi:magnify-scan")}${esc(t("maint_rescan"))}</button></div>`);
    }

    {
      const ev = d.events || [];
      h += this._acc("events", "mdi:history", t("acc_events"),
        ev.length ? ev.slice(0, 50).map((x) => this._line(`${x.name} · ${t(`ev_${x.type}`)}`, this._ts(x.t))).join("") : `<div class="note">${esc(t("events_empty"))}</div>`,
        { meta: String(ev.length) });
    }

    if (this._exp("push")) {
      const targets = o.push_targets || [];
      const sel = new Set(targets);
      const notify = (this._hass && this._hass.services && this._hass.services.notify) || {};
      const live = Object.keys(notify).filter((n) => n.startsWith("mobile_app_"));
      const avail = [...new Set([...(o.push_available || []), ...live, ...targets])].sort();
      const dis = canAct ? "" : " disabled";
      const nice = (n) => String(n).replace(/^mobile_app_/, "").replace(/_/g, " ");
      let pb = `<div class="note">${esc(t("push_select_hint"))}</div>`;
      if (!avail.length) pb += `<div class="note warn">${esc(t("push_no_app"))}</div>`;
      pb += avail.map((n) => `<label class="chk"><input type="checkbox" data-role="pushtarget" data-val="${esc(n)}"${sel.has(n) ? " checked" : ""}${dis}><span>${esc(nice(n))}${live.includes(n) || (o.push_available || []).includes(n) ? "" : ` (${esc(t("push_gone"))})`}</span></label>`).join("");
      if (avail.length && !targets.length) pb += `<div class="note warn">${esc(t("push_none"))}</div>`;
      const pdet = new Set(o.push_detections || []);
      pb += `<div class="note">${esc(t("push_det_hint"))}</div><div class="chips">${(o.detection_kinds || Object.keys(DET_ICON)).map((k) => `<label class="chk"><input type="checkbox" data-role="pushdet" data-val="${esc(k)}"${pdet.has(k) ? " checked" : ""}${dis}><span>${esc(t(`det_${k}`))}</span></label>`).join("")}</div>`;
      pb += `<div class="settings-line"><span class="lbl">${esc(t("push_cooldown"))}</span><input class="sel" style="max-width:35%" type="number" min="0" max="3600" step="5" data-role="pushcd" data-fk="pushcd" value="${esc(o.push_cooldown)}"${dis}></div><div class="note">${esc(t("push_cooldown_hint"))}</div>`;
      pb += this._line(t("push_path"), esc(t("push_path_auto")));
      if (canAct && targets.length) pb += `<div class="note">${esc(t("push_test_hint"))}</div><div class="btns"><button class="btn" data-act="testpush">${this._ico("mdi:bell-ring-outline")}${esc(t("push_test"))}</button></div>`;
      h += this._acc("push", "mdi:bell-badge-outline", t("acc_push"), pb, { open: !targets.length, meta: `<span class="expbadge">${esc(t("badge_experimental"))}</span>` });
    }

    const ex = d.experimental;
    const onSet = new Set(ex.features);
    let expBody = `<div class="note">${esc(t("exp_intro"))}</div>`;
    expBody += ex.available.map((f) => this._line(t(`exp_${f.key}`), `<span class="pill" style="--c:${onSet.has(f.key) ? "var(--rm-success)" : "var(--rm-rowicon)"}">${this._ico(EXP_ICON[f.key] || "mdi:flask")}${esc(t(onSet.has(f.key) ? "exp_state_on" : "exp_state_off"))}</span>`)).join("");
    let hint = "";
    if (!ex.enabled || !ex.features.length) hint = `<div class="note warn">${esc(t("hint_experimental_off"))}</div>`;
    else if (!this._config.show_experimental) hint = `<div class="note warn">${esc(t("hint_card_exp_off"))}</div>`;
    h += this._acc("experimental", "mdi:flask-outline", t("acc_experimental"), hint + expBody,
      { open: !!hint, variant: hint ? "update" : "", meta: `<span class="expbadge">${esc(t("badge_experimental"))}</span>` });
    return `<div class="settings" data-scroll="settings">${h}</div>`;
  }

  /* ---------- Popup (bleibt beim Neuzeichnen bestehen: Live-Bild und Scrollposition) ---------- */
  _device(id) { return this._data && (this._data.devices || []).find((x) => x.device === id); }

  _syncPopup() {
    const id = this._ui.popup;
    const d = id && this._device(id);
    if (!d) {
      if (this._elPop.firstChild) { this._elPop.textContent = ""; this._popLast = ""; this._ptzLast = ""; this._destroyLive(); }
      return;
    }
    if (this._elPop.dataset.dev !== id || !this._elPop.firstChild) {
      this._elPop.dataset.dev = id;
      this._popLast = "";
      this._ptzLast = "";
      this._elPop.innerHTML = `<div class="backdrop" data-act="backdrop"><div class="popup" role="dialog"><div class="phead"><span class="ptitle"></span><span class="t"></span><button class="btn icon" data-act="close" title="×">${this._ico("mdi:close")}</button></div><div class="pbody" id="pbody"><div id="livewrap"></div><div id="ptzwrap"></div><div id="pdyn"></div></div></div></div>`;
      this._buildLive(d);
    }
    const head = `${this._ico(KIND_ICON[d.kind] || "mdi:cctv")}`;
    const ptitle = this._elPop.querySelector(".ptitle");
    if (ptitle.innerHTML !== head) ptitle.innerHTML = head;
    const t = this._elPop.querySelector(".phead .t");
    if (t.textContent !== d.name) t.textContent = d.name;
    const ptz = this._canWrite() && this._exp("ptz") && d.ptz ? `<div class="ptzpanel">${this._ptzHtml(d)}</div>` : "";
    if (ptz !== this._ptzLast) {
      this._ptzLast = ptz;
      this._elPop.querySelector("#ptzwrap").innerHTML = ptz;
    }
    const html = this._popupBodyHtml(d);
    if (html !== this._popLast) {
      this._popLast = html;
      this._elPop.querySelector("#pdyn").innerHTML = html;
    }
  }

  _closePopup() {
    this._ptzUp();
    this._ui.popup = null;
    this._ui.confirm = null;
    this._syncPopup();
  }

  _popupBodyHtml(d) {
    const t = (k, v) => this._t(k, v);
    const det = this._ui.details[d.device];
    let h = "";
    if (this._exp("gallery") && d.gallery) {
      const g = this._ui.gal[d.device];
      h += this._acc("p:gal", "mdi:filmstrip", t("tab_gallery"), this._galBodyHtml(d), { meta: g && g.items ? esc(t("gal_count", { n: g.items.length })) : "" });
    }
    const sleepTxt = d.sleeping == null ? t("unknown") : t(d.sleeping ? "sleeping" : "awake");
    let info = this._line(t("info_model"), esc(d.model || "–")) + this._line(t("info_kind"), esc(t(`kind_${d.kind}`)));
    if (d.hub) info += this._line(t("info_hub"), esc(d.hub));
    info += this._line(t("info_status"), `<span class="pill" style="--c:${this._color(d.status)}">${esc(t(`status_${d.status}`))}</span>`);
    if (d.sleeping != null) info += this._line(t("info_sleep"), esc(sleepTxt));
    if (d.battery) info += this._line(t("info_battery"), `${this._batteryPill(d.battery)}${d.battery.temperature != null ? ` ${esc(d.battery.temperature)} °` : ""}`);
    if (d.wifi && d.wifi.value != null) info += this._line(t("wifi"), `${esc(d.wifi.value)}${d.wifi.unit ? ` ${esc(d.wifi.unit)}` : ""}`);
    if (d.storage && d.storage.value != null) info += this._line(t("storage"), `${esc(d.storage.value)}${d.storage.unit ? ` ${esc(d.storage.unit)}` : ""}`);
    info += this._line(t("info_entities"), String(d.entity_count)) + (d.unclassified ? this._line(t("info_unclassified"), String(d.unclassified)) : "");
    info += `<div class="btns"><button class="btn small" data-act="opendevice" data-dev="${esc(d.device)}">${this._ico("mdi:open-in-new")}${esc(t("open_device"))}</button></div>`;
    h += this._acc(`p:info`, "mdi:information-outline", t("acc_info"), info, { open: true });

    if (d.detections.length) {
      h += this._acc("p:det", "mdi:motion-sensor", t("acc_detections"),
        d.detections.map((x) => this._line(t(`det_${x.kind}`), `<span class="pill" style="--c:${x.on ? "var(--rm-warning)" : "var(--rm-rowicon)"}">${esc(t(x.on ? "det_active" : "det_idle"))}</span> ${this._ts(x.changed)}`)).join(""),
        { meta: d.detecting.length ? esc(String(d.detecting.length)) : "" });
    }

    const writable = this._canWrite();
    if (writable && this._exp("controls")) h += this._controlsHtml(d, det);
    if (writable && this._exp("refresh") && d.refreshable) {
      const confirm = this._ui.confirm === `refresh:${d.device}`;
      h += this._acc("p:refresh", "mdi:sync", t("acc_refresh"),
        `<div class="note">${esc(t("refresh_hint"))}</div><div class="btns"><button class="btn${confirm ? " confirm" : ""}" data-act="refresh" data-dev="${esc(d.device)}">${this._ico("mdi:sync")}${esc(t(confirm ? "refresh_confirm" : "refresh_btn"))}</button></div>`);
    }

    let ents;
    if (this._ui.detailsErr) ents = `<div class="note">${esc(t("no_details"))}</div>`;
    else if (!det) ents = `<div class="note">${esc(t("loading"))}</div>`;
    else ents = det.entities.map((e) => `<div class="ent"><span class="n" data-act="more" data-ent="${esc(e.entity)}" title="${esc(e.entity)}">${esc(e.name)}</span><span class="r">${esc(e.role === "other" || e.role.endsWith("_other") ? t("role_unclassified") : e.role)}</span><span>${esc(e.state ?? "–")}${e.unit ? ` ${esc(e.unit)}` : ""}</span><button class="btn small icon" data-act="copy" data-copy="${esc(e.entity)}" title="${esc(t("copy"))}">${this._ico("mdi:content-copy")}</button></div>`).join("");
    h += this._acc("p:ents", "mdi:format-list-bulleted", t("acc_entities"), ents, { meta: det ? String(det.entities.length) : "" });

    // Firmware ganz am Ende
    if (d.update) {
      h += this._acc("p:upd", "mdi:update", t("acc_update"),
        this._line(t("update_current"), esc(d.update.installed ?? "?")) + (d.update.available ? this._line(t("update_available"), esc(d.update.latest ?? "?")) : ""),
        { variant: d.update.available ? "update" : "" });
    }
    return h;
  }

  /* ---------- Live-Bild ---------- */
  _buildLive(d) {
    this._destroyLive();
    const wrap = this._elPop.querySelector("#livewrap");
    if (!wrap || !d.live || !this._exp("live")) return;
    const t = (k) => this._t(k);
    const node = document.createElement("div");
    node.className = "live";
    node.innerHTML = `<div class="livebox"><div class="livemsg"></div></div><div class="livebar"><button class="btn small" data-act="livestill">${this._ico("mdi:image-refresh-outline")}<span>${esc(t("live_refresh"))}</span></button><button class="btn small primary" data-act="livestream">${this._ico("mdi:play-circle-outline")}<span>${esc(t("live_start"))}</span></button></div>${d.battery ? `<div class="note warn">${esc(t("live_battery_hint"))}</div>` : ""}`;
    wrap.appendChild(node);
    this._live = { dev: d.device, entity: d.live.entity, mode: "idle", node, box: node.querySelector(".livebox"), card: null, seq: 0 };
    if (this._pendingStream) { this._pendingStream = false; this._liveStream(); }
    else if (this._config.live_auto !== false && !this._skipAutoLive) this._liveStill();
    this._skipAutoLive = false;
  }

  _destroyLive() {
    if (this._live) { this._live.seq += 1; this._live.card = null; }
    this._live = null;
  }

  _liveButtons() {
    const L = this._live;
    if (!L) return;
    const b = L.node.querySelector('[data-act="livestream"]');
    const stream = L.mode === "stream";
    b.innerHTML = `${this._ico(stream ? "mdi:stop-circle-outline" : "mdi:play-circle-outline")}<span>${esc(this._t(stream ? "live_stop" : "live_start"))}</span>`;
    L.node.querySelector('[data-act="livestill"]').disabled = stream;
  }

  _liveMessage(key, isErr) {
    const L = this._live;
    if (!L) return;
    L.box.innerHTML = `<div class="livemsg${isErr ? " err" : ""}">${esc(this._t(key))}</div>`;
  }

  async _stillUrl(entity) {
    const st = this._hass.states[entity];
    if (!st || st.state === "unavailable") throw new Error("unavailable");
    let url = st.attributes && st.attributes.entity_picture;
    if (!url) {
      const r = await this._hass.callWS({ type: "auth/sign_path", path: `/api/camera_proxy/${entity}`, expires: 120 });
      url = r.path;
    }
    url += `${url.includes("?") ? "&" : "?"}_=${Date.now()}`;
    return typeof this._hass.hassUrl === "function" ? this._hass.hassUrl(url) : url;
  }

  async _liveStill() {
    const L = this._live;
    if (!L) return;
    const seq = ++L.seq;
    L.mode = "still";
    L.card = null;
    this._liveButtons();
    this._liveMessage("live_loading", false);
    try {
      const url = await this._stillUrl(L.entity);
      if (!this._live || this._live.seq !== seq) return;
      const img = document.createElement("img");
      img.alt = "";
      img.onload = () => { if (this._live && this._live.seq === seq) L.box.replaceChildren(img); };
      img.onerror = () => { if (this._live && this._live.seq === seq) this._liveMessage("live_error", true); };
      img.src = url;
    } catch (_) {
      if (this._live && this._live.seq === seq) this._liveMessage("live_unavailable", true);
    }
  }

  async _liveStream() {
    const L = this._live;
    if (!L || L.mode === "stream") return;
    const seq = ++L.seq;
    L.mode = "stream";
    this._liveButtons();
    this._liveMessage("live_stream_loading", false);
    try {
      if (typeof window.loadCardHelpers !== "function") throw new Error("no helpers");
      const helpers = await window.loadCardHelpers();
      const card = await helpers.createCardElement({ type: "picture-entity", entity: L.entity, camera_view: "live", show_state: false, show_name: false });
      if (!this._live || this._live.seq !== seq) return;
      card.hass = this._hass;
      card.style.setProperty("--ha-card-box-shadow", "none");
      card.style.setProperty("--ha-card-border-width", "0");
      L.card = card;
      L.box.replaceChildren(card);
    } catch (_) {
      if (!this._live || this._live.seq !== seq) return;
      const st = this._hass.states[L.entity];
      const token = st && st.attributes && st.attributes.access_token;
      if (token) {
        const img = document.createElement("img");
        img.alt = "";
        img.onerror = () => { if (this._live && this._live.seq === seq) this._liveMessage("live_error", true); };
        img.src = `/api/camera_proxy_stream/${L.entity}?token=${encodeURIComponent(token)}`;
        L.box.replaceChildren(img);
        const note = document.createElement("div");
        note.className = "note warn";
        note.textContent = this._t("live_stream_failed");
        L.box.appendChild(note);
      } else {
        this._liveMessage("live_unavailable", true);
      }
    }
  }

  _liveToggleStream() {
    if (!this._live) return;
    if (this._live.mode === "stream") this._liveStill();
    else this._liveStream();
  }

  /* Ein Klick auf die PTZ-Steuerung schaltet das Bild automatisch auf den Stream. */
  _livePtzHook() {
    if (this._live && this._live.mode !== "stream") this._liveStream();
  }

  /* ---------- Deep-Link aus der Push-Nachricht: ?reolink_live=<Geräte-ID>&reolink_t=<Zeitpunkt> ---------- */
  _checkDeepLink() {
    if (!this._data || !this._config) return;
    let dev = null;
    let ts = 0;
    try {
      const q = new URLSearchParams(window.location.search);
      dev = q.get("reolink_live");
      ts = Number(q.get("reolink_t")) || 0;
    } catch (_) { return; }
    const key = `${dev}:${ts}`;
    if (!dev || key === this._deepDone) return;
    const d = this._device(dev);
    if (!d || !(d.live || d.gallery)) return;
    this._deepDone = key;
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete("reolink_live");
      u.searchParams.delete("reolink_t");
      window.history.replaceState(window.history.state, "", u.pathname + u.search + u.hash);
    } catch (_) { /* ignorieren */ }
    const age = ts ? Date.now() / 1000 - ts : 0;
    if (ts && age > DEEP_LIVE_MAX_AGE && d.gallery) this._openRecording(dev, ts);
    else this._openPopup(dev, { stream: !!d.live });
  }

  /* Spätes Antippen der Push-Nachricht: die zur Meldung passende Aufnahme direkt abspielen */
  async _openRecording(dev, ts) {
    this._skipAutoLive = true;
    this._pendingStream = false;
    this._ui.acc["p:gal"] = true;
    this._ui.popup = dev;
    this._ui.detailsErr = null;
    this._render();
    this._loadDetails(dev, true);
    await this._loadGallery(dev, true);
    const g = this._ui.gal[dev];
    const d = this._device(dev);
    const it = g && g.items ? g.items.find((x) => x.start != null && x.start <= ts + 30 && ts - x.start < 6 * 3600) : null;
    if (it && d) this._openPlayer(it.id, `${d.name} ${it.day} ${it.title}`);
    else this._showToast(this._t("gal_deep_none"), false);
  }

  /* ---------- Galerie ---------- */
  _galleryHtml() {
    const t = (k, v) => this._t(k, v);
    const list = this._devicesFor("gallery");
    if (!list.length) return `<div class="list"><div class="empty">${esc(t(this._ui.search.trim() ? "empty_filter" : "empty_list"))}</div></div>`;
    const n = this._data.options.gallery_count;
    let h = `<div class="settings" data-scroll="list"><div class="note">${esc(t("gal_limit", { n }))}</div>`;
    for (const d of list) {
      const g = this._ui.gal[d.device];
      h += this._acc(`g:${d.device}`, "mdi:filmstrip", d.name, this._galBodyHtml(d), { meta: g && g.items ? esc(t("gal_count", { n: g.items.length })) : "" });
    }
    return `${h}</div>`;
  }

  _galBodyHtml(d) {
    const t = (k, v) => this._t(k, v);
    const g = this._ui.gal[d.device];
    let body = "";
    if (!g) body = `<div class="note">${esc(t("gal_open_hint"))}</div>`;
    else if (g.loading) body = `<div class="note">${esc(t("gal_loading"))}</div>`;
    else if (g.error) body = `<div class="note err">${esc(t("gal_error", { e: this._errText(g.error) }))}</div><div class="btns"><button class="btn small" data-act="galreload" data-dev="${esc(d.device)}">${this._ico("mdi:refresh")}${esc(t("gal_reload"))}</button></div>`;
    else {
      body = this._gallerySnapshotHtml(d, g);
      body += g.items.length ? g.items.map((it) => this._galleryRowHtml(d, it)).join("") : `<div class="note">${esc(t("gal_empty"))}</div>`;
      if (g.items.length && !g.items.some((it) => it.thumbUrl)) body += `<div class="note">${esc(t("gal_no_thumb"))}</div>`;
      body += `<div class="btns"><button class="btn small" data-act="galreload" data-dev="${esc(d.device)}">${this._ico("mdi:refresh")}${esc(t("gal_reload"))}</button></div>`;
    }
    return body;
  }

  _gallerySnapshotHtml(d, g) {
    const t = (k) => this._t(k);
    if (g.snapshot) return `<div class="galsnap"><img src="${esc(g.snapshot)}" alt="${esc(t("gal_snapshot"))}"><span>${esc(t("gal_snapshot"))}</span></div>`;
    if (d.battery) return `<div class="btns"><button class="btn small" data-act="galsnap" data-dev="${esc(d.device)}">${this._ico("mdi:image-outline")}${esc(t("gal_snapshot_load"))}</button></div><div class="note warn">${esc(t("live_battery_hint"))}</div>`;
    return "";
  }

  _galleryRowHtml(d, it) {
    const thumb = it.thumbUrl ? `<img src="${esc(it.thumbUrl)}" alt="">` : this._ico("mdi:play-circle-outline");
    const dl = `<button class="btn small icon" data-act="dl" data-dev="${esc(d.device)}" data-day="${esc(it.day)}" data-title="${esc(it.title)}" title="${esc(this._t("gal_download"))}">${this._ico("mdi:download")}</button>`;
    return `<div class="galrow" data-act="play" data-id="${esc(it.id)}" data-title="${esc(d.name)} ${esc(it.day)} ${esc(it.title)}"><div class="galthumb">${thumb}</div><div class="main"><div class="name">${esc(it.title)}</div><div class="sub">${esc(it.day)}</div></div>${dl}${this._ico("mdi:chevron-right")}</div>`;
  }

  async _loadGallery(dev, force) {
    const cur = this._ui.gal[dev];
    if (cur && (cur.loading || (!force && !cur.error))) return;
    this._ui.gal[dev] = { loading: true };
    this._render();
    try {
      const msg = { type: `${WS}/gallery`, device: dev };
      if (this._config.entry_id) msg.entry_id = this._config.entry_id;
      const res = await this._hass.callWS(msg);
      const items = res.items || [];
      await Promise.all(items.map(async (it) => {
        const th = it.thumbnail;
        if (!th) return;
        try {
          if (/^https?:/.test(th)) it.thumbUrl = th;
          else if (th.startsWith("/")) it.thumbUrl = this._hass.hassUrl((await this._hass.callWS({ type: "auth/sign_path", path: th, expires: 3600 })).path);
        } catch (_) { /* ohne Vorschau */ }
      }));
      this._ui.gal[dev] = { items };
      const dd = this._device(dev);
      if (dd && dd.gallery && !dd.battery) this._loadGallerySnapshot(dev);
    } catch (e) {
      this._ui.gal[dev] = { error: (e && (e.code === "unauthorized" ? "no_admin" : e.code)) || "gallery_failed" };
    }
    this._render();
  }

  async _loadGallerySnapshot(dev) {
    const d = this._device(dev);
    const g = this._ui.gal[dev];
    if (!d || !g || !d.gallery) return;
    try { g.snapshot = await this._stillUrl(d.gallery.entity); } catch (_) { /* ohne Bild */ }
    this._render();
  }

  async _download(dev, day, title) {
    const d = this._device(dev);
    this._showToast(this._t("gal_dl_busy"), false);
    try {
      const msg = { type: `${WS}/download`, device: dev, day, title };
      if (this._config.entry_id) msg.entry_id = this._config.entry_id;
      const res = await this._hass.callWS(msg);
      const name = `${String((d && d.name) || "reolink").replace(/[^\w\-]+/g, "_")}_${day}_${String(title).split(" ")[0].replace(/:/g, "-")}.mp4`;
      if (!res.downloadable) {
        this._showToast(this._t("gal_dl_hls"), false);
        this._openPlayer(res.id, `${(d && d.name) || ""} ${day} ${res.title} HD`);
        return;
      }
      const a = document.createElement("a");
      a.href = typeof this._hass.hassUrl === "function" ? this._hass.hassUrl(res.url) : res.url;
      a.download = name;
      a.rel = "noopener";
      this.shadowRoot.appendChild(a);
      a.click();
      a.remove();
      this._showToast(this._t("gal_dl_started"), false);
    } catch (e) {
      const code = e && e.code === "unauthorized" ? "no_admin" : (e && (e.code || e.message)) || "download_failed";
      this._showToast(this._t("resp_error", { e: this._errText(code) }), true);
    }
  }

  async _openPlayer(id, title) {
    const t = (k) => this._t(k);
    this._ui.player = id;
    const ov = this._elOv;
    ov.innerHTML = `<div class="backdrop" data-act="backdrop"><div class="popup player"><div class="phead"><span class="t">${esc(title)}</span><button class="btn icon" data-act="closeplayer" title="×">${this._ico("mdi:close")}</button></div><div class="pbody"><div class="livebox"><div class="livemsg">${esc(t("gal_play_loading"))}</div></div><div class="btns"><a class="btn small" href="/media-browser/browser/app%2Cmedia-source%3A%2F%2Freolink" target="_top">${this._ico("mdi:open-in-new")}${esc(t("gal_open_ha"))}</a></div></div></div></div>`;
    const box = ov.querySelector(".livebox");
    const fail = () => { if (this._ui.player === id) box.innerHTML = `<div class="livemsg err">${esc(t("gal_play_failed"))}</div>`; };
    try {
      const res = await this._hass.callWS({ type: "media_source/resolve_media", media_content_id: id, expires: 3600 });
      if (this._ui.player !== id) return;
      const video = document.createElement("video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.onerror = fail;
      if (/mpegurl/i.test(res.mime_type || "") && !video.canPlayType(res.mime_type)) { fail(); return; }
      video.src = typeof this._hass.hassUrl === "function" ? this._hass.hassUrl(res.url) : res.url;
      box.replaceChildren(video);
    } catch (_) { fail(); }
  }

  _closePlayer() {
    this._ui.player = null;
    this._elOv.textContent = "";
  }

  _ptzSpeedKey() {
    if (!this._ui.ptzSpeed) {
      let v = null;
      try { v = window.localStorage.getItem("reolink_manager_ptz_speed"); } catch (_) { /* ohne Speicher */ }
      this._ui.ptzSpeed = PTZ_SPEEDS[v] ? v : "slow";
    }
    return this._ui.ptzSpeed;
  }

  _ptzHtml(d) {
    const b = d.ptz.buttons || {};
    const t = (k) => this._t(k);
    const btn = (key, icon, label) => (b[key] ? `<button class="btn ptz" data-ptz="${esc(b[key])}" title="${esc(label)}">${this._ico(icon)}</button>` : `<button class="btn" disabled>${this._ico(icon)}</button>`);
    const stop = b.stop ? `<button class="btn" data-act="ptzstop" data-ent="${esc(b.stop)}" title="${esc(t("ptz_stop"))}">${this._ico("mdi:stop")}</button>` : `<button class="btn" disabled>${this._ico("mdi:stop")}</button>`;
    const cur = this._ptzSpeedKey();
    let side = `<label class="ptzlbl">${esc(t("ptz_speed"))}<select class="sel" data-role="ptzspeed">${Object.keys(PTZ_SPEEDS).map((k) => `<option value="${k}"${k === cur ? " selected" : ""}>${esc(t(`ptz_speed_${k}`))}</option>`).join("")}</select></label>`;
    if (b.zoom_in || b.zoom_out) side += `<div class="btns" style="margin-top:0">${btn("zoom_out", "mdi:magnify-minus-outline", t("ptz_zoom_out"))}${btn("zoom_in", "mdi:magnify-plus-outline", t("ptz_zoom_in"))}</div>`;
    if (d.ptz.preset) {
      side += `<label class="ptzlbl">${esc(t("ptz_preset"))}<select class="sel" data-role="select" data-ent="${esc(d.ptz.preset.entity)}">${d.ptz.preset.options.map((o) => `<option${o === d.ptz.preset.current ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></label>`;
    }
    return `<div class="ptzrow"><div class="pad"><span></span>${btn("up", "mdi:arrow-up", "↑")}<span></span>${btn("left", "mdi:arrow-left", "←")}${stop}${btn("right", "mdi:arrow-right", "→")}<span></span>${btn("down", "mdi:arrow-down", "↓")}<span></span></div><div class="ptzside">${side}</div></div><div class="note">${esc(t("ptz_hint"))}</div>`;
  }

  /* Bewegung nur solange gehalten wird, Loslassen stoppt (Sicherheits-Stopp zusätzlich im Backend) */
  _ptzDown(ent) {
    if (this._ptzHeld || !ent) return;
    this._ptzHeld = ent;
    this._action({ action: "ptz", entity: ent, op: "move", value: String(PTZ_SPEEDS[this._ptzSpeedKey()]) });
    this._livePtzHook();
  }

  _ptzUp() {
    const ent = this._ptzHeld;
    if (!ent) return;
    this._ptzHeld = null;
    this._action({ action: "ptz", entity: ent, op: "stop" });
  }

  _controlsHtml(d, det) {
    const t = (k) => this._t(k);
    let body = "";
    if (d.scene) {
      body += `<div class="settings-line"><span class="lbl">${esc(t("hub_scene"))}</span><select class="sel" data-role="select" data-ent="${esc(d.scene.entity)}">${d.scene.options.map((o) => `<option${o === d.scene.current ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
    }
    if (det) {
      for (const e of det.entities) {
        if (!["switch", "light", "siren"].includes(e.domain)) continue;
        if (e.state === "unavailable") continue;
        if (e.domain === "siren") {
          const confirm = this._ui.confirm === `siren:${e.entity}`;
          body += `<div class="settings-line"><span class="lbl">${esc(e.name)}</span><span class="val"><button class="btn small${confirm ? " confirm" : ""}" data-act="siren" data-ent="${esc(e.entity)}" data-on="1">${esc(t(confirm ? "siren_confirm" : "siren_on"))}</button> <button class="btn small" data-act="toggle" data-ent="${esc(e.entity)}" data-on="0">${esc(t("siren_off"))}</button></span></div>`;
        } else {
          const on = e.state === "on";
          body += `<div class="settings-line"><span class="lbl">${esc(e.name)}</span><span class="val"><button class="pill btnp" style="--c:${on ? "var(--rm-success)" : "var(--rm-rowicon)"}" data-act="toggle" data-ent="${esc(e.entity)}" data-on="${on ? 0 : 1}">${esc(t(on ? "on" : "off"))}</button></span></div>`;
        }
      }
      for (const e of det.entities) {
        if (e.domain !== "select" || e.role === "ptz_preset" || e.role === "scene" || !e.options) continue;
        body += `<div class="settings-line"><span class="lbl">${esc(e.name)}</span><select class="sel" style="max-width:55%" data-role="select" data-ent="${esc(e.entity)}">${e.options.map((o) => `<option${o === e.state ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
      }
    } else {
      body += `<div class="note">${esc(this._ui.detailsErr ? t("no_details") : t("loading"))}</div>`;
    }
    return this._acc("p:ctl", "mdi:tune-variant", t("acc_controls"), body || `<div class="note">–</div>`);
  }

  /* ---------- Ereignisse ---------- */
  _onToggle(e) {
    const el = e.target;
    if (!el || el.tagName !== "DETAILS" || !el.dataset.k) return;
    this._ui.acc[el.dataset.k] = el.open;
    if (el.open && el.dataset.k.startsWith("g:")) this._loadGallery(el.dataset.k.slice(2), false);
    else if (el.open && el.dataset.k === "p:gal" && this._ui.popup) this._loadGallery(this._ui.popup, false);
  }

  _onInput(e) {
    const el = e.target;
    if (el.dataset.role === "search") {
      this._ui.search = el.value;
      this._render();
    }
  }

  _onChange(e) {
    const el = e.target;
    if (el.dataset.role === "sort") { this._ui.sort = el.value; this._render(); }
    else if (el.dataset.role === "ptzspeed") {
      this._ui.ptzSpeed = PTZ_SPEEDS[el.value] ? el.value : "slow";
      try { window.localStorage.setItem("reolink_manager_ptz_speed", this._ui.ptzSpeed); } catch (_) { /* ohne Speicher */ }
    } else if (["pushtarget", "pushdet", "pushcd"].includes(el.dataset.role)) this._savePush();
    else if (el.dataset.role === "select" && el.dataset.ent) this._action({ action: "set_entity", entity: el.dataset.ent, op: "select", value: el.value });
  }

  _onClick(e) {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act;
    if (act === "backdrop") {
      if (e.target === el) { if (el.closest("#ov")) this._closePlayer(); else this._closePopup(); }
      return;
    }
    e.stopPropagation();
    switch (act) {
      case "tab": this._ui.tab = el.dataset.tab; this._ui.filter = "all"; this._render(); break;
      case "filter": this._ui.filter = this._ui.filter === el.dataset.filter ? "all" : el.dataset.filter; this._render(); break;
      case "open": this._openPopup(el.dataset.dev); break;
      case "close": this._closePopup(); break;
      case "closeplayer": this._closePlayer(); break;
      case "livestill": this._liveStill(); break;
      case "livestream": this._liveToggleStream(); break;
      case "galreload": this._loadGallery(el.dataset.dev, true); break;
      case "galsnap": this._loadGallerySnapshot(el.dataset.dev); break;
      case "dl": this._download(el.dataset.dev, el.dataset.day, el.dataset.title); break;
      case "enablestorage": this._action({ action: "enable_storage", device: el.dataset.dev }); break;
      case "play": this._openPlayer(el.dataset.id, el.dataset.title); break;
      case "testpush": this._action({ action: "test_push" }); this._showToast(this._t("push_test_sent"), false); break;
      case "ptzstop": this._action({ action: "ptz", entity: el.dataset.ent, op: "stop" }); this._livePtzHook(); break;
      case "toggle": this._action({ action: "set_entity", entity: el.dataset.ent, op: el.dataset.on === "1" ? "turn_on" : "turn_off" }); break;
      case "siren": this._confirm(`siren:${el.dataset.ent}`, () => this._action({ action: "set_entity", entity: el.dataset.ent, op: "turn_on" })); break;
      case "refresh": this._confirm(`refresh:${el.dataset.dev}`, () => this._action({ action: "refresh_device", device: el.dataset.dev })); break;
      case "rescan": this._action({ action: "rescan" }); break;
      case "checkupd": this._action({ action: "check_update" }); break;
      case "more": this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.ent }, bubbles: true, composed: true })); break;
      case "opendevice": this._navigate(`/config/devices/device/${el.dataset.dev}`); break;
      case "copy": this._copy(el.dataset.copy); break;
      default: break;
    }
  }

  async _savePush() {
    if (!this._hass) return;
    const r = this._elMain;
    const targets = [...r.querySelectorAll('[data-role="pushtarget"]:checked')].map((x) => x.dataset.val);
    const detections = [...r.querySelectorAll('[data-role="pushdet"]:checked')].map((x) => x.dataset.val);
    const cdEl = r.querySelector('[data-role="pushcd"]');
    const cooldown = Math.max(0, Math.min(3600, Math.round(Number(cdEl && cdEl.value) || 0)));
    const msg = { type: `${WS}/set_push`, targets, detections, cooldown };
    if (this._config.entry_id) msg.entry_id = this._config.entry_id;
    try {
      await this._hass.callWS(msg);
      this._showToast(this._t("push_saved"), false);
    } catch (e) {
      const code = e && e.code === "unauthorized" ? "no_admin" : (e && (e.message || e.code)) || "?";
      this._showToast(this._t("resp_error", { e: this._errText(code) }), true);
    }
  }

  _confirm(key, fn) {
    if (this._ui.confirm === key) { this._ui.confirm = null; clearTimeout(this._confirmTimer); this._render(); fn(); return; }
    this._ui.confirm = key;
    this._render();
    clearTimeout(this._confirmTimer);
    this._confirmTimer = setTimeout(() => { this._ui.confirm = null; this._render(); }, 4000);
  }

  _navigate(path) {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false }, bubbles: true, composed: true }));
  }

  async _copy(text) {
    try { await navigator.clipboard.writeText(text); this._showToast(this._t("copied"), false); } catch (_) { /* ignorieren */ }
  }

  _openPopup(dev, opts) {
    this._pendingStream = !!(opts && opts.stream);
    this._ui.popup = dev;
    this._ui.detailsErr = null;
    this._render();
    this._loadDetails(dev, true);
  }

  async _loadDetails(dev, force) {
    if (!this._hass) return;
    const now = Date.now();
    if (!force && now - this._ui.detailsAt < 3000) return;
    this._ui.detailsAt = now;
    try {
      const msg = { type: `${WS}/details`, device: dev };
      if (this._config.entry_id) msg.entry_id = this._config.entry_id;
      const res = await this._hass.callWS(msg);
      this._ui.details[dev] = res;
      this._ui.detailsErr = null;
    } catch (e) {
      this._ui.detailsErr = String((e && (e.code || e.message)) || e);
    }
    this._render();
  }

  async _action(payload) {
    if (!this._hass) return;
    const msg = Object.assign({ type: `${WS}/action` }, payload);
    if (this._config.entry_id) msg.entry_id = this._config.entry_id;
    try {
      await this._hass.callWS(msg);
    } catch (e) {
      const code = e && e.code === "unauthorized" ? "no_admin" : (e && (e.message || e.code)) || "?";
      this._showToast(this._t("resp_error", { e: this._errText(code) }), true);
    }
  }
}

/* ---------------------------------------------------------------- Editor */
class ReolinkManagerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = Object.assign({}, DEFAULTS);
    this._info = null;
    this._built = false;
  }

  setConfig(config) {
    this._config = Object.assign({}, DEFAULTS, config || {});
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._loadInfo();
    if (this._form) this._form.hass = hass;
  }

  get _lang() { return pickLang(this._hass && this._hass.language); }
  _t(k, v) { return tr(this._lang, k, v); }

  async _loadInfo() {
    try { this._info = await this._hass.callWS({ type: `${WS}/info` }); } catch (_) { this._info = false; }
    this._render();
  }

  _schema() {
    const t = (k, v) => this._t(k, v);
    const catSwitches = TAB_ORDER.map((k) => ({ name: `show_${k}`, selector: { boolean: {} } }));
    return [
      { name: "title", selector: { text: {} } },
      { name: "show_title", selector: { boolean: {} } },
      { name: "show_icon", selector: { boolean: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "entry_id", selector: { text: {} } },
      { type: "expandable", name: "", title: t("ed_group_categories"), expanded: true, flatten: true, schema: [
        ...catSwitches,
        { name: "default_tab", selector: { select: { mode: "dropdown", options: TAB_ORDER.map((k) => ({ value: k, label: t(TAB_META[k].label) })) } } },
      ] },
      { type: "expandable", name: "", title: t("ed_group_display"), flatten: true, schema: [
        { name: "max_rows", selector: { number: { min: 5, max: 500, mode: "box" } } },
        { name: "zoom", selector: { number: { min: 50, max: 200, mode: "box" } } },
        { name: "show_stats", selector: { boolean: {} } },
        { name: "show_search", selector: { boolean: {} } },
        { name: "show_filter_bar", selector: { boolean: {} } },
        { name: "default_sort", selector: { select: { mode: "dropdown", options: ["name", "status", "battery"].map((k) => ({ value: k, label: t(`sort_${k}`) })) } } },
        { type: "expandable", name: "", title: t("ed_group_columns"), flatten: true, schema: [
          { name: "show_col_model", selector: { boolean: {} } }, { name: "show_col_hub", selector: { boolean: {} } },
          { name: "show_col_battery", selector: { boolean: {} } }, { name: "show_col_wifi", selector: { boolean: {} } },
          { name: "show_col_last", selector: { boolean: {} } },
        ] },
      ] },
      { type: "expandable", name: "", title: t("ed_group_edit"), flatten: true, schema: [
        { name: "read_only", selector: { boolean: {} } },
        { name: "live_auto", selector: { boolean: {} } },
      ] },
      { type: "expandable", name: "", title: t("ed_group_experimental"), flatten: true, schema: [
        { name: "show_experimental", selector: { boolean: {} } },
      ] },
    ];
  }

  _label(name) {
    const t = (k, v) => this._t(k, v);
    const m = name.match(/^show_(.+)$/);
    if (m && TAB_META[m[1]]) return t("ed_show_cat", { c: t(TAB_META[m[1]].label) });
    const map = {
      title: "ed_title", show_title: "ed_show_title", show_icon: "ed_show_icon", icon: "ed_icon", entry_id: "ed_entry_id", default_tab: "ed_default_tab",
      max_rows: "ed_max_rows", zoom: "ed_zoom", show_stats: "ed_show_stats", show_search: "ed_show_search",
      show_filter_bar: "ed_show_filter_bar", default_sort: "ed_default_sort", show_col_model: "ed_col_model",
      show_col_hub: "ed_col_hub", show_col_battery: "ed_col_battery", show_col_wifi: "ed_col_wifi", show_col_last: "ed_col_last",
      read_only: "ed_read_only", live_auto: "ed_live_auto", show_experimental: "ed_show_experimental",
    };
    return map[name] ? t(map[name]) : name;
  }

  _versionHtml() {
    const t = (k, v) => this._t(k, v);
    const esc2 = esc;
    if (this._info === null) return "";
    if (this._info === false) return `<div class="ver">${esc2(t("ed_version_unknown", { c: CARD_VERSION }))}</div>`;
    let h = `<div class="ver">${esc2(t("ed_version", { c: CARD_VERSION, i: this._info.version }))}</div>`;
    if (this._info.update_available) h += `<div class="warn">${esc2(t("ed_update_warn", { v: this._info.latest_version }))}</div>`;
    else if (this._info.version !== CARD_VERSION) h += `<div class="warn">${esc2(t("ed_mismatch_warn"))}</div>`;
    return h;
  }

  _colorsHtml() {
    const t = (k, v) => this._t(k, v);
    const rows = [];
    for (const k of Object.keys(COLOR_CONFIG_KEYS)) rows.push([`color_${k}`, t(`ed_color_${k}`)]);
    for (const k of TAB_ORDER) rows.push([`color_icon_${k}`, t("ed_color_icon", { c: t(TAB_META[k].label) })]);
    return `<details class="colors"><summary>${esc(t("ed_group_colors"))}</summary><div class="note">${esc(t("ed_colors_hint"))}</div>${rows.map(([key, label]) => {
      const val = sanitizeColor(this._config[key]);
      const hex = /^#[0-9a-fA-F]{6}$/.test(val) ? val : "#808080";
      return `<div class="crow"><label>${esc(label)}</label><input type="color" data-ckey="${key}" value="${esc(hex)}"><input type="text" data-ckey="${key}" data-fk="c_${key}" value="${esc(val)}" placeholder="–"></div>`;
    }).join("")}<button class="btn" data-reset="1">${esc(t("ed_colors_reset"))}</button></details>`;
  }

  _render() {
    const root = this.shadowRoot;
    if (!this._built) {
      root.innerHTML = `<style>
        :host{display:block}
        .ver{font-weight:600;margin:4px 0}.warn{color:var(--warning-color,#ff9800);border:1px solid var(--warning-color,#ff9800);border-radius:8px;padding:6px 10px;margin:6px 0;font-size:.88rem}
        .colors{margin-top:12px;border:1px solid var(--divider-color);border-radius:8px;padding:8px 12px}
        .colors summary{cursor:pointer;font-weight:500}.note{font-size:.8rem;color:var(--secondary-text-color);margin:6px 0}
        .crow{display:flex;align-items:center;gap:8px;margin:6px 0}.crow label{flex:1;font-size:.88rem}
        .crow input[type=text]{width:140px;padding:5px 8px;border-radius:6px;border:1px solid var(--divider-color);background:var(--card-background-color,#fff);color:var(--primary-text-color)}
        .btn{margin-top:8px;padding:6px 12px;border-radius:6px;border:1px solid var(--divider-color);background:none;color:var(--primary-text-color);cursor:pointer}
        .exp{font-size:.82rem;color:var(--secondary-text-color);margin:4px 0 10px}
      </style><div id="ver"></div><ha-form id="form"></ha-form><div class="exp" id="exp"></div><div id="colors"></div>`;
      this._form = root.getElementById("form");
      this._form.computeLabel = (s) => this._label(s.name);
      this._form.addEventListener("value-changed", (ev) => { ev.stopPropagation(); this._changed(ev.detail.value); });
      root.addEventListener("input", (ev) => this._colorInput(ev));
      root.addEventListener("click", (ev) => { if (ev.target.dataset && ev.target.dataset.reset) this._resetColors(); });
      this._built = true;
    }
    this._form.hass = this._hass;
    this._form.schema = this._schema();
    this._form.data = this._config;
    root.getElementById("ver").innerHTML = this._versionHtml();
    root.getElementById("exp").textContent = this._t("ed_exp_hint");
    const colors = root.getElementById("colors");
    const open = colors.querySelector("details") && colors.querySelector("details").open;
    if (!colors.dataset.lang || colors.dataset.lang !== this._lang) {
      colors.innerHTML = this._colorsHtml();
      colors.dataset.lang = this._lang;
      if (open) colors.querySelector("details").open = true;
    }
  }

  _changed(value) {
    const next = Object.assign({}, this._config, value);
    if (next.title === undefined) next.title = "";
    this._config = next;
    this._fire();
  }

  _colorInput(ev) {
    const el = ev.target;
    const key = el.dataset && el.dataset.ckey;
    if (!key) return;
    const val = sanitizeColor(el.value);
    this._config = Object.assign({}, this._config, { [key]: val });
    if (!val) delete this._config[key];
    if (el.type === "color") {
      const txt = this.shadowRoot.querySelector(`input[type=text][data-ckey="${key}"]`);
      if (txt) txt.value = val;
    }
    this._fire();
  }

  _resetColors() {
    const next = Object.assign({}, this._config);
    Object.keys(next).filter((k) => k.startsWith("color_")).forEach((k) => delete next[k]);
    this._config = next;
    this.shadowRoot.getElementById("colors").dataset.lang = "";
    this._render();
    this._fire();
  }

  _fire() {
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, ReolinkManagerCard);
if (!customElements.get(`${TAG}-editor`)) customElements.define(`${TAG}-editor`, ReolinkManagerCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === TAG)) {
  window.customCards.push({
    type: TAG,
    name: "Reolink Manager",
    description: "Übersicht, Batterie, Erkennungen, Updates und Steuerung für Reolink-Kameras und den Home Hub.",
    preview: false,
  });
}
console.info(`%c REOLINK MANAGER %c ${CARD_VERSION} `, "color:#fff;background:#3b6642;font-weight:700", "color:#3b6642;background:#eef5ef");
