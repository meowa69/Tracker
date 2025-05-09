import Sidebar from "../Components/Sidebar";
import { useState, useEffect, useRef } from "react";
import ViewCommitteeModal from "../Modal/ViewCommitteeModal";
import AssignMemberModal from "../Modal/AssignMemberModal";
import axios from "axios";
import { FaUserTie, FaUserShield, FaUsers, FaPlus, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

function CommitteeManage() {
  const [activeTab, setActiveTab] = useState("committees");
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [committeePage, setCommitteePage] = useState(1);
  const [addTermPage, setAddTermPage] = useState(1);
  const [editTermPage, setEditTermPage] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [committees, setCommittees] = useState([]);
  const [committeeName, setCommitteeName] = useState("");
  const [terms, setTerms] = useState([]);
  const [newTerm, setNewTerm] = useState("");
  const [committeeError, setCommitteeError] = useState("");
  const [termError, setTermError] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", progress: 100 });
  const [committeeMembers, setCommitteeMembers] = useState({
    chairman: null,
    viceChairman: null,
    members: [],
  });
  const [selectedCommitteeForEdit, setSelectedCommitteeForEdit] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);

  const itemsPerPage = 12;
  const committeesPerPage = 6;
  const addTermsPerPage = 6;
  const editTermsPerPage = 20;

  // Compute ordinal suffix (matches backend getOrdinalSuffix)
  const getOrdinalSuffix = (num) => {
    if ([11, 12, 13].includes(num)) return "th";
    const lastDigit = num % 10;
    if (lastDigit === 1) return "st";
    if (lastDigit === 2) return "nd";
    if (lastDigit === 3) return "rd";
    return "th";
  };

  // Format term for numeric inputs only
  const formatTerm = (input) => {
    const trimmed = input.trim();
    // Check if input is a number (e.g., "1", "20")
    const numberMatch = trimmed.match(/^\d+$/);
    if (numberMatch) {
      const num = parseInt(numberMatch[0], 10);
      return `${num}${getOrdinalSuffix(num)} City Council`.toUpperCase();
    }
    // Return input as-is for non-numeric inputs
    return trimmed.toUpperCase();
  };

  const showAlert = (message) => {
    setAlert({ show: true, message, progress: 100 });
  };

  const closeAlert = () => {
    setAlert({ show: false, message: "", progress: 0 });
  };

  useEffect(() => {
    if (alert.show) {
      const totalDuration = 3000;
      const intervalTime = 30;
      const step = (intervalTime / totalDuration) * 100;

      const progressInterval = setInterval(() => {
        setAlert((prev) => {
          if (prev.progress <= 0) {
            clearInterval(progressInterval);
            return { ...prev, show: false, message: "", progress: 0 };
          }
          return { ...prev, progress: prev.progress - step };
        });
      }, intervalTime);

      return () => clearInterval(progressInterval);
    }
  }, [alert.show]);

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/committees");
      setCommittees(response.data);
    } catch (err) {
      console.error("Error fetching committees:", err);
      showAlert("Failed to fetch committees.");
    }
  };

  const addCommittee = async () => {
    if (!committeeName.trim()) {
      setCommitteeError("Committee name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/committees", {
        committee_name: committeeName,
      });
      setCommittees([...committees, response.data.committee]);
      setCommitteeName("");
      setCommitteeError("");
      showAlert("Committee added successfully!");
    } catch (err) {
      setCommitteeError(err.response?.data?.message || "Failed to add committee.");
    }
  };

  const handleDeleteCommittee = async (committeeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this committee. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6767",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/committees/${committeeId}`);
          setCommittees(committees.filter((committee) => committee.id !== committeeId));
          showAlert("Committee deleted successfully!");
          Swal.fire("Deleted!", "The committee has been deleted.", "success");
        } catch (error) {
          console.error('Failed to delete committee:', error);
          showAlert("Failed to delete committee.");
          Swal.fire("Error!", "Failed to delete the committee.", "error");
        }
      }
    });
  };

  const handleCommitteeKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCommittee();
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/terms");
      setTerms(response.data);
    } catch (err) {
      console.error("Error fetching terms:", err);
      showAlert("Failed to fetch terms.");
    }
  };

  const addTerm = async () => {
    if (!newTerm.trim()) {
      setTermError("Term cannot be empty.");
      return;
    }

    const formattedTerm = formatTerm(newTerm);

    try {
      const response = await axios.post("http://localhost:8000/api/terms", {
        term: formattedTerm,
      });
      setTerms([...terms, response.data.term]);
      setNewTerm("");
      setTermError("");
      showAlert("Term added successfully!");
    } catch (err) {
      setTermError(err.response?.data?.message || "Failed to add term.");
    }
  };

  const handleDeleteTerm = async (termId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this term. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6767",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/terms/${termId}`);
          setTerms(terms.filter((term) => term.id !== termId));
          showAlert("Term deleted successfully!");
          Swal.fire("Deleted!", "The term has been deleted.", "success");
        } catch (error) {
          console.error("Failed to delete term:", error);
          showAlert("Failed to delete term.");
          Swal.fire("Error!", "Failed to delete the term.", "error");
        }
      }
    });
  };

  const handleTermKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTerm();
    }
  };

  const updateMembers = (newMembers) => {
    const chairman = newMembers.find((m) => m.role === "chairman")?.member_name || null;
    const viceChairman = newMembers.find((m) => m.role === "vice_chairman")?.member_name || null;
    const members = newMembers.filter((m) => m.role === "member").map((m) => m.member_name);

    setCommitteeMembers((prev) => ({
      chairman: chairman || prev.chairman,
      viceChairman: viceChairman || prev.viceChairman,
      members: [...prev.members, ...members].slice(0, 5), // Ensure max 5 members
    }));
  };

  const fetchMembers = async () => {
    if (selectedCommittee && selectedTerm) {
      try {
        const termId = terms.find((t) => t.term === selectedTerm)?.id;
        if (!termId) {
          console.error("Term ID not found for:", selectedTerm);
          setCommitteeMembers({ chairman: null, viceChairman: null, members: [] });
          return;
        }
        const response = await axios.get("http://localhost:8000/api/committee-members", {
          params: {
            committee_id: selectedCommittee.id,
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
      }
    } else {
      setCommitteeMembers({ chairman: null, viceChairman: null, members: [] });
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedCommittee, selectedTerm]);

  const openModal = (committee) => {
    setSelectedCommittee(committee);
    setIsModalOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCommittees = committees.filter((committee) =>
    committee?.committee_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCommittees.length / itemsPerPage);
  const paginatedCommittees = filteredCommittees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginateItems = (items, page, perPage) => {
    const totalPages = Math.ceil(items.length / perPage);
    const paginatedItems = items.slice(
      (page - 1) * perPage,
      page * perPage
    );
    return { paginatedItems, totalPages };
  };

  const { paginatedItems: paginatedCommitteeList, totalPages: totalCommitteePages } = paginateItems(committees, committeePage, committeesPerPage);
  const { paginatedItems: addPaginatedTerms, totalPages: addTotalTermPages } = paginateItems(terms, addTermPage, addTermsPerPage);
  const { paginatedItems: editPaginatedTerms, totalPages: editTotalTermPages } = paginateItems(terms, editTermPage, editTermsPerPage);

  const nextPage = (type) => {
    if (type === "committees") setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    if (type === "addCommittee") setCommitteePage((prev) => Math.min(prev + 1, totalCommitteePages));
    if (type === "addTerm") setAddTermPage((prev) => Math.min(prev + 1, addTotalTermPages));
    if (type === "editTerm") setEditTermPage((prev) => Math.min(prev + 1, editTotalTermPages));
  };

  const prevPage = (type) => {
    if (type === "committees") setCurrentPage((prev) => Math.max(prev - 1, 1));
    if (type === "addCommittee") setCommitteePage((prev) => Math.max(prev - 1, 1));
    if (type === "addTerm") setAddTermPage((prev) => Math.max(prev - 1, 1));
    if (type === "editTerm") setEditTermPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold uppercase text-[#494444] text-[35px]">
            Manage Committees
          </h1>
          {alert.show && (
            <div className="absolute top-4 right-4 bg-[#408286] text-white px-4 py-3 rounded shadow-lg flex items-center w-80">
              <span className="mr-2">✔</span>
              <span className="flex-grow font-poppins">{alert.message}</span>
              <button onClick={closeAlert} className="ml-4 text-white text-xl">
                ×
              </button>
              <div
                className="absolute bottom-0 left-0 h-1 bg-white transition-all"
                style={{ width: `${alert.progress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="w-full h-[calc(100vh-12px)] bg-white border rounded-lg shadow-lg p-4 ">
          <div className="flex border-b mb-4">
            <button
              className={`p-3 text-sm font-semibold ${activeTab === "committees" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"}`}
              onClick={() => setActiveTab("committees")}
            >
              Committees
            </button>
            <button
              className={`p-3 text-sm font-semibold ${activeTab === "editCommittee" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"}`}
              onClick={() => setActiveTab("editCommittee")}
            >
              Committee Members
            </button>
            <button
              className={`p-3 text-sm font-semibold ${activeTab === "addCommittee" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"}`}
              onClick={() => setActiveTab("addCommittee")}
            >
              Add Committee
            </button>
            <button
              className={`p-3 text-sm font-semibold ${activeTab === "addTerm" ? "border-b-2 border-[#408286] text-[#408286]" : "text-gray-600"}`}
              onClick={() => setActiveTab("addTerm")}
            >
              Add Term
            </button>
          </div>

          {activeTab === "committees" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-[300px] font-poppins pl-10 pr-4 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#408286] transition duration-150 ease-in-out"
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedCommittees.length > 0 ? (
                  paginatedCommittees.map((committee, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-[#408286]"
                    >
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-2">
                          {committee.committee_name}
                        </h2>
                      </div>
                      <div className="mt-4">
                        <button
                          className="w-full px-4 py-2 bg-[#408286] shadow-sm text-white text-sm font-medium rounded-md hover:bg-[#306060] transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#408286] focus:ring-offset-2"
                          onClick={() => openModal(committee)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic col-span-full text-center">No committees available</p>
                )}
              </div>

              <ViewCommitteeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                committee={selectedCommittee}
                terms={terms}
                fetchMembers={fetchMembers}
              />

              <div className="flex justify-end items-center mt-6 space-x-4 absolute bottom-[60px] right-[50px]">
                <button
                  className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-md ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"} transition duration-150 ease-in-out`}
                  disabled={currentPage === 1}
                  onClick={() => prevPage("committees")}
                >
                  Previous
                </button>
                <span className="text-gray-700 font-medium text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  className={`px-4 py-2 rounded-md text-white text-sm font-medium shadow-md ${currentPage === totalPages || totalPages === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"} transition duration-150 ease-in-out`}
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => nextPage("committees")}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {activeTab === "editCommittee" && (
            <div className="p-6 bg-white border rounded-lg shadow-md">
              <div className="relative w-full" ref={dropdownRef}>
                <div
                  className="uppercase cursor-pointer w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#408286] truncate"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  {selectedCommitteeForEdit || "Select Committee"}
                </div>
                <img
                  src="src/assets/Images/down2.png"
                  alt="Dropdown Icon"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                />
                {isDropdownOpen && (
                  <div className="absolute mt-1 w-full min-h-[250px] bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-2 py-2 border-b border-gray-300 focus:outline-none rounded-t-lg text-sm font-poppins"
                    />
                    <div className="max-h-[250px] overflow-y-auto">
                      {filteredCommittees.map((committee, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-poppins text-[14px] text-gray-600 uppercase"
                          onClick={() => {
                            setSelectedCommittee(committee);
                            setSelectedCommitteeForEdit(committee.committee_name);
                            setSelectedTerm(null);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {committee.committee_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedCommitteeForEdit && (
                <div className="mt-6 border rounded-lg p-6 bg-gray-50 shadow-sm">
                  <h3 className="text-sm font-poppins font-semibold text-gray-700 mb-3">Terms</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {terms.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">Loading terms...</p>
                    ) : (
                      editPaginatedTerms.map((term, index) => (
                        <button
                          key={index}
                          className={`p-2 rounded-md transition text-sm uppercase ${selectedTerm === term.term ? "bg-[#408286] text-white font-bold" : "hover:bg-gray-200 bg-white border"}`}
                          onClick={() => setSelectedTerm(term.term)}
                        >
                          {term.term}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins shadow-md ${editTermPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"}`}
                      disabled={editTermPage === 1}
                      onClick={() => prevPage("editTerm")}
                    >
                      Previous
                    </button>
                    <span className="px-4 text-gray-500 font-medium self-center text-sm">
                      Page {editTermPage} of {editTotalTermPages}
                    </span>
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins shadow-md ${editTermPage === editTotalTermPages ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"}`}
                      disabled={editTermPage === editTotalTermPages}
                      onClick={() => nextPage("editTerm")}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 border border-gray-200 rounded-lg p-8 shadow-md bg-white relative">
                {!selectedCommitteeForEdit ? (
                  <p className="text-gray-600 text-sm italic font-medium">
                    Please select a committee to proceed.
                  </p>
                ) : !selectedTerm ? (
                  <p className="text-gray-600 text-sm italic font-medium">
                    Please select a term to view or edit members.
                  </p>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 uppercase tracking-wide">
                      Committee Members for {selectedTerm}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <div className="col-span-1">
                        <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <FaUserTie className="text-[#408286]" aria-hidden="true" />
                          Chairman
                        </h4>
                        {committeeMembers.chairman ? (
                          <ul className="text-gray-700 text-[16px] list-disc pl-5 font-poppins">
                            <li>{committeeMembers.chairman}</li>
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No chairman assigned</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <div className="gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-2">
                              <FaUserShield className="text-[#408286]" aria-hidden="true" />
                              Vice Chairman
                            </h4>
                            {committeeMembers.viceChairman ? (
                              <ul className="text-gray-700 text-[16px] list-disc pl-5 font-poppins">
                                <li>{committeeMembers.viceChairman}</li>
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No vice chairman assigned</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-2">
                              <FaUsers className="text-[#408286]" aria-hidden="true" />
                              Members
                            </h4>
                            {committeeMembers.members.length > 0 ? (
                              <ul className="text-gray-700 text-[16px] list-disc pl-5 font-poppins">
                                {committeeMembers.members
                                  .slice(0, Math.ceil(committeeMembers.members.length / 1))
                                  .map((member, index) => (
                                    <li key={index} className="mb-1">
                                      {member}
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm italic">No members assigned</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-[#408286] hover:bg-[#306060] text-white rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      aria-label="Add or edit committee members"
                    >
                      <FaPlus className="text-sm" aria-hidden="true" />
                      <span className="text-sm font-medium">Add Members</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <AssignMemberModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            committee={selectedCommittee}
            term={terms.find((t) => t.term === selectedTerm)}
            updateMembers={updateMembers}
            fetchMembers={fetchMembers}
            onMembersAdded={() => showAlert("Members added successfully!")}
            terms={terms}
          />

          {activeTab === "addCommittee" && (
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 w-full mx-auto">
              <div className="flex items-center space-x-2 mb-6">
                <input
                  type="text"
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  onKeyDown={handleCommitteeKeyDown}
                  placeholder="Enter committee name"
                  className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-[#408286] transition-all duration-200 placeholder-gray-400"
                />
                <button
                  className="bg-[#408286] shadow-sm text-white px-6 py-3 rounded-lg font-poppins font-medium text-sm transition-all duration-200 hover:bg-[#306060] focus:outline-none focus:ring-2 focus:ring-[#408286] focus:ring-offset-2"
                  onClick={addCommittee}
                  aria-label="Add new committee"
                >
                  Add
                </button>
                <button
                  className="bg-gray-200 shadow-sm text-gray-700 px-6 py-3 rounded-lg font-poppins font-medium text-sm transition-all duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  onClick={() => {
                    setCommitteeName("");
                    setCommitteeError("");
                  }}
                  aria-label="Cancel adding committee"
                >
                  Cancel
                </button>
              </div>

              {committeeError && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <FaExclamationCircle className="text-red-500" aria-hidden="true" />
                  <p className="text-red-600 text-sm font-poppins">{committeeError}</p>
                </div>
              )}

              <div className="border border-gray-100 p-6 rounded-xl bg-gray-50">
                <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Committee List</h2>
                <div>
                  <table className="w-full border-collapse">
                    <thead className="bg-[#408286] text-white">
                      <tr>
                        <th scope="col" className="p-4 text-left text-sm font-semibold font-poppins uppercase tracking-wide">
                          #
                        </th>
                        <th scope="col" className="p-4 text-left text-sm font-semibold font-poppins uppercase tracking-wide">
                          Committee Name
                        </th>
                        <th scope="col" className="p-4 text-left text-sm font-semibold font-poppins uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCommitteeList.length > 0 ? (
                        paginatedCommitteeList.map((committee, index) => (
                          <tr
                            key={committee.id}
                            className={`${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-[#e6f0f0] transition-all duration-200`}
                          >
                            <td className="p-4 text-gray-600 text-sm font-poppins border-b border-gray-200">
                              {(committeePage - 1) * committeesPerPage + index + 1}
                            </td>
                            <td className="p-4 text-gray-800 text-sm font-poppins font-medium uppercase border-b border-gray-200">
                              {committee.committee_name}
                            </td>
                            <td className="p-4 border-b border-gray-200">
                              <button
                                onClick={() => handleDeleteCommittee(committee.id)}
                                className="bg-[#FF6767] hover:bg-[#f35656] shadow-md px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                                aria-label={`Delete committee ${committee.committee_name}`}
                              >
                                <FaTrash aria-hidden="true" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-gray-500 text-sm font-poppins italic">
                            No committees available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {totalCommitteePages > 1 && (
                  <div className="flex justify-end items-center mt-4">
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins shadow-md ${committeePage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"}`}
                      disabled={committeePage === 1}
                      onClick={() => prevPage("addCommittee")}
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 font-medium mx-4 text-sm font-poppins">
                      Page {committeePage} of {totalCommitteePages}
                    </span>
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins shadow-md ${committeePage === totalCommitteePages ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"}`}
                      disabled={committeePage === totalCommitteePages}
                      onClick={() => nextPage("addCommittee")}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "addTerm" && (
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 w-full mx-auto">
              <div className="flex items-center space-x-2 mb-6">
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  onKeyDown={handleTermKeyDown}
                  placeholder="Enter term (e.g., 1st City Council)"
                  className="w-full p-3 border border-gray-200 rounded-lg text-gray-700 font-poppins text-sm focus:outline-none focus:ring-2 focus:ring-[#408286] transition-all duration-200 placeholder-gray-400"
                />
                <button
                  className="bg-[#408286] shadow-sm text-white px-6 py-3 rounded-lg font-poppins font-medium text-sm transition-all duration-200 hover:bg-[#306060] focus:outline-none focus:ring-2 focus:ring-[#408286] focus:ring-offset-2"
                  onClick={addTerm}
                  aria-label="Add new term"
                >
                  Add
                </button>
                <button
                  className="bg-gray-200 shadow-sm text-gray-700 px-6 py-3 rounded-lg font-poppins font-medium text-sm transition-all duration-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  onClick={() => {
                    setNewTerm("");
                    setTermError("");
                  }}
                  aria-label="Cancel adding term"
                >
                  Cancel
                </button>
              </div>

              {termError && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <FaExclamationCircle className="text-red-500" aria-hidden="true" />
                  <p className="text-red-600 text-sm font-poppins">{termError}</p>
                </div>
              )}

              <div className="border border-gray-100 p-6 rounded-xl bg-gray-50">
                <h2 className="text-lg font-semibold font-poppins text-gray-800 mb-4">Term List</h2>
                <div>
                  <table className="w-full border-collapse">
                    <thead className="bg-[#408286] text-white">
                      <tr>
                        <th scope="col" className="p-4 text-left text-sm font-semibold font-poppins uppercase tracking-wide">
                          #
                        </th>
                        <th scope="col" className="p-4 text-left text-sm font-semibold font-poppins uppercase tracking-wide">
                          Term
                        </th>
                        <th scope="col" className="p-4 text-left text-sm font-semibold font-poppins uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {addPaginatedTerms.length > 0 ? (
                        addPaginatedTerms.map((term, index) => (
                          <tr
                            key={term.id}
                            className={`${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-[#e6f0f0] transition-all duration-200`}
                          >
                            <td className="p-4 text-gray-600 text-sm font-poppins border-b border-gray-200">
                              {(addTermPage - 1) * addTermsPerPage + index + 1}
                            </td>
                            <td className="p-4 text-gray-800 text-sm font-poppins font-medium uppercase border-b border-gray-200">
                              {term.term}
                            </td>
                            <td className="p-4 border-b border-gray-200">
                              <button
                                onClick={() => handleDeleteTerm(term.id)}
                                className="bg-[#FF6767] hover:bg-[#f35656] shadow-md px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                                aria-label={`Delete term ${term.term}`}
                              >
                                <FaTrash aria-hidden="true" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-gray-500 text-sm font-poppins italic">
                            No terms available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {addTotalTermPages > 1 && (
                  <div className="flex justify-end items-center mt-4">
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins shadow-md ${addTermPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"}`}
                      disabled={addTermPage === 1}
                      onClick={() => prevPage("addTerm")}
                    >
                      Previous
                    </button>
                    <span className="text-gray-700 font-medium mx-4 text-sm font-poppins">
                      Page {addTermPage} of {addTotalTermPages}
                    </span>
                    <button
                      className={`px-4 py-2 rounded-lg text-white text-sm font-poppins shadow-md ${addTermPage === addTotalTermPages ? "bg-gray-400 cursor-not-allowed" : "bg-[#408286] hover:bg-[#306060]"}`}
                      disabled={addTermPage === addTotalTermPages}
                      onClick={() => nextPage("addTerm")}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommitteeManage;