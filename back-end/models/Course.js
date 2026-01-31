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
  certificateTemplate: { type: String, required: false }, // store template identifier or path
  signatureUrl: { type: String, default: null }, // store uploaded signature image
});


export default mongoose.model("Course", courseSchema);
