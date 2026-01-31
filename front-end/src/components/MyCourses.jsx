import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoryImages from "./categoryImages";
import "../styles/MyCourses.css";
import logo from "../assets/logo.png";

function MyCourses() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id;
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/enroll/students/${userId}/courses`
        );
        const data = await response.json();
        setMyCourses(data);
      } catch (error) {
        console.error("Error fetching my courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <div className="my-courses-container">
      {/* Header */}
      <header className="my-courses-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="logo-area" onClick={() => navigate("/student")}>
          <img src={logo} alt="CertiChain Logo" className="logo-img" />
          <span className="logo-text">CertiChain</span>
        </div>
      </header>

      {/* Courses Table */}
      <section className="courses-section">
        {loading ? (
          <p>Loading courses...</p>
        ) : myCourses.length === 0 ? (
          <p>You have not enrolled in any courses yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <img
                        src={
                          categoryImages[course.category] ||
                          categoryImages["default"]
                        }
                        alt={course.title}
                        className="course-thumb"
                      />
                    </td>
                    <td>{course.title}</td>
                    <td>{course.instructorName}</td>
                    <td>{course.status}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/do-course/${course.id}`)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default MyCourses;
