import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppContext } from "../../../contexts/AppContext"; // ✅ make sure this points to your AppProvider

// ============= TYPES =============
interface EventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  project?: string;
  color?: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  timeEntries: { [key: string]: string };
}
export interface Role {
  id: number;
  name: string;
  is_enabled: boolean;
  created_at: string;

}
// ============= REPORT ENTRY TYPE =============
interface ReportEntry {
  id: string;
  project_name: string;
  user_name: string;
  date: string;
  worked_hours: number;
}

// ============= PAGINATION HOOK =============
interface UsePaginationProps {
  totalItems: number;
  pageSize: number;
  initialPage?: number;
}

const usePagination = ({ totalItems, pageSize, initialPage = 1 }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);
  
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  
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

// ============= REPORTS COMPONENT =============
const Reports: React.FC = () => {
  const { projects, events } = useAppContext();
  
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [userFilter, setUserFilter] = useState("All Users");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = 10;

  // ============= CONVERT PROJECTS & EVENTS TO REPORT ENTRIES =============
  const reportData = useMemo(() => {
    const entries: ReportEntry[] = [];
    let entryId = 1;

    projects.forEach((project) => {
      Object.entries(project.timeEntries).forEach(([dateKey, timeString]) => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const totalHours = hours + minutes / 60 + seconds / 3600;

        const relatedEvents = events.filter((event) => {
          const eventDate = event.start.toISOString().split("T")[0];
          return event.project === project.name && eventDate === dateKey;
        });

        const userName =
          relatedEvents.length > 0 ? relatedEvents[0].title || "Unknown User" : "System Entry";

        entries.push({
          id: `${entryId++}`,
          project_name: project.name,
          user_name: userName,
          date: dateKey,
          worked_hours: parseFloat(totalHours.toFixed(2)),
        });
      });
    });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [projects, events]);

  // ============= FORMAT DATE =============
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============= FILTER DATA =============
  const filteredData = useMemo(() => {
    return reportData.filter((entry) => {
      const matchesProject = projectFilter === "All Projects" || entry.project_name === projectFilter;
      const matchesUser = userFilter === "All Users" || entry.user_name === userFilter;

      let matchesDateRange = true;
      if (startDate && endDate) {
        const entryDate = new Date(entry.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDateRange = entryDate >= start && entryDate <= end;
      }

      const matchesSearch =
        searchQuery === "" ||
        entry.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.date.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesProject && matchesUser && matchesDateRange && matchesSearch;
    });
  }, [reportData, projectFilter, userFilter, startDate, endDate, searchQuery]);

  // ============= TOTAL HOURS =============
  const totalHours = useMemo(
    () => filteredData.reduce((sum, entry) => sum + entry.worked_hours, 0).toFixed(2),
    [filteredData]
  );

  // ============= PAGINATION =============
  const { currentPage, totalPages, nextPage, prevPage, goToPage, hasNextPage, hasPrevPage } =
    usePagination({ totalItems: filteredData.length, pageSize });

  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // ============= RESET FILTERS =============
  const handleReset = () => {
    setProjectFilter("All Projects");
    setUserFilter("All Users");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  // ✅ UPDATED FILTER OPTIONS
  const projectOptions = useMemo(() => {
    const projectNames = projects.map((p) => p.name);
    return ["All Projects", ...projectNames];
  }, [projects]);

  const userOptions = useMemo(() => {
    return ["All Users", "John Doe", "Jane Smith", "Siva Sivanesh"];
  }, []);

  // ============= EXPORT REPORT =============
  const handleExport = () => {
    const headers = ["Project", "User", "Date", "Worked Hours"];
    const rows = filteredData.map((entry) => [
      entry.project_name,
      entry.user_name,
      formatDate(entry.date),
      `${entry.worked_hours.toFixed(2)}h`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
            <button
              onClick={handleExport}
              className="px-6 py-2.5 bg-cyan-400 text-white rounded font-medium hover:bg-cyan-500 transition-colors"
            >
              EXPORT REPORT
            </button>
          </div>

          {/* Filters */}
          <div className="px-6 py-5 border-b bg-gray-50 flex-shrink-0">
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Project</label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                >
                  {projectOptions.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">User</label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
                >
                  {userOptions.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by project, user, or date..."
                  className="w-full px-4 py-2.5 pl-10 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 border border-gray-300 rounded hover:bg-gray-50 font-medium text-gray-700 text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table Info */}
          <div className="px-6 py-4 flex items-center justify-between bg-white border-b flex-shrink-0">
            <span className="text-sm text-gray-600">Showing {filteredData.length} entries</span>
            <span className="text-sm font-semibold text-gray-900">Total Hours: {totalHours}h</span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Worked Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageData.length > 0 ? (
                  currentPageData.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.project_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.user_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(entry.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.worked_hours.toFixed(2)}h</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      No timesheet entries found. Start tracking time in the calendar to see reports here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t bg-white flex-shrink-0">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={`p-2 rounded border transition-colors ${
                    hasPrevPage
                      ? "border-gray-300 hover:bg-gray-50 text-gray-700"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          currentPage === pageNum
                            ? "bg-cyan-400 text-white"
                            : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={`p-2 rounded border transition-colors ${
                    hasNextPage
                      ? "border-gray-300 hover:bg-gray-50 text-gray-700"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
