import Course from "../models/Course.js";

export const addCourse = async (req, res) => {
  try {
    const { title, description, category, instructorId, instructorName, modules, certificateTemplate } = req.body;

    let parsedModules = [];
    if (modules && typeof modules === "string") {
      parsedModules = JSON.parse(modules);
    } else if (Array.isArray(modules)) {
      parsedModules = modules;
    }

    const finalModules = parsedModules.map((mod, index) => {
      const videoFile = req.files.find(f => f.fieldname === `modules[${index}][video]`);
      const pdfFile = req.files.find(f => f.fieldname === `modules[${index}][pdf]`);

      return {
        title: mod.title,
        passMark: mod.passMark,
        videoUrl: videoFile ? `/uploads/${videoFile.filename}` : null,
        pdfUrl: pdfFile ? `/uploads/${pdfFile.filename}` : null,
        mcq: mod.mcq || [],
      };
    });

    // Handle signature upload (single file)
    const signatureFile = req.files.find(f => f.fieldname === "signature");

    const course = new Course({
      title,
      description,
      category,
      instructorId,
      instructorName,
      modules: finalModules,
      certificateTemplate, // save selected template (e.g. "template1")
      signatureUrl: signatureFile ? `/uploads/${signatureFile.filename}` : null,
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (err) {
    console.error("Error in addCourse:", err);
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

// ✅ Get courses by instructorId
export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await Course.find({ instructorId });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found for this instructor" });
    }

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


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
