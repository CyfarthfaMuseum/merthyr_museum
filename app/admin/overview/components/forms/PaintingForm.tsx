import type { PaintingDraft, PaintingCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'
import YearInput from '../ui/YearInput'

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

      {/* Title — translatable */}
      <Input
        value={isCy ? cyValue.title : value.title}
        onChange={(e) => isCy ? onCyChange({ title: e.target.value }) : onChange({ title: e.target.value })}
        placeholder={withSuffix(t.title)}
      />

      <Input
        value={value.artist}
        onChange={(e) => onChange({ artist: e.target.value })}
        placeholder={`${t.artist} (${t.artistHint})`}
      />

      {/* Item ID | Date | H | W row */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
        <Input
          value={value.itemId}
          onChange={(e) => onChange({ itemId: e.target.value })}
          placeholder={t.itemId}
        />

        <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10 min-w-[110px]">
          <span className="text-sm font-semibold text-neutral-700 whitespace-nowrap">{t.yearCreatedLabel}</span>
          <YearInput
            value={value.yearCreated}
            onChange={(v) => onChange({ yearCreated: v })}
            className="w-16"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10">
          <span className="text-sm font-semibold text-neutral-700">{t.dimensionH}</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={value.dimensionsH}
            onChange={(e) => onChange({ dimensionsH: e.target.value })}
            placeholder="0"
            className="w-14 bg-transparent text-sm focus:outline-none"
          />
          <span className="text-xs text-neutral-500">{t.cmUnit}</span>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10">
          <span className="text-sm font-semibold text-neutral-700">{t.dimensionW}</span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={value.dimensionsW}
            onChange={(e) => onChange({ dimensionsW: e.target.value })}
            placeholder="0"
            className="w-14 bg-transparent text-sm focus:outline-none"
          />
          <span className="text-xs text-neutral-500">{t.cmUnit}</span>
        </div>
      </div>

      {/* Translatable description */}
      <Textarea
        rows={8}
        value={isCy ? cyValue.description : value.description}
        onChange={(e) => isCy ? onCyChange({ description: e.target.value }) : onChange({ description: e.target.value })}
        placeholder={withSuffix(t.description)}
      />
    </div>
  )
}

