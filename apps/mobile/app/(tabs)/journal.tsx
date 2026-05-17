import { View, Text, StyleSheet } from 'react-native'

export default function JournalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📔 Ημερολόγιο</Text>
      <Text style={styles.sub}>Έρχεται στο Phase 2</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141E2E', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  sub: { fontSize: 14, color: '#9AA5B8' },
})
