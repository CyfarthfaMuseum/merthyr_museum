export type ContentType = 'book' | 'stories' | 'painting' | 'artifacts' | 'bio'
export type StoryType = string
export type EditorMode = 'create' | 'edit'

export type AudioItem = {
  mediaAssetId: string
  fileName: string
  url: string | null
}

export type ConnectedItem = {
  id: string
  title: string
  contentTypeCode: string
  contentTypeLabel: string
  imageUrl?: string | null
}

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

export type SidebarStory = {
  id: string
  title: string
  storyTypeCode: string
  storyTypeLabel: string
}

export type SidebarStoryGroup = {
  storyTypeCode: string
  storyTypeLabel: string
  stories: SidebarStory[]
}

export type SidebarPainting = {
  id: string
  title: string
  medium: string
}

export type SidebarPaintingGroup = {
  medium: string
  paintings: SidebarPainting[]
}

export type SidebarArtifact = {
  id: string
  title: string
  categoryCode: string
  categoryLabel: string
}

export type SidebarArtifactGroup = {
  categoryCode: string
  categoryLabel: string
  artifacts: SidebarArtifact[]
}

export type SidebarBio = {
  id: string
  name: string
}

export type SidebarLocation = {
  id: string
  address: string
  lat: number
  lng: number
  isAssigned: boolean
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
  categoryCode: string
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

// Welsh (CY) translatable fields per content type

export type BookCyDraft = {
  title: string
  author: string
  summary: string
  exposition: string
}

export type StoryCyDraft = {
  title: string
  summary: string
  exposition: string
}

export type PaintingCyDraft = {
  title: string
  description: string
}

export type ArtifactCyDraft = {
  title: string
  description: string
}

export type BioCyDraft = {
  occupation: string
  summary: string
  content: string
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
  seoTitleCy: string
  seoDescriptionCy: string
  book: BookDraft
  story: StoryDraft
  painting: PaintingDraft
  artifact: ArtifactDraft
  bio: BioDraft
  bookCy: BookCyDraft
  storyCy: StoryCyDraft
  paintingCy: PaintingCyDraft
  artifactCy: ArtifactCyDraft
  bioCy: BioCyDraft
}

export type StoryTypeOption = {
  code: string
  label: string
}

export type ArtifactCategoryOption = {
  code: string
  label: string
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
  seoTitleCy: '',
  seoDescriptionCy: '',
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
    categoryCode: '',
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
  bookCy: {
    title: '',
    author: '',
    summary: '',
    exposition: '',
  },
  storyCy: {
    title: '',
    summary: '',
    exposition: '',
  },
  paintingCy: {
    title: '',
    description: '',
  },
  artifactCy: {
    title: '',
    description: '',
  },
  bioCy: {
    occupation: '',
    summary: '',
    content: '',
  },
}
