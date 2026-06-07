"use client";

import { useEffect, useState } from "react";
import { HEADLINES } from "@/lib/data";
import { site } from "@/lib/site";

const ROTATE_MS = 4000;

export default function Hero() {
  const [rotIdx, setRotIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRotIdx((i) => (i + 1) % HEADLINES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const headline = HEADLINES[rotIdx];

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="eyebrow mono">
          Voice agents · Workflows · AI · Web &amp; Apps · est. {site.foundedYear}
        </div>
        <h1>
          {/* Keyed remount replays the headlineIn animation on each rotation.
              The visible state is the base style — if the animation never runs
              (reduced motion), the headline stays visible. */}
          <span className="headline-swap" key={rotIdx}>
            <span>{headline.plain}</span>
            <br />
            <span className="accent">{headline.italic}</span>
          </span>
        </h1>
        <div className="hero-meta">
          <p className="hero-sub">
            We build <strong>voice agents</strong>, <strong>automations</strong>,{" "}
            <strong>custom AI</strong>, and the <strong>websites &amp; apps</strong> that
            hold it all together. <br />
            <br />
            Low spend. High leverage. Shipped in weeks, not quarters.
          </p>
          <div className="hero-ctas">
            <a href="#contact" className="btn-primary">
              Book a free 30-min audit <span className="arrow">→</span>
            </a>
            <a href={`mailto:${site.email}`} className="btn-ghost">
              <span>or email — {site.email}</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
