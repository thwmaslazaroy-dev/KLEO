export type AIRequestType =
  | 'chat'
  | 'daily_brief'
  | 'weekly_review'
  | 'prioritize'
  | 'draft_email'
  | 'parse_voice'

const PROMPTS: Record<AIRequestType, (ctx: object) => string> = {
  chat: (ctx) => `Είσαι ο Kleo, ο προσωπικός βοηθός του Tommy.
Ο Tommy είναι ξεχασιάρης με πολλές υποχρεώσεις — τον βοηθάς να μην χάνει τίποτα.
Είσαι φιλικός, άμεσος, σαν καλός φίλος. Ελληνικά πάντα. Σύντομος και πρακτικός.
Χρησιμοποίησε αυτά που ξέρεις για τον Tommy για να δίνεις προσωπικές απαντήσεις.
Context: ${JSON.stringify(ctx)}`,

  daily_brief: (ctx) => `Είσαι ο Kleo. Πρωινό briefing για τον Tommy.
Ξεκίνα "Καλημέρα Tommy!" + μια ζεστή προσωπική παρατήρηση βάσει των insights.
Μετά: overdue (με έμφαση), τι έχει σήμερα, TOP 1 πράγμα να κάνει πρώτο.
5-6 γραμμές max. Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  weekly_review: (ctx) => `Είσαι ο Kleo. Weekly review κάθε Κυριακή.
Τόνος: ζεστός, ενθαρρυντικός. Γιόρταζε τα successes, μην κρίνεις τα fails.
Δομή: τι πήγε καλά → τι μετακινείται → focus επόμενη εβδομάδα.
Ελληνικά. Context: ${JSON.stringify(ctx)}`,

  prioritize: (ctx) => `Είσαι ο Kleo. TOP 3 tasks για ΣΗΜΕΡΑ και γιατί.
Λάβε υπόψη το ωράριο και τα insights για τον Tommy.
Σύντομο, χωρίς φλυαρία. Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  draft_email: (ctx) => `Είσαι ο Kleo. Γράφεις email για τον Tommy.
Επαγγελματικό αλλά ζεστό ύφος. Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  parse_voice: (_ctx) => `Μετέτρεψε αυτή τη φωνητική εντολή σε JSON task.
Επέστρεψε ΜΟΝΟ JSON:
{"title":string,"category":"university"|"bills"|"projects"|"clients"|"misc","priority":"low"|"medium"|"high"|"urgent","due_date":"YYYY-MM-DD"|null,"reminder_at":"YYYY-MM-DDTHH:mm"|null}`,
}

export async function callGemini({
  type,
  userMessage,
  context = {},
}: {
  type: AIRequestType
  userMessage: string
  context?: object
}): Promise<string> {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'system', content: PROMPTS[type](context) },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1000,
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status}`)
  }

  const data = await res.json()
  return (data.choices?.[0]?.message?.content as string) ?? ''
}
