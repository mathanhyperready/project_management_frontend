// import React, { useState } from "react";
// import { ChevronLeft, ChevronRight, Plus, Copy, Save, X, List } from "lucide-react";

// interface TimeEntry {
//   [key: string]: string; // date as key, time as value (HH:MM:SS)
// }

// interface Project {
//   id: number;
//   name: string;
//   color: string;
//   timeEntries: TimeEntry;
// }

// const Timesheet: React.FC = () => {
//   // Get current week dates
//   const getWeekDates = (startDate: Date) => {
//     const dates = [];
//     const start = new Date(startDate);
    
//     // Find Monday of the week
//     const day = start.getDay();
//     const diff = start.getDate() - day + (day === 0 ? -6 : 1);
//     start.setDate(diff);
    
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(start);
//       date.setDate(start.getDate() + i);
//       dates.push(date);
//     }
//     return dates;
//   };

//   const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
//   const [projects, setProjects] = useState<Project[]>([
//     {
//       id: 1,
//       name: "DEMO",
//       color: "#ef4444",
//       timeEntries: { "2025-10-15": "02:45:25" },
//     },
//     {
//       id: 2,
//       name: "TEST",
//       color: "#22c55e",
//       timeEntries: {},
//     },
//   ]);

//   const weekDates = getWeekDates(currentWeekStart);
//   const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

//   // Navigate week
//   const goToPreviousWeek = () => {
//     const newDate = new Date(currentWeekStart);
//     newDate.setDate(newDate.getDate() - 7);
//     setCurrentWeekStart(newDate);
//   };

//   const goToNextWeek = () => {
//     const newDate = new Date(currentWeekStart);
//     newDate.setDate(newDate.getDate() + 7);
//     setCurrentWeekStart(newDate);
//   };

//   const goToCurrentWeek = () => {
//     setCurrentWeekStart(new Date());
//   };

//   // Format date as YYYY-MM-DD
//   const formatDate = (date: Date) => {
//     return date.toISOString().split("T")[0];
//   };

//   // Format date for display
//   const formatDisplayDate = (date: Date, index: number) => {
//     const month = date.toLocaleDateString("en-US", { month: "short" });
//     const day = date.getDate();
//     return `${dayNames[index]}, ${month} ${day}`;
//   };

//   // Parse time string to seconds
//   const parseTime = (timeStr: string): number => {
//     if (!timeStr) return 0;
//     const parts = timeStr.split(":");
//     return (
//       parseInt(parts[0] || "0") * 3600 +
//       parseInt(parts[1] || "0") * 60 +
//       parseInt(parts[2] || "0")
//     );
//   };

//   // Format seconds to HH:MM:SS
//   const formatTime = (seconds: number): string => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
//   };

//   // Calculate row total
//   const getRowTotal = (project: Project): string => {
//     let total = 0;
//     Object.values(project.timeEntries).forEach((time) => {
//       total += parseTime(time);
//     });
//     return formatTime(total);
//   };

//   // Calculate column total
//   const getColumnTotal = (date: Date): string => {
//     let total = 0;
//     const dateKey = formatDate(date);
//     projects.forEach((project) => {
//       if (project.timeEntries[dateKey]) {
//         total += parseTime(project.timeEntries[dateKey]);
//       }
//     });
//     return formatTime(total);
//   };

//   // Calculate grand total
//   const getGrandTotal = (): string => {
//     let total = 0;
//     projects.forEach((project) => {
//       Object.values(project.timeEntries).forEach((time) => {
//         total += parseTime(time);
//       });
//     });
//     return formatTime(total);
//   };

//   // Handle time entry change
//   const handleTimeChange = (projectId: number, date: Date, value: string) => {
//     setProjects((prev) =>
//       prev.map((project) => {
//         if (project.id === projectId) {
//           const dateKey = formatDate(date);
//           return {
//             ...project,
//             timeEntries: {
//               ...project.timeEntries,
//               [dateKey]: value,
//             },
//           };
//         }
//         return project;
//       })
//     );
//   };

//   // Add new project row
//   const addNewRow = () => {
//     const newProject: Project = {
//       id: Date.now(),
//       name: `Project ${projects.length + 1}`,
//       color: "#3b82f6",
//       timeEntries: {},
//     };
//     setProjects([...projects, newProject]);
//   };

//   // Delete project
//   const deleteProject = (id: number) => {
//     setProjects(projects.filter((p) => p.id !== id));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-sm">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <h1 className="text-2xl font-semibold text-gray-800">Timesheet</h1>
          
//           <div className="flex items-center gap-3">
//             <button className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50">
//               Teammates
//             </button>
//             <button className="p-2 text-gray-600 border rounded hover:bg-gray-50">
//               <List size={20} />
//             </button>
//             <button
//               onClick={goToCurrentWeek}
//               className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
//             >
//               This week
//             </button>
//             <button
//               onClick={goToPreviousWeek}
//               className="p-2 text-gray-600 border rounded hover:bg-gray-50"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={goToNextWeek}
//               className="p-2 text-gray-600 border rounded hover:bg-gray-50"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Timesheet Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 w-48">
//                   Projects
//                 </th>
//                 {weekDates.map((date, index) => (
//                   <th
//                     key={index}
//                     className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-32"
//                   >
//                     {formatDisplayDate(date, index)}
//                   </th>
//                 ))}
//                 <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-32">
//                   Total
//                 </th>
//                 <th className="w-12"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {projects.map((project) => (
//                 <tr key={project.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-2 h-2 rounded-full"
//                         style={{ backgroundColor: project.color }}
//                       ></div>
//                       <span className="text-sm font-medium text-gray-900">
//                         {project.name}
//                       </span>
//                     </div>
//                   </td>
//                   {weekDates.map((date, index) => {
//                     const dateKey = formatDate(date);
//                     const value = project.timeEntries[dateKey] || "";
//                     return (
//                       <td key={index} className="px-4 py-4">
//                         <input
//                           type="text"
//                           value={value}
//                           onChange={(e) =>
//                             handleTimeChange(project.id, date, e.target.value)
//                           }
//                           placeholder="00:00:00"
//                           className="w-full px-3 py-2 text-sm text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                       </td>
//                     );
//                   })}
//                   <td className="px-4 py-4 text-center text-sm font-medium text-gray-900">
//                     {getRowTotal(project)}
//                   </td>
//                   <td className="px-4 py-4">
//                     <button
//                       onClick={() => deleteProject(project.id)}
//                       className="text-gray-400 hover:text-red-600"
//                     >
//                       <X size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {/* Select Project Row */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-6 py-4">
//                   <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
//                     <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
//                       <Plus size={12} />
//                     </div>
//                     Select Project
//                   </button>
//                 </td>
//                 {weekDates.map((_, index) => (
//                   <td key={index} className="px-4 py-4">
//                     <input
//                       type="text"
//                       disabled
//                       className="w-full px-3 py-2 text-sm text-center border rounded bg-gray-50"
//                     />
//                   </td>
//                 ))}
//                 <td className="px-4 py-4 text-center text-sm font-medium text-gray-400">
//                   00:00:00
//                 </td>
//                 <td className="px-4 py-4">
//                   <X size={18} className="text-gray-300" />
//                 </td>
//               </tr>

//               {/* Total Row */}
//               <tr className="bg-gray-50 font-medium">
//                 <td className="px-6 py-4 text-sm text-gray-600">Total:</td>
//                 {weekDates.map((date, index) => (
//                   <td
//                     key={index}
//                     className="px-4 py-4 text-center text-sm text-gray-900"
//                   >
//                     {getColumnTotal(date)}
//                   </td>
//                 ))}
//                 <td className="px-4 py-4 text-center text-sm text-gray-900">
//                   {getGrandTotal()}
//                 </td>
//                 <td></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center gap-3 p-6 border-t">
//           <button
//             onClick={addNewRow}
//             className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-50"
//           >
//             <Plus size={16} />
//             Add new row
//           </button>
//           <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-50">
//             <Copy size={16} />
//             Copy last week
//           </button>
//           <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-50">
//             <Save size={16} />
//             Save as template
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Timesheet;

// src/components/Timesheet/Timesheet.tsx

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