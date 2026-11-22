const upcoming = [
  ['Inquiries', 'Review form intake and promote inquiries to advertisers and proposals.'],
  ['Advertisers', 'Manage advertiser records and statuses.'],
  ['Inventory', 'Maintain the placement catalog and availability per publication.'],
  ['Campaigns', 'Proposals, approvals, scheduling, and lifecycle management.'],
  ['Reports', 'Delivery reporting from real campaign metrics.'],
] as const

export default function AdminDashboard() {
  return <section className="wrap page-content">
    <h1>Administration</h1>
    <p>Phase 2, Milestone 1 is in place: authentication, the administrative schema, row-level security, and audit logging. The following sections arrive with the next milestones.</p>
    <div className="grid-cards">{upcoming.map(([name, detail]) =>
      <article key={name}><h2>{name}</h2><p>{detail}</p><p><em>Coming in a later milestone</em></p></article>)}
    </div>
  </section>
}
