type Props = {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}

export default function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-neutral-500 hover:text-neutral-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}