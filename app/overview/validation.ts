import type { OverviewDraft } from './types'

export function validateDraft(draft: OverviewDraft): string[] {
  const errors: string[] = []

  if (!draft.slug.trim()) {
    errors.push('Slug is required.')
  }

  if (draft.contentType === 'book') {
    if (!draft.book.title.trim()) errors.push('Book title is required.')
    if (!draft.book.summary.trim()) errors.push('Book summary is required.')
  }

  if (draft.contentType === 'stories') {
    if (!draft.story.title.trim()) errors.push('Story title is required.')
    if (!draft.story.summary.trim()) errors.push('Story summary is required.')
  }

  if (draft.contentType === 'painting') {
    if (!draft.painting.title.trim()) errors.push('Painting title is required.')
  }

  if (draft.contentType === 'artifacts') {
    if (!draft.artifact.title.trim()) errors.push('Artefact title is required.')
  }

  if (draft.contentType === 'bio') {
    if (!draft.bio.name.trim()) errors.push('Biography name is required.')
  }

  return errors
}