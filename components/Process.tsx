import { PROCESS } from "@/lib/data";

export default function Process() {
  return (
    <section id="process" className="services process">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label mono">[ 02 / How we work ]</div>
          <h2 className="section-title">
            Three steps. Two weeks.{" "}
            <span style={{ color: "var(--muted)" }}>Zero lock-in.</span>
          </h2>
        </div>
        <div className="process-grid">
          {PROCESS.map((p) => (
            <div className="process-step" key={p.num}>
              <div className="pnum">{p.num}</div>
              <h3>{p.name}</h3>
              <p>{p.body}</p>
              <div className="pmeta">{p.meta}</div>
            </div>
          ))}
        </div>
        <div className="guarantee">
          <div className="gmark">✓</div>
          <div className="gtext">
            If the free audit doesn&apos;t surface <b>at least an hour a day</b> worth
            automating, you walk away owing us <b>nothing</b>.
          </div>
        </div>
      </div>
    </section>
  );
}
