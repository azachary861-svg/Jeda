import { StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Account</Text>
      <View style={styles.card}>
        <Text style={styles.name}>Budi Santoso</Text>
        <Text>Region: Jogja Hub</Text>
        <Text>Status: standby</Text>
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Set Status Offline</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  name: {
    fontWeight: '700',
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
});
