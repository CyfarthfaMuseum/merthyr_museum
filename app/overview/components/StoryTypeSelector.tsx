import type { StoryType } from '../types'

const storyTypes: { value: StoryType; label: string }[] = [
  { value: 'myth', label: 'Myth / Folklore' },
  { value: 'historical', label: 'Historical Event' },
  { value: 'period', label: 'Period Vignette' },
]

type Props = {
  value: StoryType
  onChange: (value: StoryType) => void
}

export default function StoryTypeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-8">
      {storyTypes.map((type) => {
        const checked = value === type.value

        return (
          <label key={type.value} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="storyType"
              checked={checked}
              onChange={() => onChange(type.value)}
              className="sr-only"
            />
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl ${
                checked
                  ? 'border-neutral-600 bg-white text-emerald-600'
                  : 'border-neutral-300 bg-white text-transparent'
              }`}
            >
              ✓
            </span>
            <span className="text-[18px] text-neutral-700">{type.label}</span>
          </label>
        )
      })}
    </div>
  )
}