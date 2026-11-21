import Link from 'next/link'
import { Button, Editorial, Publications } from '../components/ui'
import { SubmissionForm } from '../components/submission-form'
import { description, site } from '../content/network'

export const metadata = { alternates: { canonical: '/' } }

export default function Home() {
  const organization = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Influencers.NYC', url: site, description }
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    <section className="hero"><div aria-hidden="true" className="hero-art"><div /><div /><div /></div>
      <div className="wrap hero-copy"><p className="kicker">Human. Artificial. Cultural. Influential.</p>
        <h1>The Future of<br /> Influence <em>Starts Here.</em></h1><p>{description}</p>
        <div className="actions"><Button href="/publications">Explore Our Publications</Button><Button href="/advertise" secondary>Advertise With Us</Button></div>
      </div>
    </section>
    <section className="section paper"><div className="wrap"><div className="section-head"><h2>Our Media Network</h2><Link href="/publications">All publications →</Link></div><Publications /></div></section>
    <section className="section"><div className="wrap"><div className="section-head"><h2>The Latest Edit</h2><Link href="/the-edit">Explore The Edit →</Link></div><Editorial /></div></section>
    <section className="section band"><div className="wrap split"><div><p className="kicker">Advertising & sponsorship</p><h2>Your Brand. Our Network.</h2><p>Reach relevant audiences through managed advertising, sponsorships, and custom campaigns across eligible publications.</p><Button href="/advertise">Explore Advertising</Button></div>
      <div><h2>Partnerships</h2><p>Work with us on projects that bring together brands, agencies, technology companies, creators, media collaborators, and researchers.</p><Button href="/partnerships" secondary>Explore Partnerships</Button></div></div></section>
    <section className="section paper"><div className="wrap split"><div><h2>Network updates</h2><p>Get editorial and publication updates from Influencers.NYC.</p></div><SubmissionForm kind="newsletter" /></div></section>
  </>
}
