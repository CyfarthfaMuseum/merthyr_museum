import type { StoryDraft } from '../../types'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'

type Props = {
  value: StoryDraft
  onChange: (patch: Partial<StoryDraft>) => void
}

export default function StoryForm({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle>Story Details</SectionTitle>

      <Input
        value={value.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Story Title"
      />

      <Textarea
        rows={4}
        value={value.summary}
        onChange={(e) => onChange({ summary: e.target.value })}
        placeholder="Subtitle / Summary"
      />

      <Textarea
        rows={8}
        value={value.exposition}
        onChange={(e) => onChange({ exposition: e.target.value })}
        placeholder="Story Content"
      />

      <div className="space-y-1">
        <label className="block text-[14px] font-medium text-neutral-700">Sort Order</label>
        <Input
          value={value.sortOrder}
          onChange={(e) => onChange({ sortOrder: e.target.value })}
          placeholder="0"
        />
      </div>
    </div>
  )
}