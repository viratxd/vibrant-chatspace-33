
import html2pdf from 'html2pdf.js';

export const generatePDF = (elementId: string) => {
  const content = document.getElementById(elementId);
  if (!content) return;

  const opt = {
    margin: [0.75, 0.75],
    filename: 'answers.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      letterRendering: true,
      useCORS: true,
      logging: true
    },
    jsPDF: { 
      unit: 'in', 
      format: 'letter', 
      orientation: 'portrait',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    },
    pagebreak: { 
      mode: 'avoid-all',
      before: '.page-break',
      after: '.answer-card'
    }
  };

  return html2pdf().set(opt).from(content).save();
};
