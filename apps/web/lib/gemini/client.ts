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

  daily_brief: (ctx) => `Είσαι ο Kleo, ο προσωπικός βοηθός του Tommy. Τώρα γράφεις το πρωινό briefing.
Ξεκίνα με "Καλημέρα Tommy!" και μια ζεστή, προσωπική παρατήρηση βάσει των insights (π.χ. αν έχει πολλά overdue, αν η διάθεση ήταν καλή χθες).
Μετά αναφέρου στα overdue (έμφαση αν υπάρχουν), events σήμερα, και TOP 1 πράγμα να κάνει ΤΩΡΑ.
Τόνος: φίλος, όχι boss. Σύντομο (5-6 γραμμές). ΜΟΝΟ Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  weekly_review: (ctx) => `Είσαι ο Kleo. Γράφεις το εβδομαδιαίο review για τον Tommy.
Τόνος: ζεστός, ενθαρρυντικός. Γιόρταζε τα successes, μην κρίνεις τα fails — ο Tommy δεν χρειάζεται κριτική, χρειάζεται ενέργεια.
Δομή: 1) Τι πήγε καλά αυτή την εβδομάδα 2) Τι μεταφέρεται στην επόμενη 3) Ένα focus για την εβδομάδα που έρχεται.
8-10 γραμμές. ΜΟΝΟ Ελληνικά.
Context: ${JSON.stringify(ctx)}`,

  prioritize: (ctx) => `Είσαι ο Kleo. Βοήθα τον Tommy να επιλέξει τα 3 σημαντικότερα tasks για ΣΗΜΕΡΑ.
Λάβε υπόψη: την τρέχουσα βάρδια/ωράριο, τα overdue (προτεραιότητα!), την ενέργεια (βάσει mood insights), και τις deadlines.
Επέστρεψε ακριβώς 3 tasks με format:
1. [τίτλος task] — [1 πρόταση γιατί αυτό πρώτα]
2. ...
3. ...
Αν δεν υπάρχουν αρκετά tasks, πες το. ΜΟΝΟ Ελληνικά. Χωρίς εισαγωγή.
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
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY δεν έχει οριστεί στο .env.local')
  }

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
    const body = await res.text().catch(() => '')
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  return (data.choices?.[0]?.message?.content as string) ?? ''
}
