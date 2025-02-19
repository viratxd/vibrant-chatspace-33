import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import html2pdf from 'html2pdf.js';

// Define the AnswerCard interface.
export interface AnswerCard {
  question: string;
  answer: string;
}

/**
 * Converts an HTML element to an image data URL
 */
const elementToImage = async (element: HTMLElement): Promise<string> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#1f2937', // Match the dark theme background
  });
  return canvas.toDataURL('image/png');
};

/**
 * Generates a PDF with answer cards arranged in a collage layout (up to 4 per page)
 */
export const generatePDF = async (elementId: string) => {
  const container = document.getElementById(elementId);
  if (!container) return;

  const answerCards = Array.from(container.getElementsByClassName('answer-card'));
  if (answerCards.length === 0) return;

  // Initialize PDF with A4 size
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  
  // Calculate available space
  const availableWidth = pageWidth - (2 * margin);
  const availableHeight = pageHeight - (2 * margin);
  
  // Calculate dimensions for 2x2 grid layout
  const maxImageWidth = availableWidth / 2;
  const maxImageHeight = availableHeight / 2;

  // Process cards in groups of 4
  for (let pageIndex = 0; pageIndex < Math.ceil(answerCards.length / 4); pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Get the next 4 cards (or fewer for the last page)
    const startIdx = pageIndex * 4;
    const pageCards = answerCards.slice(startIdx, startIdx + 4);

    // Convert each card to an image and add to PDF
    for (let i = 0; i < pageCards.length; i++) {
      const card = pageCards[i] as HTMLElement;
      
      try {
        // Convert card to image
        const imageData = await elementToImage(card);

        // Calculate position based on index
        const row = Math.floor(i / 2);
        const col = i % 2;
        
        // Calculate x and y positions
        const x = margin + (col * maxImageWidth);
        const y = margin + (row * maxImageHeight);

        // Add image to PDF with automatic scaling
        pdf.addImage(
          imageData,
          'PNG',
          x,
          y,
          maxImageWidth,
          maxImageHeight,
          undefined,
          'FAST',
          0
        );
      } catch (error) {
        console.error('Error processing card:', error);
      }
    }
  }

  // Save the PDF
  pdf.save('answers-collage.pdf');
};

// Keeping the original grid PDF function as backup
export const generateGridPDF = (answerCards: AnswerCard[]) => {
  // Create a jsPDF document with letter format (8.5" x 11") and inches as units.
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter',
  });

  // Page dimensions and margins.
  const pageWidth = 8.5;
  const pageHeight = 11;
  const margin = 0.5; // inch margin on all sides

  // Calculate the available drawing area.
  const availableWidth = pageWidth - 2 * margin;
  const availableHeight = pageHeight - 2 * margin;

  // Grid parameters: 2 columns per row.
  const columns = 2;
  const gutter = 0.1; // space between cards horizontally and vertically

  // Define the card dimensions.
  // Card width is calculated so that two cards and a gutter fit within the available width.
  const cardWidth = (availableWidth - gutter) / columns;
  const cardHeight = 1.5; // fixed height for each card (adjust as needed)

  // Calculate the maximum number of rows per page.
  const rowsPerPage = Math.floor((availableHeight + gutter) / (cardHeight + gutter));

  // Set the minimum font size (8pt).
  const minFontSize = 8;
  doc.setFontSize(minFontSize);

  // Helper function to render an individual answer card.
  const drawCard = (
    card: AnswerCard,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Draw a rectangle as the border of the card.
    doc.rect(x, y, width, height);

    // Define padding inside the card.
    const padding = 0.1; // inch
    const textX = x + padding;
    let textY = y + padding + 0.15; // initial offset for text

    // Prepare the question and answer text.
    const questionText = `Q: ${card.question}`;
    const answerText = `A: ${card.answer}`;

    // Wrap text to fit within the card's width.
    const textWidth = width - 2 * padding;
    const questionLines = doc.splitTextToSize(questionText, textWidth);
    const answerLines = doc.splitTextToSize(answerText, textWidth);

    // Render the question.
    doc.text(questionLines, textX, textY);
    // Advance y by the height of the question text plus some spacing.
    const lineHeight = 0.15; // inch (adjust as needed)
    textY += questionLines.length * lineHeight + 0.1;

    // Render the answer.
    doc.text(answerLines, textX, textY);
  };

  // Place answer cards in a grid.
  let cardIndex = 0;
  while (cardIndex < answerCards.length) {
    // Loop through rows and columns for the current page.
    for (let row = 0; row < rowsPerPage && cardIndex < answerCards.length; row++) {
      for (let col = 0; col < columns && cardIndex < answerCards.length; col++) {
        // Calculate x and y positions for the current card.
        const x = margin + col * (cardWidth + gutter);
        const y = margin + row * (cardHeight + gutter);
        drawCard(answerCards[cardIndex], x, y, cardWidth, cardHeight);
        cardIndex++;
      }
    }
    // If there are still cards left, add a new page.
    if (cardIndex < answerCards.length) {
      doc.addPage();
    }
  }

  // Save the generated PDF.
  doc.save('grid_answers.pdf');
};
