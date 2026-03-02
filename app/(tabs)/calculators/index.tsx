import React from 'react';
import { View, Text, SectionList, StyleSheet, Alert } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { CalculatorListItem } from '../../../components/CalculatorListItem';
import { SectionHeader } from '../../../components/SectionHeader';
import { Colors } from '../../../constants/colors';
import {
  CALCULATORS,
  COMING_SOON,
  CATEGORIES,
  type CalculatorDefinition,
  type ComingSoonDefinition,
} from '../../../data/calculator-registry';

type SectionItem =
  | { type: 'calculator'; data: CalculatorDefinition }
  | { type: 'coming-soon'; data: ComingSoonDefinition };

interface Section {
  title: string;
  data: SectionItem[];
}

function buildSections(): Section[] {
  const sections: Section[] = CATEGORIES.map((cat) => ({
    title: cat.label,
    data: CALCULATORS
      .filter((c) => c.category === cat.key)
      .map((c) => ({ type: 'calculator' as const, data: c })),
  })).filter((s) => s.data.length > 0);

  if (COMING_SOON.length > 0) {
    sections.push({
      title: 'COMING SOON',
      data: COMING_SOON.map((c) => ({ type: 'coming-soon' as const, data: c })),
    });
  }

  return sections;
}

function renderListItem(
  item: SectionItem,
  onNavigate: (id: string) => void,
  onComingSoon: () => void,
): React.ReactElement {
  if (item.type === 'coming-soon') {
    return (
      <CalculatorListItem
        name={item.data.name}
        description={item.data.description}
        icon={item.data.icon}
        cecReference=""
        tier="coming-soon"
        onPress={onComingSoon}
      />
    );
  }

  const calc = item.data as CalculatorDefinition;
  return (
    <CalculatorListItem
      name={calc.name}
      description={calc.description}
      icon={calc.icon}
      cecReference={calc.cecReference}
      tier={calc.tier}
      onPress={() => onNavigate(calc.id)}
    />
  );
}

export default function CalculatorsDirectoryScreen(): React.ReactElement {
  const router = useRouter();
  const sections = buildSections();

  function navigateToCalculator(id: string): void {
    router.push(`/calculators/${id}` as Href);
  }

  function handleComingSoon(): void {
    Alert.alert('Coming Soon', 'This calculator will be available in a future update.');
  }

  return (
    <SectionList
      sections={sections}
      style={styles.container}
      contentContainerStyle={styles.content}
      stickySectionHeadersEnabled
      keyExtractor={(item, index) => `${item.data.id}-${index}`}
      renderSectionHeader={({ section }) => (
        <SectionHeader title={section.title} />
      )}
      renderItem={({ item }) => renderListItem(item, navigateToCalculator, handleComingSoon)}
      ListFooterComponent={
        <Text style={styles.footer}>
          All calculations per CEC 2021
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 32 },
  footer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
