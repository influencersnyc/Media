export const site = 'https://influencers.nyc'
export const description = 'An independent media network exploring the people, technology, relationships, and cultural movements shaping what comes next.'

export const publications = [{
  id: 'silver-circuit',
  slug: 'silver-circuit',
  name: 'Silver Circuit',
  website: 'https://www.silvercircuit.care/',
  logo: null,
  cover: null,
  description: 'Independent reviews and practical guides to AI companions and care technology for older adults and their families.',
  category: 'AI Companions & Senior Technology',
  topics: ['AI companions', 'Senior technology', 'Care innovation'],
  audience: 'Older adults, families, and caregivers exploring technology for everyday life.',
  status: 'active',
  advertisingEligible: true,
  contact: '/contact',
  displayOrder: 1,
  createdAt: null,
  updatedAt: null,
}].sort((a, b) => a.displayOrder - b.displayOrder)

export const categories = [
  'Human Influencers & Creators', 'Virtual Influencers & Digital Identities',
  'Friendship & Modern Relationships', 'Emerging Technology', 'Culture & Trends',
  'Independent Reviews & Guides',
] as const

export type Article = {
  slug: string
  title: string
  excerpt: string
  image?: { src: string; alt: string }
  author: string
  publishedAt: string
  updatedAt?: string
  category: typeof categories[number]
  tags: string[]
  paragraphs: string[]
  sources: { title: string; url: string }[]
  related: string[]
  seoTitle?: string
  seoDescription?: string
  disclosure?: string
}

export const articles: Article[] = []

export const products = [
  ['Display Advertising', 'Homepage, article, sidebar and mobile-responsive placements.'],
  ['Sponsored Editorial', 'A clearly labeled feature developed around an agreed brief.'],
  ['Newsletter Sponsorship', 'A sponsor placement in an eligible newsletter issue.'],
  ['Category Sponsorship', 'A presence around a relevant editorial category.'],
  ['Network Campaign', 'A coordinated campaign across eligible network publications.'],
] as const
