import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function Booking() {
  return (
    <div className="site-page">
      <Navbar />
      <main className="site-inner">
        <div className="site-inner-card">
          <h1>Booking</h1>
          <p>
            Use the appointment form on the home page for the full experience, or reach us by phone during studio
            hours.
          </p>
          <div className="site-inner-actions">
            <Link to="/#contact" className="br-btn br-btn--solid">
              Open booking form
            </Link>
            <Link to="/" className="br-btn br-btn--outline">
              Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
