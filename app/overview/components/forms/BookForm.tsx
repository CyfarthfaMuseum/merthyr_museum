import type { BookDraft, BookCyDraft } from '../../types'
import type { UiLang } from '../../ui-strings'
import { uiStrings } from '../../ui-strings'
import { BlackButton } from '../ui/Buttons'
import Divider from '../ui/Divider'
import Input from '../ui/Input'
import SectionTitle from '../ui/SectionTitle'
import Select from '../ui/Select'
import Tag from '../ui/Tag'
import Textarea from '../ui/Textarea'

type Props = {
  value: BookDraft
  availableGenres: string[]
  selectedGenre: string
  onSelectedGenreChange: (value: string) => void
  onNewGenre: () => void
  onRemoveGenre: (genre: string) => void
  onChange: (patch: Partial<BookDraft>) => void
  language: 'en' | 'cy'
  cyValue: BookCyDraft
  onCyChange: (patch: Partial<BookCyDraft>) => void
  uiLang: UiLang
}

export default function BookForm({
  value,
  availableGenres,
  selectedGenre,
  onSelectedGenreChange,
  onNewGenre,
  onRemoveGenre,
  onChange,
  language,
  cyValue,
  onCyChange,
  uiLang,
}: Props) {
  const isCy = language === 'cy'
  const t = uiStrings[uiLang]
  const langSuffix = language !== uiLang ? `(${language === 'cy' ? t.welshSuffix : t.englishSuffix})` : ''
  const withSuffix = (label: string) => langSuffix ? `${label} ${langSuffix}` : label
  // Filter out genres already applied to the book
  const genresToShow = availableGenres.filter((g) => !value.genres.includes(g));
  return (
    <>
      <div className={`space-y-4 ${isCy ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <SectionTitle>{t.bookGenres}</SectionTitle>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <Select value={selectedGenre} onChange={(e) => onSelectedGenreChange(e.target.value)}>
            <option value="">{t.selectOrAddGenre}</option>
            {genresToShow.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </Select>

          <BlackButton className="min-w-[160px]" onClick={onNewGenre}>
            {t.addGenre}
          </BlackButton>
        </div>

        {value.genres.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {value.genres.map((genre) => (
              <Tag key={genre} onRemove={() => onRemoveGenre(genre)}>
                {genre}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>

      <Divider />

      <div className="space-y-4">
        <SectionTitle>{t.bookDetails}</SectionTitle>

        <Input
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={t.bookTitle}
        />

        <Input
          value={value.author}
          onChange={(e) => onChange({ author: e.target.value })}
          placeholder={t.author}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={value.publisher}
            onChange={(e) => onChange({ publisher: e.target.value })}
            placeholder={t.publisher}
          />
          <Input
            value={value.isbn}
            onChange={(e) => onChange({ isbn: e.target.value })}
            placeholder={t.isbn}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={value.publicationDate}
            onChange={(e) => onChange({ publicationDate: e.target.value })}
            type="date"
            aria-label={t.publicationDate}
          />
          <Input
            value={value.pagesCount}
            onChange={(e) => onChange({ pagesCount: e.target.value })}
            placeholder={t.pagesCount}
          />
        </div>

        <Textarea
          rows={4}
          value={isCy ? cyValue.summary : value.summary}
          onChange={(e) => isCy ? onCyChange({ summary: e.target.value }) : onChange({ summary: e.target.value })}
          placeholder={withSuffix(t.summary)}
        />

        <Textarea
          rows={8}
          value={isCy ? cyValue.exposition : value.exposition}
          onChange={(e) => isCy ? onCyChange({ exposition: e.target.value }) : onChange({ exposition: e.target.value })}
          placeholder={withSuffix(t.detailedContent)}
        />
      </div>
    </>
  )
}
