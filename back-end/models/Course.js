import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String
  },
  duration: {
    type: String
  },
  rating: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
