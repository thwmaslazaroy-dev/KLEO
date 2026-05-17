import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-bg-elevated rounded-2xl border border-white/5 p-4',
        onClick && 'cursor-pointer hover:border-white/10 transition',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
