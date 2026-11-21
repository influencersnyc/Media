import { AdvertisingProducts, Button, PageIntro, Publications } from '../../../components/ui'
export const metadata = { title: 'Media Kit', description: 'Advertising formats and publication audiences within the Influencers.NYC network.', alternates: { canonical: '/advertise/media-kit' } }
export default function Page() {
  return <><PageIntro title="Media Kit" description="Explore publication audiences, placement formats, and custom sponsorship opportunities." /><section className="wrap page-content">
    <h2>Our publications</h2><Publications /><h2 className="mt-12 mb-4">Advertising formats</h2><AdvertisingProducts />
    <p>Availability, specifications, and pricing are provided with your campaign proposal.</p><div className="actions"><Button href="/advertise/inquire">Request a Proposal</Button></div>
  </section></>
}
