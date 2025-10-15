import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  type SlotInfo,
  type View as CalendarView,
  type Event,
} from "react-big-calendar";
import moment from "moment";
import DatePicker from "react-datepicker";
import { ChevronLeft, ChevronRight, CalendarDays, X, MoreVertical } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";

const localizer = momentLocalizer(moment);

interface EventType {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  project?: string;
  tags?: string[];
  billable?: boolean;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([
    {
      id: 1,
      title: "Test",
      start: new Date(2025, 9, 13, 2, 0),
      end: new Date(2025, 9, 13, 5, 0),
      description: "Test",
      project: "DEMO",
      billable: true,
    },
    {
      id: 2,
      title: "Sample Work",
      start: new Date(2025, 9, 15, 11, 18),
      end: new Date(2025, 9, 15, 12, 16),
      description: "Sample Work",
      project: "DEMO",
      billable: true,
    },
  ]);

  const [date, setDate] = useState(new Date(2025, 9, 15));
  const [view, setView] = useState<CalendarView>(Views.WEEK);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Form state
  const [duration, setDuration] = useState("00:00:00");
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [tags, setTags] = useState("");
  const [billable, setBillable] = useState(true);

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    
    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const start = moment(slotInfo.start).format("HH:mm");
    const end = moment(slotInfo.end).format("HH:mm");
    
    setIsEditMode(false);
    setSelectedSlot(slotInfo);
    setStartTime(start);
    setEndTime(end);
    setDuration(calculateDuration(start, end));
    setSelectedDate(slotInfo.start);
    setDescription("");
    setProject("");
    setTags("");
    setBillable(true);
    setShowModal(true);
  };

  const handleSelectEvent = (event: Event) => {
    const eventTyped = event as EventType;
    const start = moment(eventTyped.start).format("HH:mm");
    const end = moment(eventTyped.end).format("HH:mm");
    
    setIsEditMode(true);
    setEditingEvent(eventTyped);
    setStartTime(start);
    setEndTime(end);
    setDuration(calculateDuration(start, end));
    setSelectedDate(eventTyped.start);
    setDescription(eventTyped.description || "");
    setProject(eventTyped.project || "");
    setTags(eventTyped.tags?.join(", ") || "");
    setBillable(eventTyped.billable ?? true);
    setShowModal(true);
  };

  const handleAddEntry = () => {
    if (selectedSlot && description) {
      const newEvent: EventType = {
        id: Date.now(),
        title: description,
        start: selectedSlot.start,
        end: selectedSlot.end,
        description,
        project,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        billable,
      };
      setEvents((prev) => [...prev, newEvent]);
      setShowModal(false);
    }
  };

  const handleUpdateEntry = () => {
    if (editingEvent && description) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                title: description,
                description,
                project,
                tags: tags ? tags.split(",").map(t => t.trim()) : [],
                billable,
              }
            : event
        )
      );
      setShowModal(false);
      setShowContextMenu(false);
    }
  };

  const handleDeleteEntry = () => {
    if (editingEvent) {
      setEvents((prev) => prev.filter((event) => event.id !== editingEvent.id));
      setShowModal(false);
      setShowContextMenu(false);
    }
  };

  const handleDuplicateEntry = () => {
    if (editingEvent) {
      const newEvent: EventType = {
        ...editingEvent,
        id: Date.now(),
      };
      setEvents((prev) => [...prev, newEvent]);
      setShowModal(false);
      setShowContextMenu(false);
    }
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
      setDuration(calculateDuration(value, endTime));
    } else {
      setEndTime(value);
      setDuration(calculateDuration(startTime, value));
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleNext = () => {
  let newDate;

  switch (view) {
    case Views.DAY:
      newDate = moment(date).add(1, "day").toDate();
      break;
    case Views.WEEK:
      newDate = moment(date).add(1, "week").toDate();
      break;
    case Views.MONTH:
      newDate = moment(date).add(1, "month").toDate();
      break;
    default:
      newDate = moment(date).add(1, "day").toDate();
  }

  setDate(newDate);
};


  const handlePrev = () => {
    const newDate = moment(date).subtract(view === Views.DAY ? 1 : 7, "days").toDate();
    setDate(newDate);
  };

  const getDateRangeText = () => {
  if (view === Views.WEEK) {
    const startOfWeek = moment(date).startOf('week');
    const endOfWeek = moment(date).endOf('week');
    return `${startOfWeek.format('ddd, DD MMM YYYY')} - ${endOfWeek.format('ddd, DD MMM YYYY')}`;
  }
  return moment(date).format('ddd, DD MMM YYYY');
};

  const CustomToolbar = () => (
    <div style={{
      padding: "1rem",
      background: "white",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span style={{ 
          fontSize: "0.875rem", 
          color: "#6b7280",
          marginRight: "0.5rem"
        }}>
          CALENDAR
        </span>
        <button
          onClick={() => setView(Views.WEEK)}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: view === Views.WEEK ? "#3b82f6" : "white",
            color: view === Views.WEEK ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          Week
        </button>
        <button
          onClick={() => setView(Views.DAY)}
          style={{
            padding: "0.5rem 1rem",
            cursor: "pointer",
            backgroundColor: view === Views.DAY ? "#3b82f6" : "white",
            color: view === Views.DAY ? "white" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          Day
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={{
              padding: "0.5rem 1rem",
              cursor: "pointer",
              backgroundColor: "white",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CalendarDays size={16} />
            {getDateRangeText()}
          </button>
          {showDatePicker && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
              zIndex: 1000,
              background: "white",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              borderRadius: "8px",
              padding: "1rem",
            }}>
              <DatePicker
                selected={date}
                onChange={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    setShowDatePicker(false);
                  }
                }}
                inline
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            onClick={handlePrev}
            style={{
              padding: "0.5rem",
              cursor: "pointer",
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: "0.5rem",
              cursor: "pointer",
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const formats = {
    dayHeaderFormat: (date: Date) => moment(date).format('ddd, MMM D YYYY'),
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      flexDirection: "column",
      background: "#f9fafb"
    }}>
      <CustomToolbar />

      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          views={[Views.DAY, Views.WEEK]}
          defaultView={Views.WEEK}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ 
            height: "100%", 
            backgroundColor: "white", 
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}
          step={60}
          timeslots={1}
          date={date}
          onNavigate={handleNavigate}
          formats={formats}
          components={{
            toolbar: () => null,
          }}
        />
      </div>

      {/* Add/Edit Time Entry Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: "500",
                color: "#6b7280",
              }}>
                {isEditMode ? "Edit time entry" : "Add time entry"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  color: "#9ca3af",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {/* Time and Date Section */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Time and date
                </label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={duration}
                    readOnly
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      width: "100px",
                      backgroundColor: "#f9fafb",
                    }}
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      width: "100px",
                    }}
                  />
                  <span style={{ color: "#6b7280" }}>-</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      width: "100px",
                    }}
                  />
                  <input
                    type="date"
                    value={moment(selectedDate).format("YYYY-MM-DD")}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      width: "140px",
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What have you worked on?"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Project */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Project <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Select Project</option>
                  <option value="DEMO">DEMO</option>
                  <option value="Project 1">Project 1</option>
                  <option value="Project 2">Project 2</option>
                </select>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Add tags"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                />
              </div>

              {/* Billable */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#374151",
                }}>
                  <span>Billable</span>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <input
                      type="checkbox"
                      checked={billable}
                      onChange={(e) => setBillable(e.target.checked)}
                      style={{
                        width: "44px",
                        height: "24px",
                        cursor: "pointer",
                        appearance: "none",
                        backgroundColor: billable ? "#22d3ee" : "#d1d5db",
                        borderRadius: "12px",
                        position: "relative",
                        transition: "background-color 0.2s",
                      }}
                    />
                  </div>
                  <span style={{ color: "#6b7280", fontWeight: "400" }}>Yes</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "1.5rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              {isEditMode && (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowContextMenu(!showContextMenu)}
                    style={{
                      padding: "0.5rem",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      color: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showContextMenu && (
                    <div style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      marginBottom: "0.5rem",
                      backgroundColor: "white",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      borderRadius: "4px",
                      minWidth: "150px",
                      zIndex: 1001,
                    }}>
                      <button
                        onClick={handleDuplicateEntry}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          border: "none",
                          backgroundColor: "white",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          color: "#374151",
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={handleDeleteEntry}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          border: "none",
                          backgroundColor: "white",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          color: "#ef4444",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.5rem 1.5rem",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    color: "#6b7280",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={isEditMode ? handleUpdateEntry : handleAddEntry}
                  style={{
                    padding: "0.5rem 1.5rem",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "#22d3ee",
                    color: "white",
                  }}
                >
                  {isEditMode ? "SAVE" : "ADD"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;