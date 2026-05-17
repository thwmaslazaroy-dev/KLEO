interface ProgressBarProps {
  value: number
  color?: string
  size?: 'sm' | 'md'
}

export default function ProgressBar({ value, color = '#2BB8B8', size = 'md' }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={`w-full bg-white/10 rounded-full overflow-hidden ${h}`}>
      <div
        className={`${h} rounded-full transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  )
}
