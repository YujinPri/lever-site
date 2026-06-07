import BookingCalendar from "./BookingCalendar";

export default function Availability() {
  return (
    <section id="availability" className="services avail">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label mono">[ 03 / Availability ]</div>
          <h2 className="section-title">
            Pick a time that works.{" "}
            <span style={{ color: "var(--muted)" }}>
              Live calendar — what you see is what&apos;s open.
            </span>
          </h2>
        </div>
        <BookingCalendar />
      </div>
    </section>
  );
}
