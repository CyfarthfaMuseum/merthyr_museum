type Props = {
  children: React.ReactNode
  onRemove: () => void
}

export default function Tag({ children, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-3 rounded-xl border border-neutral-500 bg-white px-4 py-2 text-[16px] text-neutral-700">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="text-[22px] leading-none text-neutral-700"
        aria-label={`Remove ${children}`}
      >
        ×
      </button>
    </span>
  )
}