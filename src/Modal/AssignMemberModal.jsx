import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";

function AssignMemberModal({
  isOpen,
  onClose,
  committee,
  term,
  fetchMembers,
  updateMembers,
  onMembersAdded,
  terms,
}) {
  const [chairman, setChairman] = useState("");
  const [viceChairman, setViceChairman] = useState("");
  const [members, setMembers] = useState(["", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef(null);

  // Fetch members when modal opens or committee/term changes
  useEffect(() => {
    const loadMembers = async () => {
      if (isOpen && committee?.id && term?.id) {
        try {
          setIsLoading(true);
          const response = await axios.get("http://localhost:8000/api/committee-members", {
            params: {
              committee_id: committee.id,
              term_id: term.id,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          const membersData = response.data;
          const chairmanData = membersData.find((m) => m.role === "chairman")?.member_name || "";
          const viceChairmanData = membersData.find((m) => m.role === "vice_chairman")?.member_name || "";
          const memberData = membersData
            .filter((m) => m.role === "member")
            .map((m) => m.member_name)
            .slice(0, 5);

          setChairman(chairmanData);
          setViceChairman(viceChairmanData);
          setMembers([...memberData, ...Array(5 - memberData.length).fill("")]);
          setError("");
        } catch (err) {
          setError("Failed to load members: " + (err.response?.data?.message || err.message));
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMembers();
  }, [isOpen, committee, term]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const trapFocus = (event) => {
        if (event.key === "Tab") {
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", trapFocus);
      firstElement?.focus();

      return () => document.removeEventListener("keydown", trapFocus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!committee || !committee.committee_name) {
      setError("Please select a committee first.");
      return;
    }
    if (!term || !term.id) {
      setError("Please select a term first.");
      return;
    }

    const membersToAssign = [
      chairman.trim() && { member_name: chairman, role: "chairman" },
      viceChairman.trim() && { member_name: viceChairman, role: "vice_chairman" },
      ...members
        .filter((name) => name.trim() !== "")
        .map((name) => ({ member_name: name, role: "member" })),
    ].filter(Boolean);

    if (membersToAssign.length === 0) {
      setError("Please enter at least one member.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Optimistic update
    updateMembers(membersToAssign);

    try {
      // Delete existing members
      await axios.delete("http://localhost:8000/api/committee-members", {
        data: {
          committee_id: committee.id,
          term_id: term.id,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Add new members in batch
      const response = await axios.post(
        "http://localhost:8000/api/committee-members/batch",
        {
          committee_id: committee.id,
          term_id: term.id,
          members: membersToAssign,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update with actual data from backend
      updateMembers(response.data.members);
      onMembersAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add members.");
      // Revert optimistic update
      await fetchMembers();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !isLoading) {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px]">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-800">
            Assign Members
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Close modal"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>
        <p className="text-gray-600 text-md mb-4 mt-2 uppercase font-poppins font-semibold">
          {committee?.committee_name || "Select a committee"} -{" "}
          {term?.term || "No term selected"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-poppins">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Chairman</label>
          <input
            type="text"
            className="w-full border rounded-md p-2 text-sm"
            value={chairman}
            onChange={(e) => setChairman(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter Chairman Name"
            disabled={isLoading}
            aria-label="Chairman Name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Vice Chairman</label>
          <input
            type="text"
            className="w-full border rounded-md p-2 text-sm"
            value={viceChairman}
            onChange={(e) => setViceChairman(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter Vice Chairman Name"
            disabled={isLoading}
            aria-label="Vice Chairman Name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Members (Max 5)</label>
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm"
                value={member}
                onChange={(e) =>
                  setMembers((prev) => prev.map((m, i) => (i === index ? e.target.value : m)))
                }
                onKeyDown={handleInputKeyDown}
                placeholder={`Member ${index + 1}`}
                disabled={isLoading}
                aria-label={`Member ${index + 1} Name`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 shadow-md font-poppins text-sm"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#408286] text-white rounded-md hover:bg-[#306060] flex items-center gap-2 shadow-md font-poppins text-sm"
            onClick={handleSave}
            disabled={isLoading}
            aria-label="Save Members"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignMemberModal;