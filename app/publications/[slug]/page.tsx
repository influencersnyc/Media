import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { publications } from '../../../content/network'
import { Button, PageIntro } from '../../../components/ui'

type Props = { params: Promise<{ slug: string }> }
async function publication({ params }: Props) {
  const { slug } = await params
  const match = publications.find(p => p.slug === slug && p.status !== 'archived')
  if (!match) notFound()
  return match
}
export function generateStaticParams() {
  return publications.filter(p => p.status !== 'archived').map(({ slug }) => ({ slug }))
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const { name: title, description, slug } = await publication(props)
  return { title, description, alternates: { canonical: '/publications/' + slug }, openGraph: { title, description } }
}
export default async function Page(props: Props) {
  const p = await publication(props)
  return <><PageIntro title={p.name} description={p.description}><Button href={p.website}>Visit {p.name}</Button></PageIntro>
    <section className="wrap page-content"><div className="prose"><h2>{p.category}</h2><p>{p.audience}</p>
      <ul className="topics">{p.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
      {p.advertisingEligible && <Button href={'/advertise/inquire?publication=' + p.slug} secondary>Inquire About Advertising</Button>}
    </div></section></>
}
