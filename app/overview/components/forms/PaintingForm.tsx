import type { PaintingDraft, PaintingCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'

type Props = {
  value: PaintingDraft
  onChange: (patch: Partial<PaintingDraft>) => void
  language: 'en' | 'cy'
  cyValue: PaintingCyDraft
  onCyChange: (patch: Partial<PaintingCyDraft>) => void
  uiLang: UiLang
}

export default function PaintingForm({ value, onChange, language, cyValue, onCyChange, uiLang }: Props) {
  const isCy = language === 'cy'
  const t = uiStrings[uiLang]
  const langSuffix = language !== uiLang ? `(${language === 'cy' ? t.welshSuffix : t.englishSuffix})` : ''
  const withSuffix = (label: string) => langSuffix ? `${label} ${langSuffix}` : label
  return (
    <div className="space-y-4">
      <SectionTitle>{t.paintingDetails}</SectionTitle>

      <Input
        value={isCy ? cyValue.title : value.title}
        onChange={(e) => isCy ? onCyChange({ title: e.target.value }) : onChange({ title: e.target.value })}
        placeholder={withSuffix(t.title)}
      />

      <div className={`space-y-4 ${isCy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <Input
          value={value.artist}
          onChange={(e) => onChange({ artist: e.target.value })}
          placeholder={t.artist}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={value.yearCreated}
            onChange={(e) => onChange({ yearCreated: e.target.value })}
            type="number"
            min="0"
            max="9999"
            step="1"
            inputMode="numeric"
            placeholder={t.yearCreated}
          />
        </div>

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
