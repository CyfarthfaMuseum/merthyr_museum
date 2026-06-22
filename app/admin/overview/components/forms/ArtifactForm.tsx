import type { ArtifactDraft, ArtifactCyDraft, HistoricalPeriodOption, HistoricalEraOption } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Divider from '../ui/Divider'
import YearInput from '../ui/YearInput'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

type DateRowProps = {
  label: string
  dayValue: string
  monthValue: string
  yearValue: string
  eraValue: 'AD' | 'BC'
  dayPlaceholder: string
  monthPlaceholder: string
  yearPlaceholder: string
  onDayChange: (v: string) => void
  onMonthChange: (v: string) => void
  onYearChange: (v: string) => void
  onEraToggle: () => void
}

function DateRow({
  label, dayValue, monthValue, yearValue, eraValue,
  dayPlaceholder, monthPlaceholder, yearPlaceholder,
  onDayChange, onMonthChange, onYearChange, onEraToggle,
}: DateRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 text-sm font-medium text-neutral-600 shrink-0">{label}</span>
      <Select
        value={dayValue}
        onChange={(e) => onDayChange(e.target.value)}
        className="w-[90px]"
      >
        <option value="">{dayPlaceholder}</option>
        {DAYS.map((d) => (
          <option key={d} value={String(d)}>{d}</option>
        ))}
      </Select>
      <span className="text-neutral-400">/</span>
      <Select
        value={monthValue}
        onChange={(e) => onMonthChange(e.target.value)}
        className="w-[90px]"
      >
        <option value="">{monthPlaceholder}</option>
        {MONTHS.map((m) => (
          <option key={m} value={String(m)}>{m}</option>
        ))}
      </Select>
      <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10">
        <YearInput
          value={yearValue}
          onChange={onYearChange}
          placeholder={yearPlaceholder}
          className="w-16"
        />
        <button
          type="button"
          onClick={onEraToggle}
          className="text-xs font-bold text-neutral-700 hover:text-black ml-1 select-none"
        >
          {eraValue}
        </button>
      </div>
    </div>
  )
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
          onDayChange={(v) => onChange({ startDay: v })}
          onMonthChange={(v) => onChange({ startMonth: v })}
          onYearChange={(v) => onChange({ startYear: v })}
          onEraToggle={() => onChange({ startEra: value.startEra === 'AD' ? 'BC' : 'AD' })}
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
          onDayChange={(v) => onChange({ endDay: v })}
          onMonthChange={(v) => onChange({ endMonth: v })}
          onYearChange={(v) => onChange({ endYear: v })}
          onEraToggle={() => onChange({ endEra: value.endEra === 'AD' ? 'BC' : 'AD' })}
        />

        <p className="text-xs text-neutral-500">{t.andOrHistoricalPeriod}</p>

        <div className="flex items-center gap-3">
          <span className="w-16 text-sm font-medium text-neutral-600 shrink-0">{t.periodLabel}</span>
          <Select
            value={value.periodId}
            onChange={(e) => onChange({ periodId: e.target.value })}
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
            onChange={(e) => onChange({ eraId: e.target.value })}
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

        <div className="flex items-center gap-3">
          <span className="w-16 text-sm font-medium text-neutral-600 shrink-0">{t.customPeriodLabel}</span>
          <Input
            value={value.customPeriod}
            onChange={(e) => onChange({ customPeriod: e.target.value })}
            placeholder={t.customPeriodPlaceholder}
          />
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
