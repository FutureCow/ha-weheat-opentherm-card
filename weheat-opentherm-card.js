/**
 * WeHeat OpenTherm Card
 * Compact Lovelace card voor de weheat_opentherm custom integratie.
 *
 * Toont aanvoersetpoint, kamer-/buitentemperatuur, prijs en de opbouw
 * van de berekening (stooklijn + correcties).
 */

const CARD_VERSION = "1.0.0";

class WeheatOpenthermCard extends HTMLElement {
  static getStubConfig() {
    return {
      entity_prefix: "sensor.weheat_opentherm",
      target_temp_entity: "climate.weheat_opentherm_verwarmingsdoelwit",
      title: "WeHeat",
    };
  }

  setConfig(config) {
    if (!config?.entity_prefix) {
      throw new Error(
        "entity_prefix is verplicht (bv. sensor.weheat_opentherm)"
      );
    }
    this._config = {
      title: "WeHeat",
      show_breakdown: true,
      show_price: true,
      ...config,
    };
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 3;
  }

  _state(suffix) {
    if (!this._hass) return null;
    const entity = this._hass.states[`${this._config.entity_prefix}_${suffix}`];
    if (!entity) return null;
    if (entity.state === "unavailable" || entity.state === "unknown") return null;
    const n = parseFloat(entity.state);
    return isNaN(n) ? null : n;
  }

  _targetTemp() {
    const tgt = this._config.target_temp_entity;
    if (!tgt) return null;
    const entity = this._hass?.states[tgt];
    if (!entity) return null;
    return entity.attributes?.temperature ?? null;
  }

  _fmt(value, decimals = 1, signed = false) {
    if (value === null) return "–";
    const fixed = value.toFixed(decimals);
    if (signed && value > 0) return `+${fixed}`;
    return fixed;
  }

  _row(label, value, opts = {}) {
    if (value === null) return "";
    const { invert = false, suffix = "°C" } = opts;
    const display = invert ? -value : value;
    const sign = display > 0 ? "+" : "";
    let cls = "neutral";
    if (display > 0.05) cls = "positive";
    else if (display < -0.05) cls = "negative";
    return `
      <div class="row">
        <span class="label">${label}</span>
        <span class="value ${cls}">${sign}${display.toFixed(2)}${suffix}</span>
      </div>
    `;
  }

  _render() {
    if (!this._hass || !this._config) return;

    const setpoint = this._state("aanvoersetpoint");
    const outdoor = this._state("buitentemperatuur");
    const room = this._state("kamertemperatuur");
    const stooklijn = this._state("stooklijn_basistemperatuur");
    const kamerComp = this._state("kamercompensatie");
    const windchill = this._state("windchill_correctie");
    const zon = this._state("zoncorrectie");
    const prijs = this._state("prijscorrectie");
    const priceNow = this._state("huidige_energieprijs");
    const target = this._targetTemp();

    const showPrice = this._config.show_price && priceNow !== null;
    const showBreakdown = this._config.show_breakdown;

    this.shadowRoot.innerHTML = `
      <style>
        :host { --positive: #ff9800; --negative: #039be5; }
        ha-card {
          padding: 16px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
        }
        .title {
          font-size: 0.95em;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .setpoint {
          font-size: 2.2em;
          font-weight: 300;
          color: var(--primary-color);
          line-height: 1;
        }
        .setpoint .unit {
          font-size: 0.45em;
          color: var(--secondary-text-color);
          margin-left: 2px;
        }
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 16px;
          margin-bottom: 8px;
        }
        .stat {
          display: flex;
          flex-direction: column;
        }
        .stat .stat-label {
          font-size: 0.75em;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .stat .stat-value {
          font-size: 1.1em;
          font-variant-numeric: tabular-nums;
        }
        .stat .stat-sub {
          font-size: 0.8em;
          color: var(--secondary-text-color);
        }
        .divider {
          border-top: 1px solid var(--divider-color);
          margin: 8px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 0.9em;
        }
        .row .label { color: var(--secondary-text-color); }
        .row .value {
          font-variant-numeric: tabular-nums;
          font-feature-settings: "tnum";
        }
        .positive { color: var(--positive); }
        .negative { color: var(--negative); }
        .neutral { color: var(--primary-text-color); }
        .footer {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed var(--divider-color);
          display: flex;
          justify-content: space-between;
          font-size: 0.85em;
        }
        .footer .label { color: var(--secondary-text-color); }
        .footer .value {
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }
      </style>

      <ha-card>
        <div class="header">
          <span class="title">${this._config.title}</span>
          <span class="setpoint">
            ${this._fmt(setpoint)}<span class="unit">°C</span>
          </span>
        </div>

        <div class="summary">
          <div class="stat">
            <span class="stat-label">Kamer</span>
            <span class="stat-value">${this._fmt(room)}°C</span>
            ${target !== null
              ? `<span class="stat-sub">doel ${target.toFixed(1)}°C</span>`
              : ""}
          </div>
          <div class="stat">
            <span class="stat-label">Buiten</span>
            <span class="stat-value">${this._fmt(outdoor)}°C</span>
            ${showPrice
              ? `<span class="stat-sub">€${priceNow.toFixed(4)}/kWh</span>`
              : ""}
          </div>
        </div>

        ${showBreakdown
          ? `
          <div class="divider"></div>
          <div class="row">
            <span class="label">Stooklijn</span>
            <span class="value neutral">${this._fmt(stooklijn)}°C</span>
          </div>
          ${this._row("Kamercompensatie", kamerComp)}
          ${this._row("Windchill", windchill)}
          ${this._row("Zon", zon, { invert: true })}
          ${this._row("Prijs", prijs)}
          <div class="footer">
            <span class="label">= Aanvoersetpoint</span>
            <span class="value">${this._fmt(setpoint)}°C</span>
          </div>
        `
          : ""}
      </ha-card>
    `;
  }
}

customElements.define("weheat-opentherm-card", WeheatOpenthermCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "weheat-opentherm-card",
  name: "WeHeat OpenTherm Card",
  preview: false,
  description:
    "Compacte kaart voor de weheat_opentherm integratie met setpoint en opbouw van de berekening.",
});

console.info(
  `%c WeHeat OpenTherm Card %c v${CARD_VERSION} `,
  "color:#fff;background:#03a9f4;font-weight:700;padding:2px 6px;border-radius:3px 0 0 3px",
  "color:#fff;background:#555;padding:2px 6px;border-radius:0 3px 3px 0"
);
