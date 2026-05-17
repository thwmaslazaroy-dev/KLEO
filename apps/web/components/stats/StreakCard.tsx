interface StreakCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: string
  icon: string
}

export default function StreakCard({ label, value, sub, accent = '#2BB8B8', icon }: StreakCardProps) {
  return (
    <div className="bg-bg-elevated rounded-2xl p-4 border border-white/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted mb-1">{label}</p>
          <p className="text-3xl font-heading font-bold" style={{ color: accent }}>{value}</p>
          {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}
