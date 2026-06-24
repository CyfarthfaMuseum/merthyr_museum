export const PUBLIC_LANGUAGES = ["en", "cy"] as const

export type PublicLanguage = (typeof PUBLIC_LANGUAGES)[number]

export type PublicContentType =
  | "book"
  | "story"
  | "painting"
  | "artefact"
  | "biography"

export type PublicMedia = {
  id: string
  url: string
  fileName: string
  mimeType: string
  width: number | null
  height: number | null
  durationSeconds: number | null
  credit: string | null
  altText: string
  caption: string | null
  role: string
  isPrimary: boolean
  sortOrder: number
}

export type PublicLocationSummary = {
  id: string
  slug: string
  title: string
  description: string | null
  latitude: number
  longitude: number
  type: string
  address: string | null
  relationshipType?: string
}

export type PublicTag = {
  id: string
  slug: string
  name: string
  type: string
}

export type PublicRelatedContent = {
  id: string
  slug: string
  title: string
  summary: string | null
  contentType: PublicContentType
  href: string
  relationshipType: string
}

export type PublicPaintingData = {
  artistName: string | null
  yearCreated: number | null
  medium: string | null
  dimensions: string | null
  currentCollection: string | null
  imageCredit: string | null
  detailNotes: string | null
}

export type PublicBookData = {
  author: string | null
  excerpt: string | null
  publicationYear: number | null
  isbn: string | null
  publisher: string | null
}

export type PublicStoryData = {
  storyTypeId: number | null
  relatedPersonName: string | null
  eventDetails: string | null
}

export type PublicArtefactData = {
  maker: string | null
  originPlace: string | null
  dateCreatedLabel: string | null
  material: string | null
  dimensions: string | null
  collectionHolder: string | null
  catalogueReference: string | null
  notes: string | null
}

export type PublicBiographyData = {
  personName: string
  birthYear: number | null
  deathYear: number | null
  birthPlace: string | null
  occupation: string | null
  biographyText: string | null
}

export type PublicTypeSpecificData = {
  painting?: PublicPaintingData
  book?: PublicBookData
  story?: PublicStoryData
  artefact?: PublicArtefactData
  biography?: PublicBiographyData
}

export type PublicContentItemViewModel = PublicTypeSpecificData & {
  id: string
  slug: string
  language: PublicLanguage
  contentType: {
    id: number
    code: PublicContentType
  }
  status: {
    id: number
    code: string
    isPublic: boolean
  }
  title: string
  summary: string | null
  body: string | null
  seoTitle: string | null
  seoDescription: string | null
  customPeriodLabel: string | null
  featured: boolean
  publishedAt: string | null
  dateLabel: string | null
  primaryImage: PublicMedia | null
  galleryMedia: PublicMedia[]
  audioMedia: PublicMedia | null
  locations: PublicLocationSummary[]
  relatedContent: PublicRelatedContent[]
  tags: PublicTag[]
}

export type PublicCatalogueItem = {
  id: string
  slug: string
  title: string
  summary: string | null
  href: string
  contentType: PublicContentType
  creatorLabel: string | null
  dateLabel: string | null
  primaryImage: PublicMedia | null
}

export type PublicMapContentSummary = {
  id: string
  slug: string
  title: string
  contentType: PublicContentType
  href: string
  primaryImage: PublicMedia | null
  galleryMedia: PublicMedia[]
}

export type PublicMapLocation = PublicLocationSummary & {
  content: PublicMapContentSummary[]
  categories: PublicContentType[]
}

export type PublicLocationWithContent = PublicLocationSummary & {
  content: PublicMapContentSummary[]
}

export function isPublicLanguage(value: string): value is PublicLanguage {
  return PUBLIC_LANGUAGES.includes(value as PublicLanguage)
}

export function contentTypeToRouteSegment(type: PublicContentType) {
  const map: Record<PublicContentType, string> = {
    artefact: "artefacts",
    biography: "biographies",
    book: "books",
    painting: "paintings",
    story: "stories",
  }

  return map[type]
}

export function publicHref(path: string, lang: PublicLanguage) {
  if (lang !== "cy") return path

  const [pathWithoutHash, hash] = path.split("#", 2)
  const separator = pathWithoutHash.includes("?") ? "&" : "?"
  const href = `${pathWithoutHash}${separator}lang=cy`

  return hash ? `${href}#${hash}` : href
}

export function publicContentHref(
  type: PublicContentType,
  slug: string,
  lang: PublicLanguage
) {
  return publicHref(`/${contentTypeToRouteSegment(type)}/${slug}`, lang)
}
