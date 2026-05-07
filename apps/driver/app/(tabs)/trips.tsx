import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function TripsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trip Queue</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>BK-2026-00128</Text>
        <Text>Pickup: Malioboro 08:30</Text>
        <Text>Status: assigned</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>BK-2026-00131</Text>
        <Text>Pickup: Tugu 10:00</Text>
        <Text>Status: pending acceptance</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
