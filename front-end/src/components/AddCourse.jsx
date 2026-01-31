import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddCourse.css";

function AddCourse() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructorName: storedUser?.username || storedUser?.email || "",
    instructorId: storedUser?.id || "",
    category: "",
    modules: [],
  });

  const [numModules, setNumModules] = useState(0);
  const navigate = useNavigate();
  const categories = ["IT & Software", "AI", "Cloud", "Python", "ML", "UI/UX"];

  // General course field changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Update number of modules
  const handleNumModulesChange = (e) => {
    const count = parseInt(e.target.value, 10) || 0;
    setNumModules(count);

    const newModules = Array.from({ length: count }, (_, idx) => ({
      title: `Module ${idx + 1}`,
      videoFile: null,
      pdfFile: null,
      mcq: [{ question: "", options: ["", "", "", ""], correctAnswer: "" }],
      passMark: "",
    }));

    setFormData((prev) => ({ ...prev, modules: newModules }));
  };

  // Update module text fields
  const handleModuleFieldChange = (modIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[modIndex][field] = value;
    setFormData((prev) => ({ ...prev, modules: updatedModules }));
  };

  // File upload (video/pdf)
  const handleFileChange = (modIndex, field, file) => {
    const updatedModules = [...formData.modules];
    updatedModules[modIndex][field] = file;
    setFormData((prev) => ({ ...prev, modules: updatedModules }));
  };

  // Update MCQs
  const handleMCQChange = (modIndex, qIndex, field, value, optIndex = null) => {
    const updatedModules = [...formData.modules];
    if (field === "options") {
      updatedModules[modIndex].mcq[qIndex].options[optIndex] = value;
    } else {
      updatedModules[modIndex].mcq[qIndex][field] = value;
    }
    setFormData((prev) => ({ ...prev, modules: updatedModules }));
  };

  const addMCQ = (modIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[modIndex].mcq.push({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
    setFormData((prev) => ({ ...prev, modules: updatedModules }));
  };

  // Submit form - create course first
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.instructorId || !formData.instructorName) {
      alert("Missing instructor identity. Please re-login.");
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("category", formData.category);
      formPayload.append("instructorId", formData.instructorId);
      formPayload.append("instructorName", formData.instructorName);

      // Append modules without template/signature
      formData.modules.forEach((mod, idx) => {
        formPayload.append(`modules[${idx}][title]`, mod.title);
        formPayload.append(`modules[${idx}][passMark]`, mod.passMark || "");

        if (mod.videoFile) formPayload.append(`modules[${idx}][video]`, mod.videoFile);
        if (mod.pdfFile) formPayload.append(`modules[${idx}][pdf]`, mod.pdfFile);

        formPayload.append(`modules[${idx}][mcq]`, JSON.stringify(mod.mcq));
      });

      const response = await fetch("http://localhost:5000/api/courses/add", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();
      console.log(data);
      //if (!response.ok) throw new Error(data.error || "Failed to create course");

      // Navigate to template selection with real courseId
      navigate(`/select-template/${data.course._id}`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="add-course-outer-container">
      <div className="add-course-container">
        <div className="back-btn" onClick={() => navigate("/instructor")}>
          &#8592; Back
        </div>
        <h2>Add New Course</h2>
        <form className="add-course-form" onSubmit={handleSubmit}>
          {/* General Course Info */}
          <div className="form-group">
            <label>Course Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter course title"
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter course description"
            />
          </div>

          <div className="form-group">
            <label>Instructor Name:</label>
            <input
              type="text"
              name="instructorName"
              value={formData.instructorName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Modules:</label>
            <input
              type="number"
              min="0"
              value={numModules}
              onChange={handleNumModulesChange}
              required
            />
          </div>

          {/* Modules */}
          {formData.modules.map((module, modIndex) => (
            <div key={modIndex} className="module-section">
              <h3>{module.title}</h3>

              <div className="form-group">
                <label>Module Title:</label>
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) =>
                    handleModuleFieldChange(modIndex, "title", e.target.value)
                  }
                  required
                />
              </div>

              {/* File Uploads */}
              <div className="form-group">
                <label>Upload Video:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    handleFileChange(modIndex, "videoFile", e.target.files[0])
                  }
                />
              </div>

              <div className="form-group">
                <label>Upload PDF:</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleFileChange(modIndex, "pdfFile", e.target.files[0])
                  }
                />
              </div>

              <div className="form-group">
                <label>Pass Mark:</label>
                <input
                  type="number"
                  value={module.passMark || ""}
                  onChange={(e) =>
                    handleModuleFieldChange(
                      modIndex,
                      "passMark",
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  min="0"
                  placeholder="e.g., 60"
                />
              </div>

              {/* MCQs */}
              <div className="mcq-section">
                <h4>MCQs</h4>
                {module.mcq.map((mcq, qIndex) => (
                  <div key={qIndex} className="mcq">
                    <input
                      type="text"
                      placeholder="Question"
                      value={mcq.question}
                      onChange={(e) =>
                        handleMCQChange(modIndex, qIndex, "question", e.target.value)
                      }
                    />
                    {mcq.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleMCQChange(
                            modIndex,
                            qIndex,
                            "options",
                            e.target.value,
                            optIndex
                          )
                        }
                      />
                    ))}
                    <input
                      type="text"
                      placeholder="Correct Answer"
                      value={mcq.correctAnswer}
                      onChange={(e) =>
                        handleMCQChange(modIndex, qIndex, "correctAnswer", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addMCQ(modIndex)}
                  className="add-mcq-btn"
                >
                  + Add Another MCQ
                </button>
              </div>
            </div>
          ))}

          <button type="submit" className="submit-btn">
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddCourse;
