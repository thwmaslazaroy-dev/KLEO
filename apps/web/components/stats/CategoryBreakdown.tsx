import { CATEGORIES } from '@kleo/shared'
import type { Category } from '@kleo/shared'

interface CategoryBreakdownProps {
  data: Record<string, number>
  total: number
}

export default function CategoryBreakdown({ data, total }: CategoryBreakdownProps) {
  return (
    <div className="bg-bg-elevated rounded-2xl p-4 border border-white/5">
      <h3 className="text-sm font-medium text-muted mb-4">Κατανομή ανά κατηγορία</h3>
      <div className="space-y-3">
        {(Object.keys(CATEGORIES) as Category[]).map(k => {
          const count = data[k] ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          const cat = CATEGORIES[k]
          return (
            <div key={k}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/80">{cat.emoji} {cat.label}</span>
                <span className="text-muted">{count} ({pct}%)</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
