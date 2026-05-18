export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6">
          <img src="/logo.svg" alt="Kleo" className="w-full h-full" />
        </div>
        <h1 className="text-xl font-heading font-bold mb-2">Χωρίς σύνδεση</h1>
        <p className="text-muted text-sm">Έλεγξε τη σύνδεσή σου και δοκίμασε ξανά.</p>
      </div>
    </main>
  )
}
