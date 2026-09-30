export function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">About Golf Liquidation</h1>
        <p className="section__sub">
          Founded in 2020 and built in Texas — we turn distressed golf inventory into deals
          for everyday players.
        </p>

        <div className="feature-grid" style={{ marginTop: "1.25rem" }}>
          <article className="feature-card">
            <h3>Our story</h3>
            <p>
              Golf Liquidation started when local pro shops began closing faster than
              golfers could snap up the remaining stock. We stepped in to buy entire
              inventories — fairly, quickly, and with respect for the shops that came
              before us.
            </p>
          </article>
          <article className="feature-card">
            <h3>What we buy</h3>
            <p>
              Closing retail locations, fitting studio build-outs, wholesaler closeouts,
              and selective estate lots. If it&apos;s golf-related and we can verify
              authenticity, we&apos;re interested.
            </p>
          </article>
          <article className="feature-card">
            <h3>How we sell</h3>
            <p>
              Listings on this site move fast. Every item is photographed, graded for
              condition, and priced to reflect true liquidation value — not mall markup.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
