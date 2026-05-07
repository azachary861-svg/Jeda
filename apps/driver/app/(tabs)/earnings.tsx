import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Hari ini</Text>
        <Text style={styles.value}>Rp 420.000</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Minggu ini</Text>
        <Text style={styles.value}>Rp 2.150.000</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  label: {
    opacity: 0.7,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
});
