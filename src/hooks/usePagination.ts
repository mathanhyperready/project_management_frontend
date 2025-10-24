import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Pagination Hook
interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  initialPage?: number;
}

const usePagination = ({ totalItems, pageSize, initialPage = 1 }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);
  
  const nextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };
  
  const prevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };
  
  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };
  
  return {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Sample Data
interface ReportEntry {
  id: number;
  project: string;
  user: string;
  date: string;
  workedHours: string;
}

const sampleData: ReportEntry[] = [
  { id: 1, project: "DEMO", user: "John Doe", date: "Oct 20, 2025", workedHours: "3.50h" },
  { id: 2, project: "TEST", user: "Jane Smith", date: "Oct 20, 2025", workedHours: "5.00h" },
  { id: 3, project: "DEMO", user: "John Doe", date: "Oct 21, 2025", workedHours: "4.25h" },
  { id: 4, project: "TEST", user: "Jane Smith", date: "Oct 21, 2025", workedHours: "6.50h" },
  { id: 5, project: "DEMO", user: "Bob Johnson", date: "Oct 22, 2025", workedHours: "2.75h" },
  { id: 6, project: "TEST", user: "John Doe", date: "Oct 22, 2025", workedHours: "8.00h" },
  { id: 7, project: "DEMO", user: "Jane Smith", date: "Oct 23, 2025", workedHours: "7.00h" },
  { id: 8, project: "DEMO", user: "John Doe", date: "Oct 20, 2025", workedHours: "3.50h" },
  { id: 9, project: "TEST", user: "Bob Johnson", date: "Oct 21, 2025", workedHours: "5.25h" },
  { id: 10, project: "DEMO", user: "Jane Smith", date: "Oct 22, 2025", workedHours: "4.00h" },
  { id: 11, project: "TEST", user: "John Doe", date: "Oct 23, 2025", workedHours: "6.75h" },
  { id: 12, project: "DEMO", user: "Bob Johnson", date: "Oct 24, 2025", workedHours: "3.25h" },
  { id: 13, project: "TEST", user: "Jane Smith", date: "Oct 24, 2025", workedHours: "7.50h" },
  { id: 14, project: "DEMO", user: "John Doe", date: "Oct 25, 2025", workedHours: "4.75h" },
];

const Reports: React.FC = () => {
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [userFilter, setUserFilter] = useState("All Users");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = 10;

  // Filter data
  const filteredData = useMemo(() => {
    return sampleData.filter((entry) => {
      const matchesProject = projectFilter === "All Projects" || entry.project === projectFilter;
      const matchesUser = userFilter === "All Users" || entry.user === userFilter;
      const matchesSearch = searchQuery === "" || 
        entry.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.date.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesProject && matchesUser && matchesSearch;
    });
  }, [projectFilter, userFilter, searchQuery]);

  // Calculate total hours
  const totalHours = useMemo(() => {
    return filteredData.reduce((sum, entry) => {
      return sum + parseFloat(entry.workedHours.replace("h", ""));
    }, 0).toFixed(2);
  }, [filteredData]);

  // Pagination
  const { currentPage, totalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage } = 
    usePagination({ totalItems: filteredData.length, pageSize });

  // Get current page data
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Reset filters
  const handleReset = () => {
    setProjectFilter("All Projects");
    setUserFilter("All Users");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  // Get unique projects and users
  const projects = ["All Projects", ...Array.from(new Set(sampleData.map(e => e.project)))];
  const users = ["All Users", ...Array.from(new Set(sampleData.map(e => e.user)))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button className="text-gray-500 hover:text-gray-700 text-sm">Logout</button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Reports Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
            <button className="px-6 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 font-medium">
              EXPORT REPORT
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b bg-gray-50">
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Filters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Project Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  PROJECT
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  USER
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                  {users.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  START DATE
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  END DATE
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by project, user, or date..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-700"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table Info */}
          <div className="px-6 py-4 flex items-center justify-between border-b bg-white">
            <span className="text-sm text-gray-600">
              Showing {filteredData.length} entries
            </span>
            <span className="text-sm font-semibold text-gray-900">
              Total Hours: {totalHours}h
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Worked Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.project}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.workedHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t bg-white">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={!hasPrevPage}
                className={`p-2 rounded border ${
                  hasPrevPage
                    ? "border-gray-300 hover:bg-gray-50 text-gray-700"
                    : "border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-cyan-500 text-white"
                        : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={!hasNextPage}
                className={`p-2 rounded border ${
                  hasNextPage
                    ? "border-gray-300 hover:bg-gray-50 text-gray-700"
                    : "border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;