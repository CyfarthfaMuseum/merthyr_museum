import type { OverviewDraft } from './types'

export function validateDraft(draft: OverviewDraft): string[] {
  const errors: string[] = []

  if (draft.contentType === 'book') {
    if (!draft.book.title.trim()) errors.push('Book title is required.')
    if (!draft.book.summary.trim()) errors.push('Book summary is required.')
    if (!draft.bookCy.title.trim()) errors.push('Welsh book title is required.')
    if (!draft.bookCy.summary.trim()) errors.push('Welsh book summary is required.')
  }

  if (draft.contentType === 'stories') {
    if (!draft.story.title.trim()) errors.push('Story title is required.')
    if (!draft.story.summary.trim()) errors.push('Story summary is required.')
    if (!draft.storyCy.title.trim()) errors.push('Welsh story title is required.')
    if (!draft.storyCy.summary.trim()) errors.push('Welsh story summary is required.')
  }

  if (draft.contentType === 'painting') {
    if (!draft.painting.title.trim()) errors.push('Painting title is required.')
    if (!draft.paintingCy.title.trim()) errors.push('Welsh painting title is required.')
  }

  if (draft.contentType === 'artifacts') {
    if (!draft.artifact.title.trim()) errors.push('Artefact title is required.')
    if (!draft.artifactCy.title.trim()) errors.push('Welsh artefact title is required.')
  }

  if (draft.contentType === 'bio') {
    if (!draft.bio.name.trim()) errors.push('Biography name is required.')
  }

  if (!draft.slug.trim()) {
    errors.push('Slug is required.')
  }

  return errors
}