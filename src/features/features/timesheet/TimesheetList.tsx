import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Copy, Save, List } from "lucide-react";
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

  const weekDates = getWeekDates(currentWeekStart);

  // Fetch time entries for all projects
  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (projects.length === 0) return;

      setLoading(true);
      setError(null);
      
      try {
        // Fetch time entries for all projects
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
    
    // Filter entries for this project and date
    const entriesForDate = timeEntries.filter(entry => {
      const entryDate = formatDate(new Date(entry.start_date));
      return entry.projectId === projectId && entryDate === dateKey;
    });

    // Sum up all durations for this date (duration is in hours)
    const totalHours = entriesForDate.reduce((sum, entry) => {
      // Duration is already in hours from the API
      return sum + (entry.duration || 0);
    }, 0);
    
    // Convert total hours to HH:MM:SS format
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

  // Calculate column total for a date
  const getColumnTotal = (date: Date): string => {
    let total = 0;
    
    projects.forEach(project => {
      const timeStr = getTimeEntryForDate(project.id, date);
      if (timeStr) {
        total += parseTime(timeStr);
      }
    });
    
    return formatTime(total);
  };

  // Calculate grand total
  const getGrandTotal = (): string => {
    let total = 0;
    
    projects.forEach(project => {
      weekDates.forEach(date => {
        const timeStr = getTimeEntryForDate(project.id, date);
        if (timeStr) {
          total += parseTime(timeStr);
        }
      });
    });
    
    return formatTime(total);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
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
          <div className="overflow-x-auto">
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
                {projects.map((project) => (
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

        {/* Action Buttons */}
        <div className="flex items-center gap-3 p-6 border-t">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
            <Copy size={16} />
            Copy last week
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
            <Save size={16} />
            Save as template
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timesheet;