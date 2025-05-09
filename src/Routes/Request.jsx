import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../Components/Sidebar";

function Request() {
  const [requestData, setRequestData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const recordsPerPage = 5;

  // Fetch deletion requests on component mount
  useEffect(() => {
    const fetchDeletionRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8000/api/deletion-requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRequestData(response.data);
      } catch (error) {
        console.error("Error fetching deletion requests:", error);
        Swal.fire("Error", "Failed to load deletion requests.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDeletionRequests();
  }, []);

  const handleAction = async (id) => {
    Swal.fire({
      title: "Are you sure you want to approve this request?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#408286",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `http://localhost:8000/api/deletion-requests/${id}`,
            { status: "Approved" },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setRequestData((prev) => prev.filter((request) => request.id !== id));
          Swal.fire("Approved!", "The request has been approved.", "success");
        } catch (error) {
          console.error("Error approving deletion request:", error);
          Swal.fire("Error", "Failed to approve the request.", "error");
        }
      }
    });
  };

  const handleCancel = async (id) => {
    Swal.fire({
      title: "Are you sure you want to cancel this request?",
      text: "This will remove the deletion request and restore the ability to request deletion again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6767",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8000/api/deletion-requests/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          setRequestData((prev) => prev.filter((request) => request.id !== id));
          Swal.fire("Canceled!", "The deletion request has been canceled.", "success");
        } catch (error) {
          console.error("Error canceling deletion request:", error);
          Swal.fire("Error", "Failed to cancel the request.", "error");
        }
      }
    });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = requestData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(requestData.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-poppins font-bold uppercase text-[#333] text-[35px] tracking-wide">
            Deletion Requests
          </h1>
        </div>

        {/* Table Container */}
        <div className="w-full max-w-full border rounded-lg shadow-lg p-8 bg-white border-gray-300">
          <div className="relative">
            <table className="w-full border-collapse table-auto">
              {/* Table Header */}
              <thead className="bg-[#408286] text-white">
                <tr className="font-semibold font-poppins text-left text-[14px]">
                  <th className="border border-gray-300 px-4 py-4 w-[75%] first:rounded-tl-lg">Details</th>
                  <th className="border border-gray-300 px-4 py-4 w-[25%] text-center last:rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Scrollable Table Body */}
              <tbody>
                <tr>
                  <td colSpan="2" className="p-0">
                    <div className="max-h-[680px] overflow-y-auto">
                      <table className="w-full border-collapse">
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan="2" className="text-center py-10 text-gray-500 font-poppins text-lg">
                                <div className="flex justify-center items-center">
                                  <div className="w-8 h-8 border-4 border-[#408286] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              </td>
                            </tr>
                          ) : currentRecords.length === 0 ? (
                            <tr>
                              <td colSpan="2" className="text-center py-10 text-gray-500 font-poppins text-lg">
                                No deletion requests yet
                              </td>
                            </tr>
                          ) : (
                            currentRecords.map((request) => (
                              <tr key={request.id} className="border border-gray-300 hover:bg-gray-100 text-[14px]">
                                <td className="border border-gray-300 px-4 py-4 w-[75%] align-top">
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <p className="font-semibold font-poppins text-gray-700">
                                        Name: <span className="font-normal">{request.user_name}</span>
                                      </p>
                                      <p className="font-semibold font-poppins text-gray-700">
                                        Date of Request: <span className="font-normal">{new Date(request.created_at).toLocaleDateString()}</span>
                                      </p>
                                    </div>
                                    <div className="flex justify-between">
                                      <p className="font-semibold font-poppins text-gray-700">
                                        Document Type: <span className="font-normal">{request.document_type}</span>
                                      </p>
                                      <p className="font-semibold font-poppins text-gray-700">
                                        No: <span className="font-normal">{request.number}</span>
                                      </p>
                                    </div>
                                    <p className="font-semibold font-poppins text-gray-700">
                                      Title: <span className="font-normal">{request.title}</span>
                                    </p>
                                    <p className="font-semibold font-poppins text-red-600">
                                      Reason for Deletion: <span className="font-normal">{request.reason}</span>
                                    </p>
                                    <p className="font-semibold font-poppins text-gray-700">
                                      Status: <span className="font-normal">{request.status}</span>
                                    </p>
                                  </div>
                                </td>
                                <td className="border border-gray-300 w-[25%] px-4 py-4 text-center align-middle">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => handleAction(request.id)}
                                      className="bg-[#408286] hover:bg-[#306466] shadow-md px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleCancel(request.id)}
                                      className="bg-[#FF6767] hover:bg-[#f35656] shadow-md px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!loading && requestData.length > recordsPerPage && (
              <div className="flex justify-center mt-6 items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-medium py-2 px-6 rounded-full shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <span className="font-poppins text-gray-700 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-medium py-2 px-6 rounded-full shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Request;