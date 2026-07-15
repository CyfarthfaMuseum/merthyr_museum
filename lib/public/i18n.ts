import type { PublicLanguage } from "./types"

const ui = {
  // Navigation / left menu
  "nav.map":          { en: "Map",          cy: "Map" },
  "nav.creativity":   { en: "Creations",    cy: "Creadigaethau" },
  "nav.activism":     { en: "Stories",      cy: "Straeon" },
  "nav.industry":     { en: "Discoveries",  cy: "Darganfyddiadau" },
  "nav.everyday":     { en: "Figures",      cy: "Ffigurau" },
  "nav.books":        { en: "Books",        cy: "Llyfrau" },
  "nav.paintings":    { en: "Paintings",    cy: "Peintiadau" },
  "nav.closeMenu":    { en: "Close menu",   cy: "Cau'r ddewislen" },

  // Category filter chips (labels match the left-panel nav)
  "filter.all":        { en: "All",          cy: "Pob un" },
  "filter.painting":   { en: "Creations",    cy: "Creadigaethau" },
  "filter.book":       { en: "Books",        cy: "Llyfrau" },
  "filter.story":      { en: "Stories",      cy: "Straeon" },
  "filter.artefact":   { en: "Discoveries",  cy: "Darganfyddiadau" },
  "filter.biography":  { en: "Figures",      cy: "Ffigurau" },

  // Content type labels
  "type.painting":     { en: "Painting",     cy: "Peintiad" },
  "type.book":         { en: "Book",         cy: "Llyfr" },
  "type.story":        { en: "Story",        cy: "Stori" },
  "type.artefact":     { en: "Artefact",     cy: "Arteffact" },
  "type.biography":    { en: "Biography",    cy: "Bywgraffiad" },

  // Sidebar tabs
  "sidebar.about":           { en: "About",                         cy: "Amdano" },
  "sidebar.audio":           { en: "Audio",                         cy: "Sain" },
  "sidebar.details":         { en: "Details",                       cy: "Manylion" },
  "sidebar.noContent":       { en: "No additional content available.", cy: "Dim cynnwys ychwanegol ar gael." },
  "sidebar.noAudio":         { en: "No audio available.",            cy: "Dim sain ar gael." },
  "sidebar.unavailable":     { en: "Unavailable",                   cy: "Ddim ar gael" },
  "sidebar.viewFullDetails": { en: "View full details",             cy: "Gweld yr holl fanylion" },
  "sidebar.related":         { en: "Related",                       cy: "Cysylltiedig" },
  "sidebar.closePanel":      { en: "Close panel",                   cy: "Cau'r panel" },

  // Detail field labels
  "field.author":          { en: "Author",           cy: "Awdur" },
  "field.publisher":       { en: "Publisher",        cy: "Cyhoeddwr" },
  "field.isbn":            { en: "ISBN",             cy: "ISBN" },
  "field.publicationYear": { en: "Publication year", cy: "Blwyddyn cyhoeddi" },
  "field.artist":          { en: "Artist",           cy: "Artist" },
  "field.year":            { en: "Year",             cy: "Blwyddyn" },
  "field.medium":          { en: "Medium",           cy: "Cyfrwng" },
  "field.dimensions":      { en: "Dimensions",       cy: "Dimensiynau" },
  "field.collection":      { en: "Collection",       cy: "Casgliad" },
  "field.imageCredit":     { en: "Image credit",     cy: "Credyd delwedd" },
  "field.maker":           { en: "Maker",            cy: "Gwneuthurwr" },
  "field.date":            { en: "Date",             cy: "Dyddiad" },
  "field.material":        { en: "Material",         cy: "Deunydd" },
  "field.reference":       { en: "Reference",        cy: "Cyfeirnod" },
  "field.dates":           { en: "Dates",            cy: "Dyddiadau" },
  "field.born":            { en: "Born",             cy: "Ganwyd" },
  "field.occupation":      { en: "Occupation",       cy: "Galwedigaeth" },
  "field.person":          { en: "Person",           cy: "Person" },
  "field.name":            { en: "Name",             cy: "Enw" },
  "field.origin":          { en: "Origin",           cy: "Tarddiad" },
  "field.birthPlace":      { en: "Birth place",      cy: "Man geni" },
  "field.created":         { en: "Created",          cy: "Crëwyd" },

  // Detail page tabs
  "tab.caption":  { en: "Caption",  cy: "Capsiwn" },
  "tab.location": { en: "Location", cy: "Lleoliad" },

  // Detail page states / actions
  "state.detailsToFollow": { en: "Details to follow.", cy: "Manylion i ddilyn." },
  "state.contentToFollow": { en: "Content to follow.", cy: "Cynnwys i ddilyn." },
  "state.imagePending":    { en: "Image pending",      cy: "Delwedd ar y ffordd" },
  "action.goBack":         { en: "Go back",             cy: "Yn ôl" },
  "action.viewFullScreen": { en: "View image full screen", cy: "Gweld y ddelwedd yn llawn sgrin" },
  "media.galleryImage":    { en: "Gallery image",      cy: "Delwedd oriel" },

  // Home page
  "home.openMap":        { en: "Open Map",       cy: "Agor y Map" },
  "home.books":          { en: "Books",           cy: "Llyfrau" },
  "home.paintings":      { en: "Paintings",       cy: "Peintiadau" },
  "home.browseMerthyr":  { en: "Browse Merthyr",  cy: "Pori Merthyr" },
  "home.search":         { en: "Search",          cy: "Chwilio" },
  "home.seeAll":         { en: "See all",         cy: "Gweld i gyd" },
} satisfies Record<string, Record<"en" | "cy", string>>

export type UIKey = keyof typeof ui

export function t(key: UIKey, lang: PublicLanguage): string {
  return ui[key][lang] ?? ui[key].en
}
