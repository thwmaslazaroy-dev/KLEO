import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected)
    })
    return unsub
  }, [])

  if (!offline) return null

  return (
    <View style={{ backgroundColor: 'rgba(245,158,11,0.1)', paddingVertical: 6, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(245,158,11,0.2)' }}>
      <Text style={{ color: '#fbbf24', fontSize: 12, textAlign: 'center' }}>
        Εκτός σύνδεσης — οι αλλαγές θα συγχρονιστούν αργότερα.
      </Text>
    </View>
  )
}
