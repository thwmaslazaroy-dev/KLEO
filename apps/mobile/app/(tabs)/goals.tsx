import { View, Text, StyleSheet } from 'react-native'

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Στόχοι</Text>
      <Text style={styles.sub}>Έρχεται στο Phase 3</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141E2E', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  sub: { fontSize: 14, color: '#9AA5B8' },
})
