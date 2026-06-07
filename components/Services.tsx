"use client";

import { useState } from "react";
import { SERVICES } from "@/lib/data";

export default function Services() {
  const [openIdx, setOpenIdx] = useState(0); // accordion — default open row 0

  return (
    <section id="services" className="services">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label mono">[ 01 / Services ]</div>
          <h2 className="section-title">
            Six things we build.{" "}
            <span style={{ color: "var(--muted)" }}>All of them pay for themselves.</span>
          </h2>
        </div>

        <div className="service-list">
          {SERVICES.map((s, i) => {
            const open = openIdx === i;
            return (
              <div
                key={s.num}
                className={`service-row ${open ? "open" : ""}`}
                onClick={() => setOpenIdx(open ? -1 : i)}
              >
                <div className="service-num mono">{s.num}</div>
                <button
                  className="service-name"
                  aria-expanded={open}
                  aria-controls={`service-detail-${s.num}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIdx(open ? -1 : i);
                  }}
                >
                  {s.name}
                </button>
                <div className="service-tag">{s.tag}</div>
                <div className="service-toggle" aria-hidden="true">
                  +
                </div>
                <div className="service-detail" id={`service-detail-${s.num}`}>
                  <div className="service-detail-grid">
                    <div>
                      <h4>What&apos;s included</h4>
                      <ul>
                        {s.includes.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>Typical stack</h4>
                      <ul>
                        {s.stack.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
