import type { ArtifactDraft, ArtifactCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'

type Props = {
  value: ArtifactDraft
  onChange: (patch: Partial<ArtifactDraft>) => void
  language: 'en' | 'cy'
  cyValue: ArtifactCyDraft
  onCyChange: (patch: Partial<ArtifactCyDraft>) => void
  uiLang: UiLang
}

export default function ArtifactForm({ value, onChange, language, cyValue, onCyChange, uiLang }: Props) {
  const isCy = language === 'cy'
  const t = uiStrings[uiLang]
  const langSuffix = language !== uiLang ? `(${language === 'cy' ? t.welshSuffix : t.englishSuffix})` : ''
  const withSuffix = (label: string) => langSuffix ? `${label} ${langSuffix}` : label
  return (
    <div className="space-y-4">
      <SectionTitle>{t.artefactDetails}</SectionTitle>

      <Input
        value={isCy ? cyValue.title : value.title}
        onChange={(e) => isCy ? onCyChange({ title: e.target.value }) : onChange({ title: e.target.value })}
        placeholder={withSuffix(t.title)}
      />

      <div className={`space-y-4 ${isCy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <Input
          value={value.datePeriod}
          onChange={(e) => onChange({ datePeriod: e.target.value })}
          placeholder={t.datePeriod}
        />

        <Input
          value={value.material}
          onChange={(e) => onChange({ material: e.target.value })}
          placeholder={t.material}
        />

        <Input
          value={value.dimensions}
          onChange={(e) => onChange({ dimensions: e.target.value })}
          placeholder={t.dimensions}
        />
      </div>

      <Textarea
        rows={8}
        value={isCy ? cyValue.description : value.description}
        onChange={(e) => isCy ? onCyChange({ description: e.target.value }) : onChange({ description: e.target.value })}
        placeholder={withSuffix(t.description)}
      />
    </div>
  )
}
