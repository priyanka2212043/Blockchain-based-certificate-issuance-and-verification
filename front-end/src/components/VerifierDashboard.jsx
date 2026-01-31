import React, { useState } from "react";
import { pythonApi } from "../utils/api";
import "../styles/VerifierDashboard.css";

const VerifierDashboard = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleVerify = async () => {
    if (!file) {
      setError("⚠️ Please upload a certificate file before verifying.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("certificate", file);
    

    try {
      const res = await pythonApi.post("/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error("Verify error:", err);
      setError(
        err.response?.data?.error ||
          "🚨 Something went wrong while verifying. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verifier-dashboard">
      <h2>Certificate Verification</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify Certificate"}
      </button>

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <div className="result-box">
          {result.success ? (
            result.verification?.overall_match ? (
              <div className="success-box">
                ✅ Verification Successful
                <p>
                  Student <b>{result.metadata?.studentName}</b> has successfully
                  completed <b>{result.metadata?.courseName}</b> on{" "}
                  <b>{result.metadata?.completionDate}</b>.
                </p>
              </div>
            ) : (
              <div className="error-box">
                ❌ Forgery Detected
                <p>The certificate has mismatched fields:</p>
                <ul>
                  {result.verification?.failed_fields?.length > 0 && (
                      <ul>
                        {result.verification.failed_fields.map((field) => {
                          const values = result.verification[field];
                          return (
                            <li key={field}>
                              ⚠️ {field.replace("_", " ").toUpperCase()} mismatch: expected "<b>{values.expected}</b>"
                            </li>
                          );
                        })}
                      </ul>
                    )}

                </ul>
              </div>
            )
          ) : (
            <div className="error-box">
              ❌ {result.error || "Verification failed."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifierDashboard;