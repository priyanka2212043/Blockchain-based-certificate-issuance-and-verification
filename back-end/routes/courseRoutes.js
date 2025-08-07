import express from 'express';
import {
  getCoursesByInstructor,
  addCourse
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/instructor/:instructorId', getCoursesByInstructor);
router.post('/add', addCourse); // Add course

export default router;
