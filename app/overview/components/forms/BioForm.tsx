'use client'

import type { BioDraft, BioCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import SectionTitle from '../ui/SectionTitle'

type Props = {
  value: BioDraft
  onChange: (patch: Partial<BioDraft>) => void
  language: 'en' | 'cy'
  cyValue: BioCyDraft
  onCyChange: (patch: Partial<BioCyDraft>) => void
  uiLang: UiLang
}

export default function BioForm({ value, onChange, language, cyValue, onCyChange, uiLang }: Props) {
  const isCy = language === 'cy'
  const t = uiStrings[uiLang]
  const langSuffix = language !== uiLang ? `(${language === 'cy' ? t.welshSuffix : t.englishSuffix})` : ''
  const withSuffix = (label: string) => langSuffix ? `${label} ${langSuffix}` : label
  return (
    <div className="space-y-6">
      <SectionTitle>{t.biographyDetails}</SectionTitle>

      {/* Name — not translatable */}
      <div className={isCy ? 'opacity-50 pointer-events-none select-none' : ''}>
        <Input
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={t.fullName}
        />
      </div>

      {/* Occupation — translatable */}
      <Input
        value={isCy ? cyValue.occupation : value.occupation}
        onChange={(e) => isCy ? onCyChange({ occupation: e.target.value }) : onChange({ occupation: e.target.value })}
        placeholder={withSuffix(t.occupation)}
      />

      {/* Dates — not translatable */}
      <div className={`grid gap-4 md:grid-cols-2 ${isCy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <Input
          value={value.birthDate}
          onChange={(e) => onChange({ birthDate: e.target.value })}
          type="number"
          min="0"
          max="9999"
          step="1"
          inputMode="numeric"
          placeholder={t.birthYear}
        />

        <Input
          value={value.deathDate}
          onChange={(e) => onChange({ deathDate: e.target.value })}
          type="number"
          min="0"
          max="9999"
          step="1"
          inputMode="numeric"
          placeholder={t.deathYear}
        />
      </div>

      {/* Summary — translatable */}
      <Textarea
        rows={4}
        value={isCy ? cyValue.summary : value.summary}
        onChange={(e) => isCy ? onCyChange({ summary: e.target.value }) : onChange({ summary: e.target.value })}
        placeholder={withSuffix(t.shortSummary)}
      />

      {/* Full Biography — translatable */}
      <Textarea
        rows={8}
        value={isCy ? cyValue.content : value.content}
        onChange={(e) => isCy ? onCyChange({ content: e.target.value }) : onChange({ content: e.target.value })}
        placeholder={withSuffix(t.fullBiographyContent)}
      />
    </div>
  )
}
