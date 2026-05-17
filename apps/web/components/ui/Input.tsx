import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm text-muted">{label}</label>}
      <input
        className={clsx(
          'w-full bg-bg-elevated border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none transition text-sm',
          error ? 'border-coral focus:border-coral' : 'border-white/10 focus:border-teal',
          className
        )}
        {...props}
      />
      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  )
}
