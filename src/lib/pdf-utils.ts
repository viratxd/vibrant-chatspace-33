
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Converts an HTML element to an image and places it on the PDF
 */
const addElementToPDF = async (
  element: HTMLElement,
  pdf: jsPDF,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
) => {
  try {
    // Convert element to canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#1f2937', // Match dark theme background
      logging: false
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png');

    // Calculate scaling to fit within max dimensions while maintaining aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', x, y, width, height, undefined, 'FAST');
    
    return height; // Return actual height used
  } catch (error) {
    console.error('Error processing element:', error);
    return maxHeight; // Return max height in case of error
  }
};

/**
 * Generates a PDF with answer cards arranged in a vertical layout
 */
export const generatePDF = async (elementId: string) => {
  const container = document.getElementById(elementId);
  if (!container) return;

  // Get all answer cards
  const cards = Array.from(container.getElementsByClassName('answer-card'));
  if (cards.length === 0) return;

  // Initialize PDF (A4 size)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions and margins (in mm)
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20; // Increased margin for better spacing
  const gap = 15; // Gap between cards

  // Calculate available space
  const contentWidth = pageWidth - (2 * margin);
  const contentHeight = (pageHeight - (2 * margin) - gap) / 2; // Height for 2 cards

  // Process cards in groups of 2
  for (let i = 0; i < cards.length; i += 2) {
    if (i > 0) {
      pdf.addPage();
    }

    // Get up to 2 cards for this page
    const pageCards = cards.slice(i, Math.min(i + 2, cards.length));

    // Add each card to the PDF
    for (let j = 0; j < pageCards.length; j++) {
      // Calculate y position based on card index
      const y = margin + (j * (contentHeight + gap));

      // Add card to PDF
      await addElementToPDF(
        pageCards[j] as HTMLElement,
        pdf,
        margin,
        y,
        contentWidth,
        contentHeight
      );
    }
  }

  // Save the PDF
  pdf.save('answers-collage.pdf');
};
