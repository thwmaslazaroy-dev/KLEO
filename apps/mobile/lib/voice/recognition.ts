import Voice from '@react-native-voice/voice'

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
}

export function setupVoice(
  onResult: (result: VoiceRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
) {
  Voice.onSpeechResults = (e) => {
    const value = e.value?.[0] ?? ''
    const confidence = (e as unknown as { confidence?: number }).confidence ?? 1
    if (value) onResult({ transcript: value, confidence })
  }
  Voice.onSpeechError = (e) => {
    onError(e.error?.message ?? 'Σφάλμα αναγνώρισης φωνής')
  }
  Voice.onSpeechEnd = onEnd
}

export async function startListening() {
  await Voice.start('el-GR')
}

export async function stopListening() {
  await Voice.stop()
}

export async function destroyVoice() {
  await Voice.destroy()
  Voice.removeAllListeners()
}
