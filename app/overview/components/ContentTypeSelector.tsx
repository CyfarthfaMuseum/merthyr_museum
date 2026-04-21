import type { ContentType } from '../types'

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'stories', label: 'Stories' },
  { value: 'painting', label: 'Painting' },
  { value: 'artifacts', label: 'Artefacts' },
  { value: 'bio', label: 'Bio' },
]

type Props = {
  value: ContentType
  onChange: (value: ContentType) => void
}

export default function ContentTypeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-8">
      {contentTypes.map((type) => {
        const checked = value === type.value

        return (
          <label key={type.value} className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="contentType"
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