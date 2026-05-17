'use client'

interface DayBar {
  label: string
  completed: number
  total: number
}

interface WeeklyChartProps {
  data: DayBar[]
}

const DAY_SHORT = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ']

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(...data.map(d => d.total), 1)

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 border border-white/5">
      <h3 className="text-sm font-medium text-muted mb-4">Tasks ανά μέρα (τελευταίες 7 μέρες)</h3>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const totalH = (d.total / max) * 100
          const doneH = d.total > 0 ? (d.completed / d.total) * totalH : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end h-20 gap-0.5">
                <div
                  className="w-full rounded-t-sm bg-teal/80 transition-all"
                  style={{ height: `${doneH}%` }}
                  title={`${d.completed} ολοκληρώθηκαν`}
                />
                <div
                  className="w-full rounded-t-sm bg-white/10"
                  style={{ height: `${Math.max(0, totalH - doneH)}%` }}
                  title={`${d.total - d.completed} εκκρεμεί`}
                />
              </div>
              <span className="text-xs text-muted">{DAY_SHORT[i]}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <div className="w-3 h-3 rounded-sm bg-teal/80" />Ολοκληρώθηκαν
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <div className="w-3 h-3 rounded-sm bg-white/10" />Εκκρεμεί
        </div>
      </div>
    </div>
  )
}
