import { site } from "@/lib/site";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="#" className="wordmark">
          <span className="wordmark-dot"></span>
          {site.name}
        </a>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#process">How we work</a>
          <a href="#availability">Availability</a>
          <a href="#contact">Contact</a>
          <a href="#contact" className="nav-cta">
            Book a call →
          </a>
        </div>
      </div>
    </nav>
  );
}
