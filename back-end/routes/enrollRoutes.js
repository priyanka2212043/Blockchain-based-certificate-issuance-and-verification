import express from "express";
import { enrollStudent, checkEnrollment, getStudentCourses, updateModuleStatus, getEnrollmentProgress, getCertificateHash} from "../controllers/enrollController.js";

const router = express.Router();

router.post("/enroll", enrollStudent);       // Enroll a student
router.get("/check", checkEnrollment);       // Check enrollment
router.get("/students/:studentId/courses", getStudentCourses);
router.put("/update-progress", updateModuleStatus);
router.get("/progress", getEnrollmentProgress);
router.get("/certificate", getCertificateHash);

export default router;
