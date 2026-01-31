import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import categoryImages from "./categoryImages";
import "../styles/CourseDetail.css";

function CourseDetail() {
  const { id } = useParams(); // course ID from URL
  const navigate = useNavigate(); // for back navigation

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const studentId = storedUser?.id; // MongoDB _id

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch course details & check enrollment
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${id}`);
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkEnrollment = async () => {
      if (!studentId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/enroll/check?studentId=${studentId}&courseId=${id}`);
        const data = await res.json();
        if (data.enrolled) setEnrolled(true);
      } catch (err) {
        console.error("Error checking enrollment:", err);
      }
    };

    fetchCourse();
    checkEnrollment();
  }, [id, studentId]);

  const handleEnroll = async () => {
    if (!studentId) return alert("Please login to enroll");

    try {
      const res = await fetch(`${API_BASE_URL}/enroll/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId: id }),
      });

      const data = await res.json();
      if (res.ok) {
        setEnrolled(true);
        alert("Enrolled successfully!");
      } else {
        alert(data.message || "Enrollment failed");
      }
    } catch (err) {
      console.error("Error enrolling:", err);
    }
  };

  if (loading) return <p>Loading course...</p>;
  if (!course) return <p>Course not found</p>;

  return (
    <div className="course-details-container">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>{course.title}</h1>
      <p className="instructor-name">By {course.instructorName}</p>
      <p className="course-description">{course.description}</p>

      <h2>Modules</h2>
      <ul className="modules-list">
        {course.modules.map((mod, index) => (
          <li key={index} className="module-card locked">
            <h3>{mod.title}</h3>
            <p>Locked</p>
          </li>
        ))}
      </ul>

      <button
        onClick={handleEnroll}
        disabled={enrolled}
        className={enrolled ? "enrolled-button" : "enroll-button"}
      >
        {enrolled ? "Enrolled" : "Enroll"}
      </button>
    </div>
  );
}

export default CourseDetail;
