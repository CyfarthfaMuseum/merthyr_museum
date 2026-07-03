import Select from '../ui/Select'
import YearInput from '../ui/YearInput'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export type DateRowProps = {
  label: string
  dayValue: string
  monthValue: string
  yearValue: string
  eraValue: 'AD' | 'BC'
  dayPlaceholder: string
  monthPlaceholder: string
  yearPlaceholder: string
  onDayChange: (v: string) => void
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
  onEraToggle: () => void
}

export default function DateRow({
  label, dayValue, monthValue, yearValue, eraValue,
  dayPlaceholder, monthPlaceholder, yearPlaceholder,
  onDayChange, onMonthChange, onYearChange, onEraToggle,
}: DateRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 text-sm font-medium text-neutral-600 shrink-0">{label}</span>
      <Select
        value={dayValue}
        onChange={(e) => onDayChange(e.target.value)}
        className="w-[90px]"
      >
        <option value="">{dayPlaceholder}</option>
        {DAYS.map((d) => (
          <option key={d} value={String(d)}>{d}</option>
        ))}
      </Select>
      <span className="text-neutral-400">/</span>
      <Select
        value={monthValue}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-[90px]"
      >
        <option value="">{monthPlaceholder}</option>
        {MONTHS.map((m) => (
          <option key={m} value={String(m)}>{m}</option>
        ))}
      </Select>
      <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10">
        <YearInput
          value={yearValue}
          onChange={onYearChange}
          placeholder={yearPlaceholder}
          className="w-16"
        />
        <button
          type="button"
          onClick={onEraToggle}
          className="text-xs font-bold text-neutral-700 hover:text-black ml-1 select-none"
        >
          {eraValue}
        </button>
      </div>
    </div>
  )
}
