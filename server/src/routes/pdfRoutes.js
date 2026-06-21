import express from 'express';
import { exportPDF } from '../controllers/pdfController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:tripId', protect, exportPDF);

export default router;
