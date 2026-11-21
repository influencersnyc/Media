import { ImageResponse } from 'next/og'

export const alt = 'Influencers.NYC — Independent Media. Connected Influence.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '72px 84px', background: '#111419', color: '#ffffff',
      backgroundImage: 'radial-gradient(ellipse at 88% 50%, #71351f 0%, #30231f 34%, #111419 68%)',
    }}>
      <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', color: '#f3a46a', fontWeight: 700 }}>
        Human · Artificial · Cultural · Influential
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 28, fontSize: 92, lineHeight: 1.05, letterSpacing: -3, fontWeight: 700, maxWidth: 900 }}>
        The Future of Influence Starts Here.
      </div>
      <div style={{ display: 'flex', marginTop: 40, fontSize: 34, color: '#c5c9cf' }}>
        Influencers<span style={{ color: '#f3a46a' }}>.NYC</span>
      </div>
    </div>,
    size,
  )
}
