import { Tabs } from 'expo-router'

const C = {
  bg: '#141E2E',
  elevated: '#1E2D42',
  coral: '#E8523A',
  muted: '#9AA5B8',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.elevated,
          borderTopColor: C.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: C.coral,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Σήμερα',   tabBarIcon: ({ color }) => <TabIcon icon="☀️" color={color} /> }} />
      <Tabs.Screen name="tasks"    options={{ title: 'Tasks',    tabBarIcon: ({ color }) => <TabIcon icon="✅" color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Ημερολόγιο', tabBarIcon: ({ color }) => <TabIcon icon="📅" color={color} /> }} />
      <Tabs.Screen name="notes"    options={{ title: 'Σημειώσεις', tabBarIcon: ({ color }) => <TabIcon icon="📝" color={color} /> }} />
      <Tabs.Screen name="thoughts" options={{ title: 'Σκέψεις',    tabBarIcon: ({ color }) => <TabIcon icon="💭" color={color} /> }} />
      <Tabs.Screen name="journal"  options={{ title: 'Ημερολόγιο', tabBarIcon: ({ color }) => <TabIcon icon="📔" color={color} /> }} />
      <Tabs.Screen name="goals"    options={{ title: 'Στόχοι',   tabBarIcon: ({ color }) => <TabIcon icon="🎯" color={color} /> }} />
      <Tabs.Screen name="alarms"   options={{ title: 'Ξυπνητήρια', tabBarIcon: ({ color }) => <TabIcon icon="⏰" color={color} /> }} />
    </Tabs>
  )
}

function TabIcon({ icon, color: _color }: { icon: string; color: string }) {
  const { Text } = require('react-native')
  return <Text style={{ fontSize: 18 }}>{icon}</Text>
}
