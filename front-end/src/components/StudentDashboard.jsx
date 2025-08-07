import React, { useState, useEffect, useRef } from "react";
import logo from '../assets/logo.png';
import "../styles/StudentDashboard.css";

function StudentDashboard() {

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.email || "User";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to login
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Choose From</h2>
        <ul>
          <li className="font-bold">Popular Courses</li>
          <li>Microsoft Programs</li>
          <li>ChatGPT and Generative AI</li>
          <li>Artificial Intelligence</li>
          <li>Machine Learning</li>
          <li>Data Science</li>
          <li>Digital Marketing</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main>
        <header className="dashboard-header">
          <div className="header-left">
            <img src={logo} alt="Logo" className="logo-image" style={{ width: "32px", height: "32px" }} />

            <div className="browse-dropdown">
              <button className="browse-button">BROWSE ▾</button>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Browse Courses</h4>
                  <ul>
                    <li>IT & Software</li>
                    <li>Management</li>
                    <li>Data Science</li>
                    <li>ChatGPT & Gen AI</li>
                    <li>Digital Marketing</li>
                    <li>Artificial Intelligence</li>
                    <li className="highlight">Machine Learning</li>
                    <li>UI/UX Design</li>
                    <li>Cloud Computing</li>
                    <li>Cyber Security</li>
                    <li>Big Data</li>
                  </ul>
                  <button className="discover-button">Discover All Courses</button>
                </div>

                <div className="dropdown-section subcategories">
                  <h4>Sub Categories</h4>
                  <ul>
                    <li>Machine Learning</li>
                    <li>Python</li>
                    <li>Data Visualization</li>
                    <li>Supervised Machine Learning</li>
                    <li>Unsupervised Machine Learning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar and Search */}
          <div className="header-right">
            <input type="text" placeholder="Search Courses" className="search-box" />

            <div className="avatar-container" ref={dropdownRef}>
              <div
                className="user-avatar"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {avatarLetter}
              </div>

              {showDropdown && (
                <div className="profile-dropdown">
                  <p className="welcome-text">Welcome</p>
                  <p className="user-email">{userName}</p>
                  <hr />
                  <ul>
                    <li>Profile</li>
                    <li>My Courses</li>
                    <li onClick={handleLogout} style={{ cursor: "pointer" }}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Courses Section */}
        <section>
          <h2>Popular Free Courses</h2>
          <div className="grid">
            <div className="course-card">
              <img
                src="https://d1jnx9ba8s6j9r.cloudfront.net/course/course_image/3e13b7e3c2aa.png"
                alt="C for Beginners"
              />
              <div className="rating">★ 4.49 • 2L+ learners</div>
              <h3>C for Beginners</h3>
              <p>2 hrs</p>
              <button>View Course</button>
            </div>

            <div className="course-card">
              <img
                src="https://d1jnx9ba8s6j9r.cloudfront.net/course/course_image/8cbf6f621155.png"
                alt="Excel for Beginners"
              />
              <div className="rating">★ 4.48 • 14.3L+ learners</div>
              <h3>Excel for Beginners</h3>
              <p>5 hrs</p>
              <button>View Course</button>
            </div>

            <div className="course-card">
              <img
                src="https://d1jnx9ba8s6j9r.cloudfront.net/course/course_image/8cbf6f621155.png"
                alt="Excel for Beginners"
              />
              <div className="rating">★ 4.48 • 14.3L+ learners</div>
              <h3>Excel for Beginners</h3>
              <p>5 hrs</p>
              <button>View Course</button>
            </div>

            <div className="course-card">
              <img
                src="https://d1jnx9ba8s6j9r.cloudfront.net/course/course_image/2f3942e6eb6b.png"
                alt="Data Visualization With Power BI"
              />
              <div className="rating">★ 4.52 • 3.1L+ learners</div>
              <h3>Data Visualization With Power BI</h3>
              <p>1.5 hrs</p>
              <button>View Course</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
