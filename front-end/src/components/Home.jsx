import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/google-icon.jpg';
import Navbar from './Navbar';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Navbar />
      <main className="main-wrapper">
        <div className="main-content">
          <h1>Your gateway to <span>tech skills</span>.</h1>
          <p>
            Learn the latest technology with interactive, hands‑on courses.
            <strong> It’s free.</strong>
          </p>


          <button className="more-options" onClick={() => navigate('/login')}>
            See more options
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
