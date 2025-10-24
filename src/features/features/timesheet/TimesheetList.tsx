import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { useAppContext } from "../../../contexts/AppContext";
import type { Project } from "../../../utils/types";
import {
  getWeekDates,
  formatDate,
  formatDisplayDate,
  parseTime,
  formatTime,
} from "../../../utils/timeCalculations";
import { timesheetsAPI } from "../../../api/timesheet.api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Type for API response
interface TimeEntry {
  id: number;
  description: string;
  start_date: string;
  end_date: string;
  duration: number;
  status: string;
  projectId: number;
  userId: number | null;
  created_by: number | null;
  project: any | null;
  user: any | null;
  creator: any | null;
}

export const Timesheet: React.FC = () => {
  const { projects } = useAppContext();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(8); // Changed to 8 projects per page

  const weekDates = getWeekDates(currentWeekStart);

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Fetch time entries for all projects
  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (projects.length === 0) return;

      setLoading(true);
      setError(null);
      
      try {
        const allEntries: TimeEntry[] = [];
        
        for (const project of projects) {
          try {
            const response = await timesheetsAPI.getTimesheetByProject(project.id);
            if (response && Array.isArray(response)) {
              allEntries.push(...response);
            }
          } catch (err) {
            console.error(`Error fetching entries for project ${project.id}:`, err);
          }
        }
        
        setTimeEntries(allEntries);
      } catch (err) {
        console.error("Error fetching time entries:", err);
        setError("Failed to load time entries");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();
  }, [projects]);

  // Reset to first page when projects change
  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  // Convert duration (hours) to HH:MM:SS format
  const durationToTimeString = (duration: number): string => {
    const hours = Math.floor(duration);
    const minutes = Math.floor((duration - hours) * 60);
    const seconds = Math.floor(((duration - hours) * 60 - minutes) * 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Get aggregated time entries for a project on a specific date
  const getTimeEntryForDate = (projectId: number, date: Date): string => {
    const dateKey = formatDate(date);
    
    const entriesForDate = timeEntries.filter(entry => {
      const entryDate = formatDate(new Date(entry.start_date));
      return entry.projectId === projectId && entryDate === dateKey;
    });

    const totalHours = entriesForDate.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);
    
    return totalHours > 0 ? durationToTimeString(totalHours) : "";
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(new Date());
  };

  // Calculate row total for a project
  const getRowTotal = (projectId: number): string => {
    let total = 0;
    
    weekDates.forEach(date => {
      const timeStr = getTimeEntryForDate(projectId, date);
      if (timeStr) {
        total += parseTime(timeStr);
      }
    });
    
    return formatTime(total);
  };

  // Calculate column total for a date (for current page only)
  const getColumnTotal = (date: Date): string => {
    let total = 0;
    
    currentProjects.forEach(project => {
      const timeStr = getTimeEntryForDate(project.id, date);
      if (timeStr) {
        total += parseTime(timeStr);
      }
    });
    
    return formatTime(total);
  };

  // Calculate grand total (for current page only)
  const getGrandTotal = (): string => {
    let total = 0;
    
    currentProjects.forEach(project => {
      weekDates.forEach(date => {
        const timeStr = getTimeEntryForDate(project.id, date);
        if (timeStr) {
          total += parseTime(timeStr);
        }
      });
    });
    
    return formatTime(total);
  };

  // Generate page numbers for shadcn pagination
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          items.push(i);
        }
        items.push('ellipsis');
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push('ellipsis');
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push('ellipsis');
        items.push(totalPages);
      }
    }
    
    return items;
  };

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-sm flex flex-col" style={{ height: 'calc(100vh - 3rem)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-800">Timesheet</h1>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              Teammates
            </button>
            <button className="p-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              <List size={20} />
            </button>
            <button
              onClick={goToCurrentWeek}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              This week
            </button>
            <button
              onClick={goToPreviousWeek}
              className="p-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="p-6 text-center text-gray-600">
            Loading time entries...
          </div>
        )}
        
        {error && (
          <div className="p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Timesheet Table */}
        {!loading && (
          <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100% - 12rem)' }}> {/* Adjusted maxHeight to ensure scrolling */}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-48">
                    Projects
                  </th>
                  {weekDates.map((date, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-32"
                    >
                      {formatDisplayDate(date, index)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-32">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    {weekDates.map((date, index) => {
                      const value = getTimeEntryForDate(project.id, date);
                      return (
                        <td key={index} className="px-4 py-4">
                          <input
                            type="text"
                            value={value}
                            readOnly
                            placeholder="00:00:00"
                            className="w-full px-3 py-2 text-sm text-center border border-gray-300 rounded bg-gray-50 text-gray-700"
                          />
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">
                      {getRowTotal(project.id)}
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-6 py-4 text-sm text-gray-600">Total:</td>
                  {weekDates.map((date, index) => (
                    <td
                      key={index}
                      className="px-4 py-4 text-center text-sm text-gray-900"
                    >
                      {getColumnTotal(date)}
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-sm text-gray-900">
                    {getGrandTotal()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls with shadcn - At the Bottom */}
        {!loading && projects.length > 0 && (
          <div className="p-6 border-t flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center gap-4">
                {/* Showing X to Y and Dropdown - Left Side */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, projects.length)} of {projects.length} projects</span>
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={projectsPerPage}
                    onChange={(e) => {
                      setProjectsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={8}>8</option> {/* Added 8 as an option */}
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Page Navigation (Previous, Page Numbers, Next) - Right Side */}
               <div className="flex items-center gap-2">
  <PaginationItem>
    <PaginationPrevious
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      className={`cursor-pointer rounded-md ${
        currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-100"
      }`}
    >
      <span className="text-sm">Previous</span>
    </PaginationPrevious>
  </PaginationItem>

  {getPaginationItems().map((item, index) => (
    <PaginationItem key={index}>
      {item === "ellipsis" ? (
        // Remove or replace ellipsis here
        <span className="w-4" />  // keeps spacing consistent without showing dots
      ) : (
        <PaginationLink
          onClick={() => setCurrentPage(item as number)}
          isActive={currentPage === item}
          className={`cursor-pointer rounded-md px-3 py-1 text-sm ${
            currentPage === item
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {item}
        </PaginationLink>
      )}
    </PaginationItem>
  ))}

  <PaginationItem>
    <PaginationNext
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      className={`cursor-pointer rounded-md ${
        currentPage === totalPages
          ? "pointer-events-none opacity-50"
          : "hover:bg-gray-100"
      }`}
    >
      <span className="text-sm">Next</span>
    </PaginationNext>
  </PaginationItem>
</div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timesheet;