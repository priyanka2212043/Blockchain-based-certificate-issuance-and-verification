import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { uploadJSONToPinata } from "../utils/ipfs.js";
import { generateQRCode } from "../utils/qr.js";
import { uploadFileToPinata } from "../utils/ipfs_file.js";
import { generateCertificatePDF } from "../utils/generateCertificate.js";
import { registerCertificate } from "../blockchain/blockchain.js";
import { verifyCertificate } from "../blockchain/blockchain.js"; // your SC helper

import mongoose from "mongoose";

// Enroll student in a course
export const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return res.status(400).json({ message: "studentId and courseId required" });

    // Check if already enrolled
    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    // Fetch course modules
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Create progress for each module
    const progress = course.modules.map((mod) => ({
      moduleId: mod._id,
      status: "not started"
    }));

    const enrollment = new Enrollment({ studentId, courseId, progress });
    await enrollment.save();

    res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check enrollment status
export const checkEnrollment = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    if (!studentId || !courseId)
      return res.status(400).json({ message: "studentId and courseId required" });

    const enrolled = await Enrollment.findOne({ studentId, courseId });
    res.json({ enrolled: !!enrolled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getStudentCourses = async (req, res) => {
  const { studentId } = req.params;
  try {
    const enrollments = await Enrollment.find({ studentId }).populate("courseId");

    const validEnrollments = enrollments.filter(e => e.courseId);

    const courses = validEnrollments.map((enroll) => ({
      id: enroll.courseId._id,
      title: enroll.courseId.title,
      category: enroll.courseId.category,
      instructorName: enroll.courseId.instructorName,
      status: enroll.status,
      enrolledAt: enroll.enrolledAt,
      progress: enroll.progress.map((p) => ({
        moduleId: p.moduleId,
        status: p.status
      }))
    }));

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get certificate hash for a student in a course
export const getCertificateHash = async (req, res) => {
  const { studentId, courseId } = req.query;

  if (!studentId || !courseId) {
    return res.status(400).json({ error: "studentId and courseId are required" });
  }

  try {
    // 1️⃣ Find enrollment using studentId + courseId
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    const enrollmentId = enrollment._id.toString();

    // 2️⃣ Fetch certificate hash from blockchain using enrollmentId
    const certData = await verifyCertificate(enrollmentId);
    if (!certData || !certData.cid) {
      return res.status(404).json({ error: "Certificate not yet available on blockchain" });
    }

    // 3️⃣ Return the IPFS hash (cid) from blockchain
    return res.json({ certificateIpfsHash: certData.cid });
  } catch (err) {
    console.error("Error fetching certificate from blockchain:", err);
    res.status(500).json({ error: "Server error" });
  }
};




// GET /enroll/progress?studentId=xxx&courseId=yyy
export const getEnrollmentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;
    if (!studentId || !courseId) return res.status(400).json({ message: "studentId and courseId required" });

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    res.json({ progress: enrollment.progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// Update module status and handle IPFS upload
export const updateModuleStatus = async (req, res) => {
  try {
    const { studentId, courseId, moduleId } = req.body;
    if (!studentId || !courseId || !moduleId)
      return res.status(400).json({ message: "studentId, courseId, moduleId required" });

    // Fetch enrollment and populate student name and course title
    const enrollment = await Enrollment.findOne({ studentId, courseId })
      .populate("studentId", "username") // fetch student name
      .populate("courseId", "title certificateTemplate signatureUrl");    // fetch course title

    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    // Find module index
    const moduleIndex = enrollment.progress.findIndex(
      (p) => p.moduleId.toString() === moduleId
    );
    if (moduleIndex === -1)
      return res.status(404).json({ message: "Module not found in enrollment" });

    // Mark current module as completed
    enrollment.progress[moduleIndex].status = "completed";

    // Unlock next module if it exists
    if (moduleIndex + 1 < enrollment.progress.length) {
      const nextModule = enrollment.progress[moduleIndex + 1];
      if (nextModule.status === "not started") {
        nextModule.status = "unlocked";
      }
    }

    // Update overall course status
    const allCompleted = enrollment.progress.every((m) => m.status === "completed");
    enrollment.status = allCompleted ? "completed" : "in-progress";

    await enrollment.save(); 

    // 🔹 If all modules completed, generate certificate JSON and upload to IPFS
    let hash1 = null;
    let qrCodeBase64=null;
    if (allCompleted) {
      const certificateJSON = {
        certificateId: `CERT-${enrollment._id}`,
        studentName: enrollment.studentId.username, // populated from User
        courseName: enrollment.courseId.title,      // populated from Course
        completionDate: new Date().toISOString().split("T")[0],
        modulesCompleted: enrollment.progress.map((p) => p.moduleId),
      };

      // 👇 pass enrollment._id as the name
      hash1 = await uploadJSONToPinata(certificateJSON, enrollment._id.toString());
      qrCodeBase64 = await generateQRCode(hash1);

      const pdfBuffer = await generateCertificatePDF(
        {
          studentName: enrollment.studentId.username,
          courseName: enrollment.courseId.title,
          completionDate: new Date().toISOString().split("T")[0],
          signatureUrl: enrollment.courseId.signatureUrl || "",
          qrCode: qrCodeBase64, 
        },
        enrollment.courseId.certificateTemplate, 
      );

      // Upload PDF Buffer to Pinata
      const ipfsHashPDF = await uploadFileToPinata(pdfBuffer, `${enrollment._id}.pdf`);
      try {
        const txHash = await registerCertificate(enrollment._id.toString(), ipfsHashPDF);
        enrollment.certificateOnChain = {
          txHash, // blockchain reference
        };

        console.log("Certificate stored on blockchain. TxHash:", txHash);
      } catch (err) {
        console.error("Error storing certificate on blockchain:", err);
      }
      await enrollment.save();
      console.log("Certificate JSON stored in IPFS with hash1:", hash1);
    }

    res.json({
      message: "Module and course status updated",
      enrollment,
      hash1,
      qrCode: qrCodeBase64,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
