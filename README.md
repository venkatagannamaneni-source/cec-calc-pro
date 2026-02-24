# CEC Calc Pro — Canadian Electrical Code Calculator

## Project Overview

A mobile app for Canadian electricians that performs offline CEC 2021 code-compliant calculations. Built with Expo (React Native), targeting both Google Play Store and Apple App Store.

**Core Value Proposition:** Ad-free, offline-first, CEC 2021-compliant electrical calculator that works on job sites with zero internet. Replaces flipping through the code book or using ad-riddled free apps with buggy calculations.

**Target User:** Licensed electricians, electrical apprentices, and contractors in Canada (~80,000 licensed electricians).

**Business Model:** Freemium with RevenueCat-managed subscriptions.

- FREE: Wire Sizing Calculator + Imperial/Metric Converter
- PRO ($4.99/month or $29.99/year): Voltage Drop, Conduit Fill, Box Fill, future calculators

-----

## Tech Stack

- **Framework:** Expo SDK 54+ (managed workflow)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based routing with tabs)
- **UI:** React Native core components + custom styled components (no external UI library needed — utility app, clean & minimal)
- **State:** React Context for pro/free status, useState for calculator inputs
- **Payments:** RevenueCat (`react-native-purchases`) — free up to $2,500/month revenue
- **Offline:** All calculations are pure TypeScript functions using bundled JSON data. Zero network calls.
- **Build/Deploy:** EAS Build + EAS Submit
- **Analytics:** Expo Analytics (free tier) — track which calculators are used most

-----

## Project Structure

```
cec-calc-pro/
├── app/
│   ├── _layout.tsx              # Root layout with RevenueCat provider
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator layout
│   │   ├── index.tsx            # Home / Wire Sizing Calculator (FREE)
│   │   ├── converter.tsx        # Imperial/Metric Converter (FREE)
│   │   ├── voltage-drop.tsx     # Voltage Drop Calculator (PRO)
│   │   ├── conduit-fill.tsx     # Conduit Fill Calculator (PRO)
│   │   └── box-fill.tsx         # Box Fill Calculator (PRO)
│   └── paywall.tsx              # RevenueCat paywall screen
├── components/
│   ├── CalculatorCard.tsx       # Reusable input/output card
│   ├── ResultDisplay.tsx        # Styled result with CEC rule reference
│   ├── ProBadge.tsx             # Lock icon overlay for pro features
│   ├── PickerSelect.tsx         # Styled dropdown picker
│   └── NumberInput.tsx          # Numeric input with validation
├── data/
│   ├── cec-tables.ts            # All CEC 2021 ampacity & reference tables
│   ├── conduit-data.ts          # Conduit & wire cross-section areas
│   └── box-fill-data.ts        # Box fill allowances per CEC
├── utils/
│   ├── wire-sizing.ts           # Wire sizing calculation logic
│   ├── voltage-drop.ts          # Voltage drop calculation logic
│   ├── conduit-fill.ts          # Conduit fill calculation logic
│   ├── box-fill.ts              # Box fill calculation logic
│   ├── conversions.ts           # Imperial/Metric conversion functions
│   └── format.ts                # Number formatting helpers
├── hooks/
│   ├── useProStatus.ts          # RevenueCat subscription check
│   └── useCalculation.ts        # Generic calculation state handler
├── constants/
│   ├── colors.ts                # App color palette
│   └── typography.ts            # Font sizes and weights
├── app.json                     # Expo config
├── eas.json                     # EAS Build profiles
└── package.json
```

-----

## Design Guidelines

**Visual Style:** Professional utility tool. Think “digital multimeter” not “social media app.”

- **Color palette:**
  - Primary: `#1B5E20` (dark green — electrical safety/go color)
  - Accent: `#FFC107` (amber — caution/attention, used for results)
  - Background: `#121212` (dark mode default — easier on eyes in dim job site conditions)
  - Surface: `#1E1E1E` (card backgrounds)
  - Text Primary: `#FFFFFF`
  - Text Secondary: `#B0BEC5`
  - Error: `#EF5350`
  - Pro Badge: `#FFD700` (gold lock icon)
- **Dark mode only** — electricians work in basements, attics, mechanical rooms. Light mode is blinding.
- **Typography:** System default (San Francisco on iOS, Roboto on Android). Large touch targets (minimum 48x48dp). Input fields should be extra large for gloved fingers.
- **No animations or transitions** — this is a tool, speed matters. Calculations should appear instantly.
- **Each calculator screen follows the same layout pattern:**
1. Header with calculator name + CEC rule reference
1. Input section (dropdowns and number inputs)
1. “Calculate” button (prominent, full width)
1. Result section (large, high-contrast amber text on dark background)
1. CEC rule citation at bottom (e.g., “Per CEC 2021 Table 2, Rule 4-004”)

-----

## App Configuration

### app.json

```json
{
  "expo": {
    "name": "CEC Calc Pro",
    "slug": "cec-calc-pro",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "cec-calc-pro",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "ios": {
      "bundleIdentifier": "com.ceccalcpro.app",
      "supportsTablet": true,
      "buildNumber": "1"
    },
    "android": {
      "package": "com.ceccalcpro.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1B5E20"
      },
      "versionCode": 1
    },
    "plugins": [
      "expo-router",
      ["react-native-purchases", {}]
    ]
  }
}
```

### eas.json

```json
{
  "cli": { "version": ">= 7.3.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "APPLE_ID_HERE",
        "ascAppId": "ASC_APP_ID_HERE"
      }
    }
  }
}
```

-----

## CEC 2021 Reference Data

### Table 2 — Ampacity of Copper Conductors (Amps)

These are the core ampacity values from CEC 2021 Table 2 (25th Edition, CSA C22.1:21, harmonized with NEC). The app uses these for wire sizing.

**Sources:** electdesign.ca (CEC Table 1&2 reference), IAEI Magazine (Rule 4-006 article confirming #3 AWG = 115A at 90°C, #3/0 = 225A at 90°C), AES Engineering (CEC Rule 4-006 application).

**Copper conductors, not more than 3 in raceway/cable (30°C ambient):**

|AWG/kcmil|60°C (TW)|75°C (T90 Nylon)|90°C (RW90 XLPE)|
|---------|---------|----------------|----------------|
|14       |15       |20              |25              |
|12       |20       |25              |30              |
|10       |30       |35              |40              |
|8        |40       |50              |55              |
|6        |55       |65              |75              |
|4        |70       |85              |95              |
|3        |85       |100             |115             |
|2        |95       |115             |130             |
|1        |110      |130             |145             |
|1/0      |125      |150             |170             |
|2/0      |145      |175             |195             |
|3/0      |165      |200             |225             |
|4/0      |195      |230             |260             |
|250      |215      |255             |290             |
|300      |240      |285             |320             |
|350      |260      |310             |350             |
|400      |280      |335             |380             |
|500      |320      |380             |430             |
|600      |355      |420             |475             |
|750      |400      |475             |535             |
|1000     |455      |545             |615             |

**IMPORTANT — Rule 4-006 Termination Temperature:**
Even when using 90°C rated conductors (RW90, T90), the ampacity must be selected from the 75°C column if equipment terminations are rated 75°C (which is most common for equipment ≤600V). The 90°C column is primarily used for DERATING purposes (applying Table 5A ambient temp correction or Table 5C conductor bundling factors to a higher base ampacity). The app should warn users about this with a note on the wire sizing screen.

**Overcurrent Protection Limits (regardless of table ampacity):**

- 14 AWG: max 15A overcurrent device
- 12 AWG: max 20A overcurrent device
- 10 AWG: max 30A overcurrent device

**Aluminum conductors, not more than 3 in raceway/cable (30°C ambient):**

|AWG/kcmil|60°C (TW)|75°C (T90 Nylon)|90°C (RW90 XLPE)|
|---------|---------|----------------|----------------|
|12       |15       |20              |25              |
|10       |25       |30              |35              |
|8        |30       |40              |45              |
|6        |40       |50              |60              |
|4        |55       |65              |75              |
|3        |65       |75              |85              |
|2        |75       |90              |100             |
|1        |85       |100             |115             |
|1/0      |100      |120             |135             |
|2/0      |115      |135             |150             |
|3/0      |130      |155             |175             |
|4/0      |150      |180             |205             |
|250      |170      |205             |230             |
|300      |190      |230             |255             |
|350      |210      |250             |280             |
|400      |225      |270             |305             |
|500      |260      |310             |350             |
|600      |285      |340             |385             |
|750      |320      |385             |435             |
|1000     |375      |445             |500             |

### Table 5A — Correction Factors for Ambient Temperature

**NOTE: This is CEC Table 5A, NOT Table 5C.** Table 5A provides ambient temperature correction factors for Tables 1, 2, 3, and 4. (Table 5C is for conductor bundling derating — see below.)

When ambient temperature differs from 30°C, multiply ampacity by:

|Ambient Temp (°C)|60°C Conductor|75°C Conductor|90°C Conductor|
|-----------------|--------------|--------------|--------------|
|10 or less       |1.29          |1.20          |1.15          |
|11-20            |1.22          |1.15          |1.12          |
|21-25            |1.08          |1.05          |1.04          |
|26-30            |1.00          |1.00          |1.00          |
|31-35            |0.91          |0.94          |0.96          |
|36-40            |0.82          |0.88          |0.91          |
|41-45            |0.71          |0.82          |0.87          |
|46-50            |0.58          |0.75          |0.82          |
|51-55            |0.41          |0.67          |0.76          |
|56-60            |—             |0.58          |0.71          |
|61-70            |—             |0.33          |0.58          |
|71-80            |—             |—             |0.41          |

**Source:** CEC 2021 Table 5A (harmonized with NEC Table 310.15(B)(2)(a)). Confirmed by AES Engineering article on Rule 4-006: 90°C conductor at 40°C ambient = 0.91 correction factor.

### Table 5C — Derating Factors for More Than 3 Conductors in Raceway/Cable

**NOTE: This is CEC Table 5C, NOT Table 5D.** Table 5C provides ampacity correction factors for Tables 2 and 4 when more than 3 current-carrying conductors are in a raceway or cable. (CEC Table 5D is for cable tray installations only.)

**Source:** CEC 2021 Rule 4-004(1)(c), Table 5C. Confirmed by Dakota Prep Red Seal exam guide: 7 conductors = 0.70 factor.

|Number of Conductors|Derating Factor|
|--------------------|---------------|
|4–6                 |0.80           |
|7–24                |0.70           |
|25–42               |0.60           |
|43+                 |0.50           |

**Note:** Per CEC Rule 4-004(3), a neutral carrying only the unbalanced current is NOT counted as a current-carrying conductor for derating purposes.

### Voltage Drop Calculation (CEC Rule 8-102)

CEC recommends max 3% voltage drop for branch circuits, 5% total (feeder + branch).

**Formula:**

```
Single Phase:  Vd = (2 × K × I × L) / A
Three Phase:   Vd = (1.732 × K × I × L) / A

Where:
  Vd = Voltage drop (volts)
  K  = Resistivity constant
       Copper at 75°C: 12.9 (ohm·cmil/ft) or 0.0214 (ohm·mm²/m)
       Aluminum at 75°C: 21.2 (ohm·cmil/ft) or 0.0352 (ohm·mm²/m)
  I  = Current in amperes
  L  = One-way length of conductor (feet or meters)
  A  = Cross-sectional area of conductor (cmil or mm²)

Percentage: Vd% = (Vd / V_source) × 100
```

**Wire cross-sectional areas:**

|AWG|Area (cmil)|Area (mm²)|
|---|-----------|----------|
|14 |4,110      |2.08      |
|12 |6,530      |3.31      |
|10 |10,380     |5.26      |
|8  |16,510     |8.37      |
|6  |26,240     |13.30     |
|4  |41,740     |21.15     |
|3  |52,620     |26.67     |
|2  |66,360     |33.62     |
|1  |83,690     |42.41     |
|1/0|105,600    |53.49     |
|2/0|133,100    |67.43     |
|3/0|167,800    |85.01     |
|4/0|211,600    |107.2     |
|250|250,000    |126.7     |
|300|300,000    |152.0     |
|350|350,000    |177.3     |
|400|400,000    |202.7     |
|500|500,000    |253.4     |

### Conduit Fill (CEC Rule 12-910, Table 8)

**Source:** CEC 2021 Rule 12-910, Table 8. Cross-verified against IAEI Magazine (2021 CEC updates article), Electrical Industry News Week (CEC Tables guide), and Nexans Canada Electrician’s Handbook.

**Maximum fill percentages (CEC Table 8):**

|Number of Conductors|Max Fill %|
|--------------------|----------|
|1                   |53%       |
|2                   |31%       |
|3 or more           |40%       |

**How conduit fill calculation works in CEC 2021:**

1. Look up wire cross-sectional area in **Table 6** (6A through 6K, by insulation type)
1. Sum total wire area: Σ(wire_area_mm² × quantity)
1. Look up conduit cross-sectional area in **Table 9** (9A through 9P, by conduit type)
1. Determine max fill % from **Table 8** based on number of conductors
1. Compare: total_wire_area ≤ conduit_area × fill_%

**Key CEC 2021 Table restructuring:** Tables 6A-6K now provide mm² area of single conductors/cables (previously provided max conductor counts). Tables 9A-9P provide conduit internal cross-sectional areas at various fill percentages (100%, 53%, 31%, 40%). Tables 10A-10D provide additional conductor dimensions for specialized cable types.

**Conduit internal areas (approximate — Trade Size → mm²):**

**⚠️ VERIFICATION REQUIRED:** The values below are approximations. The developer MUST verify against actual CEC 2021 Table 9 values before publishing. CEC metric values may differ from NEC imperial-to-metric conversions. Consider purchasing the Nexans Canada Electrician’s Handbook as a low-cost reference.

|Trade Size|EMT (mm²)|Rigid PVC (mm²)|Rigid Metal (mm²)|
|----------|---------|---------------|-----------------|
|1/2”      |161      |141            |161              |
|3/4”      |283      |252            |283              |
|1”        |490      |440            |490              |
|1-1/4”    |684      |620            |684              |
|1-1/2”    |916      |838            |916              |
|2”        |1534     |1413           |1534             |
|2-1/2”    |2165     |2010           |2165             |
|3”        |3356     |3137           |3356             |
|3-1/2”    |4560     |4282           |4560             |
|4”        |5901     |5565           |5901             |

**Wire outer diameter areas (with insulation):**

**⚠️ VERIFICATION REQUIRED:** CEC 2021 uses Tables 6A through 6K for wire/cable dimensions (referenced by Rule 12-910). Table 6A covers R90XLPE/RW75XLPE/RW90XLPE unjacketed 600V. Table 6J covers TW/TW75. Table 6K covers TWN75/T90 Nylon. The values below are approximations — verify against actual CEC 2021 Table 6 values before publishing.

|AWG|T90 Nylon (mm²)|RW90 XLPE (mm²)|
|---|---------------|---------------|
|14 |8.97           |13.85          |
|12 |11.68          |17.34          |
|10 |18.10          |24.52          |
|8  |23.09          |36.17          |
|6  |33.17          |47.77          |
|4  |48.07          |62.77          |
|3  |56.06          |73.94          |
|2  |62.77          |81.07          |
|1  |81.07          |101.3          |
|1/0|95.60          |119.7          |
|2/0|112.9          |137.0          |
|3/0|131.9          |158.6          |
|4/0|154.1          |180.7          |

### Box Fill (CEC Rule 12-3034, Tables 22 & 23)

**Volume allowance per conductor (CEC Table 22):**

**Source:** CEC 2021 Table 22, cross-verified against Offset Notes CEC Box Fill Calculator (built by 25-year master electrician), Electrician Talk forum calculations, and DIY Home Improvement Forum CEC discussions.

|AWG|Volume per Conductor (mL / cm³)|
|---|-------------------------------|
|14 |24.6                           |
|12 |28.7                           |
|10 |36.9                           |
|8  |45.1                           |
|6  |73.7                           |

**⚠️ NOTE:** These are CEC Table 22 values (metric). They differ significantly from NEC Table 314.16(B) values (e.g., NEC #14 = 32.8 cm³ vs CEC #14 = 24.6 mL). Do NOT use NEC values.

**Conductor counting rules (CEC 12-3034):**

Per Rule 12-3034(1) — Conductors to count:

- Each insulated conductor entering the box = 1 conductor volume
- Each pass-through conductor (not spliced, not terminated) = **1 conductor** (not 2)
- Pigtails originating inside the box that do not leave = **do NOT count**
- Fixture wires (No. 18 and No. 16 AWG supplying a luminaire on the box) = **do NOT count**
- Bare bonding conductors = **do NOT count** (rule says “insulated conductors”)

Per Rule 12-3034(2) — Additional allowances to ADD (reduce available conductor count):

- (a) Fixture stud or hickey: **1 conductor** volume for each stud/hickey (based on largest wire)
- (b) Wire connectors with insulating caps: **1 conductor** volume for every PAIR of connectors (no deduction for 1 connector; 2-3 connectors = deduct 1; 4-5 connectors = deduct 2; etc.) — based on largest wire terminated under the connector
- (c) Flush-mounted device on single strap: **2 conductors** volume per device (based on largest wire connected to that device)

Per Rule 12-3034(3) — Deep device rule:

- Devices with >2.54 cm (1 inch) between mounting strap and back of device:
- Reduce total usable space by: **82 cm³ × depth(cm) ÷ 2.54** (simplified: ~32 cm³ × depth in cm)
- Applies to GFCIs, smart switches, dimmers, and other oversized devices

Per Rule 12-3034(5) — Box volume:

- Total usable space = internal volume of the box
- Disregard space occupied by locknuts, bushings, box connectors, or clamps

**Equipment grounding conductors (EGCs):**

- All EGCs in a box = **1 conductor** volume total, based on the largest EGC present
- Example: 4× #14 grounds + 2× #12 grounds = 1× 28.7 mL (not six separate entries)

**⚠️ CEC vs NEC KEY DIFFERENCE:** CEC does NOT have a separate “cable clamp” allowance like NEC 314.16(B)(2). CEC Rule 12-3034(5) says to disregard space occupied by clamps.

-----

## Calculator Specifications

### 1. Wire Sizing Calculator (FREE)

**Inputs:**

- Material: Copper / Aluminum (dropdown)
- Insulation Type: 60°C (TW) / 75°C (T90 Nylon) / 90°C (RW90 XLPE) (dropdown)
- Required Ampacity: number input (amps)
- Ambient Temperature: dropdown (10°C to 60°C in 5°C steps, default 30°C)
- Number of current-carrying conductors in raceway: dropdown (3, 4-6, 7-24, 25-42, 43+)

**Calculation Logic:**

1. Get ambient temperature correction factor from Table 5A
1. Get derating factor from Table 5C (if >3 conductors)
1. Required ampacity after adjustments = Input Amps / (temp_factor × derate_factor)
1. Look up Table 2 for smallest wire size where ampacity >= adjusted requirement
1. **Apply Rule 4-006:** If termination temperature is 75°C (default for most equipment), use the 75°C ampacity column for final sizing, but use 90°C column as starting point for derating calculations

**Output:**

- Recommended wire size (AWG/kcmil)
- Ampacity of selected wire at rated temperature
- Adjusted ampacity after correction factors
- CEC rule references: “Per CEC 2021 Table 2, Table 5A, Table 5C, Rule 4-006”

### 2. Imperial/Metric Converter (FREE)

**Conversion categories:**

- Length: inches ↔ mm, feet ↔ meters, yards ↔ meters
- Area: sq ft ↔ sq m, sq in ↔ sq cm
- Volume: cubic ft ↔ cubic m, gallons (Imperial) ↔ liters
- Weight: pounds ↔ kg
- Temperature: °F ↔ °C
- Electrical: cmil ↔ mm² (critical for CEC work)
- Pipe/Conduit: trade sizes with actual dimensions

**Implementation:** Bidirectional — user types in either field, other updates instantly (no “Calculate” button needed for converter).

### 3. Voltage Drop Calculator (PRO)

**Inputs:**

- System Type: Single Phase / Three Phase (dropdown)
- Source Voltage: number (volts, common defaults: 120, 208, 240, 347, 480, 600)
- Conductor Material: Copper / Aluminum (dropdown)
- Wire Size: dropdown of all AWG/kcmil sizes
- Load Current: number (amps)
- One-Way Distance: number (meters or feet, with unit toggle)
- Number of parallel conductors per phase: dropdown (1, 2, 3, 4)

**Calculation Logic:**

1. Get wire cross-sectional area from lookup table
1. If parallel conductors > 1, multiply area by count
1. Apply voltage drop formula (single or three phase)
1. Calculate percentage: Vd% = (Vd / V_source) × 100
1. Flag if > 3% (branch) or > 5% (total)

**Output:**

- Voltage drop in volts
- Voltage drop percentage
- Voltage at load end
- Pass/Fail indicator (green ≤3%, amber 3-5%, red >5%)
- Maximum recommended distance for this wire size (reverse calculation)
- CEC rule reference: “Per CEC 2021 Rule 8-102”

### 4. Conduit Fill Calculator (PRO)

**Inputs:**

- Conduit Type: EMT / Rigid PVC / Rigid Metal (dropdown)
- Conduit Trade Size: dropdown (1/2” through 4”)
- Wire entries: repeatable row with:
  - Wire Size (AWG dropdown)
  - Insulation Type (T90 Nylon / RW90 XLPE)
  - Quantity (number input)
- “Add Wire” button to add more rows

**Calculation Logic:**

1. Sum total wire area: Σ(wire_area × quantity) for each wire entry
1. Determine number of conductors for fill percentage rule
1. Get conduit internal area
1. Calculate: fill% = (total_wire_area / conduit_area) × 100
1. Compare against max fill percentage

**Output:**

- Total wire area (mm²)
- Conduit internal area (mm²)
- Fill percentage
- Maximum allowed fill percentage
- Pass/Fail indicator
- Remaining capacity (mm² available)
- CEC rule reference: “Per CEC 2021 Rule 12-910, Tables 6/8/9”

**Note on CEC 2021 Table restructuring:** Tables 6A-6K provide wire/cable cross-sectional areas (mm²). Tables 9A-9P provide conduit internal areas at various fill percentages (100%, 53%, 31%, 40%). Table 8 provides maximum fill percentages. Rule 12-910 is the general conduit fill rule; Rule 12-1014 applies specifically to rigid metal conduit.

### 5. Box Fill Calculator (PRO)

**Inputs:**

- Wire entries: for each wire size (14, 12, 10, 8, 6):
  - Insulated wires entering box: number
  - Pass-through wires (not spliced/terminated): number
- Number of wire connector pairs (marrettes): number (uses largest wire terminated)
- Number of devices (switches/receptacles): number (uses largest wire connected to each)
- Number of fixture studs/hickeys: number (uses largest wire)
- Equipment grounding conductors: checkbox per size present (all count as 1 based on largest)
- Deep device present: Yes/No (if Yes, input depth in cm)

**Calculation Logic (CEC Rule 12-3034, Table 22):**

1. Count insulated conductors entering box (1 volume each)
1. Count pass-through conductors (1 volume each, NOT 2)
1. Pigtails and bare bonds do NOT count
1. Add 1 conductor volume per pair of wire connectors (based on largest wire)
1. Add 1 conductor volume per fixture stud/hickey (based on largest wire)
1. Add 2 conductor volumes per flush device (based on largest wire connected)
1. Add 1 conductor volume for all EGCs combined (based on largest EGC)
1. Multiply each count by CEC Table 22 volume for that wire size
1. Sum total required volume (mL)
1. If deep device: reduce box usable space by 82 cm³ × depth(cm) ÷ 2.54
1. Compare against CEC Table 23 standard box sizes

**Output:**

- Itemized volume breakdown (mL)
- Total required volume (mL / cm³)
- Common standard box sizes that meet requirement (from Table 23)
- Pass/Fail indicator
- CEC rule reference: “Per CEC 2021 Rule 12-3034, Table 22”

-----

## RevenueCat Integration

### Setup

```bash
npx expo install react-native-purchases
```

### Configuration

Create RevenueCat account → Add App (iOS + Android) → Create:

- Product: `cec_calc_pro_monthly` ($4.99/month)
- Product: `cec_calc_pro_annual` ($29.99/year)
- Entitlement: `pro`
- Offering: `default` containing both products

### Implementation Pattern

```typescript
// In app/_layout.tsx — initialize on app start
import Purchases from 'react-native-purchases';

Purchases.configure({
  apiKey: Platform.OS === 'ios' 
    ? 'appl_XXXXXXX'  // iOS API key from RevenueCat
    : 'goog_XXXXXXX', // Android API key from RevenueCat
});

// Hook: useProStatus.ts
export function useProStatus() {
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    const checkStatus = async () => {
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPro(customerInfo.entitlements.active['pro'] !== undefined);
    };
    checkStatus();
    // Also listen for updates
    Purchases.addCustomerInfoUpdateListener(checkStatus);
  }, []);
  
  return isPro;
}

// Paywall trigger — wrap PRO calculator screens
if (!isPro) {
  navigation.navigate('paywall');
  return;
}
```

### Paywall Screen Design

- Show all 5 calculator icons (free ones with checkmark, pro ones with lock)
- “Unlock All Calculators” header
- Two pricing cards: Monthly ($4.99) and Annual ($29.99 — “Save 50%”)
- “Restore Purchases” link at bottom
- “7-Day Free Trial” if configured in App Store Connect / Google Play Console

-----

## App Store Optimization (ASO)

### App Store Listing

**Title:** CEC Calc Pro — Electrical Code Calculator

**Subtitle (iOS) / Short Description (Android):**
“Canadian Electrical Code 2021 Wire Sizing & Voltage Drop”

**Keywords (iOS, 100 char max):**
`CEC,electrical,calculator,wire,sizing,voltage,drop,conduit,fill,Canadian,code,electrician,ampacity`

**Description:**
Focus on these pain points in the first 3 lines:

1. Works offline — no internet needed on job sites
1. CEC 2021 compliant — not NEC, specifically Canadian code
1. No ads — ever. Clean professional tool.

**Category:** Utilities (primary), Productivity (secondary)

**Screenshots:** Show each calculator with realistic values. Dark background. Include “OFFLINE” and “CEC 2021” badges on screenshots.

-----

## Marketing Channels (Post-Launch)

1. **Reddit:** r/electricians (77K+), r/electrical, r/canadianelectricians
1. **Electrician Talk forum:** Canadian subforum — active community of CEC users
1. **Facebook Groups:** Ontario/Alberta/BC electrical apprentice groups
1. **Trade schools:** Toronto has George Brown, Humber, Centennial with electrical programs
1. **YouTube Shorts:** “CEC wire sizing in 3 seconds” demo videos

-----

## Commands Reference

```bash
# Create project
npx create-expo-app cec-calc-pro --template tabs

# Install dependencies
npx expo install react-native-purchases
npx expo install react-native-purchases-ui  # optional: pre-built paywall UI components
npx expo install expo-haptics  # tactile feedback on calculate button

# Development
npx expo start

# Build for stores
eas build --platform all --profile production

# Submit
eas submit --platform android
eas submit --platform ios
```

-----

## IMPORTANT NOTES

- **All CEC table data in this file is based on CEC 2021 (CSA C22.1:21, 25th Edition).** The Table 2 ampacity values have been cross-verified against electdesign.ca (Canadian electrical design reference), IAEI Magazine articles on Rule 4-006, AES Engineering publications, and Texcan cable sizing article. The 90°C column reflects post-harmonization values (aligned with NEC Table 310.16).
- **Table 5A (ambient temp correction) and Table 5C (conductor bundling derating) have been verified.** Note: CEC Table 5D is for cable tray installations only, NOT for raceway derating.
- **Box fill data uses CEC Table 22 values (Rule 12-3034), NOT NEC Table 314.16(B).** CEC volumes are in mL/cm³ and differ significantly from NEC cubic inch values. Counting rules verified against Offset Notes CEC Box Fill Calculator and Electrician Talk forum discussions.
- **Conduit fill uses CEC Rule 12-910, Tables 6/8/9.** Conduit internal areas (Table 9) and wire outer diameters (Table 6) are approximations. CEC 2021 restructured these tables significantly. The developer MUST verify against the actual CEC 2021 code book (Tables 6A-6K and 9A-9P) before publishing. Consider purchasing the Nexans Canada Electrician’s Handbook as a low-cost reference.
- **Rule 4-006 (Termination Temperature) is critical for practical accuracy.** Most equipment ≤600V is rated for 75°C terminations. The app should default to 75°C column for wire sizing and clearly explain when the 90°C column applies (derating calculations only).
- **The app must include a disclaimer:** “This app is a calculation aid only. Always verify calculations against the official Canadian Electrical Code. Not a substitute for professional engineering judgment.”
- **Do NOT include copyrighted CEC table reproductions in the app.** The calculation results are derived from standard electrical engineering formulas. The app performs calculations — it does not reproduce the code book.
- **RevenueCat API keys are placeholders.** Replace with actual keys from RevenueCat dashboard after creating the project there.
- **Test all calculations against known CEC examples** before submitting to stores. Recommended test cases:
1. #3 AWG copper at 90°C → Should show 115A (confirms harmonized values)
1. #3/0 AWG copper at 75°C → Should show 200A
1. 90°C conductor at 40°C ambient → correction factor should be 0.91
1. 7 conductors in raceway → derating factor should be 0.70
1. Box fill: 6× #12-2C + 3 marrette pairs → 12 × 28.7 + 3 × 28.7 = 430.5 mL (CEC Table 22)
1. Conduit fill: 3× #10 RW90XLPE in ½” EMT → Check against Table 6A + Table 9G
