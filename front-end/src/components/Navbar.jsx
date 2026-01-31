import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>
        <div className="navbar-right">
          <a href="#">Courses</a>
          <a className="verify-link" onClick={() => navigate('/verifier')}>Verify</a>
          <button className="login-btn" onClick={() => navigate('/login')}>Log in</button>
          <button className="register-btn" onClick={() => navigate('/register')}>Register</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
