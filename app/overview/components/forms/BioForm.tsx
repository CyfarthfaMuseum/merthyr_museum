'use client'

import type { BioDraft } from '../../types'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import SectionTitle from '../ui/SectionTitle'

type Props = {
  value: BioDraft
  onChange: (patch: Partial<BioDraft>) => void
}

export default function BioForm({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <SectionTitle>Biography Details</SectionTitle>

      {/* Name */}
      <Input
        value={value.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Full Name"
      />

      {/* Occupation */}
      <Input
        value={value.occupation}
        onChange={(e) => onChange({ occupation: e.target.value })}
        placeholder="Occupation"
      />

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          value={value.birthDate}
          onChange={(e) => onChange({ birthDate: e.target.value })}
          placeholder="Birth Year (e.g. 1820)"
        />

        <Input
          value={value.deathDate}
          onChange={(e) => onChange({ deathDate: e.target.value })}
          placeholder="Death Year (e.g. 1890)"
        />
      </div>

      {/* Summary */}
      <Textarea
        rows={4}
        value={value.summary}
        onChange={(e) => onChange({ summary: e.target.value })}
        placeholder="Short summary"
      />

      {/* Full Biography */}
      <Textarea
        rows={8}
        value={value.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Full biography content"
      />
    </div>
  )
}