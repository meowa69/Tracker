import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import moment from "moment-timezone";
import axios from "axios";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const History = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const datePickerRef = useRef(null);

  const categories = [
    "All",
    "Add Document",
    "Update Document",
    "Delete Document",
    "Request Delete Document",
  ];

  const perPage = 12; // Fetch 12 logs per page

  // Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle date range selection
  const handleDateSelect = (ranges) => {
    setDateRange(ranges.selection);
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDateDisplay = () => {
    if (!dateRange.startDate || !dateRange.endDate) return "Select date range";
    const start = moment(dateRange.startDate).format("YYYY-MM-DD");
    const end = moment(dateRange.endDate).format("YYYY-MM-DD");
    return `${start} to ${end}`;
  };

  // Fetch logs from backend
  const fetchLogs = useCallback(
    async (pageNumber, reset = false) => {
      setIsLoading(true);
      try {
        const params = {
          page: pageNumber,
          per_page: perPage,
          category: selectedCategory,
          search: searchQuery,
        };
        if (dateRange.startDate) {
          params.date_from = moment(dateRange.startDate).format("YYYY-MM-DD");
        }
        if (dateRange.endDate) {
          params.date_to = moment(dateRange.endDate).format("YYYY-MM-DD");
        }

        const response = await axios.get("http://localhost:8000/api/history", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params,
        });

        const newLogs = Array.isArray(response.data.data) ? response.data.data : [];
        setLogs((prevLogs) => {
          if (reset) return newLogs;
          const existingIds = new Set(prevLogs.map((log) => log.id));
          return [...prevLogs, ...newLogs.filter((log) => !existingIds.has(log.id))];
        });
        setHasMore(newLogs.length === perPage && response.data.current_page < response.data.total_pages);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch logs:", err.response ? err.response.data : err.message);
        setError("Failed to fetch logs. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, searchQuery, dateRange]
  );

  // Fetch logs when filters change or on initial load
  useEffect(() => {
    setPage(1);
    setLogs([]);
    setHasMore(true);
    fetchLogs(1, true);
  }, [selectedCategory, searchQuery, dateRange, fetchLogs]);

  // Handle Load More button click
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  // Filter logs in frontend
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logs)) return [];

    return logs.filter((log) => {
      if (selectedCategory !== "All" && log.action !== selectedCategory) return false;
      if (
        searchQuery &&
        !(
          log.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.document_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.document_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
        return false;
      const logTime = moment.tz(log.timestamp, "YYYY-MM-DD h:mm A", "Asia/Manila");
      if (dateRange.startDate && dateRange.endDate) {
        return logTime.isBetween(
          moment(dateRange.startDate),
          moment(dateRange.endDate).endOf("day"),
          undefined,
          "[]"
        );
      }
      if (dateRange.startDate) {
        return logTime.isSameOrAfter(moment(dateRange.startDate));
      }
      if (dateRange.endDate) {
        return logTime.isSameOrBefore(moment(dateRange.endDate).endOf("day"));
      }
      return true;
    });
  }, [logs, searchQuery, dateRange, selectedCategory]);

  return (
    <div className="flex font-poppins">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-y-auto p-6">
        <h1 className="font-bold uppercase text-[#494444] text-[35px] mb-6">History</h1>

        {/* Category Tabs and Filters */}
        <div className="flex flex-wrap items-center justify-between mb-4 border-b">
          <div className="flex">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-3 text-sm font-semibold ${
                  selectedCategory === category
                    ? "border-b-2 border-[#408286] text-[#408286]"
                    : "text-gray-600 hover:text-[#408286]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative" ref={datePickerRef}>
              <input
                type="text"
                value={formatDateDisplay()}
                onClick={() => setShowDatePicker(!showDatePicker)}
                readOnly
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#408286] cursor-pointer"
                placeholder="Select date range"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {showDatePicker && (
                <div className="absolute left-1/2 -translate-x-1/2 z-20 mt-2 bg-white shadow-lg rounded-md">
                  <DateRangePicker
                    ranges={[dateRange]}
                    onChange={handleDateSelect}
                    maxDate={new Date()}
                    showDateDisplay={false}
                    direction="horizontal"
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-md pl-10 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#408286]"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Logs Table */}
        <div className="bg-white p-6 shadow-lg rounded-lg overflow-x-auto">
          <div className="max-h-[650px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#408286] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Document Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Document No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  <>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.username}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.document_type}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.document_no}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.action}</td>
                        <td className="px-4 py-3 text-gray-700 text-sm">{log.timestamp}</td>
                      </tr>
                    ))}
                    {hasMore && !isLoading && (
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-center">
                          <button
                            onClick={handleLoadMore}
                            className="px-4 py-2 bg-[#408286] text-white text-sm rounded hover:bg-[#306466] w-full max-w-xs mx-auto"
                          >
                            Load More
                          </button>
                        </td>
                      </tr>
                    )}
                    {isLoading && (
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-center">
                          <div className="inline-block h-6 w-6 border-4 border-t-[#408286] border-r-transparent border-b-[#408286] border-l-transparent rounded-full animate-spin"></div>
                        </td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500 text-sm">
                      No logs match the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;