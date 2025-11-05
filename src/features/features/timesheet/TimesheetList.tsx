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
  const { projects, user } = useAppContext(); // If user doesn't exist in context, we'll handle it
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null); // Local state for user
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(8);

  const weekDates = getWeekDates(currentWeekStart);

  // Fetch current user from localStorage or API
  useEffect(() => {
    const fetchCurrentUser = () => {
      // Try to get user from localStorage (common pattern)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          console.log('User loaded from localStorage:', parsedUser);
        } catch (err) {
          console.error('Error parsing user from localStorage:', err);
        }
      } else {
        // If user is available from context, use it
        if (user) {
          setCurrentUser(user);
          console.log('User loaded from context:', user);
        } else {
          console.warn('No user found in context or localStorage');
        }
      }
    };

    fetchCurrentUser();
  }, [user]);

  // Filter entries based on user role
  const filterEntriesByRole = (entries: TimeEntry[]): TimeEntry[] => {
    if (!currentUser) {
      console.log('No current user found, returning all entries');
      return entries;
    }
    
    console.log('Filtering entries for user:', currentUser.user_name);
    
    const isAdmin = 
      currentUser.role?.name?.toLowerCase() === 'admin' || 
      currentUser.role_id === 1 || 
      currentUser.role_id === 4;
    
    console.log('Is admin?', isAdmin, 'role_id:', currentUser.role_id);
    
    if (isAdmin) {
      console.log('User is admin, showing all entries');
      return entries; // Admin sees all entries
    }
    
    // Regular users only see their own entries
    const filtered = entries.filter(entry => {
      const creatorName = entry.creator?.user_name;
      const matches = creatorName === currentUser.user_name;
      console.log(`Entry ${entry.id}: creator=${creatorName}, user=${currentUser.user_name}, matches=${matches}`);
      return matches;
    });
    
    console.log(`Filtered ${filtered.length} entries out of ${entries.length}`);
    return filtered;
  };

  // Calculate pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // Fetch time entries for all projects
  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (projects.length === 0) return;

      // Debug: Log user object
      console.log('Current user:', currentUser);
      console.log('User role_id:', currentUser?.role_id);
      console.log('User role:', currentUser?.role);
      console.log('User name:', currentUser?.user_name);

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
        
        // Filter entries based on user role
        const filteredEntries = filterEntriesByRole(allEntries);
        console.log('Total entries fetched:', allEntries.length);
        console.log('Filtered entries:', filteredEntries.length);
        console.log('Sample entry:', allEntries[0]);
        setTimeEntries(filteredEntries);
      } catch (err) {
        console.error("Error fetching time entries:", err);
        setError("Failed to load time entries");
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();
  }, [projects, currentUser]); // Use currentUser instead of user

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
          <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100% - 12rem)' }}>
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
                    <option value={8}>8</option>
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
                        <span className="w-4" />
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