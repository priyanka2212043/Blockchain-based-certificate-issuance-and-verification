import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import "../styles/StudentDashboard.css";
import categoryImages from "./categoryImages"; // ✅ same as instructor

function StudentDashboard() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.email || "User";
  const avatarLetter = userName.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [courses, setCourses] = useState([]); // ✅ fetched courses
  const [searchQuery, setSearchQuery] = useState(""); // ✅ search input
  const [selectedCategory, setSelectedCategory] = useState("All"); // ✅ browse filter
  const dropdownRef = useRef(null);

  // ✅ Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

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

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ✅ Filter courses by search + category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Choose From</h2>
        <ul>
          <li
            className={selectedCategory === "All" ? "font-bold" : ""}
            onClick={() => setSelectedCategory("All")}
          >
            All Courses
          </li>
          {Object.keys(categoryImages).map((category) => (
            <li
              key={category}
              className={selectedCategory === category ? "font-bold" : ""}
              onClick={() => setSelectedCategory(category)}
              style={{ cursor: "pointer" }}
            >
              {category}
            </li>
          ))}
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
                      <li
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        style={{ cursor: "pointer" }}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="discover-button"
                    onClick={() => setSelectedCategory("All")}
                  >
                    Discover All Courses
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar and Search */}
          <div className="header-right">
            <input
              type="text"
              placeholder="Search Courses"
              className="search-box"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  <p className="user-email">{userName}</p>
                  <hr />
                  <ul>
                    <li>Profile</li>
                    <li onClick={() => navigate("/my-courses")}>My Courses</li>
                    <li onClick={handleLogout} style={{ cursor: "pointer" }}>
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Courses Section */}
        <section>
          <h2>
            {selectedCategory === "All"
              ? "Available Courses"
              : `${selectedCategory} Courses`}
          </h2>

          {/* Scrollable container */}
          <div className="courses-scroll-container">
            <div className="grid">
              {filteredCourses.length === 0 ? (
                <p>No courses found.</p>
              ) : (
                filteredCourses.map((course) => (
                  <div className="course-card" key={course._id}>
                    <img
                      src={
                        categoryImages[course.category] ||
                        categoryImages["default"]
                      }
                      alt={course.title}
                    />
                    <h3>{course.title}</h3>
                    <p className="instructor-name">
                      By {course.instructorName}
                    </p>
                    <button onClick={() => navigate(`/courses/${course._id}`)}>
                      View Course
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
