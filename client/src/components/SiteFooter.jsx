import { Link } from 'react-router-dom';
import { ChevronUp, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants/socialLinks';

function IconInstagram({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTikTok({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M14 3v11.2a4.2 4.2 0 1 1-4.2-4.2" />
      <path d="M14 5.5c1.5 2.3 3.1 3.4 5 3.5" />
    </svg>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link to="/" className="site-logo site-logo--footer">
              <span className="site-logo-mark" aria-hidden>
                <Sparkles size={22} strokeWidth={1.75} />
              </span>
              <span className="site-logo-text">Beauty Rocks</span>
            </Link>
            <p className="site-footer-tagline">
              Premium nails, hair, and self-care in a calm Los Angeles studio — crafted so you leave glowing.
            </p>
            <div className="site-social">
              <a
                href={SOCIAL_LINKS.instagram}
                className="site-social-btn"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconInstagram />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                className="site-social-btn"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconFacebook />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                className="site-social-btn"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconTikTok />
              </a>
            </div>
          </div>

          <div>
            <h3 className="site-footer-heading">Services</h3>
            <ul className="site-footer-list">
              <li>
                <Link to="/services">All services</Link>
              </li>
              <li>
                <Link to="/services">Nail care</Link>
              </li>
              <li>
                <Link to="/services">Hair styling</Link>
              </li>
              <li>
                <Link to="/services">Bridal packages</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="site-footer-heading">Company</h3>
            <ul className="site-footer-list">
              <li>
                <Link to="/#about">About</Link>
              </li>
              <li>
                <Link to="/team">Team</Link>
              </li>
              <li>
                <Link to="/#gallery">Gallery</Link>
              </li>
              <li>
                <Link to="/booking">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="site-footer-heading">Account</h3>
            <ul className="site-footer-list">
              <li>
                <Link to="/login">Sign in</Link>
              </li>
              <li>
                <Link to="/booking">Book appointment</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bar">
          <p>© {year} Beauty Rocks Salon &amp; Studio. All rights reserved.</p>
        </div>
      </div>
      <button
        type="button"
        className="site-scroll-fab"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp size={22} strokeWidth={2.2} aria-hidden />
      </button>
    </footer>
  );
}
