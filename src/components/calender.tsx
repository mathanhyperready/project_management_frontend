import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import {enUS} from "date-fns/locale/en-US"; // ← use ES module import
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const events = [
  {
    title: "Meeting",
    start: new Date(2025, 9, 13, 10, 0),
    end: new Date(2025, 9, 13, 11, 0),
  },
  {
    title: "Lunch",
    start: new Date(2025, 9, 14, 12, 0),
    end: new Date(2025, 9, 14, 13, 0),
  },
];

export default function MyCalendar() {
  return (
    <div className="p-6">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}
