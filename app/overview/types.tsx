export type ContentType = 'book' | 'stories' | 'painting' | 'artifacts' | 'bio'
export type StoryType = 'myth' | 'historical' | 'period'
export type EditorMode = 'create' | 'edit'

export type SidebarCounts = {
  totalContent: number
  books: number
  stories: number
  paintings: number
  artifacts: number
  biographies: number
}

export type SidebarBook = {
  id: string
  title: string
  genres: string[]
}

export type SidebarBookGroup = {
  genre: string
  books: SidebarBook[]
}

export type BookDraft = {
  title: string
  author: string
  publisher: string
  isbn: string
  summary: string
  exposition: string
  publicationDate: string
  pagesCount: string
  genres: string[]
}

export type StoryDraft = {
  storyType: StoryType
  title: string
  summary: string
  exposition: string
  sortOrder: string
}

export type PaintingDraft = {
  title: string
  artist: string
  medium: string
  dimensions: string
  description: string
  yearCreated: string
}

export type ArtifactDraft = {
  title: string
  material: string
  dimensions: string
  description: string
  datePeriod: string
}

export type BioDraft = {
  name: string
  occupation: string
  summary: string
  content: string
  birthDate: string
  deathDate: string
}

export type OverviewDraft = {
  contentType: ContentType
  slug: string
  isFeatured: boolean
  isPublished: boolean
  sortOrder: string
  featuredImageId: string
  seoTitle: string
  seoDescription: string
  book: BookDraft
  story: StoryDraft
  painting: PaintingDraft
  artifact: ArtifactDraft
  bio: BioDraft
}

export const initialDraft: OverviewDraft = {
  contentType: 'book',
  slug: '',
  isFeatured: false,
  isPublished: false,
  sortOrder: '100',
  featuredImageId: '',
  seoTitle: '',
  seoDescription: '',
  book: {
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    summary: '',
    exposition: '',
    publicationDate: '',
    pagesCount: '',
    genres: [],
  },
  story: {
    storyType: 'historical',
    title: '',
    summary: '',
    exposition: '',
    sortOrder: '0',
  },
  painting: {
    title: '',
    artist: '',
    medium: '',
    dimensions: '',
    description: '',
    yearCreated: '',
  },
  artifact: {
    title: '',
    material: '',
    dimensions: '',
    description: '',
    datePeriod: '',
  },
  bio: {
    name: '',
    occupation: '',
    summary: '',
    content: '',
    birthDate: '',
    deathDate: '',
  },
}
