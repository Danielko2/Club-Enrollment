import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const CalendarView = ({ sessions, onEventClick }) => {
  // Transform sessions to the format expected by FullCalendar
  const transformedSessions = sessions.map((session) => ({
    title: session.name + (session.time ? ` - ${session.time}` : ""), // Include time
    start: session.date, // Use date as start
    // end: session.endDate,
    extendedProps: {
      ...session, // Include the entire session object for easy access on click
    },
  }));
  const renderEventContent = (eventInfo) => {
    return (
      <div className="flex flex-col justify-between items-start h-full p-1">
        <div className="font-semibold text-center text-xs sm:text-sm">
          {eventInfo.event.extendedProps.name}
        </div>
        <div className="text-xs sm:text-sm">{eventInfo.timeText}</div>
      </div>
    );
  };

  return (
    <div className="mx-auto p-4 sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        footerToolbar={
          {
            // Custom buttons or other components if needed
          }
        }
        events={transformedSessions}
        eventContent={renderEventContent}
        eventClick={onEventClick}
        aspectRatio={1.35} // Control the aspect ratio of the calendar
        // Additional options...
      />
    </div>
  );
};

export default CalendarView;
