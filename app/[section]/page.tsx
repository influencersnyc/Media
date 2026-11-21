import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AdvertisingProducts, Button, Editorial, PageIntro, Publications } from '../../components/ui'
import { SubmissionForm } from '../../components/submission-form'

const pages = {
  publications: ['Our Publications', 'Explore the independent publications in the Influencers.NYC media network.'],
  'the-edit': ['The Edit', 'Coverage of the people, relationships, technologies, and ideas shaping digital culture.'],
  advertise: ['Advertise', 'Your Brand. The Right Audience. Real Influence.'],
  partnerships: ['Partnerships', 'Collaborate with Influencers.NYC on editorial projects, research, creator initiatives, and brand partnerships.'],
  about: ['About Influencers.NYC', 'Independent Media. Connected Influence.'],
  contact: ['Contact', 'Get in touch with Influencers.NYC for general questions, media inquiries, and corrections.'],
  privacy: ['Privacy Policy', 'How Influencers.NYC handles information submitted on this site.'],
  terms: ['Terms of Use', 'Terms for using the Influencers.NYC website.'],
  'advertising-disclosure': ['Advertising Disclosure', 'How we identify paid placements and commercial relationships.'],
  'editorial-standards': ['Editorial Standards', 'How we approach independent reporting, reviews, sourcing, and corrections.'],
} as const
type Section = keyof typeof pages
type Props = { params: Promise<{ section: string }> }
function sectionName(section: string): Section {
  if (!Object.hasOwn(pages, section)) notFound()
  return section as Section
}

export function generateStaticParams() {
  return Object.keys(pages).map(section => ({ section }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = sectionName((await params).section)
  const [title, description] = pages[section]
  return { title, description, alternates: { canonical: '/' + section }, openGraph: { title, description } }
}

function Content({ section }: { section: Section }) {
  switch (section) {
    case 'publications': return <Publications />
    case 'the-edit': return <><p>Explore our editorial coverage areas.</p><Editorial /></>
    case 'advertise': return <><AdvertisingProducts /><p>Tell us about your goals and preferred publications. We review requests and confirm pricing and availability individually.</p><div className="actions"><Button href="/advertise/inquire">Start an Inquiry</Button><Button href="/advertise/media-kit" secondary>View Media Kit</Button></div></>
    case 'partnerships': return <div className="prose"><p>We welcome proposals from brands, agencies, technology teams, independent creators, media collaborators, and research organizations. Tell us what you are working on, who it serves, and how you would like to collaborate.</p><SubmissionForm kind="contact" topic="Partnerships" /></div>
    case 'about': return <div className="prose"><p>Influencers.NYC is an independent media network covering human and virtual influence, relationships, consumer technology, and culture.</p><p>Our first publication, Silver Circuit, publishes independent reviews and guides about AI companions and care technology for older adults and their families.</p><Button href="/publications">Explore Our Publications</Button></div>
    case 'contact': return <SubmissionForm kind="contact" />
    case 'privacy': return <div className="prose"><h2>Information you provide</h2><p>We use contact and advertising inquiry details to respond to your message and evaluate your request. We use newsletter email addresses to manage subscriptions and send requested updates when available.</p><h2>Service providers</h2><p>Our hosting, submission storage, and email providers process information to operate the site and deliver responses. We restrict access to submitted records to authorized operators.</p><h2>Privacy requests</h2><p>Use our <a href="/contact">contact form</a> to ask about your information or request removal or newsletter opt-out.</p></div>
    case 'terms': return <div className="prose"><h2>Use of this website</h2><p>You may read and share links to our content. Please respect applicable intellectual property rights and use forms for legitimate inquiries.</p><h2>Advertising inquiries</h2><p>Sending an inquiry starts a review. Pricing, availability, and campaign terms are confirmed in writing before a booking.</p><h2>External sites</h2><p>Linked sites publish their own policies and terms. For questions about Influencers.NYC, <a href="/contact">contact us</a>.</p></div>
    case 'advertising-disclosure': return <div className="prose"><h2>Paid placements</h2><p>We label paid ads and sponsored editorial so readers can identify the commercial relationship. We identify affiliate relationships where they apply.</p><h2>Editorial independence</h2><p>Advertisers cannot purchase favorable reviews, ratings, or conclusions. Read our <a href="/editorial-standards">editorial standards</a> for our approach to reviews and sourcing.</p></div>
    case 'editorial-standards': return <div className="prose"><h2>Reporting and reviews</h2><p>We attribute external reporting, cite sources, and identify relevant commercial relationships. Reviews reflect editorial judgment. Paid features carry clear disclosures.</p><h2>Corrections and updates</h2><p>We date updates and identify substantive corrections. If you see an error, <a href="/contact">send us the article link and the details</a>.</p></div>
  }
}

export default async function Page({ params }: Props) {
  const section = sectionName((await params).section)
  return <><PageIntro title={pages[section][0]} description={pages[section][1]} /><section className="wrap page-content"><Content section={section} /></section></>
}
