import { Button, PageIntro } from '../components/ui'

export const metadata = { title: 'Page Not Found', robots: { index: false, follow: false } }

export default function NotFound() {
  return <>
    <PageIntro title="Page not found" description="The page you are looking for does not exist or may have moved." />
    <section className="wrap page-content"><div className="actions">
      <Button href="/">Back to Home</Button>
      <Button href="/contact" secondary>Contact Us</Button>
    </div></section>
  </>
}
