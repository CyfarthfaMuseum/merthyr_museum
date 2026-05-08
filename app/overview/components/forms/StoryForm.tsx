import type { StoryDraft, StoryCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Textarea from '../ui/Textarea'

type Props = {
  value: StoryDraft
  onChange: (patch: Partial<StoryDraft>) => void
  language: 'en' | 'cy'
  cyValue: StoryCyDraft
  onCyChange: (patch: Partial<StoryCyDraft>) => void
  uiLang: UiLang
}

export default function StoryForm({ value, onChange, language, cyValue, onCyChange, uiLang }: Props) {
  const isCy = language === 'cy'
  const t = uiStrings[uiLang]
  const langSuffix = language !== uiLang ? `(${language === 'cy' ? t.welshSuffix : t.englishSuffix})` : ''
  const withSuffix = (label: string) => langSuffix ? `${label} ${langSuffix}` : label
  return (
    <div className="space-y-4">
      <SectionTitle>{t.storyDetails}</SectionTitle>

      <Input
        value={isCy ? cyValue.title : value.title}
        onChange={(e) => isCy ? onCyChange({ title: e.target.value }) : onChange({ title: e.target.value })}
        placeholder={withSuffix(t.storyTitle)}
      />

      <Textarea
        rows={4}
        value={isCy ? cyValue.summary : value.summary}
        onChange={(e) => isCy ? onCyChange({ summary: e.target.value }) : onChange({ summary: e.target.value })}
        placeholder={withSuffix(t.subtitleSummary)}
      />

      <Textarea
        rows={8}
        value={isCy ? cyValue.exposition : value.exposition}
        onChange={(e) => isCy ? onCyChange({ exposition: e.target.value }) : onChange({ exposition: e.target.value })}
        placeholder={withSuffix(t.storyContent)}
      />

      <div className={`space-y-1 ${isCy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <label className="block text-[14px] font-medium text-neutral-700">{t.sortOrder}</label>
        <Input
          value={value.sortOrder}
          onChange={(e) => onChange({ sortOrder: e.target.value })}
          placeholder="0"
        />
      </div>
    </div>
  )
}
