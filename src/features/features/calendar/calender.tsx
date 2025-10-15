import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface EventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([
    {
      id: 1,
      title: "Test",
      start: new Date(2025, 9, 13, 2, 0),   // October 13, 2025, 2:00 AM
      end: new Date(2025, 9, 13, 5, 0),     // October 13, 2025, 5:00 AM
    },
    {
      id: 2,
      title: "Sample Work",
      start: new Date(2025, 9, 15, 11, 18), // October 15, 2025, 11:18 AM
      end: new Date(2025, 9, 15, 12, 16),   // October 15, 2025, 12:16 PM
    },
  ]);

  const [filteredEvents, setFilteredEvents] = useState<EventType[]>(events);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const title = prompt("Enter task name:");
    if (title) {
      const newEvent = { id: Date.now(), title, start, end };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
    }
  };

  const handleFilter = (filterText: string) => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(filterText.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* Sidebar */}
      <div style={{ width: "200px", backgroundColor: "#f8f9fa", padding: "1rem" }}>
        <h3>TaskFlow</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#tasks">Tasks</a></li>
          <li><a href="#calendar">Calendar</a></li>
        </ul>
      </div>

      {/* Calendar */}
      <div style={{ flex: 1, padding: "1rem" }}>
        <input
          type="text"
          placeholder="Filter by title..."
          onChange={(e) => handleFilter(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem" }}
        />
        <Calendar
          selectable
          localizer={localizer}
          events={filteredEvents}
          defaultView={Views.WEEK}
          views={[Views.DAY, Views.WEEK]}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          style={{
            height: "calc(90vh - 2rem)",
            backgroundColor: "white",
            borderRadius: "10px",
            overflow: "auto",
          }}
          step={30}
          timeslots={2}
          defaultDate={new Date(2025, 9, 15)} // Set default to October 15, 2025
        />
      </div>
    </div>
  );
};

export default CalendarView;