import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import "../styles/InstructorDashboard.css";
import { useNavigate } from "react-router-dom";
import categoryImages from "./categoryImages";

function InstructorDashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const instructorId = storedUser?.id || "";
  const instructorName = storedUser?.username || storedUser?.email;
  const avatarLetter = instructorName.charAt(0).toUpperCase();

  const [showDropdown, setShowDropdown] = useState(false);
  const [myCourses, setMyCourses] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch instructor’s courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!instructorId) return;
        const response = await fetch(
          `http://localhost:5000/api/courses/instructor/${instructorId}`
        );
        const data = await response.json();
        if(response.status!=404)
          setMyCourses(data);
      } catch (error) {
        console.error("Error fetching instructor courses:", error);
      }
    };
    fetchCourses();
  }, [instructorId]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <img
              src={logo}
              alt="Logo"
              className="logo-image"
              style={{ width: "32px", height: "32px" }}
            />
            <div className="browse-dropdown">
              <button className="browse-button">BROWSE ▾</button>
              <div className="dropdown-content">
                <div className="dropdown-section">
                  <h4>Browse Courses</h4>
                  <ul>
                    {Object.keys(categoryImages).map((category) => (
                      <li key={category}>{category}</li>
                    ))}
                  </ul>
                  <button className="discover-button">Discover All Courses</button>
                </div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <input
              type="text"
              placeholder="Search Courses"
              className="search-box"
            />
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
                  <p className="user-email">{instructorId}</p>
                  <hr />
                  <ul>
                    <li>Profile</li>
                    <li>My Courses</li>
                    <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                      Logout
                    </li>
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
            <button
              className="add-course-button"
              onClick={() => navigate("/add-course")}
            >
              + Add Course
            </button>
          </div>

          <div className="grid">
            {myCourses.length === 0 ? (
              <p>No courses uploaded yet.</p>
            ) : (
              myCourses.map((course) => (
                <div className="course-card" key={course._id}>
                  <img
                    src={
                      categoryImages[course.category] || categoryImages["default"]
                    }
                    alt={course.title}
                  />
                  <h3>{course.title}</h3>
                  <p className="instructor-name">By {course.instructorName}</p>
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
