import { SubmissionForm } from '../../../components/submission-form'
import { PageIntro } from '../../../components/ui'
export const metadata = { title: 'Advertiser Inquiry', description: 'Tell Influencers.NYC about your campaign and the publications you want to reach.', alternates: { canonical: '/advertise/inquire' } }
export default async function Page({ searchParams }: { searchParams: Promise<{ publication?: string }> }) {
  const { publication } = await searchParams
  return <><PageIntro title="Advertiser Inquiry" description="Share your campaign details. Our team reviews each inquiry and follows up about availability and pricing." /><section className="wrap page-content"><SubmissionForm kind="inquiries" publication={publication} /></section></>
}
