interface RolloverBadgeProps {
  days: number
}

export default function RolloverBadge({ days }: RolloverBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 bg-coral/20 text-coral text-xs px-2 py-0.5 rounded-md font-medium">
      +{days} {days === 1 ? 'μέρα' : 'μέρες'}
    </span>
  )
}
