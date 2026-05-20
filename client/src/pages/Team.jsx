import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TeamHero from '../components/team/TeamHero';
import TeamGrid from '../components/team/TeamGrid';
import TeamCTA from '../components/team/TeamCTA';
import '../style/team.css';

export default function Team() {
  return (
    <div className="br-page team-page">
      <Navbar />
      <main className="team-main">
        <TeamHero />
        <TeamGrid />
        <TeamCTA />
      </main>
      <Footer />
    </div>
  );
}
