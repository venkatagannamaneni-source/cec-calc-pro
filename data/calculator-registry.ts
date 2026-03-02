import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type AppIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface CalculatorDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: AppIconName;
  cecReference: string;
  tier: 'free' | 'pro';
  category: CalculatorCategory;
}

export type CalculatorCategory =
  | 'wire-cable'
  | 'raceway-enclosures'
  | 'utilities';

export interface ComingSoonDefinition {
  id: string;
  name: string;
  description: string;
  icon: AppIconName;
}

export const CALCULATORS: CalculatorDefinition[] = [
  {
    id: 'wire-sizing',
    name: 'Wire Sizing Calculator',
    shortName: 'Wire Sizing',
    description: 'Find the right conductor for your load with temperature derating',
    icon: 'lightning-bolt',
    cecReference: 'CEC 2021 Table 2, Rule 4-004, Rule 4-006',
    tier: 'free',
    category: 'wire-cable',
  },
  {
    id: 'voltage-drop',
    name: 'Voltage Drop Calculator',
    shortName: 'Voltage Drop',
    description: 'Calculate voltage drop for branch circuits and feeders',
    icon: 'chart-line-variant',
    cecReference: 'CEC 2021 Rule 8-102',
    tier: 'pro',
    category: 'wire-cable',
  },
  {
    id: 'conduit-fill',
    name: 'Conduit Fill Calculator',
    shortName: 'Conduit Fill',
    description: 'Verify conductor fill percentage in raceways',
    icon: 'pipe',
    cecReference: 'CEC 2021 Rule 12-910, Table 8',
    tier: 'pro',
    category: 'raceway-enclosures',
  },
  {
    id: 'box-fill',
    name: 'Box Fill Calculator',
    shortName: 'Box Fill',
    description: 'Calculate junction box volume requirements',
    icon: 'cube-outline',
    cecReference: 'CEC 2021 Rule 12-3034, Table 22',
    tier: 'pro',
    category: 'raceway-enclosures',
  },
  {
    id: 'converter',
    name: 'Unit Converter',
    shortName: 'Converter',
    description: 'Length, area, volume, weight, temperature, electrical conversions',
    icon: 'swap-horizontal',
    cecReference: '',
    tier: 'free',
    category: 'utilities',
  },
];

export const COMING_SOON: ComingSoonDefinition[] = [
  { id: 'motor-load', name: 'Motor Load Calculator', description: 'Motor FLC, overload, and branch circuit protection', icon: 'engine' },
  { id: 'demand-load', name: 'Demand Load Calculator', description: 'Residential & commercial demand load calculations', icon: 'home-lightning-bolt' },
  { id: 'service-size', name: 'Service Size Calculator', description: 'Service entrance sizing per CEC', icon: 'transmission-tower' },
  { id: 'ground-conductor', name: 'Ground Conductor Sizing', description: 'Equipment grounding conductor sizing', icon: 'shield-check' },
];

export const CATEGORIES: { key: CalculatorCategory; label: string }[] = [
  { key: 'wire-cable', label: 'WIRE & CABLE' },
  { key: 'raceway-enclosures', label: 'RACEWAY & ENCLOSURES' },
  { key: 'utilities', label: 'UTILITIES' },
];

export function getCalculatorById(id: string): CalculatorDefinition | undefined {
  return CALCULATORS.find((c) => c.id === id);
}

export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorDefinition[] {
  return CALCULATORS.filter((c) => c.category === category);
}
