import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { EventType, Project, AppContextType } from "../utils/types";
import { formatDate, formatTime } from "../utils/timeCalculations";
import { projectsAPI } from "../api/projects.api";
import { timesheetsAPI } from "../api/timesheet.api";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  console.log(children, "children");
  
  const [events, setEvents] = useState<EventType[]>(() => {
    const saved = localStorage.getItem('calendar_events');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    }
    return [];
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingTimesheet, setIsLoadingTimesheet] = useState(false);

  // Fetch and calculate time entries for all projects
  const fetchTimesheetData = useCallback(async (projectsList: Project[]) => {
    if (projectsList.length === 0) return;

    console.log('🔄 Fetching timesheets for all projects...');
    setIsLoadingTimesheet(true);
    
    try {
      const updatedProjects = await Promise.all(
        projectsList.map(async (project) => {
          try {
            // Fetch timesheets for this project
            const timesheets = await timesheetsAPI.getTimesheetsByProject(project.id);
            console.log(`📊 Timesheets for project "${project.name}" (ID: ${project.id}):`, timesheets);

            // Group timesheets by date and sum durations
            const timeEntries: { [key: string]: string } = {};

            if (Array.isArray(timesheets)) {
              timesheets.forEach((timesheet: any) => {
                // Format the date key
                const date = new Date(timesheet.date || timesheet.work_date || timesheet.created_at);
                const dateKey = formatDate(date);
                
                // Get duration (adjust field name based on your API response)
                const duration = timesheet.duration || timesheet.hours || 0;
                console.log(`  Date: ${dateKey}, Duration: ${duration}`);

                if (timeEntries[dateKey]) {
                  // Add to existing entry
                  const [eH, eM, eS] = timeEntries[dateKey].split(":").map(Number);
                  const existingSeconds = eH * 3600 + eM * 60 + eS;
                  const totalSeconds = existingSeconds + duration;
                  timeEntries[dateKey] = formatTime(totalSeconds);
                  console.log(`  ✅ Updated ${dateKey}: ${formatTime(totalSeconds)}`);
                } else {
                  // Create new entry
                  timeEntries[dateKey] = formatTime(duration);
                  console.log(`  ✅ Created ${dateKey}: ${formatTime(duration)}`);
                }
              });
            }

            console.log(`  Final timeEntries for ${project.name}:`, timeEntries);

            return {
              ...project,
              timeEntries
            };
          } catch (err) {
            console.error(`Failed to fetch timesheets for project ${project.name}:`, err);
            return {
              ...project,
              timeEntries: {}
            };
          }
        })
      );

      console.log('📋 All projects with updated time entries:', updatedProjects);
      setProjects(updatedProjects);
    } catch (err) {
      console.error('Failed to calculate time entries:', err);
    } finally {
      setIsLoadingTimesheet(false);
    }
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsAPI.getProjects();
        console.log('📦 Fetched projects:', data);
        
        const formattedProjects = data.map((p: any) => ({
          id: p.id,
          name: p.project_name,
          description: p.description,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16),
          startDate: p.start_date,
          endDate: p.end_date,
          status: "active",
          timeEntries: {} as { [key: string]: string },
        }));
        
        // Fetch timesheet data after projects are loaded
        await fetchTimesheetData(formattedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, []); // Only run on mount

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: EventType) => {
    setEvents(prev => [...prev, event]);
  };

  const updateEvent = (id: number, updatedEvent: Partial<EventType>) => {
    setEvents(prev =>
      prev.map(event => (event.id === id ? { ...event, ...updatedEvent } : event))
    );
  };

  const deleteEvent = (id: number) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
  };

  // Optional: Refresh timesheet data manually
  const refreshTimesheets = useCallback(() => {
    if (projects.length > 0) {
      fetchTimesheetData(projects);
    }
  }, [projects, fetchTimesheetData]);

  return (
    <AppContext.Provider 
      value={{ 
        events, 
        projects, 
        addEvent, 
        updateEvent, 
        deleteEvent, 
        updateProjects,
        refreshTimesheets, // Add this if you want manual refresh capability
        isLoadingTimesheet
      }}
    >
      {children}
    </AppContext.Provider>
  );
};