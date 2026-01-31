import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/InstructorCourseStudents.css";
import logo from "../assets/logo.png";

function InstructorCourseStudents() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}/students`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p>Error: {error}</p>;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Apply filters: status + date range
  const filteredStudents = students.filter(({ status, enrolledAt }) => {
    let statusMatch = true;
    let dateMatch = true;
    const enrolledDate = new Date(enrolledAt);

    if (statusFilter) statusMatch = status.toLowerCase() === statusFilter.toLowerCase();

    if (startDate) {
      dateMatch = enrolledDate >= new Date(startDate);
    }

    if (endDate) {
      dateMatch = dateMatch && enrolledDate <= new Date(endDate);
    }

    return statusMatch && dateMatch;
  });

  return (
    <div className="page-container">
      {/* Fixed Header */}
      <header className="my-courses-header">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <div className="logo-area" onClick={() => navigate("/instructor")}>
          <img src={logo} alt="CertiChain Logo" className="logo-img" />
          <span className="logo-text">CertiChain</span>
        </div>
      </header>

      {/* Report Content */}
      <main className="students-report-container">
        <h2>Enrolled Students</h2>
        <button className="print-btn" onClick={() => window.print()}>Print Report</button>

        {/* Filters */}
        <div className="filters">
          <div>
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <p>No students found for the selected filters.</p>
        ) : (
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Enrolled At</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(({ student, status, enrolledAt }) => (
                  <tr key={student._id}>
                    <td>{student.username}</td>
                    <td>{student.email}</td>
                    <td>{status}</td>
                    <td>{formatDate(enrolledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default InstructorCourseStudents;
