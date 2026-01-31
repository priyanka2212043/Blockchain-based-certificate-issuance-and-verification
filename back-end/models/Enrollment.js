import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  status: { type: String, default: "active" },
  enrolledAt: { type: Date, default: Date.now },

  // Track progress for each module
  progress: [
    {
      moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
      status: { 
        type: String, 
        enum: ["not started", "in progress", "completed", "unlocked"], 
        default: "not started" 
      }
    }
  ],
  certificateOnChain: {
    txHash: { type: String },  // stores blockchain transaction hash (hash2 is on-chain only)
  },
});

const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
