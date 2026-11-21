import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { articles } from '../../../content/network'
import { PageIntro } from '../../../components/ui'

type Props = { params: Promise<{ slug: string }> }
async function getArticle({ params }: Props) {
  const { slug } = await params
  const article = articles.find(item => item.slug === slug)
  if (!article) notFound()
  return article
}
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }))
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const a = await getArticle(props)
  const title = a.seoTitle ?? a.title
  const description = a.seoDescription ?? a.excerpt
  return { title, description, alternates: { canonical: '/the-edit/' + a.slug }, openGraph: {
    type: 'article', title, description, authors: [a.author], publishedTime: a.publishedAt,
    modifiedTime: a.updatedAt, tags: a.tags, images: a.image ? [a.image.src] : undefined,
  } }
}
export default async function Page(props: Props) {
  const a = await getArticle(props)
  const related = articles.filter(item => a.related.includes(item.slug))
  return <article><PageIntro title={a.title} description={a.excerpt}><p>{a.category} · {a.author} · <time dateTime={a.publishedAt}>{a.publishedAt}</time>
    {a.updatedAt && <> · Updated <time dateTime={a.updatedAt}>{a.updatedAt}</time></>}</p></PageIntro>
    <div className="wrap page-content"><div className="prose">
      {a.disclosure && <p><strong>{a.disclosure}</strong></p>}
      {a.image && <Image src={a.image.src} alt={a.image.alt} width={1200} height={675} sizes="(max-width: 760px) 100vw, 736px" />}
      {a.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {a.sources.length > 0 && <><h2>Sources</h2><ul>{a.sources.map(source => <li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ul></>}
      {related.length > 0 && <><h2>Related Articles</h2><ul>{related.map(item => <li key={item.slug}><Link href={'/the-edit/' + item.slug}>{item.title}</Link></li>)}</ul></>}
    </div></div></article>
}
