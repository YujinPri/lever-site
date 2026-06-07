import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer wrap">
      <div className="wordmark">
        <span className="wordmark-dot"></span>
        {site.name}
      </div>
      <div className="footer-status mono">
        <span className="status-dot"></span>
        {site.capacityNote}
      </div>
      <div className="mono">© {site.foundedYear} · All rights reserved</div>
    </footer>
  );
}
