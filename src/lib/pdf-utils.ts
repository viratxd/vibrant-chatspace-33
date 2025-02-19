
import html2pdf from 'html2pdf.js';

export const generatePDF = async (elementId: string) => {
  const content = document.getElementById(elementId);
  if (!content) return;

  // Clone the content to manipulate it without affecting the original
  const clonedContent = content.cloneNode(true) as HTMLElement;
  const answerCards = Array.from(clonedContent.getElementsByClassName('answer-card'));

  // Create a temporary container for the PDF layout
  const pdfContainer = document.createElement('div');
  pdfContainer.style.width = '8.5in'; // Letter size width
  pdfContainer.style.margin = '0';
  pdfContainer.style.padding = '0.4in';

  // Process answer cards in pairs
  for (let i = 0; i < answerCards.length; i += 2) {
    const pageContainer = document.createElement('div');
    pageContainer.style.display = 'flex';
    pageContainer.style.flexDirection = 'column';
    pageContainer.style.gap = '0.3in';
    pageContainer.style.pageBreakAfter = 'always';
    pageContainer.className = 'pdf-page';

    // Add first card
    const card1 = answerCards[i] as HTMLElement;
    card1.style.fontSize = '8px';
    card1.style.padding = '0.2in';
    card1.style.margin = '0';
    card1.style.backgroundColor = '#1f2937'; // bg-gray-800
    card1.style.border = '1px solid #374151'; // border-gray-700
    card1.style.borderRadius = '0.375rem';
    
    // Format content within the card
    const markdown = card1.querySelectorAll('.prose');
    markdown.forEach(elem => {
      (elem as HTMLElement).style.maxWidth = 'none';
      (elem as HTMLElement).style.fontSize = '8px';
      (elem as HTMLElement).style.margin = '0.1in 0';
    });

    pageContainer.appendChild(card1);

    // Add second card if it exists
    if (i + 1 < answerCards.length) {
      const card2 = answerCards[i + 1] as HTMLElement;
      card2.style.fontSize = '8px';
      card2.style.padding = '0.2in';
      card2.style.margin = '0';
      card2.style.backgroundColor = '#1f2937';
      card2.style.border = '1px solid #374151';
      card2.style.borderRadius = '0.375rem';

      const markdown2 = card2.querySelectorAll('.prose');
      markdown2.forEach(elem => {
        (elem as HTMLElement).style.maxWidth = 'none';
        (elem as HTMLElement).style.fontSize = '8px';
        (elem as HTMLElement).style.margin = '0.1in 0';
      });

      pageContainer.appendChild(card2);
    }

    pdfContainer.appendChild(pageContainer);
  }

  // Configure PDF options
  const opt = {
    margin: 0,
    filename: 'answers.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 4, // Higher scale for better quality
      letterRendering: true,
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
      compress: true
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Create temporary container in the document
  document.body.appendChild(pdfContainer);

  try {
    // Generate PDF
    await html2pdf()
      .set(opt)
      .from(pdfContainer)
      .save();
  } finally {
    // Clean up
    document.body.removeChild(pdfContainer);
  }
};
