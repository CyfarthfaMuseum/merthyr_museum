import type { PaintingDraft } from '../../types'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'

type Props = {
  value: PaintingDraft
  onChange: (patch: Partial<PaintingDraft>) => void
}

export default function PaintingForm({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle>Painting Details</SectionTitle>

      <Input
        value={value.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
      />

      <Input
        value={value.artist}
        onChange={(e) => onChange({ artist: e.target.value })}
        placeholder="Artist"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          value={value.medium}
          onChange={(e) => onChange({ medium: e.target.value })}
          placeholder="Medium"
        />
        <Input
          value={value.yearCreated}
          onChange={(e) => onChange({ yearCreated: e.target.value })}
          type="number"
          min="0"
          max="9999"
          step="1"
          inputMode="numeric"
          placeholder="Year Created"
        />
      </div>

      <Input
        value={value.dimensions}
        onChange={(e) => onChange({ dimensions: e.target.value })}
        placeholder="Dimensions"
      />

      <Textarea
        rows={8}
        value={value.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description"
      />
    </div>
  )
}
