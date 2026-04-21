type Props = {
  open: boolean
  message: string
  tone?: 'success' | 'error'
}

export default function Toast({ open, message, tone = 'success' }: Props) {
  if (!open || !message) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`min-w-[280px] rounded-2xl px-5 py-4 text-sm font-medium shadow-lg ${
          tone === 'success' ? 'bg-emerald-700 text-white' : 'bg-red-600 text-white'
        }`}
      >
        {message}
      </div>
    </div>
  )
}