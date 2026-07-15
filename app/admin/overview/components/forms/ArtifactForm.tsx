import type { ArtifactDraft, ArtifactCyDraft, HistoricalPeriodOption, HistoricalEraOption } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Divider from '../ui/Divider'
import DateRow from '../shared/DateRow'

const EMPTY_DATE_PATCH = {
  startDay: '', startMonth: '', startYear: '', startEra: 'AD' as const,
  endDay: '', endMonth: '', endYear: '', endEra: 'AD' as const,
}

type Props = {
  value: ArtifactDraft
  onChange: (patch: Partial<ArtifactDraft>) => void
  language: 'en' | 'cy'
  cyValue: ArtifactCyDraft
  onCyChange: (patch: Partial<ArtifactCyDraft>) => void
  uiLang: UiLang
  availableHistoricalPeriods: HistoricalPeriodOption[]
  availableHistoricalEras: HistoricalEraOption[]
  onAddPeriod: () => void
  onAddEra: () => void
}

export default function ArtifactForm({
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

  // An artefact may have an era, a period, or a date range — not more than one at a time.
  function onDateFieldChange(patch: Partial<ArtifactDraft>) {
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

      {/* ── Artefact Details ── */}
      <div className="space-y-4">
        <SectionTitle>{t.artefactDetails}</SectionTitle>

        {/* Translatable title */}
        <Input
          value={isCy ? cyValue.title : value.title}
          onChange={(e) => isCy ? onCyChange({ title: e.target.value }) : onChange({ title: e.target.value })}
          placeholder={withSuffix(t.title)}
        />

        {/* Shared maker */}
        <Input
          value={value.maker}
          onChange={(e) => onChange({ maker: e.target.value })}
          placeholder={`${t.maker} (${t.makerHint})`}
        />

        {/* Item ID | H | W | D row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
          <Input
            value={value.itemId}
            onChange={(e) => onChange({ itemId: e.target.value })}
            placeholder={t.itemId}
          />
          {([
            [t.dimensionH, value.dimensionsH, 'dimensionsH'],
            [t.dimensionW, value.dimensionsW, 'dimensionsW'],
            [t.dimensionD, value.dimensionsD, 'dimensionsD'],
          ] as [string, string, keyof ArtifactDraft][]).map(([label, val, field]) => (
            <div key={field} className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10">
              <span className="text-sm font-semibold text-neutral-700">{label}</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={val}
                onChange={(e) => onChange({ [field]: e.target.value } as Partial<ArtifactDraft>)}
                placeholder="0"
                className="w-14 bg-transparent text-sm focus:outline-none"
              />
              <span className="text-xs text-neutral-500">{t.cmUnit}</span>
            </div>
          ))}
        </div>

        {/* English-only fields */}
        <div className={`space-y-4 ${isCy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          <Input
            value={value.material}
            onChange={(e) => onChange({ material: e.target.value })}
            placeholder={t.material}
          />
        </div>

        {/* Translatable description */}
        <Textarea
          rows={8}
          value={isCy ? cyValue.description : value.description}
          onChange={(e) => isCy ? onCyChange({ description: e.target.value }) : onChange({ description: e.target.value })}
          placeholder={withSuffix(t.description)}
        />
      </div>
    </div>
  )
}
