import mongoose from "mongoose";

const mcqSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String
});

const moduleSchema = new mongoose.Schema({
  title: String,
  passMark: Number,
  videoUrl: { type: String, default: null },
  pdfUrl: { type: String, default: null },
  mcq: [mcqSchema],
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  instructorId: String,
  instructorName: String,
  modules: [moduleSchema],
});

export default mongoose.model("Course", courseSchema);
