import type { OverviewDraft } from './types'

export function validateDraft(draft: OverviewDraft): string[] {
  const errors: string[] = []

  if (draft.contentType === 'book') {
    if (!draft.book.title.trim()) errors.push('Book title is required.')
    if (!draft.book.summary.trim()) errors.push('Book summary is required.')
  }

  if (draft.contentType === 'stories') {
    if (!draft.story.title.trim()) errors.push('Story title is required.')
    if (!draft.story.summary.trim()) errors.push('Story summary is required.')
    if (!draft.storyCy.title.trim()) errors.push('Welsh story title is required.')
    if (!draft.storyCy.summary.trim()) errors.push('Welsh story summary is required.')

    const hasDateRange = !!(draft.story.startDay || draft.story.startMonth || draft.story.startYear
      || draft.story.endDay || draft.story.endMonth || draft.story.endYear)
    const groupsSet = [hasDateRange, !!draft.story.periodId, !!draft.story.eraId].filter(Boolean).length
    if (groupsSet > 1) {
      errors.push('A story can only have one of an era, a period, or a date range.')
    }
  }

  if (draft.contentType === 'painting') {
    if (!draft.painting.title.trim()) errors.push('Painting title is required.')
    if (!draft.paintingCy.title.trim()) errors.push('Welsh painting title is required.')
  }

  if (draft.contentType === 'artifacts') {
    if (!draft.artifact.title.trim()) errors.push('Artefact title is required.')
    if (!draft.artifactCy.title.trim()) errors.push('Welsh artefact title is required.')

    const hasDateRange = !!(draft.artifact.startDay || draft.artifact.startMonth || draft.artifact.startYear
      || draft.artifact.endDay || draft.artifact.endMonth || draft.artifact.endYear)
    const groupsSet = [hasDateRange, !!draft.artifact.periodId, !!draft.artifact.eraId].filter(Boolean).length
    if (groupsSet > 1) {
      errors.push('An artefact can only have one of an era, a period, or a date range.')
    }
  }

  if (draft.contentType === 'bio') {
    if (!draft.bio.name.trim()) errors.push('Biography name is required.')
    if (!draft.bio.summary.trim()) errors.push('Biography summary is required.')
    if (!draft.bioCy.summary.trim()) errors.push('Welsh biography summary is required.')
    if (!draft.bio.content.trim()) errors.push('Biography content is required.')
    if (!draft.bioCy.content.trim()) errors.push('Welsh biography content is required.')
  }

  if (!draft.slug.trim()) {
    errors.push('Slug is required.')
  }

  return errors
}