import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { uploadJSONToPinata } from "../utils/ipfs.js";
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

// Get all courses for a student with progress
export const getStudentCourses = async (req, res) => {
  const { studentId } = req.params;
  try {
    const enrollments = await Enrollment.find({ studentId }).populate("courseId");

    const courses = enrollments.map((enroll) => ({
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
      .populate("courseId", "title");    // fetch course title

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

    await enrollment.save(); // save updated progress

    // 🔹 If all modules completed, generate certificate JSON and upload to IPFS
    let hash1 = null;
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
      enrollment.ipfsHash1 = hash1;
      await enrollment.save();

      console.log("Certificate JSON stored in IPFS with hash1:", hash1);
    }

    res.json({
      message: "Module and course status updated",
      enrollment,
      hash1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
