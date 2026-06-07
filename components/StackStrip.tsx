import { STACK_LOGOS } from "@/lib/data";

export default function StackStrip() {
  return (
    <div className="stack">
      <div className="stack-label mono">Built on</div>
      <div className="stack-marquee-wrap">
        {/* List duplicated for a seamless 0 → -50% loop */}
        <div className="stack-marquee">
          {[...STACK_LOGOS, ...STACK_LOGOS].map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
