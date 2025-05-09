// PrintReferral.js
export const printReferral = (referralData) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Referral Document</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .details { margin: 20px 0; }
            .details p { margin: 5px 0; }
            .meno { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Referral Document</h1>
          <div class="details">
            <p><span class="meno">No:</span> ${referralData.no || "N/A"}</p>
            <p><span class="meno">Document Type:</span> ${referralData.document_type || "N/A"}</p>
            <p><span class="meno">Title:</span> ${referralData.title || "N/A"}</p>
            <p><span class="meno">Committee Sponsor:</span> ${referralData.sponsor || "N/A"}</p>
            <p><span class="meno">City Mayor Forwarded:</span> ${referralData.cm_forwarded || "N/A"}</p>
            <p><span class="meno">City Mayor Received:</span> ${referralData.cm_received || "N/A"}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  export const getReferralData = (localRowData) => {
    return {
      no: localRowData.no,
      document_type: localRowData.document_type,
      title: localRowData.title,
      sponsor: localRowData.sponsor,
      cm_forwarded: localRowData.cm_forwarded,
      cm_received: localRowData.cm_received,
    };
  };