import type { Metadata } from 'next'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { Theme } from '../components/theme'
import { description, site } from '../content/network'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'Influencers.NYC | Independent Media. Connected Influence.', template: '%s | Influencers.NYC' },
  description,
  openGraph: { siteName: 'Influencers.NYC', type: 'website', description },
  twitter: { card: 'summary_large_image' },
  robots: process.env.VERCEL_ENV === 'preview' ? { index: false, follow: false } : undefined,
}

// Applies the saved or preferred theme before first paint to avoid a flash.
const themeScript = "try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}catch(e){}"

const navigation = [
  ['/', 'Home'], ['/publications', 'Our Publications'], ['/the-edit', 'The Edit'],
  ['/advertise', 'Advertise'], ['/partnerships', 'Partnerships'], ['/about', 'About'], ['/contact', 'Contact'],
]
const policies = [
  ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/advertising-disclosure', 'Advertising Disclosure'], ['/editorial-standards', 'Editorial Standards'],
]

function Navigation() {
  return <ul>{navigation.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  </head><body>
    <a className="skip" href="#main">Skip to content</a>
    <header className="masthead"><div className="wrap bar">
      <Link className="wordmark" href="/">Influencers<span>.NYC</span></Link>
      <nav className="desktop-nav" aria-label="Primary"><Navigation /></nav>
      <details className="mobile-nav"><summary>Menu</summary><nav aria-label="Primary"><Navigation /></nav></details>
      <Theme />
    </div></header>
    <main id="main">{children}</main>
    <footer><div className="wrap footer-grid"><div><Link className="wordmark" href="/">Influencers<span>.NYC</span></Link><p>Independent Media. Connected Influence.</p></div>
      <nav aria-label="Site links"><Navigation /><Link href="/advertise/media-kit">Media Kit</Link></nav>
      <nav aria-label="Policies"><ul>{policies.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></nav>
    </div></footer>
    {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' && <Analytics />}
  </body></html>
}
