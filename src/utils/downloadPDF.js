import { jsPDF } from 'jspdf';
import {
  cdo_logoBase64,
  goldenfriendship_logoBase64,
  bagongpilipinas_logoBase64,
  CityC_LogoBase64,
} from './logoImages';

// Import the EB Garamond font files from src/assets/Font
import EBGaramondRegular from '../assets/Font/EBGaramond-Regular.ttf';
import EBGaramondBold from '../assets/Font/EBGaramond-Bold.ttf';
import EBGaramondItalic from '../assets/Font/EBGaramond-Italic.ttf';

export const downloadPDF = (documentData, signatoryDetails, currentDate, sessionDate, docNo, preview = false) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [216, 330], // Folio size
    orientation: 'portrait',
  });

  // Register EB Garamond fonts using the imported URLs
  doc.addFont(EBGaramondRegular, 'EBGaramond', 'normal');
  doc.addFont(EBGaramondBold, 'EBGaramond', 'bold');
  doc.addFont(EBGaramondItalic, 'EBGaramond', 'italic');

  // Set default font to EBGaramond
  doc.setFont('EBGaramond');

  // Margins
  const marginLeft = 38.1; // ~3.81cm
  const marginRight = 25.4; // ~2.54cm
  const marginTop = 0; // No top margin
  const marginBottom = 15; // ~mb-4
  const pageWidth = 216;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Helper function to add text with bold phrases and superscript suffix
  const addText = (doc, text, yPosition, options = {}) => {
    const {
      x = marginLeft,
      y = yPosition,
      size = 12, // Default size set to 11
      bold = false,
      italic = false,
      align = 'left',
      indent = 0,
      maxWidth = contentWidth,
      color = [0, 0, 0], // Changed to black
      boldPhrases = [],
      superscript = null,
      customLineHeight = size * 0.4,
    } = options;
  
    doc.setFontSize(size);
    doc.setTextColor(...color);
  
    if (boldPhrases.length === 0 && !superscript) {
      doc.setFont('EBGaramond', bold ? 'bold' : italic ? 'italic' : 'normal');
      const lines = doc.splitTextToSize(String(text), maxWidth - indent);
      const lineHeight = customLineHeight;

      if (align === 'justify' && lines.length > 0) {
        lines.forEach((line, index) => {
          const lineY = y + index * lineHeight;
          const isLastLine = index === lines.length - 1;
          const words = line.trim().split(' ').filter(word => word);
          
          if (isLastLine && words.length <= 2) {
            doc.text(line, x + indent, lineY, { align: 'left' });
          } else if (words.length > 1) {
            const totalTextWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
            const totalSpaces = words.length - 1;
            const spaceWidth = (maxWidth - indent - totalTextWidth) / totalSpaces;
            let currentX = x + indent;

            words.forEach((word, i) => {
              doc.text(word, currentX, lineY);
              if (i < words.length - 1) {
                currentX += doc.getTextWidth(word) + spaceWidth;
              }
            });
          } else {
            doc.text(line, x + indent, lineY);
          }
        });
      } else {
        doc.text(lines, x + indent, y, { align });
      }
      return lines.length * lineHeight;
    }
  
    const lines = doc.splitTextToSize(String(text), maxWidth - indent);
    const lineHeight = customLineHeight || (size * 0.4);
    let totalHeight = 0;
  
    lines.forEach((line, lineIndex) => {
      let currentX = x + indent;
      let remainingText = line;
  
      while (remainingText.length > 0) {
        let foundBold = false;
        let foundSuperscript = false;
  
        for (const phrase of boldPhrases) {
          if (remainingText.startsWith(phrase)) {
            doc.setFont('EBGaramond', 'bold');
            doc.text(phrase, currentX, y + lineIndex * lineHeight);
            currentX += doc.getTextWidth(phrase);
            remainingText = remainingText.substring(phrase.length);
            foundBold = true;
            break;
          }
        }
  
        if (!foundBold && superscript) {
          const dayStr = String(sessionDate.day);
          const suffix = sessionDate.suffix;
          const fullDateStr = dayStr + suffix;
  
          const dateIndex = remainingText.indexOf(fullDateStr);
          if (dateIndex !== -1) {
            if (dateIndex > 0) {
              const beforeDate = remainingText.substring(0, dateIndex);
              doc.setFont('EBGaramond', 'normal');
              doc.text(beforeDate, currentX, y + lineIndex * lineHeight);
              currentX += doc.getTextWidth(beforeDate);
              remainingText = remainingText.substring(dateIndex);
            }
  
            doc.setFont('EBGaramond', 'bold');
            doc.text(dayStr, currentX, y + lineIndex * lineHeight);
            currentX += doc.getTextWidth(dayStr);
  
            doc.setFontSize(size * 0.6);
            doc.setFont('EBGaramond', 'bold');
            doc.text(suffix, currentX, y + lineIndex * lineHeight - size * 0.15);
            currentX += doc.getTextWidth(suffix);
            doc.setFontSize(size);
  
            remainingText = remainingText.substring(fullDateStr.length);
            foundSuperscript = true;
          }
        }
  
        if (!foundBold && !foundSuperscript) {
          const nextSpace = remainingText.indexOf(' ') === -1 ? remainingText.length : remainingText.indexOf(' ');
          const nextText = remainingText.substring(0, nextSpace + 1);
          doc.setFont('EBGaramond', 'normal');
          doc.text(nextText, currentX, y + lineIndex * lineHeight);
          currentX += doc.getTextWidth(nextText);
          remainingText = remainingText.substring(nextSpace + 1);
          totalHeight = (lineIndex + 1) * lineHeight;
        }
      }
      totalHeight = (lineIndex + 1) * lineHeight;
    });
  
    return totalHeight;
  };

  // Helper function to draw a solid line
  const drawLine = (doc, x1, y, x2, color, thickness = 0.3) => {
    doc.setLineWidth(thickness);
    doc.setDrawColor(...color);
    doc.line(x1, y, x2, y);
  };

  // Helper function to interpolate between two colors
  const interpolateColor = (color1, color2, factor) => {
    const result = color1.map((channel, index) => {
      return Math.round(channel + factor * (color2[index] - channel));
    });
    return result;
  };

  // Helper function to draw a gradient line
  const drawGradientLine = (doc, x1, y, x2, colors, thickness = 0.3) => {
    const lineWidth = x2 - x1;
    const segmentWidth = 1;
    const numSegments = Math.ceil(lineWidth / segmentWidth);
    const halfSegments = numSegments / 2;

    const startColor = colors[0];
    const midColor = colors[1];
    const endColor = colors[2];

    doc.setLineWidth(thickness);

    for (let i = 0; i < numSegments; i++) {
      const segmentX1 = x1 + i * segmentWidth;
      const segmentX2 = Math.min(segmentX1 + segmentWidth, x2);
      const factor = i / numSegments;

      let color;
      if (i < halfSegments) {
        const subFactor = (i / halfSegments);
        color = interpolateColor(startColor, midColor, subFactor);
      } else {
        const subFactor = ((i - halfSegments) / halfSegments);
        color = interpolateColor(midColor, endColor, subFactor);
      }

      doc.setDrawColor(...color);
      doc.line(segmentX1, y, segmentX2, y);
    }
  };

  // Function to add a page (main or recipient)
  const addPage = (recipient = null, pageIndex = 1) => {
    console.log(`Adding page ${pageIndex}${recipient ? ` for recipient: ${recipient.name}` : ' (main sheet)'}`);
    let yPosition = marginTop;

    // Header: Logos and Text
    const logos = {
      cdo: { image: cdo_logoBase64, width: 25, height: 25, x: 5, y: yPosition + 3 },
      goldenfriendship: { image: goldenfriendship_logoBase64, width: 18, height: 9, x: 31, y: yPosition + 11 },
      bagongpilipinas: { image: bagongpilipinas_logoBase64, width: 25, height: 25, x: 49, y: yPosition + 3 },
      cityCouncil: { image: CityC_LogoBase64, width: 25, height: 25, x: pageWidth - 30, y: yPosition + 3 },
    };

    Object.values(logos).forEach((logo) => {
      try {
        doc.addImage(logo.image, 'PNG', logo.x, logo.y, logo.width, logo.height);
      } catch (error) {
        console.error(`Error adding logo at y=${logo.y}:`, error);
      }
    });

    const headerHeight = Math.max(...Object.values(logos).map(logo => logo.height));
    const leftLogosWidth = logos.bagongpilipinas.x + logos.bagongpilipinas.width - logos.cdo.x;
    const rightLogoWidth = logos.cityCouncil.width;
    const textAreaWidth = pageWidth - leftLogosWidth - rightLogoWidth - 10;

    const textXOffset = 0;
    const textX = logos.bagongpilipinas.x + logos.bagongpilipinas.width + 5 + textXOffset;
    const textYStart = yPosition + 7.5;
    let textY = textYStart;

    // Header with specified sizes
    addText(doc, 'Republic of the Philippines', textY, { x: textX + 31, y: textY + 4, size: 11, align: 'center', maxWidth: textAreaWidth });
    textY += 4;
    addText(doc, 'CITY OF CAGAYAN DE ORO', textY, { x: textX + 33, y: textY + 5, size: 12, align: 'center', maxWidth: textAreaWidth });
    textY += 4;
    addText(doc, 'OFFICE OF THE CITY COUNCIL', textY, { x: textX + 33, y: textY + 6, size: 13, bold: true, align: 'center', maxWidth: textAreaWidth });
    textY += 4;
    addText(doc, '(088) 565-0568 ∙ (088) 565-0697 ∙ www.cdocitycouncil.com', textY, { x: textX + 32.5, y: textY + 6.5, size: 8, align: 'center', color: [0, 0, 0] });

    yPosition += headerHeight + 5;

    const borderThickness = 0.5;
    drawLine(doc, 5, yPosition, pageWidth - 5, [167, 137, 125], borderThickness);
    yPosition += 1 + borderThickness / 4;
    drawGradientLine(doc, 5, yPosition, pageWidth - 5, [
      [118, 173, 184],
      [63, 111, 139],
      [18, 51, 96],
    ], borderThickness);
    yPosition += 10 + borderThickness / 4;

    // Title and Date
    const titleXOffset = 0;
    const titleX = marginLeft + titleXOffset;
    if (!recipient) {
      addText(doc, 'TRANSMITTAL SHEET', yPosition, { x: titleX + 75, y: yPosition, size: 16, bold: true, align: 'center', maxWidth: contentWidth });
      yPosition += 8;
      yPosition += 5;
      addText(doc, currentDate, yPosition, { size: 12, align: 'left', indent: 89, y: yPosition, color: [0, 0, 0] });
      yPosition += 10;

      // Body
      addText(doc, 'Sirs/Mesdames:', yPosition, { size: 12 });
      yPosition += 10;

      const bodyText = `Enclosed is a copy of ${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}, current series, passed by the City Council of this City, during its Regular Session on the ${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}, to wit:`;
      const documentPhrase = `${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}`;
      const datePhrase = `${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}`;
      const monthPhrase = `day of ${sessionDate.month}`;
      const yearPhrase = `${sessionDate.year}`;
      const fullDateStr = `${String(sessionDate.day)}${sessionDate.suffix}`;

      const splitIndex = bodyText.indexOf('City') + 'City'.length;
      const indentedText = bodyText.substring(0, splitIndex);
      const remainingText = bodyText.substring(splitIndex);

      const indentedHeight = addText(doc, indentedText, yPosition, { 
        size: 12, 
        maxWidth: contentWidth,
        boldPhrases: [documentPhrase],
        indent: 10
      });

      yPosition += indentedHeight;

      yPosition += addText(doc, remainingText, yPosition, { 
        size: 12, 
        maxWidth: contentWidth,
        boldPhrases: [datePhrase, monthPhrase, yearPhrase, fullDateStr],
        superscript: true,
        indent: 0
      });
    } else {
      yPosition += 13; // Match margin-top from renderRecipientPage
      addText(doc, currentDate, yPosition, { size: 12, align: 'left', indent: 89, y: yPosition, color: [0, 0, 0] });
      yPosition += 20; // Move down after date to align with recipient details

      // Recipient Details
      addText(doc, recipient.name.toUpperCase(), yPosition, { size: 12, bold: true, align: 'left', y: yPosition });
      yPosition += 5;
      if (recipient.designation) {
        addText(doc, recipient.designation, yPosition, { size: 12, align: 'left', y: yPosition });
        yPosition += 5;
      }
      if (recipient.office) {
        addText(doc, recipient.office, yPosition, { size: 12, align: 'left', y: yPosition });
        yPosition += 5;
      }
      if (recipient.address) {
        addText(doc, recipient.address, yPosition, { size: 12, align: 'left', y: yPosition });
        yPosition += 10;
      }

      // Body
      addText(doc, `${recipient.salutation || "Sir/Madam"}:`, yPosition, { size: 12 });
      yPosition += 10;

      const bodyText = `Enclosed is a copy of ${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}, current series, passed by the City Council of this City, during its Regular Session on the ${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}, to wit:`;
      const documentPhrase = `${documentData.document_type || "N/A"} No. ${documentData.no || "N/A"}`;
      const datePhrase = `${String(sessionDate.day)}${sessionDate.suffix} day of ${sessionDate.month} ${sessionDate.year}`;
      const monthPhrase = `day of ${sessionDate.month}`;
      const yearPhrase = `${sessionDate.year}`;
      const fullDateStr = `${String(sessionDate.day)}${sessionDate.suffix}`;

      const splitIndex = bodyText.indexOf('City') + 'City'.length;
      const indentedText = bodyText.substring(0, splitIndex);
      const remainingText = bodyText.substring(splitIndex);

      const indentedHeight = addText(doc, indentedText, yPosition, { 
        size: 12, 
        maxWidth: contentWidth,
        boldPhrases: [documentPhrase],
        indent: 10
      });

      yPosition += indentedHeight;

      yPosition += addText(doc, remainingText, yPosition, { 
        size: 12, 
        maxWidth: contentWidth,
        boldPhrases: [datePhrase, monthPhrase, yearPhrase, fullDateStr],
        superscript: true,
        indent: 0
      });
    }

    // Title Box
    yPosition += 5;
    const title = documentData.title || 'N/A';
    doc.setDrawColor(55, 65, 81);
    doc.setLineWidth(0.1);
    const boxWidth = contentWidth * 0.85;
    const boxX = marginLeft + (contentWidth - boxWidth) / 2;

    const titleText = title.toUpperCase();
    doc.setFontSize(11);
    doc.setFont('EBGaramond', 'bold');
    const textLines = doc.splitTextToSize(titleText, boxWidth - 8);
    const titleLineHeight = 11 * 0.45; // Adjusted for size 11
    const textHeight = textLines.length * titleLineHeight;
    const paddingTopBottom = 3;
    const boxHeight = textHeight + paddingTopBottom * 2;

    doc.rect(boxX, yPosition, boxWidth, boxHeight, 'S');

    const textBlockHeight = textLines.length * titleLineHeight;
    const yStart = yPosition + paddingTopBottom + (boxHeight - textBlockHeight) / 2;

    addText(doc, titleText, yStart, { 
      x: boxX + 4,
      y: yStart,
      size: 11, 
      bold: true, 
      align: 'justify',
      maxWidth: boxWidth - 8,
      customLineHeight: titleLineHeight
    });
    yPosition += boxHeight + 5;

    // Additional Text
    yPosition += 5;
    yPosition += addText(doc, 'for your information.', yPosition, { size: 12 });
    yPosition += 5;
    yPosition += addText(doc, 'Thank you very much.', yPosition, { size: 12, indent: 10 });
    yPosition += 6;

    // Signature Section
    const signatureX = pageWidth - marginRight - 49;
    addText(doc, 'Very truly yours,', yPosition, { size: 12, x: signatureX, align: 'center' });
    yPosition += 15;
    addText(doc, signatoryDetails.name.toUpperCase(), yPosition, { size: 12, bold: true, x: signatureX, align: 'center' });
    yPosition += 4;
    addText(doc, signatoryDetails.title1, yPosition, { size: 11, x: signatureX, align: 'center' });
    yPosition += 4;
    addText(doc, signatoryDetails.title2, yPosition, { size: 11, x: signatureX, align: 'center' });
    yPosition += 4;
    addText(doc, signatoryDetails.title3 || '', yPosition, { size: 11, x: signatureX, align: 'center' });
    yPosition += 4;
    addText(doc, signatoryDetails.authority, yPosition, { size: 11, x: signatureX, align: 'center' });
    yPosition += 4;
    addText(doc, signatoryDetails.authorityTitle, yPosition, { size: 11, x: signatureX, align: 'center' });
    yPosition += 15;

    // Recipients Table (only for main sheet)
    if (!recipient) {
      const isSecondSignatory = signatoryDetails.title1 === "City Secretary" && 
                               !signatoryDetails.title2 && 
                               !signatoryDetails.title3 && 
                               !signatoryDetails.authority && 
                               !signatoryDetails.authorityTitle;
      yPosition += isSecondSignatory ? -15 : 0;

      const colWidths = {
        office: 50,
        receiverName: 35,
        signature: 30,
        date: 25,
      };

      const headerXPositions = {
        office: marginLeft + 10,
        receiverName: marginLeft + colWidths.office + 23,
        signature: marginLeft + colWidths.office + colWidths.receiverName + 23,
        date: marginLeft + colWidths.office + colWidths.receiverName + colWidths.signature + 19.25,
      };

      doc.setFontSize(9);
      doc.setFont('EBGaramond', 'normal');
      doc.text('Office', headerXPositions.office, yPosition, { align: 'left' });
      doc.text('Receiver Name', headerXPositions.receiverName + colWidths.receiverName / 2, yPosition, { align: 'center' });
      doc.text('Signature', headerXPositions.signature + colWidths.signature / 2, yPosition, { align: 'center' });
      doc.text('Date', headerXPositions.date + colWidths.date / 2, yPosition, { align: 'center' });
      yPosition += 10;

      if (documentData.transmitted_recipients && documentData.transmitted_recipients.length > 0) {
        documentData.transmitted_recipients.forEach((recipient, index) => {
          console.log(`Adding recipient ${index + 1} to table:`, recipient);
          const office = recipient.office || 'N/A';
          const officeLines = doc.splitTextToSize(office, colWidths.office - 5);
          const lineHeight = 11 * 0.4; // Matches addText line height
          const rowHeight = officeLines.length * lineHeight;

          // Render office text (no underline)
          officeLines.forEach((line, lineIndex) => {
            doc.setFontSize(9);
            doc.setFont('EBGaramond', 'normal');
            doc.text(line, marginLeft, yPosition + lineIndex * lineHeight, { align: 'left' });
          });

          // Draw underlines for Receiver Name, Signature, and Date
          doc.setLineWidth(0.1);
          doc.setDrawColor(0, 0, 0);

          const underlineY = yPosition + (officeLines.length - 1) * lineHeight + 0; // Align with last line's baseline + offset
          const receiverNameLineWidth = (colWidths.receiverName - 10) * 1.5;
          const receiverNameX1 = headerXPositions.receiverName + (colWidths.receiverName - receiverNameLineWidth) / 2;
          const receiverNameX2 = receiverNameX1 + receiverNameLineWidth;
          doc.line(receiverNameX1, underlineY, receiverNameX2, underlineY);

          const signatureLineWidth = colWidths.signature - 10;
          const signatureX1 = headerXPositions.signature + (colWidths.signature - signatureLineWidth) / 2;
          const signatureX2 = signatureX1 + signatureLineWidth;
          doc.line(signatureX1, underlineY, signatureX2, underlineY);

          const dateLineWidth = signatureLineWidth;
          const dateX1 = headerXPositions.date + (colWidths.date - dateLineWidth) / 2;
          const dateX2 = dateX1 + dateLineWidth;
          doc.line(dateX1, underlineY, dateX2, underlineY);

          yPosition += rowHeight;
        });
      } else {
        const noRecipientsHeight = addText(doc, 'No recipients added.', yPosition, { size: 10, align: 'center', x: pageWidth / 2 });
        yPosition += noRecipientsHeight;
      }
    }

    // Footer
    const footerText = `Generated from the LMIS & Records Section ${new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })}`;
    addText(doc, footerText, 330 - marginBottom, {
      x: pageWidth - marginRight,
      y: 338 - marginBottom,
      size: 9,
      align: 'right',
      color: [0, 0, 0],
    });
  };

  // Add main page
  console.log("Adding main page...");
  addPage(null, 1);

  // Add recipient pages
  let pageIndex = 2;
  if (documentData.transmitted_recipients && Array.isArray(documentData.transmitted_recipients) && documentData.transmitted_recipients.length > 0) {
    console.log(`Found ${documentData.transmitted_recipients.length} recipients:`, documentData.transmitted_recipients);
    documentData.transmitted_recipients.forEach((recipient, index) => {
      if (recipient && typeof recipient === 'object' && recipient.name) {
        console.log(`Adding page for recipient ${index + 1}: ${recipient.name}`);
        doc.addPage();
        addPage(recipient, pageIndex);
        pageIndex++;
      } else {
        console.warn(`Skipping invalid recipient at index ${index}:`, recipient);
      }
    });
  } else {
    console.log("No valid recipients found in documentData.transmitted_recipients");
  }

  // Log total pages
  const totalPages = doc.getNumberOfPages();
  console.log(`Total pages in PDF: ${totalPages}`);

  // Save or preview
  if (preview) {
    console.log("Returning data URI for preview...");
    return doc.output('datauristring');
  } else {
    console.log("Saving PDF...");
    doc.save(`Transmittal_Sheet_${docNo || 'N/A'}.pdf`);
  }
};