// DoCourse.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/DoCourse.css";
import logo from "../assets/logo.png";

function DoCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [course, setCourse] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [step, setStep] = useState(1);
  const [unlockedModules, setUnlockedModules] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔄 helper to fetch student progress
  const fetchProgress = async () => {
    try {
      const { data: enrollmentData } = await api.get(
        `${API_BASE_URL}/enroll/progress?studentId=${storedUser.id}&courseId=${courseId}`
      );

      if (enrollmentData?.progress) {
        const completed = enrollmentData.progress
          .map((p, idx) => (p.status === "completed" ? idx : null))
          .filter((v) => v !== null);

        const unlocked = enrollmentData.progress
          .map((p, idx) =>
            p.status === "completed" || p.status === "unlocked" ? idx : null
          )
          .filter((v) => v !== null);

        setCompletedModules(completed);
        setUnlockedModules(unlocked.length ? unlocked : [0]);
      } else {
        setUnlockedModules([0]);
      }
    } catch (err) {
      console.error("Error refreshing progress", err);
      setUnlockedModules([0]);
    }
  };

  // fetch course + progress on mount
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const { data: courseData } = await api.get(`${API_BASE_URL}/courses/${courseId}`);
        setCourse(courseData);
        await fetchProgress();
      } catch (err) {
        console.error("Error fetching course or enrollment", err);
        setUnlockedModules([0]);
      }
    };

    fetchCourseAndProgress();
  }, [courseId]);

  if (!course) return <p className="loading">Loading course...</p>;
  const module =
    currentModuleIndex !== null ? course.modules[currentModuleIndex] : null;

  const handleAnswerChange = (qIndex, optionText) => {
    setMcqAnswers({ ...mcqAnswers, [qIndex]: optionText });
  };

  // ✅ Submit quiz
  const handleSubmitMCQ = async () => {
    let correctCount = 0;
    module.mcq.forEach((q, idx) => {
      if (mcqAnswers[idx] === q.correctAnswer) correctCount++;
    });

    const totalQuestions = module.mcq.length;
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    if (percentage >= module.passMark) {
      alert(`✅ Passed this module! Score: ${percentage}%`);

      try {
        await api.put(`${API_BASE_URL}/enroll/update-progress`, {
          studentId: storedUser.id,
          courseId,
          moduleId: module._id,
        });

        await fetchProgress();
      } catch (err) {
        console.error("Error updating module status", err);
      }
    } else {
      alert(
        `❌ Failed this module! Score: ${percentage}%\nPass mark: ${module.passMark}%\nReturning to modules...`
      );
    }

    setStep(1);
    setMcqAnswers({});
    setCurrentModuleIndex(null);
    await fetchProgress();
  };

  // ✅ Download certificate from IPFS
// ✅ Download certificate from enrollment record
const handleDownloadCertificate = async () => {
  try {
    // Fetch the certificate hash from enrollment
    const res = await api.get(
      `${API_BASE_URL}/enroll/certificate?studentId=${storedUser.id}&courseId=${courseId}`
    );

    const certificateHash = res.data.certificateIpfsHash;
    if (!certificateHash) {
      alert("Certificate not available yet.");
      return;
    }

    // Fetch the actual certificate PDF from IPFS
    const response = await fetch(`https://ipfs.io/ipfs/${certificateHash}`);
    console.log(response);
    if (!response.ok) throw new Error("Failed to fetch certificate");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create temporary link to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${course.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error downloading certificate:", err);
    alert("Failed to download certificate");
  }
};


  return (
    <>
      {/* Header */}
      <header className="do-courses-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="logo-area">
          <a onClick={() => navigate('/student')}><img src={logo} alt="CertiChain Logo" className="logo-img" /></a>
          <a onClick={() => navigate('/student')}><span className="logo-text">CertiChain</span></a>
        </div>
      </header>

      <div className="docourse-container">
        <h2 className="course-title">{course.title}</h2>

        {/* Module List */}
        {currentModuleIndex === null && (
          <>
            <ul className="modules-list">
              {unlockedModules === null ? (
                <p className="loading">Loading modules...</p>
              ) : (
                course.modules.map((mod, index) => (
                  <li
                    key={index}
                    className={`module-card ${
                      completedModules.includes(index)
                        ? "completed"
                        : unlockedModules.includes(index)
                        ? "unlocked"
                        : "locked"
                    }`}
                  >
                    <h3>{mod.title}</h3>
                    {completedModules.includes(index) ? (
                      <button onClick={() => setCurrentModuleIndex(index)}>
                        Completed
                      </button>
                    ) : unlockedModules.includes(index) ? (
                      <button onClick={() => setCurrentModuleIndex(index)}>
                        Start Module
                      </button>
                    ) : (
                      <p>🔒 Locked</p>
                    )}
                  </li>
                ))
              )}
            </ul>
            {/* ✅ Download Certificate button */}
            {completedModules.length === course.modules.length && (
                
                <button
                  className="download-certificate-btn"
                  onClick={handleDownloadCertificate}
                >
                  🎓 Download Certificate
                </button>
              )}
          </>
        )}

        {/* Module Content */}
        {currentModuleIndex !== null && module && (
          <div className="module-content-wrapper">
          <div className="module-content">
            <h3 className="module-title">📘 {module.title}</h3>

            {/* STEP 1: VIDEO */}
            {step === 1 && module.videoUrl && (
              <div className="step-container">
                <video className="video-player" controls>
                  <source
                    src={`http://localhost:5000${module.videoUrl}`}
                    type="video/mp4"
                  />
                </video>
                <button className="next-btn" onClick={() => setStep(2)}>
                  Next →
                </button>
              </div>
            )}

            {/* STEP 2: PDF */}
            {step === 2 && module.pdfUrl && (
              <div className="step-container">
                <iframe
                  src={`http://localhost:5000${module.pdfUrl}`}
                  className="pdf-viewer"
                  title="PDF Viewer"
                ></iframe>
                <button className="next-btn" onClick={() => setStep(3)}>
                  Next →
                </button>
              </div>
            )}

            {/* STEP 3: MCQ */}
            {step === 3 && (
              <div className="step-container">
                <h4 className="mcq-heading">📝 Quiz</h4>
                {module.mcq.map((q, qIndex) => (
                  <div key={qIndex} className="question-block">
                    <p className="question">
                      {qIndex + 1}. {q.question}
                    </p>
                    {q.options.map((opt, optIndex) => (
                      <label key={optIndex} className="option-label">
                        <input
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={mcqAnswers[qIndex] === opt}
                          onChange={() => handleAnswerChange(qIndex, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ))}
                <button className="submit-btn" onClick={handleSubmitMCQ}>
                  Submit Quiz
                </button>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DoCourse;
