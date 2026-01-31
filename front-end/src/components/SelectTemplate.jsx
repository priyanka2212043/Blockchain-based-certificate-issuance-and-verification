// SelectTemplate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TemplateSelector from "./TemplateSelector";

function SelectTemplate() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [signature, setSignature] = useState(null);
  const [course, setCourse] = useState(null);

  // Optional: fetch course info for display
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();
        setCourse(data.course);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch course data.");
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  const handleSignatureChange = (e) => {
    setSignature(e.target.files[0]);
  };

  const handleFinalSubmit = async () => {
    if (!selectedTemplate) {
      alert("Please select a certificate template.");
      return;
    }
    if (!signature) {
      alert("Please upload your signature.");
      return;
    }

    try {
      const data = new FormData();
      data.append("certificateTemplate", selectedTemplate);
      data.append("signature", signature);
      console.log(courseId);
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/update-template`,
        {
          method: "PATCH",
          body: data,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update course with template");
      }

      alert("✅ Course & Certificate Template added successfully!");
      navigate("/instructor");
    } catch (error) {
      console.error("Error updating course template:", error);
      alert(error.message);
    }
  };

  return (
    <div className="template-page">
      <h2>Select Certificate Template</h2>
      
      {course && (
        <p>
          <strong>Course:</strong> {course.title}
        </p>
      )}

      <TemplateSelector
        selected={selectedTemplate}
        setSelected={setSelectedTemplate}
      />

      <div className="signature-upload">
        <label>Upload Instructor Signature:</label>
        <input type="file" accept="image/*" onChange={handleSignatureChange} />
      </div>

      <button className="submit-btn" onClick={handleFinalSubmit}>
        Finalize Course
      </button>
    </div>
  );
}

export default SelectTemplate;
