# CLAUDE.md — AI Assistant Guide for CEC Calc Pro

## Project Overview

CEC Calc Pro is a mobile app for Canadian electricians that performs offline CEC 2021 code-compliant electrical calculations. Built with Expo (React Native) and TypeScript, targeting both Google Play Store and Apple App Store.

**Current State:** Pre-development — the repository contains a detailed specification in `README.md` but no application source code yet. The README serves as the authoritative design document and specification.

**Business Model:** Freemium with RevenueCat-managed subscriptions.
- FREE: Wire Sizing Calculator + Imperial/Metric Converter
- PRO ($4.99/month or $29.99/year): Voltage Drop, Conduit Fill, Box Fill calculators

## Tech Stack

| Layer           | Technology                                              |
|-----------------|---------------------------------------------------------|
| Framework       | Expo SDK 54+ (managed workflow)                         |
| Language        | TypeScript                                              |
| Navigation      | Expo Router (file-based routing with tabs)              |
| UI              | React Native core + custom styled components (no UI library) |
| State           | React Context (pro/free status), `useState` (calculator inputs) |
| Payments        | RevenueCat (`react-native-purchases`)                   |
| Data            | Pure TypeScript functions + bundled JSON (zero network calls) |
| Build/Deploy    | EAS Build + EAS Submit                                  |
| Analytics       | Expo Analytics (free tier)                              |

## Project Structure (Planned)

```
cec-calc-pro/
├── README.md                  # Authoritative spec & design document
├── CLAUDE.md                  # This file — AI assistant guide
├── app/
│   ├── _layout.tsx            # Root layout with RevenueCat provider
│   ├── paywall.tsx            # RevenueCat paywall screen
│   └── (tabs)/
│       ├── _layout.tsx        # Tab navigator layout
│       ├── index.tsx          # Home / Wire Sizing Calculator (FREE)
│       ├── converter.tsx      # Imperial/Metric Converter (FREE)
│       ├── voltage-drop.tsx   # Voltage Drop Calculator (PRO)
│       ├── conduit-fill.tsx   # Conduit Fill Calculator (PRO)
│       └── box-fill.tsx       # Box Fill Calculator (PRO)
├── components/
│   ├── CalculatorCard.tsx     # Reusable input/output card
│   ├── ResultDisplay.tsx      # Styled result with CEC rule reference
│   ├── ProBadge.tsx           # Lock icon overlay for pro features
│   ├── PickerSelect.tsx       # Styled dropdown picker
│   └── NumberInput.tsx        # Numeric input with validation
├── data/
│   ├── cec-tables.ts          # CEC 2021 ampacity & reference tables
│   ├── conduit-data.ts        # Conduit & wire cross-section areas
│   └── box-fill-data.ts       # Box fill allowances per CEC
├── utils/
│   ├── wire-sizing.ts         # Wire sizing calculation logic
│   ├── voltage-drop.ts        # Voltage drop calculation logic
│   ├── conduit-fill.ts        # Conduit fill calculation logic
│   ├── box-fill.ts            # Box fill calculation logic
│   ├── conversions.ts         # Imperial/Metric conversion functions
│   └── format.ts              # Number formatting helpers
├── hooks/
│   ├── useProStatus.ts        # RevenueCat subscription check
│   └── useCalculation.ts      # Generic calculation state handler
├── constants/
│   ├── colors.ts              # App color palette
│   └── typography.ts          # Font sizes and weights
├── app.json                   # Expo config
├── eas.json                   # EAS Build profiles
└── package.json
```

## Development Commands

```bash
# Create project (first-time setup)
npx create-expo-app cec-calc-pro --template tabs

# Install dependencies
npx expo install react-native-purchases
npx expo install react-native-purchases-ui   # optional: pre-built paywall UI
npx expo install expo-haptics                 # tactile feedback on calculate button

# Development
npx expo start

# Build for stores
eas build --platform all --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Key Design Conventions

### Visual Style
- **Dark mode only** — electricians work in basements, attics, mechanical rooms
- Primary: `#1B5E20` (dark green), Accent: `#FFC107` (amber for results)
- Background: `#121212`, Surface: `#1E1E1E`, Text: `#FFFFFF` / `#B0BEC5`
- Error: `#EF5350`, Pro Badge: `#FFD700` (gold)
- **No animations or transitions** — this is a tool, speed matters
- Large touch targets (min 48x48dp) for gloved fingers
- System default fonts (San Francisco / Roboto)

### Calculator Screen Layout Pattern
Every calculator screen follows the same structure:
1. Header with calculator name + CEC rule reference
2. Input section (dropdowns and number inputs)
3. "Calculate" button (prominent, full width)
4. Result section (large, high-contrast amber text on dark background)
5. CEC rule citation at bottom (e.g., "Per CEC 2021 Table 2, Rule 4-004")

### Code Architecture
- **Offline-first**: All calculations are pure TypeScript functions with bundled data. Zero network calls for calculations.
- **Calculation logic** lives in `utils/` — pure functions, easily testable
- **CEC reference data** lives in `data/` — typed lookup tables
- **Components** are reusable across calculators — shared input/output patterns
- **Pro gating** uses `useProStatus` hook wrapping RevenueCat

## Critical Domain Rules (CEC 2021)

These rules are fundamental to correctness. Getting them wrong produces dangerous results for electricians.

### Rule 4-006 (Termination Temperature)
Even when using 90°C rated conductors (RW90, T90), ampacity must be selected from the **75°C column** if equipment terminations are rated 75°C (most common for equipment ≤600V). The 90°C column is primarily used for **derating purposes** only. The app must warn users about this.
- **4-006(1):** Equipment >100A or >No. 1 AWG → 75°C column
- **4-006(2):** Equipment ≤100A or ≤No. 1 AWG → **60°C column** unless marked 75°C (most modern equipment is marked 75°C)
- **4-006(4):** 1.2m rule — conductors within 1.2m of termination may use the termination temp rating

### Wire Sizing Calculation Flow
1. Get ambient temp correction factor (Table 5A — NOT Table 5C)
2. Get derating factor for conductor bundling (Table 5C — NOT Table 5D)
3. Adjusted ampacity = Input Amps / (temp_factor × derate_factor)
4. Look up Table 2 for smallest wire where ampacity ≥ adjusted requirement
5. Apply Rule 4-006 for termination temperature

### Overcurrent Protection Limits (Rule 14-104)
Copper:
- 14 AWG: max 15A device
- 12 AWG: max 20A device
- 10 AWG: max 30A device

Aluminum (Rule 14-104(2)(d-e)):
- 12 AWG: max 15A device
- 10 AWG: max 25A device

### Voltage Drop (Rule 8-102)
- **Mandatory** max 3% for branch circuits, 5% total (feeder + branch) — Rule 8-102 uses "shall", not advisory
- Single phase: `Vd = (2 × K × I × L) / A`
- Three phase: `Vd = (1.732 × K × I × L) / A`

### Conduit Fill (Rule 12-910, Table 8)
- 1 conductor: 53% fill, 2 conductors: 31%, 3+: 40%
- Uses Tables 6A-6K (wire areas) and 9A-9P (conduit areas)

### Box Fill (Rule 12-3034, Table 22)
- Uses CEC Table 22 volumes (mL/cm³) — **NOT NEC Table 314.16(B)**
- CEC values differ significantly from NEC (e.g., #14: CEC 24.6 mL vs NEC 32.8 cm³)
- Pass-through conductors count as 1, not 2
- All EGCs in a box count as 1 conductor total (based on largest)
- CEC does NOT have a separate "cable clamp" allowance (unlike NEC)

## CEC vs NEC — Common Pitfalls

This app is for the **Canadian Electrical Code (CEC)**, not the NEC. Key differences:
- Table numbers differ (CEC Table 2 ≠ NEC Table 310.16)
- Box fill volumes use metric (mL) and have different counting rules
- Conductor bundling uses CEC Table 5C, not NEC 310.15(C)(1)
- CEC has no cable clamp allowance for box fill
- Always use CEC rule references, never NEC

## Data Verification Requirements

Several data tables in the README are marked with **⚠️ VERIFICATION REQUIRED**:
- Conduit internal areas (Table 9) — approximate values, must verify against CEC 2021
- Wire outer diameter areas (Table 6) — approximate values, must verify against CEC 2021

Do not treat these approximate values as authoritative. The developer must verify against the actual CEC 2021 code book before publishing.

## Testing Requirements

All calculations must be tested against known CEC examples before store submission:
1. #3 AWG copper at 90°C → 115A (confirms harmonized values)
2. #3/0 AWG copper at 75°C → 200A
3. 90°C conductor at 40°C ambient → correction factor 0.91
4. 7 conductors in raceway → derating factor 0.70
5. Box fill: 6× #12-2C + 3 marrette pairs → 12 × 28.7 + 3 × 28.7 = 430.5 mL
6. Conduit fill: 3× #10 RW90XLPE in ½" EMT → verify against Table 6A + Table 9G

## Legal Requirements

- The app **must** include a disclaimer: "This app is a calculation aid only. Always verify calculations against the official Canadian Electrical Code. Not a substitute for professional engineering judgment."
- Do **not** include copyrighted CEC table reproductions. The app performs calculations from standard electrical engineering formulas — it does not reproduce the code book.
- RevenueCat API keys in the README are placeholders. Replace with actual keys from RevenueCat dashboard.

## Git Workflow

- `main` branch — primary branch
- Commit messages should be clear and descriptive
- No CI/CD pipeline configured yet
- No linting or formatting configuration yet (to be set up with project scaffolding)
