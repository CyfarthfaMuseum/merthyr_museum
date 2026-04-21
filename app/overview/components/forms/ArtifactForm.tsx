import type { ArtifactDraft } from '../../types'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'

type Props = {
  value: ArtifactDraft
  onChange: (patch: Partial<ArtifactDraft>) => void
}

export default function ArtifactForm({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle>Artefact Details</SectionTitle>

      <Input
        value={value.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
      />

      <Input
        value={value.datePeriod}
        onChange={(e) => onChange({ datePeriod: e.target.value })}
        placeholder="Date Period"
      />

      <Input
        value={value.material}
        onChange={(e) => onChange({ material: e.target.value })}
        placeholder="Material"
      />

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