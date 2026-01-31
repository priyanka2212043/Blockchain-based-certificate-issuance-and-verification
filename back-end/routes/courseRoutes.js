import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { addCourse, getCourses, getCoursesByInstructor, getCourseById, getCourseWithModules, updateCourseTemplate, getCourseStudents } from "../controllers/courseController.js";

const router = express.Router();

// Setup storage for multer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Add course
router.post("/add", upload.any(), addCourse);

// Get all courses
router.get("/", getCourses);


router.get("/:courseId/students", getCourseStudents);
// Get course by id
router.get("/:id", getCourseById);

// Get courses by instructor
router.get("/instructor/:instructorId", getCoursesByInstructor);
router.get("/:courseId", getCourseWithModules);


router.patch("/:id/update-template", upload.single("signature"), updateCourseTemplate);


export default router;
