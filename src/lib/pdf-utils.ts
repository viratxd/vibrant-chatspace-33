// pdf-utils.ts
import jsPDF from 'jspdf';

// Define the AnswerCard interface.
export interface AnswerCard {
  question: string;
  answer: string;
}

/**
 * Generates a custom PDF where each page contains answer cards arranged in a two-column grid.
 *
 * @param answerCards - Array of AnswerCard data objects.
 */
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
