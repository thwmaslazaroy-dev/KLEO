import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import * as Crypto from 'expo-crypto'

const hash = (pin: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin)

export const setPIN = async (pin: string) =>
  SecureStore.setItemAsync('kleo_pin', await hash(pin))

export const hasPIN = async () =>
  !!(await SecureStore.getItemAsync('kleo_pin'))

export const verifyPIN = async (input: string): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync('kleo_pin')
  return !!stored && (await hash(input)) === stored
}

export const verifyBiometric = async (): Promise<boolean> => {
  if (!(await LocalAuthentication.hasHardwareAsync())) return false
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  if (!enrolled) return false

  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Kleo — Επιβεβαίωση ταυτότητας',
    fallbackLabel: 'Χρήση PIN',
  })
  return r.success
}

export const clearPIN = async () => SecureStore.deleteItemAsync('kleo_pin')
