import type { StoryType, StoryTypeOption } from '../types'

type Props = {
  value: StoryType
  options: StoryTypeOption[]
  onChange: (value: StoryType) => void
}

export default function StoryTypeSelector({ value, options, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-8">
      {options.map((type) => {
        const checked = value === type.code

        return (
          <label key={type.code} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="storyType"
              checked={checked}
              onChange={() => onChange(type.code)}
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
