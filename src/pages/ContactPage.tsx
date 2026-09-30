import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";

const CONTACT_EMAIL = "golfliquidation@gmail.com";

export function ContactPage() {
  const [params] = useSearchParams();
  const item = params.get("item");
  const [name, setName] = useState("");
  const [message, setMessage] = useState(
    item ? `Hi, I'm interested in: ${item}\n\n` : "",
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = item ? `Inquiry: ${item}` : "Golf Liquidation inquiry";
    const body = `${message.trim()}\n\n${name.trim()}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="section__title">Contact</h1>
        <p className="section__sub">
          Questions on a listing, bulk buys, or shop closeouts? Reach out and we&apos;ll get
          back quickly.
        </p>

        <div className="contact-card" style={{ marginTop: "1rem" }}>
          <p style={{ margin: 0 }}>
            <strong>Email</strong>
            <br />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p style={{ margin: 0 }}>
            <strong>Based in</strong>
            <br />
            Texas, USA. Shipping available on most items.
          </p>
        </div>

        <form
          className="form-stack contact-card"
          style={{ marginTop: "1rem" }}
          onSubmit={handleSubmit}
        >
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block">
            Send message
          </button>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
            Opens your email app with your message ready to send.
          </p>
        </form>
      </div>
    </section>
  );
}
