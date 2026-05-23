# WeHeat OpenTherm Card

Compacte Lovelace-kaart voor de [weheat_opentherm](https://github.com/FutureCow/ha-setpoint-heating) custom integratie.

Toont in één oogopslag:

- Berekend **aanvoersetpoint** (groot, prominent)
- **Kamer-** en **buitentemperatuur** met gewenste waarde
- **Huidige energieprijs** (indien geconfigureerd)
- **Opbouw van de berekening**: stooklijn + alle correcties, kleur-gecodeerd

## Screenshot

```
┌────────────────────────────────────┐
│ WEHEAT                    27.5°C   │
│                                    │
│ KAMER             BUITEN           │
│ 19.2°C            -2.1°C           │
│ doel 20.0°C       €0.1842/kWh      │
│ ─────────────────────────────────  │
│ Stooklijn               29.00°C    │
│ Kamercompensatie        +1.60°C    │
│ Windchill               +1.20°C    │
│ Zon                     -0.00°C    │
│ Prijs                   -2.00°C    │
│ - - - - - - - - - - - - - - - - -  │
│ = Aanvoersetpoint        29.80°C   │
└────────────────────────────────────┘
```

## Installatie

### Via HACS (aanbevolen)

1. HACS → Frontend → 3-puntsmenu → "Custom repositories"
2. URL: `https://github.com/FutureCow/ha-weheat-opentherm-card`, categorie: `Lovelace`
3. "WeHeat OpenTherm Card" installeren
4. Browser refreshen (`Ctrl+F5`)

### Handmatig

1. `weheat-opentherm-card.js` downloaden naar `<config>/www/`
2. In HA: Instellingen → Dashboards → ⋮ → Resources → Toevoegen:
   - URL: `/local/weheat-opentherm-card.js`
   - Type: JavaScript Module

## Configuratie

```yaml
type: custom:weheat-opentherm-card
entity_prefix: sensor.weheat_opentherm
target_temp_entity: climate.weheat_opentherm_verwarmingsdoelwit
title: Verwarming
show_breakdown: true
show_price: true
```

### Opties

| Optie | Type | Default | Beschrijving |
|---|---|---|---|
| `entity_prefix` | string | **vereist** | Prefix van de integratie-entiteiten (meestal `sensor.weheat_opentherm`) |
| `target_temp_entity` | string | `null` | Climate-entiteit voor weergave van de doeltemperatuur |
| `title` | string | `"WeHeat"` | Tekst rechtsboven |
| `show_breakdown` | bool | `true` | Toon de formule-opbouw onder de samenvatting |
| `show_price` | bool | `true` | Toon de huidige energieprijs (alleen als beschikbaar) |

De kaart leest automatisch de volgende suffixen onder `entity_prefix`:

- `_aanvoersetpoint` — eindwaarde
- `_buitentemperatuur`, `_kamertemperatuur` — inputs
- `_stooklijn_basistemperatuur` — basis stooklijn
- `_kamercompensatie`, `_windchill_correctie`, `_zoncorrectie`, `_prijscorrectie` — correctietermen
- `_huidige_energieprijs` — actuele prijs

Ontbrekende sensoren worden stilletjes overgeslagen.

## Vereisten

- Home Assistant 2024.1 of nieuwer
- De [weheat_opentherm](https://github.com/FutureCow/ha-setpoint-heating) integratie

## Licentie

MIT
