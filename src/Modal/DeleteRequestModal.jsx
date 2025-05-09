import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const DeletionRequestModal = ({ isOpen, onClose, recordData, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [existingRequests, setExistingRequests] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData")) || {};

  // Fetch existing deletion requests when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchDeletionRequests = async () => {
        try {
          const response = await axios.get("http://localhost:8000/api/deletion-requests", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setExistingRequests(response.data);
        } catch (error) {
          console.error("Error fetching deletion requests:", error.response?.data || error);
          setError("Failed to fetch existing requests. Please try again.");
        }
      };
      fetchDeletionRequests();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for deletion.");
      return;
    }

    // Check if a deletion request already exists for this record
    const hasExistingRequest = existingRequests.some(
      (request) => request.record_id === recordData.id && request.status === "Pending"
    );
    if (hasExistingRequest) {
      Swal.fire({
        icon: "error",
        title: "Request Already Sent",
        text: "A pending deletion request already exists for this document. Please wait for it to be processed or cancel it.",
        confirmButtonColor: "#FF6767",
      });
      return;
    }

    try {
      const payload = {
        user_name: userData.name,
        document_type: recordData.document_type,
        number: recordData.no,
        title: recordData.title,
        reason: reason,
        record_id: recordData.id,
      };

      const response = await axios.post(
        "http://localhost:8000/api/deletion-request",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Pass request details to onSubmit
      onSubmit({
        id: response.data.data.id || `temp-${Date.now()}`,
        document_type: recordData.document_type,
        number: recordData.no,
        user_name: userData.name,
        created_at: new Date().toISOString(),
        status: "Pending",
      });

      onClose();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Deletion request submitted successfully.",
        confirmButtonColor: "#408286",
      });
    } catch (error) {
      console.error("Error submitting deletion request:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to submit deletion request.");
    }
  };

  const handleCancel = () => {
    setReason("");
    setError("");
    setExistingRequests([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[600px]">
        <h2 className="text-lg font-semibold mb-4 font-poppins">Request Document Deletion</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Document Type</label>
            <input
              type="text"
              value={recordData.document_type || ""}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Document Number</label>
            <input
              type="text"
              value={recordData.no || ""}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={recordData.title || ""}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Reason for Deletion</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for deletion"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#408286] focus:border-[#408286] resize-y"
              rows="4"
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#408286] hover:bg-[#306466] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-colors duration-200"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletionRequestModal;