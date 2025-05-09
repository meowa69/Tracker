import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserTie, FaUserShield, FaUsers } from "react-icons/fa";

function ViewCommitteeModal({ isOpen, onClose, committee, terms, fetchMembers }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [committeeMembers, setCommitteeMembers] = useState({
    chairman: null,
    viceChairman: null,
    members: [],
  });
  const [loading, setLoading] = useState(false);

  // Fetch members when a term is selected
  useEffect(() => {
    const loadMembers = async () => {
      if (committee && selectedTerm && terms) {
        setLoading(true);
        try {
          const termId = terms.find((t) => t.term === selectedTerm)?.id;
          if (!termId) {
            console.error("Term ID not found for:", selectedTerm);
            setCommitteeMembers({ chairman: null, viceChairman: null, members: [] });
            return;
          }
          const response = await axios.get("http://localhost:8000/api/committee-members", {
            params: {
              committee_id: committee.id,
              term_id: termId,
            },
          });
          const membersData = response.data;
          setCommitteeMembers({
            chairman: membersData.find((m) => m.role === "chairman")?.member_name || null,
            viceChairman: membersData.find((m) => m.role === "vice_chairman")?.member_name || null,
            members: membersData.filter((m) => m.role === "member").map((m) => m.member_name),
          });
        } catch (err) {
          console.error("Error fetching members:", err);
          setCommitteeMembers({ chairman: null, viceChairman: null, members: [] });
        } finally {
          setLoading(false);
        }
      }
    };
    loadMembers();
  }, [selectedTerm, committee, terms]);

  if (!isOpen || !committee) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 uppercase tracking-wide">
            {committee.committee_name}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors duration-150 focus:outline-none"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Term Selection */}
          <div className="space-y-2">
            <label htmlFor="term-select" className="block text-sm font-medium text-gray-700">
              Select Term
            </label>
            <select
              id="term-select"
              value={selectedTerm || ""}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full uppercase p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#408286] focus:border-[#408286] text-gray-700 bg-white transition duration-150 ease-in-out text-sm font-medium"
            >
              <option value="" disabled>
                -- Select a Term --
              </option>
              {terms && terms.length > 0 ? (
                terms.map((term) => (
                  <option key={term.id} value={term.term} className="uppercase">
                    {term.term}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No terms available
                </option>
              )}
            </select>
          </div>

          {/* Members Display */}
          <div className="space-y-6">
            {selectedTerm ? (
              loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#408286]"></div>
                  <span className="ml-3 text-gray-600 text-sm font-medium">Loading members...</span>
                </div>
              ) : (
                <>
                  {/* Chairman */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaUserTie className="text-[#408286] w-5 h-5" /> Chairman
                    </h3>
                    <div className="mt-3">
                      {committeeMembers.chairman ? (
                        <p className="text-gray-700 font-medium bg-gray-100 p-4 rounded-md text-sm">
                          {committeeMembers.chairman}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No chairman assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Vice Chairman */}
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaUserShield className="text-[#408286] w-5 h-5" /> Vice Chairman
                    </h3>
                    <div className="mt-3">
                      {committeeMembers.viceChairman ? (
                        <p className="text-gray-700 font-medium bg-gray-100 p-4 rounded-md text-sm">
                          {committeeMembers.viceChairman}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No vice chairman assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Members */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                      <FaUsers className="text-[#408286] w-5 h-5" /> Members
                    </h3>
                    <div className="mt-3">
                      {committeeMembers.members.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                          {committeeMembers.members.map((member, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-4 rounded-md text-gray-700 font-medium text-sm border border-gray-200 shadow-sm flex items-center justify-start"
                            >
                              <span className="inline-block w-2 h-2 bg-[#408286] rounded-full mr-2"></span>
                              {member}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-sm">No members assigned</p>
                      )}
                    </div>
                  </div>
                </>
              )
            ) : (
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-center">
                <p className="text-gray-600 text-sm font-medium">
                  Please select a term to view committee members.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            className="px-6 py-2 bg-[#408286] hover:bg-[#306060] text-white font-medium rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#408286] focus:ring-offset-2 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewCommitteeModal;