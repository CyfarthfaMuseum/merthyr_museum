import type { PublicContentItemViewModel, PublicMedia } from '@/lib/public/types'
import type { PreviewImage } from './components/shared/ImageManager'
import type { AudioItems, ContentType, OverviewDraft, PaintingMediumOption } from './types'

const CONTENT_TYPE_MAP: Record<ContentType, PublicContentItemViewModel['contentType']['code']> = {
  book: 'book',
  stories: 'story',
  painting: 'painting',
  artifacts: 'artefact',
  bio: 'biography',
}

function toYear(value: string): number | null {
  const year = Number(String(value).slice(0, 4))
  return Number.isFinite(year) && year !== 0 ? year : null
}

function toMedia(image: PreviewImage, sortOrder: number): PublicMedia {
  return {
    id: image.id,
    url: image.previewUrl,
    fileName: image.fileName,
    mimeType: 'image/*',
    width: null,
    height: null,
    durationSeconds: null,
    credit: image.credit || null,
    altText: image.altText,
    caption: image.caption || null,
    role: 'other',
    isPrimary: image.isPrimary,
    sortOrder,
  }
}

function dimensionsJson(h: string, w: string, d?: string): string | null {
  if (!h && !w && !d) return null
  const payload: Record<string, string | null> = { h: h || null, w: w || null }
  if (d !== undefined) payload.d = d || null
  return JSON.stringify(payload)
}

function artifactDateLabel(draft: OverviewDraft['artifact']): string | null {
  if (!draft.startYear) return null
  const start = `${draft.startYear}${draft.startEra === 'BC' ? ' BC' : ''}`
  if (draft.endYear && draft.endYear !== draft.startYear) {
    return `${start} – ${draft.endYear}${draft.endEra === 'BC' ? ' BC' : ''}`
  }
  return start
}

export function buildPreviewContent(args: {
  draft: OverviewDraft
  language: 'en' | 'cy'
  images: PreviewImage[]
  audio: AudioItems
  location: { id?: string; address: string; lat: number; lng: number } | null
  paintingMediums: PaintingMediumOption[]
  contentItemId: string | null
}): PublicContentItemViewModel {
  const { draft, language, images, audio, location, paintingMediums, contentItemId } = args
  const isCy = language === 'cy'

  const galleryMedia = images.map((img, index) => toMedia(img, index))
  const primaryImage = galleryMedia.find((img) => img.isPrimary) ?? galleryMedia[0] ?? null

  const audioItem = audio[language] ?? audio.en ?? null
  const audioMedia: PublicMedia | null =
    audioItem && audioItem.url
      ? {
          id: audioItem.mediaAssetId,
          url: audioItem.url,
          fileName: audioItem.fileName,
          mimeType: 'audio/mpeg',
          width: null,
          height: null,
          durationSeconds: null,
          credit: null,
          altText: '',
          caption: null,
          role: 'audio',
          isPrimary: false,
          sortOrder: 0,
        }
      : null

  let title = ''
  let summary: string | null = null
  let body: string | null = null
  let customPeriodLabel: string | null = null
  let dateLabel: string | null = null
  const typeData: Pick<
    PublicContentItemViewModel,
    'book' | 'story' | 'painting' | 'artefact' | 'biography'
  > = {}

  if (draft.contentType === 'book') {
    title = (isCy ? draft.bookCy.title : '') || draft.book.title
    summary = (isCy ? draft.bookCy.summary : '') || draft.book.summary || null
    body = (isCy ? draft.bookCy.exposition : '') || draft.book.exposition || null
    typeData.book = {
      author: draft.book.author || null,
      excerpt: summary,
      publicationYear: toYear(draft.book.publicationDate),
      isbn: draft.book.isbn || null,
      publisher: draft.book.publisher || null,
    }
  } else if (draft.contentType === 'stories') {
    title = (isCy ? draft.storyCy.title : '') || draft.story.title
    summary = (isCy ? draft.storyCy.summary : '') || draft.story.summary || null
    body = (isCy ? draft.storyCy.exposition : '') || draft.story.exposition || null
    typeData.story = {
      storyTypeId: null,
      relatedPersonName: null,
      eventDetails: body,
    }
  } else if (draft.contentType === 'painting') {
    title = (isCy ? draft.paintingCy.title : '') || draft.painting.title
    summary = (isCy ? draft.paintingCy.description : '') || draft.painting.description || null
    body = summary
    const mediumOption = paintingMediums.find((m) => m.code === draft.painting.medium)
    typeData.painting = {
      artistName: draft.painting.artist || null,
      yearCreated: draft.painting.yearCreated ? Number(draft.painting.yearCreated) || null : null,
      medium: (isCy ? mediumOption?.labelCy : mediumOption?.label) ?? draft.painting.medium ?? null,
      dimensions: dimensionsJson(draft.painting.dimensionsH, draft.painting.dimensionsW),
      currentCollection: null,
      imageCredit: null,
      detailNotes: body,
    }
  } else if (draft.contentType === 'artifacts') {
    title = (isCy ? draft.artifactCy.title : '') || draft.artifact.title
    summary = (isCy ? draft.artifactCy.description : '') || draft.artifact.description || null
    body = summary
    customPeriodLabel = draft.artifact.customPeriod || null
    dateLabel = artifactDateLabel(draft.artifact)
    typeData.artefact = {
      maker: draft.artifact.maker || null,
      originPlace: null,
      dateCreatedLabel: null,
      material: draft.artifact.material || null,
      dimensions: dimensionsJson(draft.artifact.dimensionsH, draft.artifact.dimensionsW, draft.artifact.dimensionsD),
      collectionHolder: null,
      catalogueReference: draft.artifact.itemId || null,
      notes: body,
    }
  } else {
    title = draft.bio.name
    summary = (isCy ? draft.bioCy.summary : '') || draft.bio.summary || null
    body = (isCy ? draft.bioCy.content : '') || draft.bio.content || null
    typeData.biography = {
      personName: draft.bio.name,
      birthYear: toYear(draft.bio.birthDate),
      deathYear: toYear(draft.bio.deathDate),
      birthPlace: null,
      occupation: (isCy ? draft.bioCy.occupation : '') || draft.bio.occupation || null,
      biographyText: body,
    }
  }

  return {
    id: contentItemId ?? 'preview',
    slug: draft.slug || 'preview',
    language,
    contentType: {
      id: 0,
      code: CONTENT_TYPE_MAP[draft.contentType],
    },
    status: {
      id: 0,
      code: draft.isPublished ? 'published' : 'draft',
      isPublic: draft.isPublished,
    },
    title,
    summary,
    body,
    seoTitle: (isCy ? draft.seoTitleCy : draft.seoTitle) || null,
    seoDescription: (isCy ? draft.seoDescriptionCy : draft.seoDescription) || null,
    customPeriodLabel,
    featured: draft.isFeatured,
    publishedAt: draft.isPublished ? new Date().toISOString() : null,
    dateLabel,
    primaryImage,
    galleryMedia,
    audioMedia,
    locations: location
      ? [
          {
            id: location.id ?? 'preview-location',
            slug: '',
            title: location.address,
            description: null,
            latitude: location.lat,
            longitude: location.lng,
            type: 'landmark',
            address: location.address,
            relationshipType: 'primary',
          },
        ]
      : [],
    relatedContent: [],
    tags: [],
    ...typeData,
  }
}
