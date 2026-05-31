import { API_URL } from './api'

// Returns a newest-first copy of a resource list without mutating the original array.
export function sortByCreatedAt(items) {
  return [...items].sort(
    (first, second) =>
      new Date(second.created_at || 0).getTime() -
      new Date(first.created_at || 0).getTime(),
  )
}

// Produces short card copy, using fallback text when the resource has no useful summary.
export function summarize(text, fallback) {
  const cleanText = (text || fallback).trim()
  if (cleanText.length <= 112) return cleanText
  return `${cleanText.slice(0, 109).trim()}...`
}

// Builds up to two initials from a display name for avatar fallbacks.
export function initialsFor(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

// Chooses the best wide/card image for a resource and resolves it against the API host.
export function resourceImage(resource) {
  const path =
    resource.banner_image?.url ||
    resource.cover_image?.url ||
    resource.portrait_image?.url ||
    resource.crest_image?.url
  return absoluteApiUrl(path)
}

// Chooses the best portrait image for a resource and resolves it against the API host.
export function resourcePortrait(resource) {
  const path =
    resource.portrait_image?.url ||
    resource.crest_image?.url ||
    resource.banner_image?.url ||
    resource.cover_image?.url
  return absoluteApiUrl(path)
}

// Resolves an arbitrary attachment URL returned by the API.
export function attachmentUrl(attachment) {
  return absoluteApiUrl(attachment?.url)
}

// Looks up a linked resource's name by id, keeping the UI readable when only ids are present.
export function displayNameById(items, id, fallbackLabel) {
  if (!id) return ''
  const item = items.find((candidate) => String(candidate.id) === String(id))
  return item?.name || `${fallbackLabel} #${id}`
}

// Converts API-relative upload paths into browser-loadable absolute URLs.
function absoluteApiUrl(path) {
  if (!path) return ''
  return /^https?:\/\//i.test(path) ? path : `${API_URL}${path}`
}

// Converts plain text into simple paragraphs, while preserving existing HTML drafts.
export function normalizeEditableHtml(value) {
  if (!value.trim()) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return value

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

// Escapes user-written plain text before converting it into HTML snippets.
export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

// Turns headings into stable fragment ids for the article table of contents.
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Sanitizes article HTML to the small wiki-safe subset rendered with dangerouslySetInnerHTML.
export function sanitizeArticleHtml(rawHtml) {
  const fallbackHtml =
    '<h2>Overview</h2><p>This universe does not have a written article yet.</p>'
  const parser = new DOMParser()
  const doc = parser.parseFromString(
    normalizeEditableHtml(rawHtml || fallbackHtml),
    'text/html',
  )
  const allowedTags = new Set([
    'A',
    'B',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'EM',
    'H2',
    'H3',
    'H4',
    'HR',
    'I',
    'IMG',
    'LI',
    'OL',
    'P',
    'PRE',
    'STRONG',
    'TABLE',
    'TBODY',
    'TD',
    'TH',
    'THEAD',
    'TR',
    'UL',
  ])
  const toc = []

  doc.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    ;[...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value
      const isSafeUrl =
        /^(https?:|mailto:|#)/i.test(value) && !/javascript:/i.test(value)
      const keepAttribute =
        (element.tagName === 'A' && name === 'href' && isSafeUrl) ||
        (element.tagName === 'IMG' && name === 'src' && /^https?:/i.test(value)) ||
        (['alt', 'title'].includes(name) && ['A', 'IMG'].includes(element.tagName))

      if (!keepAttribute) element.removeAttribute(attribute.name)
    })

    if (element.tagName === 'A') {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noreferrer')
    }

    if (element.tagName === 'IMG') {
      element.setAttribute('loading', 'lazy')
    }

    if (['H2', 'H3'].includes(element.tagName)) {
      const title = element.textContent.trim()
      if (!title) return

      const id = slugify(title) || `section-${toc.length + 1}`
      element.id = id
      toc.push({ id, level: element.tagName === 'H2' ? 2 : 3, title })
    }
  })

  if (toc.length === 0) {
    toc.push({ id: 'article', level: 2, title: 'Article' })
  }

  return { html: doc.body.innerHTML, toc }
}

// Converts stored article HTML into the structured plain-text editor model.
export function parseArticleSections(rawHtml) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(normalizeEditableHtml(rawHtml || ''), 'text/html')
  const sections = []
  const intro = []
  let currentSection = null

  ;[...doc.body.children].forEach((element) => {
    if (element.tagName === 'H2') {
      currentSection = { body: '', title: element.textContent.trim() }
      sections.push(currentSection)
      return
    }

    const text = element.textContent.trim()
    if (!text) return

    if (currentSection) {
      currentSection.body = [currentSection.body, text].filter(Boolean).join('\n\n')
    } else {
      intro.push(text)
    }
  })

  return {
    intro: intro.join('\n\n'),
    sections:
      sections.length > 0
        ? sections
        : [{ body: '', title: 'Overview' }],
  }
}

// Converts plain-text paragraphs into escaped <p> blocks for the saved article HTML.
function paragraphsToHtml(text) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

// Converts the friendly editor model back into the HTML article format expected by the API.
export function sectionsToHtml(article) {
  const introHtml = paragraphsToHtml(article.intro)
  const sectionHtml = article.sections
    .filter((section) => section.title.trim() || section.body.trim())
    .map(
      (section) =>
        `<h2>${escapeHtml(section.title.trim() || 'Untitled section')}</h2>${paragraphsToHtml(section.body)}`,
    )
    .join('')

  return `${introHtml}${sectionHtml}` || '<h2>Overview</h2><p>Write your article here.</p>'
}
