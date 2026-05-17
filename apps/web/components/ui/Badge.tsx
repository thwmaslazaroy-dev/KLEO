import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'coral' | 'teal' | 'muted' | 'category'
  color?: string
  className?: string
}

export default function Badge({ children, variant = 'muted', color, className }: BadgeProps) {
  const styles: Record<string, string> = {
    coral: 'bg-coral/20 text-coral',
    teal: 'bg-teal/20 text-teal',
    muted: 'bg-white/10 text-muted',
    category: '',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        styles[variant],
        className
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  )
}
