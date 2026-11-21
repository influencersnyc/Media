// Content integrity checks for the Influencers.NYC network records.
// Runs on Node 22+ with type stripping; no additional dependencies.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articles, categories, products, publications, site } from '../content/network.ts'

const isHttpsUrl = value => {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}
const isIsoDate = value => /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value))

test('site identity', () => {
  assert.equal(site, 'https://influencers.nyc')
  assert.ok(isHttpsUrl(site))
})

test('editorial categories match the approved coverage areas', () => {
  assert.deepEqual([...categories], [
    'Human Influencers & Creators',
    'Virtual Influencers & Digital Identities',
    'Friendship & Modern Relationships',
    'Emerging Technology',
    'Culture & Trends',
    'Independent Reviews & Guides',
  ])
})

test('publication records are complete and unique', () => {
  assert.ok(publications.length >= 1, 'at least one publication is required')
  const slugs = new Set()
  for (const p of publications) {
    assert.ok(!slugs.has(p.slug), `duplicate slug ${p.slug}`)
    slugs.add(p.slug)
    for (const field of ['id', 'slug', 'name', 'description', 'category', 'audience'])
      assert.ok(p[field] && String(p[field]).trim(), `${p.slug}: ${field} is required`)
    assert.ok(isHttpsUrl(p.website), `${p.slug}: website must be an HTTPS URL`)
    assert.ok(['active', 'upcoming', 'archived'].includes(p.status), `${p.slug}: invalid status`)
    assert.ok(Number.isInteger(p.displayOrder), `${p.slug}: displayOrder must be an integer`)
    assert.ok(p.topics.length > 0, `${p.slug}: at least one topic is required`)
    if (p.logo) assert.ok(p.logo.startsWith('/') || isHttpsUrl(p.logo), `${p.slug}: logo must be a local or HTTPS URL`)
    if (p.cover) assert.ok(p.cover.startsWith('/') || isHttpsUrl(p.cover), `${p.slug}: cover must be a local or HTTPS URL`)
  }
})

test('Silver Circuit is listed as the first active property', () => {
  const silver = publications.find(p => p.slug === 'silver-circuit')
  assert.ok(silver, 'silver-circuit record missing')
  assert.equal(silver.status, 'active')
  assert.equal(silver.website, 'https://www.silvercircuit.care/')
  assert.equal(silver.category, 'AI Companions & Senior Technology')
})

test('advertising products are defined without published rates', () => {
  assert.ok(products.length >= 5, 'expected the five advertising products')
  for (const [name, detail] of products) {
    assert.ok(name.trim() && detail.trim(), 'product name and detail are required')
    assert.ok(!/\$\d/.test(name + detail), `draft rates must not be published: ${name}`)
  }
})

test('articles meet editorial requirements', () => {
  const slugs = new Set(articles.map(a => a.slug))
  assert.equal(slugs.size, articles.length, 'article slugs must be unique')
  for (const a of articles) {
    assert.ok(a.title.trim() && a.excerpt.trim(), `${a.slug}: title and excerpt are required`)
    assert.ok(categories.includes(a.category), `${a.slug}: unknown category ${a.category}`)
    assert.ok(a.author.trim(), `${a.slug}: author is required`)
    assert.ok(isIsoDate(a.publishedAt), `${a.slug}: publishedAt must be an ISO date`)
    if (a.updatedAt) {
      assert.ok(isIsoDate(a.updatedAt), `${a.slug}: updatedAt must be an ISO date`)
      assert.ok(Date.parse(a.updatedAt) >= Date.parse(a.publishedAt), `${a.slug}: updatedAt before publishedAt`)
    }
    assert.ok(a.paragraphs.length > 0, `${a.slug}: article body is required`)
    for (const source of a.sources)
      assert.ok(isHttpsUrl(source.url) || source.url.startsWith('http:'), `${a.slug}: source URL invalid`)
    for (const related of a.related)
      assert.ok(slugs.has(related), `${a.slug}: related article ${related} does not exist`)
    if (a.image) assert.ok(a.image.src.startsWith('/') && a.image.alt.trim(), `${a.slug}: image needs a local src and alt text`)
  }
})
