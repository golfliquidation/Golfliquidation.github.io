export function ContactPage() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">Contact</h1>
        <p className="section__sub">
          Questions on a listing, bulk buys, or shop closeouts — reach out and we&apos;ll
          get back quickly.
        </p>

        <div className="contact-card" style={{ marginTop: "1rem" }}>
          <p>
            <strong>Email</strong>
            <br />
            <a href="mailto:golfliquidation@gmail.com">golfliquidation@gmail.com</a>
          </p>
          <p>
            <strong>Based in</strong>
            <br />
            Texas, USA — shipping available on most items.
          </p>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
            Prefer text? Add your number in Supabase settings later — this form is a static
            placeholder until you wire your preferred channel.
          </p>
        </div>

        <form
          className="form-stack contact-card"
          style={{ marginTop: "1rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks! Connect Supabase or your email provider to route messages.");
          }}
        >
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required />
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}
