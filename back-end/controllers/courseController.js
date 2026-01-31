import Course from "../models/Course.js";
import Enrollment from "../models/enrollment.js";
import User from "../models/User.js";

export const getCourseStudents = async (req, res) => {
  const { courseId } = req.params;

  try {
    const enrollments = await Enrollment.find({ courseId }).populate("studentId");

    const studentsReport = enrollments.map((enrollment) => ({
      student: {
        _id: enrollment.studentId,
        username: enrollment.studentId.username,
        email: enrollment.studentId.email,
      },
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt, // ✅ assuming your schema has timestamps: true
    }));

    res.json(studentsReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch students for this course this fileeeee" });
  }
};


// Add a new course (Step 1: general info + modules)
export const addCourse = async (req, res) => {
  try {
    const { title, description, category, instructorId, instructorName, modules } = req.body;

    if (!title || !description || !category || !instructorId || !instructorName) {
      return res.status(400).json({ error: "Missing required course fields" });
    }

    // Parse modules from string if sent via FormData
    let parsedModules = [];
    if (modules) {
      parsedModules = typeof modules === "string" ? JSON.parse(modules) : modules;
    }

    // Process modules and MCQs
    const finalModules = parsedModules.map((mod, index) => {
      // Parse MCQs if they are strings
      let mcqArray = [];
      if (mod.mcq) {
        mcqArray = typeof mod.mcq === "string" ? JSON.parse(mod.mcq) : mod.mcq;
      }

      // Attach uploaded video/pdf files
      const videoFile = req.files?.find(f => f.fieldname === `modules[${index}][video]`);
      const pdfFile = req.files?.find(f => f.fieldname === `modules[${index}][pdf]`);

      return {
        title: mod.title,
        passMark: mod.passMark,
        videoUrl: videoFile ? `/uploads/${videoFile.filename}` : null,
        pdfUrl: pdfFile ? `/uploads/${pdfFile.filename}` : null,
        mcq: mcqArray,
      };
    });

    const course = new Course({
      title,
      description,
      category,
      instructorId,
      instructorName,
      modules: finalModules,
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (err) {
    console.error("Error in addCourse:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update course with certificate template + signature (Step 2)
export const updateCourseTemplate = async (req, res) => {
  try {
    const courseId = req.params.id; // <-- must exist
    if (!courseId) return res.status(400).json({ error: "Course ID missing" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (req.body.certificateTemplate) {
      course.certificateTemplate = req.body.certificateTemplate;
    }

    if (req.file) {
      course.signatureUrl = `/uploads/${req.file.filename}`;
    }

    await course.save();
    res.json({ message: "Course updated with template successfully", course });
  } catch (err) {
    console.error("Error in updateCourseTemplate:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get courses by instructor
export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await Course.find({ instructorId });
    if (!courses.length) return res.status(404).json({ message: "No courses found" });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getCourseWithModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
