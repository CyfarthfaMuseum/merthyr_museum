import type { BookDraft } from '../../types'
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
  onApplyGenre: () => void
  onNewGenre: () => void
  onRemoveGenre: (genre: string) => void
  onChange: (patch: Partial<BookDraft>) => void
}

export default function BookForm({
  value,
  availableGenres,
  selectedGenre,
  onSelectedGenreChange,
  onApplyGenre,
  onNewGenre,
  onRemoveGenre,
  onChange,
}: Props) {
  return (
    <>
      <div className="space-y-4">
        <SectionTitle>Book Genres</SectionTitle>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <Select value={selectedGenre} onChange={(e) => onSelectedGenreChange(e.target.value)}>
            <option value="">Select Book Genre</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </Select>

          <BlackButton
            className="min-w-[140px]"
            onClick={onApplyGenre}
            disabled={!selectedGenre}
          >
            APPLY
          </BlackButton>

          <BlackButton className="min-w-[160px]" onClick={onNewGenre}>
            NEW GENRE
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
        <SectionTitle>Book Details</SectionTitle>

        <Input
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Book Title"
        />

        <Input
          value={value.author}
          onChange={(e) => onChange({ author: e.target.value })}
          placeholder="Author"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={value.publisher}
            onChange={(e) => onChange({ publisher: e.target.value })}
            placeholder="Publisher"
          />
          <Input
            value={value.isbn}
            onChange={(e) => onChange({ isbn: e.target.value })}
            placeholder="ISBN"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={value.publicationDate}
            onChange={(e) => onChange({ publicationDate: e.target.value })}
            placeholder="Publication Date (YYYY-MM-DD)"
          />
          <Input
            value={value.pagesCount}
            onChange={(e) => onChange({ pagesCount: e.target.value })}
            placeholder="Pages Count"
          />
        </div>

        <Textarea
          rows={4}
          value={value.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Summary"
        />

        <Textarea
          rows={8}
          value={value.exposition}
          onChange={(e) => onChange({ exposition: e.target.value })}
          placeholder="Detailed Content"
        />
      </div>
    </>
  )
}