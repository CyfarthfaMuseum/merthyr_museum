import type { StoryDraft, StoryCyDraft, HistoricalPeriodOption, HistoricalEraOption } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Divider from '../ui/Divider'
import DateRow from '../shared/DateRow'

type Props = {
  value: StoryDraft
  onChange: (patch: Partial<StoryDraft>) => void
  language: 'en' | 'cy'
  cyValue: StoryCyDraft
  onCyChange: (patch: Partial<StoryCyDraft>) => void
  uiLang: UiLang
  availableHistoricalPeriods: HistoricalPeriodOption[]
  availableHistoricalEras: HistoricalEraOption[]
  onAddPeriod: () => void
  onAddEra: () => void
}

const EMPTY_DATE_PATCH = {
  startDay: '', startMonth: '', startYear: '', startEra: 'AD' as const,
  endDay: '', endMonth: '', endYear: '', endEra: 'AD' as const,
}

export default function StoryForm({
  value,
  onChange,
  language,
  cyValue,
  onCyChange,
  uiLang,
  availableHistoricalPeriods,
  availableHistoricalEras,
  onAddPeriod,
  onAddEra,
}: Props) {
  const isCy = language === 'cy'
  const t = uiStrings[uiLang]
  const langSuffix = language !== uiLang ? `(${language === 'cy' ? t.welshSuffix : t.englishSuffix})` : ''
  const withSuffix = (label: string) => langSuffix ? `${label} ${langSuffix}` : label

  // A story may have an era, a period, or a date range — not more than one at a time.
  function onDateFieldChange(patch: Partial<StoryDraft>) {
    onChange({ ...patch, periodId: '', eraId: '' })
  }

  function onPeriodChange(periodId: string) {
    onChange({ periodId, eraId: '', ...EMPTY_DATE_PATCH })
  }

  function onEraChange(eraId: string) {
    onChange({ eraId, periodId: '', ...EMPTY_DATE_PATCH })
  }

  return (
    <div className="space-y-6">
      {/* ── Date / Time Period ── */}
      <div className="space-y-4">
        <SectionTitle>{t.dateTimePeriod}</SectionTitle>

        <DateRow
          label={t.dateStart}
          dayValue={value.startDay}
          monthValue={value.startMonth}
          yearValue={value.startYear}
          eraValue={value.startEra}
          dayPlaceholder={t.dateDay}
          monthPlaceholder={t.dateMonth}
          yearPlaceholder={t.dateYear}
          onDayChange={(v) => onDateFieldChange({ startDay: v })}
          onMonthChange={(v) => onDateFieldChange({ startMonth: v })}
          onYearChange={(v) => onDateFieldChange({ startYear: v })}
          onEraToggle={() => onDateFieldChange({ startEra: value.startEra === 'AD' ? 'BC' : 'AD' })}
        />
        <DateRow
          label={t.dateEnd}
          dayValue={value.endDay}
          monthValue={value.endMonth}
          yearValue={value.endYear}
          eraValue={value.endEra}
          dayPlaceholder={t.dateDay}
          monthPlaceholder={t.dateMonth}
          yearPlaceholder={t.dateYear}
          onDayChange={(v) => onDateFieldChange({ endDay: v })}
          onMonthChange={(v) => onDateFieldChange({ endMonth: v })}
          onYearChange={(v) => onDateFieldChange({ endYear: v })}
          onEraToggle={() => onDateFieldChange({ endEra: value.endEra === 'AD' ? 'BC' : 'AD' })}
        />

        <p className="text-xs text-neutral-500">{t.orHistoricalPeriodOrEra}</p>

        <div className="flex items-center gap-3">
          <span className="w-16 text-sm font-medium text-neutral-600 shrink-0">{t.periodLabel}</span>
          <Select
            value={value.periodId}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="flex-1"
          >
            <option value="">{t.selectHistoricalPeriod}</option>
            {availableHistoricalPeriods.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
          <button
            type="button"
            onClick={onAddPeriod}
            className="text-sm font-medium text-emerald-700 underline underline-offset-2 whitespace-nowrap"
          >
            {t.addPeriod}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-16 text-sm font-medium text-neutral-600 shrink-0">{t.eraLabel}</span>
          <Select
            value={value.eraId}
            onChange={(e) => onEraChange(e.target.value)}
            className="flex-1"
          >
            <option value="">{t.selectHistoricalEra}</option>
            {availableHistoricalEras.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </Select>
          <button
            type="button"
            onClick={onAddEra}
            className="text-sm font-medium text-emerald-700 underline underline-offset-2 whitespace-nowrap"
          >
            {t.addEra}
          </button>
        </div>
      </div>

      <Divider />

      {/* ── Story Details ── */}
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
    </div>
  )
}
