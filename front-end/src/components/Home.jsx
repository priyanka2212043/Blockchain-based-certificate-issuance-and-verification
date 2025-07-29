// Home.js
import { useNavigate } from 'react-router-dom';
import googleIcon from '../assets/google-icon.jpg';
import logo from '../assets/logo.png';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
        <nav className="navbar-right">
          <a href="#">Courses</a>
          <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
          <button className="register-btn" onClick={() => navigate('/register')}>Register</button>
        </nav>
      </header>

      <div className="main-wrapper">
        <div className="main-content">
          <h1>Your gateway to tech skills.</h1>
          <p>
            Learn the latest technology with interactive, hands-on courses.
            <strong> It’s free.</strong>
          </p>

          <button className="google-login" onClick={() => navigate('/login')}>
            <img src={googleIcon} alt="Google icon" />
            Log in with Google
          </button>

          <div className="divider">
            <hr /><span>or</span><hr />
          </div>

          <button className="more-options" onClick={() => navigate('/login')}>See more options</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
