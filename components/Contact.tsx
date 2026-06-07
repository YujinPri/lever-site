import { site } from "@/lib/site";

export default function Contact() {
  return (
    <section id="contact" className="closing">
      <div className="wrap">
        <div className="closing-eyebrow mono">[ 04 / Get in touch ]</div>
        <h2>
          Let&apos;s find <span className="accent">an hour a day</span> your team can
          stop spending.
        </h2>
        <div className="closing-grid">
          {/* Booking now lives on-site: scroll up to the availability calendar */}
          <a href="#availability" className="closing-card">
            <div className="label">Primary</div>
            <div className="value">Book a 30-min audit</div>
            <div className="meta">
              Free. No pitch. We map one workflow live and tell you what&apos;s worth
              automating.
            </div>
            <div className="arrow-corner">→</div>
          </a>
          <a href={`mailto:${site.email}`} className="closing-card">
            <div className="label">Or email</div>
            <div className="value">{site.email}</div>
            <div className="meta">
              For longer briefs, partnerships, or if calendars are the enemy.
            </div>
            <div className="arrow-corner">→</div>
          </a>
        </div>
      </div>
    </section>
  );
}
