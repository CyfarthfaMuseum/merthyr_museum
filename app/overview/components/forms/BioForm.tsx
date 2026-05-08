'use client'

import type { BioDraft, BioCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import SectionTitle from '../ui/SectionTitle'
import YearInput from '../ui/YearInput'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

type BiDateRowProps = {
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

function BiDateRow({
  label, dayValue, monthValue, yearValue, eraValue,
  dayPlaceholder, monthPlaceholder, yearPlaceholder,
  onDayChange, onMonthChange, onYearChange, onEraToggle,
}: BiDateRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 text-sm font-medium text-neutral-600 shrink-0">{label}</span>
      <Select value={dayValue} onChange={(e) => onDayChange(e.target.value)} className="w-[90px]">
        <option value="">{dayPlaceholder}</option>
        {DAYS.map((d) => <option key={d} value={String(d)}>{d}</option>)}
      </Select>
      <Select value={monthValue} onChange={(e) => onMonthChange(e.target.value)} className="w-[90px]">
        <option value="">{monthPlaceholder}</option>
        {MONTHS.map((m) => <option key={m} value={String(m)}>{m}</option>)}
      </Select>
      <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 h-10">
        <YearInput value={yearValue} onChange={onYearChange} placeholder={yearPlaceholder} className="w-16" />
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
      <Input
        value={value.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder={t.fullName}
      />

      {/* Occupation — translatable */}
      <Input
        value={isCy ? cyValue.occupation : value.occupation}
        onChange={(e) => isCy ? onCyChange({ occupation: e.target.value }) : onChange({ occupation: e.target.value })}
        placeholder={withSuffix(t.occupation)}
      />

      {/* Dates — not translatable */}
      <div className="space-y-3">
        <BiDateRow
          label={t.birthLabel}
          dayValue={value.birthDay}
          monthValue={value.birthMonth}
          yearValue={value.birthDate}
          eraValue={value.birthEra}
          dayPlaceholder={t.dateDay}
          monthPlaceholder={t.dateMonth}
          yearPlaceholder={t.dateYear}
          onDayChange={(v) => onChange({ birthDay: v })}
          onMonthChange={(v) => onChange({ birthMonth: v })}
          onYearChange={(v) => onChange({ birthDate: v })}
          onEraToggle={() => onChange({ birthEra: value.birthEra === 'AD' ? 'BC' : 'AD' })}
        />
        <BiDateRow
          label={t.deathLabel}
          dayValue={value.deathDay}
          monthValue={value.deathMonth}
          yearValue={value.deathDate}
          eraValue={value.deathEra}
          dayPlaceholder={t.dateDay}
          monthPlaceholder={t.dateMonth}
          yearPlaceholder={t.dateYear}
          onDayChange={(v) => onChange({ deathDay: v })}
          onMonthChange={(v) => onChange({ deathMonth: v })}
          onYearChange={(v) => onChange({ deathDate: v })}
          onEraToggle={() => onChange({ deathEra: value.deathEra === 'AD' ? 'BC' : 'AD' })}
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
