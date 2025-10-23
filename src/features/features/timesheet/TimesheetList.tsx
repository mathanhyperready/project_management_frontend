import React, { useState,useEffect } from "react";
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



export const Timesheet: React.FC = () => {
  const { projects } = useAppContext();
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  console.log(projects,"projects");

  useEffect(() => {
    console.log('📊 Timesheet received projects:', projects);
    projects.forEach(p => {
      console.log(`Project: ${p.name}, Time entries:`, p.timeEntries);
    });
  }, [projects]);

  const weekDates = getWeekDates(currentWeekStart);

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

  // Calculate row total
  const getRowTotal = (project: Project): string => {
    let total = 0;
    Object.values(project.timeEntries).forEach((time) => {
      total += parseTime(time);
    });
    return formatTime(total);
  };

  // Calculate column total
  const getColumnTotal = (date: Date): string => {
    let total = 0;
    const dateKey = formatDate(date);
    projects.forEach((project) => {
      if (project.timeEntries[dateKey]) {
        total += parseTime(project.timeEntries[dateKey]);
      }
    });
    return formatTime(total);
  };

  // Calculate grand total
  const getGrandTotal = (): string => {
    let total = 0;
    projects.forEach((project) => {
      Object.values(project.timeEntries).forEach((time) => {
        total += parseTime(time);
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

        {/* Timesheet Table */}
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
                    const dateKey = formatDate(date);
                    const value = project.timeEntries[dateKey] || "";
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
                    {getRowTotal(project)}
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