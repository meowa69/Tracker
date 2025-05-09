import React, { useEffect } from "react";

const ViewModal = ({ isOpen, onClose, rowData }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !rowData) return null;

  console.log("ViewModal rowData:", rowData);
  console.log("Transmitted Recipients in ViewModal:", rowData.transmitted_recipients);

  const isOrdinanceOrResolution = ["ordinance", "resolution", "motion"].includes(
    rowData.document_type?.toLowerCase()
  );
  const isOrdinance = rowData.document_type?.toLowerCase() === "ordinance";
  const isResolution = rowData.document_type?.toLowerCase() === "resolution";
  const isMotion = rowData.document_type?.toLowerCase() === "motion";

  const displayCompleted = rowData.completed ? "True" : "False";

  const formatDateForDisplay = (date) => {
    if (!date) return "Not Set";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    return `${d.toLocaleString("default", { month: "long" })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const getNumberLabel = () => {
    switch (rowData.document_type?.toLowerCase()) {
      case "ordinance":
        return "Ordinance No.";
      case "resolution":
        return "Resolution No.";
      case "motion":
        return "Motion No.";
      default:
        return "No.";
    }
  };

  const transmittedRecipients = Array.isArray(rowData.transmitted_recipients)
    ? rowData.transmitted_recipients
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-[80%] h-[92%] shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#494444] text-2xl font-bold uppercase font-poppins">
            View Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="max-h-[710px] overflow-auto pr-4">
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                {getNumberLabel()}
              </span>
              <span className="w-2/3 text-gray-600">{rowData.no || "N/A"}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-center">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Date Approved
              </span>
              <span className="w-2/3 text-gray-600">{formatDateForDisplay(rowData.date_approved)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-center">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385V4.804zM11 4.804A7.968 7.968 0 0114.5 4c1.255 0 2.443.29 3.5.804v10A7.968 7.968 0 0114.5 14c-1.669 0-3.218.51-4.5 1.385V4.804z" />
                </svg>
                Title
              </span>
              <span className="w-2/3 text-gray-600 text-justify">{rowData.title || "N/A"}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-center">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Committee Sponsor
              </span>
              <span className="w-2/3 text-gray-600">{rowData.sponsor || "N/A"}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-center">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Status
              </span>
              <span className="w-2/3 text-gray-600">{rowData.status || "N/A"}</span>
            </div>
            <hr className="border-gray-200" />
            {isOrdinanceOrResolution && (
              <div className="flex gap-x-8 border p-4 rounded-lg">
                <div className={`${isResolution || isMotion ? "w-full" : "w-1/2"} space-y-4`}>
                  <h3 className="text-xl font-bold text-[#2C4B5F] flex items-center bg-gray-100 p-2 rounded-md shadow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2 text-[#408286]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Vice Mayor's Office
                  </h3>
                  <div className="flex items-center">
                    <span className="w-1/3 font-semibold text-gray-700">Forwarded (For Signature):</span>
                    <span className="w-2/3 text-gray-600">{formatDateForDisplay(rowData.vmForwarded)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-1/3 font-semibold text-gray-700">Received (Signed):</span>
                    <span className="w-2/3 text-gray-600">{formatDateForDisplay(rowData.vmReceived)}</span>
                  </div>
                </div>
                {isOrdinance && (
                  <div className="w-1/2 space-y-4">
                    <h3 className="text-xl font-bold text-[#2C4B5F] flex items-center bg-gray-100 p-2 rounded-md shadow">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mr-2 text-[#408286]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      City Mayor
                    </h3>
                    <div className="flex items-center">
                      <span className="w-1/3 font-semibold text-gray-700">Forwarded:</span>
                      <span className="w-2/3 text-gray-600">{formatDateForDisplay(rowData.cmForwarded)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-1/3 font-semibold text-gray-700">Received:</span>
                      <span className="w-2/3 text-gray-600">{formatDateForDisplay(rowData.cmReceived)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <hr className="border-gray-200" />
            <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-bold text-[#2C4B5F] flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Transmitted To
              </h3>
              {transmittedRecipients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-700 border-collapse">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 border-b">Name</th>
                        <th className="px-4 py-3 border-b">Designation/Office</th>
                        <th className="px-4 py-3 border-b">Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transmittedRecipients.map((recipient, index) => (
                        <tr
                          key={index}
                          className="bg-white border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">{recipient.name || "N/A"}</td>
                          <td className="px-4 py-3">{recipient.designation || "N/A"}</td>
                          <td className="px-4 py-3">{recipient.address || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No recipients specified.</p>
              )}
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-center">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Date Transmitted
              </span>
              <span className="w-2/3 text-gray-600">{formatDateForDisplay(rowData.dateTransmitted)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between gap-x-8">
              <div className="w-1/2 flex items-center">
                <span className="font-semibold text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#408286]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Completed
                </span>
                <span className="ml-2 text-gray-600">{displayCompleted}</span>
              </div>
              <div className="w-1/2 flex items-center justify-start">
                <span className="font-semibold text-gray-700 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#408286]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Date of Completion
                </span>
                <span className="ml-2 text-gray-600">{formatDateForDisplay(rowData.completion_date)}</span>
              </div>
            </div>
            <hr className="border-gray-200" />
            <div className="flex items-start">
              <span className="w-1/3 font-semibold text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#408286]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7-1.502 0-2.918-.412-4.096-1.128l-3.687.98a1 1 0 01-1.217-1.217l.98-3.687C2.412 11.918 2 10.502 2 9c0-4.418 3.582-8 8-8s8 3.582 8 8zm-6-2a1 1 0 100-2 1 1 0 000 2zm-2 6a1 1 0 000-2H8a1 1 0 100 2h2z"
                    clipRule="evenodd"
                  />
                </svg>
                Remarks
              </span>
              <span className="w-2/3 text-gray-600">{rowData.remarks || "N/A"}</span>
            </div>
            <hr className="border-gray-200" />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-[#408286] hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;