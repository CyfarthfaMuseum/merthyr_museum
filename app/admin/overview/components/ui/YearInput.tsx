'use client'

const CURRENT_YEAR = new Date().getFullYear()

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function YearInput({ value, onChange, placeholder = 'YYYY', className = '' }: Props) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={4}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
        onChange(v)
      }}
      onBlur={(e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
        if (!v) return
        const padded = v.padStart(4, '0')
        const year = Number(padded)
        if (year > CURRENT_YEAR) {
          onChange(String(CURRENT_YEAR).padStart(4, '0'))
        } else {
          onChange(padded)
        }
      }}
      className={`bg-transparent text-sm focus:outline-none font-mono text-center ${className}`}
    />
  )
}
