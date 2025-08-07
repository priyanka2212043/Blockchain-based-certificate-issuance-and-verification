import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import "../styles/InstructorDashboard.css";

function InstructorDashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email || "User";
  const avatarLetter = userEmail.charAt(0).toUpperCase();

  const [showDropdown, setShowDropdown] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch instructor-specific courses from backend
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/courses/instructor/${storedUser?.id}`);
        const data = await response.json();
        setMyCourses(data);
      } catch (error) {
        console.error("Error fetching instructor courses:", error);
      }
    };
    fetchCourses();
  }, [storedUser?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Explore</h2>
        <ul>
          <li className="font-bold">All Courses</li>
          <li>AI & ML</li>
          <li>Cloud Computing</li>
          <li>Web Development</li>
          <li>Python</li>
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
                    <li>AI</li>
                    <li>Cloud</li>
                    <li>Python</li>
                    <li>ML</li>
                    <li>UI/UX</li>
                  </ul>
                  <button className="discover-button">Discover All Courses</button>
                </div>
              </div>
            </div>
          </div>

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
                  <p className="user-email">{userEmail}</p>
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

        {/* Instructor Courses Section */}
        <section>
          <div className="section-header">
            <h2>My Uploaded Courses</h2>
            <button className="add-course-button">+ Add Course</button>
          </div>

          <div className="grid">
            {myCourses.length === 0 ? (
              <p>No courses uploaded yet.</p>
            ) : (
              myCourses.map((course) => (
                <div className="course-card" key={course._id}>
                  <img src={course.imageUrl} alt={course.title} />
                  <div className="rating">★ {course.rating || "4.5"}</div>
                  <h3>{course.title}</h3>
                  <p>{course.duration || "2 hrs"}</p>
                  <button>View Course</button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default InstructorDashboard;
