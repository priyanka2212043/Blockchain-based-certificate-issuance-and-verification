// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Make sure the path is correct
import courseRoutes from './routes/courseRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  credentials: true                // Allow credentials (cookies, headers)
}));

app.use(express.json());
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(process.env.PORT, () => {
    console.log(` Server is running on http://localhost:${process.env.PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection failed:', err.message);
});
