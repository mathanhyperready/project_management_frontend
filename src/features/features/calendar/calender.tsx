import React, { useState , useEffect} from "react";
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
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import { projectsAPI } from '../../../api/projects.api';

import { useAppContext } from "../../../contexts/AppContext";
import  type { EventType } from "../../../utils/types";
import { EventModal } from "./EventModal";

const localizer = momentLocalizer(moment);

const CalendarViewComponent: React.FC = () => {

  
  const { events, addEvent, updateEvent, deleteEvent } = useAppContext();
  
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(Views.WEEK);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  // Form state
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [project, setProject] = useState<{ value: string; label: string }[]>([]);
  const [tags, setTags] = useState("");
  const [billable, setBillable] = useState(true);

   useEffect(() => {
      const fetchProject = async () => {
        try {
          const data = await projectsAPI.getProjects(); 
          const formattedRoles = data.map((project: any) => ({
            value: project.project_name, 
            label: project.project_name,
          }));
          setProject(formattedRoles);
        } catch (err) {
          console.error('Failed to fetch Project:', err);
        }
      };
  
      fetchProject();
      console.log("projectlist",project);
    }, []);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const start = moment(slotInfo.start).format("HH:mm");
    const end = moment(slotInfo.end).format("HH:mm");
    
    setIsEditMode(false);
    setSelectedSlot(slotInfo);
    setStartTime(start);
    setEndTime(end);
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
    setSelectedDate(eventTyped.start);
    setDescription(eventTyped.description || "");
    setProject(eventTyped.project || "");
    setTags(eventTyped.tags?.join(", ") || "");
    setBillable(eventTyped.billable ?? true);
    setShowModal(true);
  };

  const handleAddEntry = () => {
    if (selectedSlot && description && project) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      
      const startDate = new Date(selectedDate);
      startDate.setHours(startHour, startMin, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, endMin, 0, 0);

      const newEvent: EventType = {
        id: Date.now(),
        title: description,
        start: startDate,
        end: endDate,
        description,
        project,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        billable,
      };
      addEvent(newEvent);
      setShowModal(false);
    }
  };

  const handleUpdateEntry = () => {
    if (editingEvent && description && project) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      
      const startDate = new Date(selectedDate);
      startDate.setHours(startHour, startMin, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, endMin, 0, 0);

      updateEvent(editingEvent.id, {
        title: description,
        start: startDate,
        end: endDate,
        description,
        project,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        billable,
      });
      setShowModal(false);
    }
  };

  const handleDeleteEntry = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      setShowModal(false);
    }
  };

  const handleDuplicateEntry = () => {
    if (editingEvent) {
      const newEvent: EventType = {
        ...editingEvent,
        id: Date.now(),
      };
      addEvent(newEvent);
      setShowModal(false);
    }
  };

  const getDateRangeText = () => {
    if (view === Views.WEEK) {
      const startOfWeek = moment(date).startOf('week');
      const endOfWeek = moment(date).endOf('week');
      return `${startOfWeek.format('DD/MM/YYYY')} - ${endOfWeek.format('DD/MM/YYYY')}`;
    }
    return moment(date).format('DD/MM/YYYY');
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const amount = view === Views.DAY ? 1 : 7;
    const newDate = moment(date)[direction === 'next' ? 'add' : 'subtract'](amount, 'days').toDate();
    setDate(newDate);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Custom Toolbar */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600 mr-2">CALENDAR</span>
          <button
            onClick={() => setView(Views.WEEK)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              view === Views.WEEK 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView(Views.DAY)}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              view === Views.DAY 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Day
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-4 py-2 text-sm border border-gray-300 rounded flex items-center gap-2 hover:bg-gray-50"
            >
              <CalendarDays size={16} />
              {getDateRangeText()}
            </button>
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white shadow-lg rounded-lg p-4">
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

          <div className="flex gap-1">
            <button
              onClick={() => handleNavigate('prev')}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleNavigate('next')}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Calendar
          selectable
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          views={[Views.DAY, Views.WEEK]}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          className="h-full bg-white rounded-lg border border-gray-200"
          step={15}
          timeslots={1}
          date={date}
          onNavigate={setDate}
          components={{ toolbar: () => null }}
        />
      </div>

      {/* Event Modal */}
      <EventModal
        show={showModal}
        isEditMode={isEditMode}
        editingEvent={editingEvent}
        startTime={startTime}
        endTime={endTime}
        selectedDate={selectedDate}
        description={description}
        project={project}
        tags={tags}
        billable={billable}
        onClose={() => setShowModal(false)}
        onSave={isEditMode ? handleUpdateEntry : handleAddEntry}
        onDelete={handleDeleteEntry}
        onDuplicate={handleDuplicateEntry}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        setSelectedDate={setSelectedDate}
        setDescription={setDescription}
        setProject={setProject}
        setTags={setTags}
        setBillable={setBillable}
      />
    </div>
  );
};

export default CalendarViewComponent;