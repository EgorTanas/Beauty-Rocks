import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function Team() {
  return (
    <div className="site-page">
      <Navbar />
      <main className="site-inner">
        <div className="site-inner-card">
          <h1>Our team</h1>
          <p>
            Meet the stylists and nail artists behind Beauty Rocks — bios and portfolios will appear here in a future
            update.
          </p>
          <div className="site-inner-actions">
            <Link to="/" className="br-btn br-btn--solid">
              Back to home
            </Link>
            <Link to="/booking" className="br-btn br-btn--outline">
              Book with us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
