import Sidebar from "../Components/Sidebar";
import HighlightText from "../Components/HighlightText";
import { useState, useEffect, useRef } from "react";
import EditModal from "../Modal/EditModal";
import ViewModal from "../Modal/ViewModal";
import StatusHistoryModal from "../Modal/StatusHistoryModal";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";
import { TransmittalSheet, getTransmittalData } from "../Components/TransmittalSheet";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("Document");
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState({});
  const notifDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusHistoryModalOpen, setIsStatusHistoryModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedStatusHistory, setSelectedStatusHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [singleYear, setSingleYear] = useState("");
  const [yearRangeStart, setYearRangeStart] = useState("");
  const [yearRangeEnd, setYearRangeEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("no-asc"); // Default to ascending by document number
  const [sortOrder, setSortOrder] = useState("asc"); // Sort order state
  const recordsPerPage = 10;
  const maxVisiblePages = 5;
  const [alert, setAlert] = useState({ show: false, message: "", progress: 100 });
  const [notifications, setNotifications] = useState([]);
  const bellControls = useAnimation();
  const [unviewedNotificationCount, setUnviewedNotificationCount] = useState(() => {
    const storedCount = localStorage.getItem("unviewedNotificationCount");
    return storedCount ? parseInt(storedCount, 10) : 0;
  });
  const [viewedNotificationStatuses, setViewedNotificationStatuses] = useState(() => {
    const storedStatuses = localStorage.getItem("viewedNotificationStatuses");
    return storedStatuses ? JSON.parse(storedStatuses) : {};
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Get user role safely
  const userRole = (() => {
    const userDataRaw = localStorage.getItem("userData");
    if (!userDataRaw || userDataRaw === "undefined") {
      console.warn("userData in localStorage is missing or invalid:", userDataRaw);
      return "";
    }
    try {
      const userData = JSON.parse(userDataRaw);
      return userData?.role || "";
    } catch (error) {
      console.error("Failed to parse userData from localStorage:", error);
      return "";
    }
  })();

  // Update localStorage for viewed statuses and unviewed count
  useEffect(() => {
    localStorage.setItem("viewedNotificationStatuses", JSON.stringify(viewedNotificationStatuses));
    localStorage.setItem("unviewedNotificationCount", unviewedNotificationCount.toString());
  }, [viewedNotificationStatuses, unviewedNotificationCount]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/get-record", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          sort: sortField,
        },
      });
      const formattedRows = response.data.map((row) => ({
        ...row,
        vmForwarded: row.vm_forwarded || row.vice_mayor_forwarded,
        vmReceived: row.vm_received || row.vice_mayor_received,
        cmForwarded: row.cm_forwarded || row.city_mayor_forwarded,
        cmReceived: row.cm_received || row.city_mayor_received,
        transmitted_recipients: row.transmitted_recipients || [],
        dateTransmitted: row.date_transmitted,
        status: row.completed ? "Completed" : row.status,
        status_history: row.status_history || [],
      }));
      console.log("fetchRecords - Records:", formattedRows.map(row => ({
        id: row.id,
        no: row.no,
        date_approved: row.date_approved,
        status: row.status,
        status_history: row.status_history
      })));
      setRows(formattedRows);
      setSelectedRow((prev) => (prev ? formattedRows.find((row) => row.id === prev.id) || prev : prev));
    } catch (error) {
      console.error("Error fetching records:", error.response?.data || error);
      alert("Failed to fetch records: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const notifications = response.data
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 50);
      setNotifications(notifications.slice(0, 9));
      let unviewedCount = 0;
      notifications.forEach((notif) => {
        const viewed = viewedNotificationStatuses[notif.notification_id];
        if (
          !viewed ||
          viewed.vmStatus !== notif.vm_status ||
          viewed.cmStatus !== notif.cm_status
        ) {
          unviewedCount++;
        }
      });
      setUnviewedNotificationCount(unviewedCount);
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error);
      Swal.fire("Error", "Failed to fetch notifications", "error");
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchNotifications();
  }, [sortField]);

  const handleEditClick = (index) => {
    if (loading || !paginatedRows[index]) {
      console.warn("Cannot open EditModal: Data is loading or row is invalid");
      return;
    }
    const row = paginatedRows[index];
    setSelectedRow(row);
    setIsEditModalOpen(true);
  };

  const handleViewClick = (index) => {
    const row = paginatedRows[index];
    setSelectedRow(row);
    setIsViewModalOpen(true);
  };

  const handleStatusHistoryClick = (index) => {
    const row = paginatedRows[index];
    console.log("handleStatusHistoryClick - Selected status_history:", row.status_history);
    setSelectedStatusHistory(row.status_history || []);
    setIsStatusHistoryModalOpen(true);
  };

  const handleSave = async (updatedRow) => {
    try {
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === updatedRow.id ? { ...row, ...updatedRow } : row))
      );
      console.log("Dashboard handleSave - Updated row:", {
        id: updatedRow.id,
        no: updatedRow.no,
        date_approved: updatedRow.date_approved,
        status_history: updatedRow.status_history
      });
      setSelectedRow(updatedRow);
      setIsEditModalOpen(false);
      await fetchRecords();
      await updateNotifications([updatedRow]);
      const documentType = updatedRow.document_type?.toLowerCase();
      if (["ordinance", "resolution", "motion"].includes(documentType)) {
        const formattedType = documentType.charAt(0).toUpperCase() + documentType.slice(1);
        showAlert(`${formattedType} No. ${updatedRow.no} has been updated`);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("Failed to save changes: " + (error.message || "Unknown error"));
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsNotifDropdownOpen((prev) => {
          const newState = { ...prev, main: false };
          Object.keys(newState).forEach((key) => {
            newState[key] = false;
          });
          return newState;
        });
      } else {
        if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
          setIsNotifDropdownOpen((prev) => ({
            ...prev,
            main: false,
          }));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteRow = async (index, id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this document?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#408286",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:8000/api/delete-record/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.status === 200) {
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            Swal.fire("Deleted!", "The document has been deleted.", "success");
            await fetchRecords(); // Refresh records after deletion
          }
        } catch (error) {
          console.error("Error deleting record:", error.response?.data || error);
          Swal.fire("Error", "Failed to delete record: " + (error.response?.data?.error || error.message), "error");
        }
      }
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "For Vice Mayor's Signature":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "For Mailings":
        return "bg-green-100 text-green-800 border-green-300";
      case "Delivered":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "Returned":
        return "bg-red-100 text-red-800 border-red-300";
      case "Draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const calculateTimeRemaining = (forwardedDate, receivedDate) => {
    if (!forwardedDate) return "Not Started";
    if (receivedDate && new Date(receivedDate).toString() !== "Invalid Date") return "Completed";
    const forwarded = new Date(forwardedDate);
    const now = new Date();
    const deadline = new Date(forwarded);
    deadline.setDate(forwarded.getDate() + 10);
    const diffMs = deadline - now;
    if (diffMs <= 0) {
      const overdueMs = now - deadline;
      const overdueDays = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
      return `Overdue ${overdueDays} days`;
    }
    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${daysRemaining} days remaining`;
  };

  const getBookmarkColor = (time) => {
    if (time === "Completed") return "fill-blue-600";
    if (time.includes("Overdue")) return "fill-red-600";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "fill-red-600";
    if (days >= 8) return "fill-green-600";
    if (days >= 6) return "fill-yellow-600";
    return "fill-red-600";
  };

  const getBookmarkColorName = (time) => {
    if (time === "Completed") return "blue";
    if (time.includes("Overdue")) return "red";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "red";
    if (days >= 8) return "green";
    if (days >= 6) return "yellow";
    return "red";
  };

  const shouldShowBookmark = (row) => {
    const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
    const cmTime =
      row.document_type?.toLowerCase() === "ordinance"
        ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
        : "Not Started";
    const isCompleted = vmTime === "Completed" || cmTime === "Completed";
    const isOverdue = vmTime.includes("Overdue") || cmTime.includes("Overdue");
    const isInProgress =
      (row.vmForwarded && !row.vmReceived) ||
      (row.document_type?.toLowerCase() === "ordinance" && row.cmForwarded && !row.cmReceived);
    const isNotStarted = vmTime === "Not Started" && cmTime === "Not Started";
    return (isInProgress || isOverdue || isCompleted) && !isNotStarted;
  };

  // Count records by bookmark color
  const colorCounts = rows.reduce(
    (acc, row) => {
      if (!shouldShowBookmark(row)) return acc;
      const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
      const cmTime =
        row.document_type?.toLowerCase() === "ordinance"
          ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
          : "Not Started";
      const relevantTime =
        vmTime !== "Not Started" && vmTime !== "Completed"
          ? vmTime
          : cmTime !== "Not Started" && cmTime !== "Completed"
          ? cmTime
          : vmTime === "Completed" || cmTime === "Completed"
          ? "Completed"
          : "Not Started";
      const color = getBookmarkColorName(relevantTime);
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0, blue: 0 }
  );

  const filteredRows = rows.filter((row) => {
    const rowYear = row.date_approved ? new Date(row.date_approved).getFullYear().toString() : "";
    const docNumberYear = row.no?.split("-")[1] || ""; // Extract year from document number
    let matchesYear = true;
    if (singleYear) {
      matchesYear = rowYear === singleYear || docNumberYear === singleYear;
    } else if (yearRangeStart && yearRangeEnd) {
      const startYear = parseInt(yearRangeStart);
      const endYear = parseInt(yearRangeEnd);
      const rowYearNum = parseInt(rowYear) || 0;
      const docNumberYearNum = parseInt(docNumberYear) || 0;
      matchesYear = 
        (rowYearNum >= startYear && rowYearNum <= endYear) ||
        (docNumberYearNum >= startYear && docNumberYearNum <= endYear);
    }
    const matchesStatus = !statusFilter || 
      row.status === statusFilter || 
      (row.status_history && row.status_history.some((entry) => entry.status === statusFilter));
    const matchesDocumentType = selectedType === "Document" || row.document_type === selectedType;
    const matchesSearchTerm =
      !searchTerm ||
      row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (searchTerm.match(/^\d{4}$/) && row.no?.split("-")[1]?.includes(searchTerm));
    const matchesColorFilter = !colorFilter || (() => {
      if (!shouldShowBookmark(row)) return false;
      const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
      const cmTime =
        row.document_type?.toLowerCase() === "ordinance"
          ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
          : "Not Started";
      const relevantTime =
        vmTime !== "Not Started" && vmTime !== "Completed"
          ? vmTime
          : cmTime !== "Not Started" && cmTime !== "Completed"
          ? cmTime
          : vmTime === "Completed" || cmTime === "Completed"
          ? "Completed"
          : "Not Started";
      const color = getBookmarkColorName(relevantTime);
      return color === colorFilter;
    })();
    return (
      matchesYear &&
      matchesStatus &&
      matchesDocumentType &&
      matchesSearchTerm &&
      matchesColorFilter
    );
  });

  // Sort rows based on document number
  const sortedRows = [...filteredRows].sort((a, b) => {
    const [aNumber, aYear] = a.no.split("-");
    const [bNumber, bYear] = b.no.split("-");
    const aValue = parseInt(aNumber + aYear);
    const bValue = parseInt(bNumber + bYear);
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedRows = sortedRows.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedRows.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getVisiblePages = () => {
    const halfRange = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showPrevEllipsis = visiblePages[0] > 1;
  const showNextEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  const handleAddClick = () => {
    navigate("/add-records");
  };

  const getStatusColor = (time) => {
    if (time === "Completed") return "bg-blue-600 text-blue-600";
    if (time.includes("Overdue")) return "bg-red-600 text-blue-600";
    const days = parseInt(time.split(" ")[0], 10);
    if (isNaN(days)) return "bg-red-600 text-blue-600";
    if (days >= 8) return "bg-green-600 text-blue-600";
    if (days >= 6) return "bg-yellow-600 text-blue-600";
    return "bg-red-600 text-blue-600";
  };

  const updateNotifications = async (data) => {
    try {
      const newNotifications = data
        .filter((row) => ["Ordinance", "Resolution", "Motion"].includes(row.document_type))
        .map((row) => {
          const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
          const cmTime =
            row.document_type.toLowerCase() === "ordinance"
              ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
              : "Not Started";
          const isCompleted = row.status === "Completed";
          const isOverdue = vmTime.includes("Overdue") || cmTime.includes("Overdue");
          const isNotStarted = vmTime === "Not Started" && cmTime === "Not Started";
          if (isNotStarted) return null;
          let relevantTime, statusColor, notificationStatus;
          if (isCompleted || (vmTime === "Completed" && cmTime === "Completed")) {
            relevantTime = "Completed";
            statusColor = "bg-blue-600 text-blue-600";
            notificationStatus = "Completed";
          } else if (isOverdue) {
            relevantTime = vmTime.includes("Overdue") ? vmTime : cmTime;
            statusColor = "bg-red-600 text-red-600";
            notificationStatus = "Overdue";
          } else {
            relevantTime = vmTime !== "Not Started" ? vmTime : cmTime;
            const days = parseInt(relevantTime.split(" ")[0], 10);
            notificationStatus = "In Progress";
            if (days >= 8) {
              statusColor = "bg-green-600 text-green-600";
            } else if (days >= 6) {
              statusColor = "bg-yellow-600 text-yellow-600";
            } else {
              statusColor = "bg-red-600 text-red-600";
            }
          }
          return {
            record_id: row.id,
            notification_id: `${row.id}-${new Date().toISOString()}`,
            document_no: row.no,
            document_type: row.document_type,
            vm_status: vmTime,
            cm_status: row.document_type.toLowerCase() === "ordinance" ? cmTime : null,
            status: notificationStatus,
            status_color: statusColor,
            updated_at: row.updatedAt || new Date().toISOString(),
          };
        })
        .filter((notif) => notif !== null);
      for (const notif of newNotifications) {
        await axios.post(
          "http://localhost:8000/api/notifications",
          notif,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      await fetchNotifications();
      if (newNotifications.length > 0) {
        bellControls.start({
          rotate: [0, 15, -15, 15, -15, 0],
          transition: { duration: 0.6, repeat: 1 },
        });
      }
    } catch (error) {
      console.error("Error updating notifications:", error.response?.data || error);
      Swal.fire("Error", "Failed to create notifications", "error");
    }
  };

  const handleNotificationOpen = () => {
    setIsOpen(true);
    setUnviewedNotificationCount(0);
    const newStatuses = { ...viewedNotificationStatuses };
    notifications.forEach((notif) => {
      newStatuses[notif.notification_id] = { vmStatus: notif.vm_status, cmStatus: notif.cm_status };
    });
    setViewedNotificationStatuses(newStatuses);
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`http://localhost:8000/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId));
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error.response?.data || error);
      Swal.fire("Error", "Failed to delete notification", "error");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete("http://localhost:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications([]);
      setUnviewedNotificationCount(0);
      setViewedNotificationStatuses({});
      localStorage.setItem("viewedNotificationStatuses", JSON.stringify({}));
      localStorage.setItem("unviewedNotificationCount", "0");
    } catch (error) {
      console.error("Error clearing notifications:", error.response?.data || error);
      Swal.fire("Error", "Failed to clear notifications", "error");
    }
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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrintClick = (index) => {
    const row = paginatedRows[index];
    const transmittalData = getTransmittalData(row);
    setPreviewData(transmittalData);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewData(null);
  };

  // Handle color filter click
  const handleColorFilterClick = (color) => {
    setColorFilter((prev) => (prev === color ? "" : color));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle sort order change
  const handleSortOrderChange = (e) => {
    const newOrder = e.target.value;
    setSortOrder(newOrder);
    setSortField(`no-${newOrder}`);
    setCurrentPage(1); // Reset to first page when sort order changes
  };

  // Clear single year when range is selected
  const handleYearRangeChange = () => {
    setSingleYear("");
    setCurrentPage(1);
  };

  // Clear range when single year is selected
  const handleSingleYearChange = () => {
    setYearRangeStart("");
    setYearRangeEnd("");
    setCurrentPage(1);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-4">
        {alert.show && (
          <div className="absolute top-4 right-4 bg-[#408286] text-white px-4 py-3 rounded shadow-lg flex items-center w-80 z-50">
            <svg
              className="mr-2 w-8 h-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
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

        <div className="font-poppins font-bold uppercase px-4 mb-5 text-[#494444] text-[35px] flex justify-between">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-bold uppercase text-[#494444] text-[35px]">Dashboard</h1>
          </div>
          <motion.div
            ref={notificationRef}
            className="bg-[#408286] text-white px-4 py-2 rounded-full flex shadow-md cursor-pointer"
            animate={bellControls}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNotificationOpen}
          >
            <div className="relative flex items-center">
              <img
                src="src/assets/Images/notif.png"
                alt="notification"
                className="w-5 h-5 self-center invert shadow-lg"
              />
              {unviewedNotificationCount > 0 && (
                <span className="absolute -top-0 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unviewedNotificationCount > 100 ? "99+" : unviewedNotificationCount}
                </span>
              )}
            </div>
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-8 top-16 mt-2 w-96 bg-white text-gray-800 shadow-xl rounded-lg z-50 max-h-[800px] overflow-y-auto border border-gray-200"
                ref={notificationRef}
              >
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
                    <p className="text-sm text-gray-500">{notifications.length} updates</p>
                  </div>
                  <div className="relative z-20 notification-menu" ref={notifDropdownRef}>
                    <button
                      onClick={() => setIsNotifDropdownOpen((prev) => ({ ...prev, main: !prev.main }))}
                      className="text-gray-600 hover:text-gray-900 focus:outline-none flex items-start hover:bg-gray-200 p-2 rounded-[100%]"
                    >
                      <img
                        src="src/assets/Images/menu.png"
                        alt="Options"
                        className="w-5 h-5"
                      />
                    </button>
                    {isNotifDropdownOpen.main && (
                      <div className="absolute right-0 mt-2 w-[250px] p-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 notification-menu">
                        <button
                          onClick={clearAllNotifications}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <img
                            src="src/assets/Images/delete.png"
                            alt="Delete"
                            className="w-4 h-4"
                          />
                          Clear All Notifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notif) => {
                      const statusColor = notif.status_color;
                      const uniqueKey = notif.notification_id;
                      const isThisDropdownOpen = isNotifDropdownOpen[uniqueKey] || false;
                      return (
                        <div
                          key={uniqueKey}
                          className="p-4 hover:bg-gray-50 transition-colors duration-150 group relative"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${statusColor.split(" ")[0]}`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notif.document_type} No. {notif.document_no}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Vice Mayor: <span className="font-medium">{notif.vm_status}</span>
                              </p>
                              {notif.document_type.toLowerCase() === "ordinance" && (
                                <p className="text-xs text-gray-600 mt-1">
                                  City Mayor: <span className="font-medium">{notif.cm_status}</span>
                                </p>
                              )}
                              <p className={`text-xs mt-1 ${statusColor.split(" ")[1]}`}>
                                Status: {notif.status}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{formatTimestamp(notif.updated_at)}</p>
                            </div>
                            <div
                              className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity notification-menu z-40 ${
                                isThisDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <div className="relative">
                                <button
                                  onClick={() => setIsNotifDropdownOpen((prev) => ({
                                    ...prev,
                                    [uniqueKey]: !prev[uniqueKey],
                                  }))}
                                  className="text-gray-600 hover:text-gray-900 focus:outline-none flex items-center hover:bg-gray-200 p-2 rounded-[100%]"
                                >
                                  <img
                                    src="src/assets/Images/menu.png"
                                    alt="Options"
                                    className="w-5 h-5"
                                  />
                                </button>
                                {isThisDropdownOpen && (
                                  <div className="absolute right-0 mt-2 w-[250px] p-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 notification-menu">
                                    <button
                                      onClick={() => {
                                        deleteNotification(notif.notification_id);
                                        setIsNotifDropdownOpen((prev) => ({
                                          ...prev,
                                          [uniqueKey]: false,
                                        }));
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <img
                                        src="src/assets/Images/delete.png"
                                        alt="Delete"
                                        className="w-4 h-4"
                                      />
                                      Delete this notification
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">No notification history</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 flex justify-between items-center">
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] pr-10"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="Document">Document</option>
                <option value="Ordinance">Ordinance</option>
                <option value="Resolution">Resolution</option>
                <option value="Motion">Motion</option>
              </select>
              <img
                src="src/assets/Images/down2.png"
                alt="Dropdown Icon"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
              >
                <option value="">Status</option>
                <option value="For Vice Mayor's Signature">For Vice Mayor's Signature</option>
                <option value="For Mailings">For Mailings</option>
                <option value="For Mayor's & Admin Signature">For Mayor's & Admin Signature</option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
                <option value="Completed">Completed</option>
              </select>
              <img
                src="src/assets/Images/down2.png"
                alt="Dropdown Icon"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="cursor-pointer inline-flex justify-center w-full appearance-none rounded-md border border-gray-300 shadow-sm px-4 py-2 pr-10 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
              >
                <option value="asc">Sort Ascending</option>
                <option value="desc">Sort Descending</option>
              </select>
              <img
                src="src/assets/Images/down2.png"
                alt="Dropdown Icon"
                className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              />
            </div>

            <div className="flex space-x-2 items-center">
              <input
                type="number"
                placeholder="Single Year"
                value={singleYear}
                onChange={(e) => {
                  setSingleYear(e.target.value);
                  handleSingleYearChange();
                }}
                className="border cursor-pointer border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] rounded-md w-32"
                min="1900"
                max="9999"
              />
              <input
                type="number"
                placeholder="From Year"
                value={yearRangeStart}
                onChange={(e) => {
                  setYearRangeStart(e.target.value);
                  handleYearRangeChange();
                }}
                className="border cursor-pointer border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] rounded-md w-28"
                min="1900"
                max="9999"
              />
              <span className="text-gray-700">-</span>
              <input
                type="number"
                placeholder="To Year"
                value={yearRangeEnd}
                onChange={(e) => {
                  setYearRangeEnd(e.target.value);
                  handleYearRangeChange();
                }}
                className="border cursor-pointer border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD] rounded-md w-28"
                min="1900"
                max="9999"
              />
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-[300px] font-poppins pl-10 pr-10 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#5FA8AD]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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

        <div className="flex-grow px-4 py-2">
          <div className="bg-white w-full border rounded-md shadow-lg p-4 min-h-[100px] flex flex-col">
            <div className="flex justify-between items-center mb-2 ">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleColorFilterClick("green")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 ${
                    colorFilter === "green" ? "ring-2 ring-green-600" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-green-600 shadow-lg"></div>
                  <span className="text-sm font-poppins text-gray-700">{colorCounts.green}</span>
                </button>
                <button
                  onClick={() => handleColorFilterClick("yellow")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 ${
                    colorFilter === "yellow" ? "ring-2 ring-yellow-600" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-yellow-600 shadow-lg"></div>
                  <span className="text-sm font-poppins text-gray-700">{colorCounts.yellow}</span>
                </button>
                <button
                  onClick={() => handleColorFilterClick("red")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 ${
                    colorFilter === "red" ? "ring-2 ring-red-600" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-red-600 shadow-lg"></div>
                  <span className="text-sm font-poppins text-gray-700">{colorCounts.red}</span>
                </button>
                <button
                  onClick={() => handleColorFilterClick("blue")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 ${
                    colorFilter === "blue" ? "ring-2 ring-blue-600" : ""
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-blue-600 shadow-lg"></div>
                  <span className="text-sm font-poppins text-gray-700">{colorCounts.blue}</span>
                </button>
              </div>
              <button
                onClick={handleAddClick}
                className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-2 shadow-md rounded-[100%] flex items-center gap-1"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col flex-grow">
              <div
                  className="relative w-full border rounded-lg shadow-lg overflow-hidden flex-grow"
                >
                  <div
                    className="overflow-auto"
                    style={{
                      minHeight: paginatedRows.length > 0 ? "300px" : "auto",
                      maxHeight: "650px",
                      position: "relative",
                    }}
                  >
                    <table className="w-full border-collapse table-fixed">
                      <thead className="bg-[#408286] text-white sticky top-0 z-10">
                        <tr className="text-left text-[14px]">
                          {selectedType === "Document" && (
                            <th className="border border-gray-300 px-4 py-4 w-[9%]">Document</th>
                          )}
                          <th className="border border-gray-300 px-4 py-4 w-[9%]">
                            {selectedType === "Document"
                              ? "No."
                              : selectedType === "Ordinance"
                              ? "Ordinance No."
                              : selectedType === "Motion"
                              ? "Motion No."
                              : "Resolution No."}
                          </th>
                          <th className="border border-gray-300 px-4 py-4 text-center w-[40%]">Title</th>
                          <th
                            className="border border-gray-300 px-4 py-4 cursor-pointer w-[12%]"
                            onClick={() => setSortField(sortField === "status_history" ? "" : "status_history")}
                          >
                            Status {sortField === "status_history" ? "↑" : "↓"}
                          </th>
                          <th className="border border-gray-300 px-4 py-4 w-[9%]">Remarks</th>
                          <th className="border border-gray-300 px-4 py-4 text-center w-[30%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td
                              colSpan={selectedType === "Document" ? 6 : 5}
                              className="text-center py-6"
                            >
                              <div className="flex justify-center items-center">
                                <div className="w-7 h-7 border-4 border-[#408286] border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {!loading && paginatedRows.length > 0 ? (
                          paginatedRows.map((row, index) => {
                            const vmTime = calculateTimeRemaining(row.vmForwarded, row.vmReceived);
                            const cmTime =
                              row.document_type?.toLowerCase() === "ordinance"
                                ? calculateTimeRemaining(row.cmForwarded, row.cmReceived)
                                : "Not Started";
                            const relevantTime =
                              vmTime !== "Not Started" && vmTime !== "Completed"
                                ? vmTime
                                : cmTime !== "Not Started" && cmTime !== "Completed"
                                ? cmTime
                                : vmTime === "Completed" || cmTime === "Completed"
                                ? "Completed"
                                : "Not Started";
                            const bookmarkColor = getBookmarkColor(relevantTime);
                            const showBookmark = shouldShowBookmark(row);

                            return (
                              <tr
                                key={row.id}
                                className="border border-gray-300 hover:bg-gray-100 text-[14px]"
                              >
                                {selectedType === "Document" && (
                                  <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700 relative">
                                    {showBookmark && (
                                      <motion.div
                                        className="absolute left-0 top-0 flex items-center cursor-pointer"
                                        initial={{ x: -125 }}
                                        whileHover={{ x: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                      >
                                        <div className="bg-white to-gray-100 border border-gray-300 rounded-lg p-2 text-sm font-semibold font-poppins text-gray-500 w-[120px] text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                          {relevantTime.toUpperCase()}
                                        </div>
                                        <svg
                                          className={`w-6 h-12 ${bookmarkColor} transform rotate-[-90deg] cursor-pointer`}
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 48"
                                          fill="currentColor"
                                        >
                                          <path d="M2 2H22V42L17 36L12 30L2 42V2Z" />
                                        </svg>
                                      </motion.div>
                                    )}
                                    <HighlightText text={row.document_type} searchTerm={searchTerm} />
                                  </td>
                                )}
                                <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700 relative">
                                  {selectedType !== "Document" && showBookmark && (
                                    <motion.div
                                      className="absolute left-0 top-0 flex items-center cursor-pointer"
                                      initial={{ x: -125 }}
                                      whileHover={{ x: 0 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                      <div className="bg-white to-gray-100 border border-gray-300 rounded-lg p-2 text-sm font-semibold font-poppins text-gray-500 w-[120px] text-center shadow-sm hover:shadow-md transition-shadow duration-200">
                                        {relevantTime.toUpperCase()}
                                      </div>
                                      <svg
                                        className={`w-6 h-12 ${bookmarkColor} transform rotate-[-90deg] cursor-pointer`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 48"
                                        fill="currentColor"
                                      >
                                        <path d="M2 2H22V42L17 36L12 30L2 42V2Z" />
                                      </svg>
                                    </motion.div>
                                  )}
                                  <HighlightText text={row.no} searchTerm={searchTerm} />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700 text-justify">
                                  <HighlightText text={row.title} searchTerm={searchTerm} />
                                </td>
                                <td className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700">
                                  {row.status_history && row.status_history.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      {row.status_history.slice(0).map((entry, idx) => (
                                        <span
                                          key={idx}
                                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(entry.status)}`}
                                        >
                                          {entry.status}
                                        </span>
                                      ))}
                                      {row.status_history.length > 0 && (
                                        <button
                                          onClick={() => {
                                            console.log("Show More clicked - status_history:", row.status_history);
                                            handleStatusHistoryClick(index);
                                          }}
                                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium underline text-gray-600 hover:text-[#5FA8AD]"
                                        >
                                          Show More
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(row.status || "None")}`}
                                    >
                                      {row.status || "None"}
                                    </span>
                                  )}
                                </td>
                                <td
                                  className="border border-gray-300 px-4 py-2 font-poppins text-sm text-gray-700 break-words w-[9%]"
                                >
                                  {row.remarks || "None"}
                                </td>
                                <td
                                  className={
                                    userRole === "user"
                                      ? "px-2 py-2 min-w-[200px] border font-poppins text-sm text-gray-700"
                                      : "px-2 py-2 min-w-[200px] border font-poppins text-sm text-gray-700"
                                  }
                                >
                                  <div
                                    className={
                                      userRole === "user"
                                        ? "flex justify-center gap-2"
                                        : "md:flex md:flex-wrap md:justify-start gap-2"
                                    }
                                  >
                                    <button
                                      onClick={() => handleViewClick(index)}
                                      className="bg-[#37ad6c] hover:bg-[#2d8f59] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
                                    >
                                      <img
                                        src="src/assets/Images/view.png"
                                        alt="View"
                                        className="w-5 h-5 invert self-center"
                                      />
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleEditClick(index)}
                                      className="bg-[#f5bd64] hover:bg-[#e9b158] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
                                    >
                                      <img
                                        src="src/assets/Images/edit.png"
                                        alt="Edit"
                                        className="w-5 h-5 invert self-center"
                                      />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handlePrintClick(index)}
                                      className="bg-[#3b7bcf] hover:bg-[#3166ac] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
                                    >
                                      <img
                                        src="src/assets/Images/print.png"
                                        alt="Print"
                                        className="w-5 h-5 invert self-center"
                                      />
                                      Print
                                    </button>
                                    {userRole !== "user" && (
                                      <button
                                        onClick={() => deleteRow(index, row.id)}
                                        className="bg-[#FF6767] hover:bg-[#f35656] px-4 py-2 rounded-md text-white font-medium flex items-center gap-1 font-poppins text-sm shadow-md"
                                      >
                                        <img
                                          src="src/assets/Images/delete.png"
                                          alt="Delete"
                                          className="w-5 h-5 invert self-center"
                                        />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          !loading && (
                            <tr>
                              <td
                                colSpan={selectedType === "Document" ? 6 : 5}
                                className="text-center text-gray-500 py-6 text-md font-poppins"
                              >
                                No data yet
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-center mt-4 items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-l-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>
                  {showPrevEllipsis && (
                    <span className="mx-1 py-2 px-4 text-gray-700">...</span>
                  )}
                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`mx-[2px] py-2 px-4 rounded-md ${
                        currentPage === page
                          ? "bg-[#5FA8AD] text-white"
                          : "bg-[#408286] text-white hover:bg-[#5FA8AD]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {showNextEllipsis && (
                    <span className="mx-1 py-2 px-4 text-gray-700">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-[#408286] hover:bg-[#5FA8AD] text-white font-bold py-2 px-4 rounded-r-md shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

            <EditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              rowData={selectedRow}
              onSave={handleSave}
              setRowData={setSelectedRow}
            />
            <ViewModal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              rowData={selectedRow}
            />
            <StatusHistoryModal
              isOpen={isStatusHistoryModalOpen}
              onClose={() => setIsStatusHistoryModalOpen(false)}
              statusHistory={selectedStatusHistory}
            />
            <div>
              {isPreviewOpen && previewData && (
                <TransmittalSheet
                  documentData={previewData}
                  onPrint={() => console.log("Printing...")}
                  onClose={handleClosePreview}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    export default Dashboard;