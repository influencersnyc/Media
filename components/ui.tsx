import Link from 'next/link'
import type { ReactNode } from 'react'
import { articles, categories, publications, products } from '../content/network'

export function Button({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={secondary ? 'button secondary' : 'button'}>{children}<span aria-hidden="true"> ↗</span></Link>
}

export function PageIntro({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <header className="intro wrap"><h1>{title}</h1>{description && <p>{description}</p>}{children}</header>
}

export function Publications() {
  return <div className="directory">{publications.filter(p => p.status !== 'archived').map(p =>
    <article className="publication" key={p.id}>
      <div className="publication-art" aria-hidden="true"><span>{p.name}</span></div>
      <div className="publication-body"><p className="kicker">{p.category}</p><h3>{p.name}</h3>
        <p>{p.description}</p><ul className="topics">{p.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
        <div className="actions"><Link href={'/publications/' + p.slug}>Publication profile <span aria-hidden="true">→</span></Link>
          <a href={p.website}>Visit {p.name} <span aria-hidden="true">↗</span></a></div>
      </div>
    </article>)}</div>
}

export function Editorial() {
  return <>{articles.length ? <div className="grid-cards">{[...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).map(article =>
    <article key={article.slug}><p className="kicker">{article.category}</p><h3><Link href={'/the-edit/' + article.slug}>{article.title}</Link></h3><p>{article.excerpt}</p></article>)}</div>
    : <ul className="coverage">{categories.map(category => <li key={category}>{category}</li>)}</ul>}</>
}

export function AdvertisingProducts() {
  return <div className="grid-cards">{products.map(([name, detail]) => <article key={name}><h2>{name}</h2><p>{detail}</p></article>)}</div>
}
