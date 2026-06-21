import { jsPDF } from 'jspdf';
import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';
import Expense from '../models/Expense.js';
import PackingList from '../models/PackingList.js';

// @desc    Export travel dossier to PDF
// @route   GET /api/export-pdf/:tripId
// @access  Private
export const exportPDF = async (req, res, next) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      res.status(404);
      return next(new Error('Trip not found or unauthorized'));
    }

    const itinerary = await Itinerary.findOne({ trip: tripId });
    const expenses = await Expense.find({ trip: tripId }).sort({ date: 1 });
    const packing = await PackingList.findOne({ trip: tripId });

    // Initialize PDF Document (A4 size: 210mm x 297mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let y = 20;
    const margin = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);

    // Helper: Add page if overflow
    const checkPageOverflow = (neededHeight) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
        drawHeaderFooter();
      }
    };

    // Helper: Draw header and footer borders on page
    const drawHeaderFooter = () => {
      // Small bottom line and page number
      doc.setDrawColor(70, 69, 84);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(144, 143, 160);
      doc.text('TripCraft AI | Precision Engineered Travel', margin, pageHeight - 8);
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin - 10, pageHeight - 8);
    };

    // Draw branding
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(128, 131, 255); // Brand color: #8083ff
    doc.text('TripCraft AI', margin, y);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(144, 143, 160);
    doc.text('Travel Intelligence Report', pageWidth - margin - 45, y - 2);
    y += 8;

    doc.setDrawColor(128, 131, 255);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;

    // 1. Trip Telemetry Card
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(228, 225, 237); // Text color: #e4e1ed
    doc.setFillColor(31, 31, 39); // Card background: #1f1f27
    doc.rect(margin, y, contentWidth, 36, 'F');
    
    doc.setTextColor(192, 193, 255);
    doc.text(`DESTINATION: ${trip.destination.toUpperCase()}`, margin + 5, y + 8);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(228, 225, 237);
    
    const startStr = new Date(trip.startDate).toLocaleDateString();
    const endStr = new Date(trip.endDate).toLocaleDateString();
    doc.text(`Expedition Timeline: ${startStr} - ${endStr}`, margin + 5, y + 16);
    doc.text(`Travelers Count: ${trip.travelers} Pax`, margin + 5, y + 23);
    doc.text(`Preferences: ${trip.travelStyle} Style / Food: ${trip.foodPreferences}`, margin + 5, y + 30);
    
    y += 44;

    // 2. Budget Analytics Summary
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = trip.budget - totalSpent;
    const spentPercent = ((totalSpent / trip.budget) * 100).toFixed(0);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(128, 131, 255);
    doc.text('Financial Balance Sheet', margin, y);
    y += 6;

    doc.setDrawColor(70, 69, 84);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(228, 225, 237);
    doc.text(`Total Trip Budget Cap: $${trip.budget.toFixed(2)}`, margin, y);
    doc.text(`Logged Debits: $${totalSpent.toFixed(2)} (${spentPercent}% Expended)`, margin, y + 6);
    doc.text(`Available Reserves: $${balance.toFixed(2)}`, margin, y + 12);
    y += 22;

    // 3. Day-Wise Timeline Itinerary
    if (itinerary && itinerary.days && itinerary.days.length > 0) {
      checkPageOverflow(30);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(128, 131, 255);
      doc.text('Optimized AI Timeline Itinerary', margin, y);
      y += 6;
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      for (const day of itinerary.days) {
        checkPageOverflow(40);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(192, 193, 255);
        doc.text(`Day ${day.day} Timeline (Est. Daily Budget: $${day.budget})`, margin, y);
        y += 6;

        // Morning
        if (day.morning && day.morning.length > 0) {
          checkPageOverflow(15);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(76, 215, 246); // Secondary color
          doc.text('Morning:', margin + 5, y);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(228, 225, 237);
          const act = day.morning[0];
          doc.text(`${act.title} (${act.location || 'Central'})`, margin + 22, y);
          y += 5;
        }

        // Afternoon
        if (day.afternoon && day.afternoon.length > 0) {
          checkPageOverflow(15);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(76, 215, 246);
          doc.text('Afternoon:', margin + 5, y);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(228, 225, 237);
          const act = day.afternoon[0];
          doc.text(`${act.title} (${act.location || 'Central'})`, margin + 22, y);
          y += 5;
        }

        // Evening
        if (day.evening && day.evening.length > 0) {
          checkPageOverflow(15);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(76, 215, 246);
          doc.text('Evening:', margin + 5, y);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(228, 225, 237);
          const act = day.evening[0];
          doc.text(`${act.title} (${act.location || 'Central'})`, margin + 22, y);
          y += 5;
        }

        // Restaurants
        if (day.restaurants && day.restaurants.length > 0) {
          checkPageOverflow(15);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(208, 188, 255); // Tertiary color
          doc.text('Dining:', margin + 5, y);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(228, 225, 237);
          const rest = day.restaurants[0];
          doc.text(`${rest.name} (${rest.type || 'Cuisine'})`, margin + 22, y);
          y += 5;
        }

        y += 6; // spacing after day
      }
    }

    // 4. Packing checklist
    if (packing && packing.items && packing.items.length > 0) {
      checkPageOverflow(35);
      y += 5;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(128, 131, 255);
      doc.text('Expedition Gear Packing Checklist', margin, y);
      y += 6;
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(228, 225, 237);

      // Split packing list items into 2 columns
      const halfLength = Math.ceil(packing.items.length / 2);
      for (let i = 0; i < halfLength; i++) {
        checkPageOverflow(8);
        const col1 = packing.items[i];
        const col2 = packing.items[i + halfLength];

        // Column 1
        const status1 = col1.checked ? '[X]' : '[ ]';
        doc.text(`${status1} ${col1.name} (${col1.category})`, margin, y);

        // Column 2
        if (col2) {
          const status2 = col2.checked ? '[X]' : '[ ]';
          doc.text(`${status2} ${col2.name} (${col2.category})`, margin + 90, y);
        }
        y += 5;
      }
    }

    // Call final page border
    drawHeaderFooter();

    // Compile into buffer and send
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tripcraft_${tripId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
