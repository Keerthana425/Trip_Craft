import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base health route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'TripCraft AI API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/export-pdf', pdfRoutes);






// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
