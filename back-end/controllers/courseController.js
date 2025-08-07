import Course from '../models/Course.js';

export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await Course.find({ instructor: instructorId });
    res.status(200).json(courses);
  } catch (err) {
    console.error('Error fetching instructor courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { title, description, instructor, imageUrl, duration } = req.body;

    const newCourse = new Course({
      title,
      description,
      instructor,
      imageUrl,
      duration
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
