import React, { createContext, useContext, useState, useEffect } from "react";
import type { EventType, Project, AppContextType } from "../utils/types";
import { formatDate, formatTime } from "../utils/timeCalculations";
import { projectsAPI } from "../api/projects.api";

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
    console.log(children,"children");
  // Load from localStorage or use defaults
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsAPI.getProjects(); // fetch all projects
        const formattedProjects = data.map((p: any) => ({
          id: p.id,
          name: p.project_name,
          description: p.description,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16), // random color
          startDate: p.start_date,
          endDate: p.end_date,
          status: "active",
          timeEntries: {} as { [key: string]: string },
        }));
        setProjects(formattedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  }, [events]);

  // Calculate timesheet entries from calendar events
useEffect(() => {
  console.log('🔄 Events changed:', events);
  const calculateTimeEntries = () => {
    const newProjects = projects.map(project => ({
      ...project,
      timeEntries: {} as { [key: string]: string }
    }));

    console.log('📊 Calculating timesheet entries...');
    
    events.forEach(event => {
      console.log('Processing event:', event);
      
      if (!event.project) {
        console.log('⚠️ Event has no project, skipping');
        return;
      }

      const projectIndex = newProjects.findIndex(p => p.name === event.project);
      console.log(`Looking for project "${event.project}", found at index:`, projectIndex);
      
      if (projectIndex === -1) {
        console.log('⚠️ Project not found!');
        return;
      }

      const dateKey = formatDate(event.start);
      console.log('Date key:', dateKey);
      
      const durationSeconds = (event.end.getTime() - event.start.getTime()) / 1000;
      console.log('Duration (seconds):', durationSeconds);
      
      if (newProjects[projectIndex].timeEntries[dateKey]) {
        const existingTime = newProjects[projectIndex].timeEntries[dateKey];
        const [eH, eM, eS] = existingTime.split(":").map(Number);
        const existingSeconds = eH * 3600 + eM * 60 + eS;
        const totalSeconds = existingSeconds + durationSeconds;
        
        newProjects[projectIndex].timeEntries[dateKey] = formatTime(totalSeconds);
        console.log('✅ Updated existing entry:', formatTime(totalSeconds));
      } else {
        newProjects[projectIndex].timeEntries[dateKey] = formatTime(durationSeconds);
        console.log('✅ Created new entry:', formatTime(durationSeconds));
      }
    });

    console.log('📋 Final projects with time entries:', newProjects);
    setProjects(newProjects);
  };

  calculateTimeEntries();
}, [events]); // Remove 'projects' from dependency to avoid infinite loop

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

  return (
    <AppContext.Provider 
      value={{ 
        events, 
        projects, 
        addEvent, 
        updateEvent, 
        deleteEvent, 
        updateProjects 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};