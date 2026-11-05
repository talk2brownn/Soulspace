import CrisisCard from '../components/CrisisCard';
import { CRISIS_RESOURCES } from '../lib/safety';
import './Support.css';

function Support() {
  return (
    <div className="support">
      <div className="support-header">
        <h1>💙 Get support</h1>
        <p>
          SoulSpace is a place to reflect and build healthy habits. It isn't therapy or emergency
          care. If things feel too heavy, please talk to a real person.
        </p>
      </div>

      <CrisisCard />

      <section className="support-more">
        <h2>Other things that can help</h2>
        <ul>
          <li>Tell someone you trust how you're really doing, even if it's just a short message.</li>
          <li>If you can, speak to a doctor, counsellor or psychologist about what you're feeling.</li>
          <li>Move somewhere safe and away from anything you could use to hurt yourself.</li>
        </ul>
        <p className="support-note">
          Helpline numbers were checked in {CRISIS_RESOURCES.checked} using Find A Helpline. If one
          doesn't connect, try another number above.
        </p>
      </section>
    </div>
  );
}

export default Support;
