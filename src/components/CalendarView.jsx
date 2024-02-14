import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const CalendarView = ({ sessions, onEventClick, currentUser }) => {
  const [sortedSessions, setSortedSessions] = useState([]);

  useEffect(() => {
    const transformedSessions = sessions
      .map((session) => {
        const dateTime = `${session.date}T${session.time}:00`;
        const isUserJoined = session.participants.some(
          (participant) => participant.uid === currentUser?.uid
        );

        return {
          title: session.name + (session.time ? ` - ${session.time}` : ""),
          start: dateTime,
          backgroundColor: isUserJoined ? "#34D399" : "#60A5FA",
          borderColor: isUserJoined ? "#059669" : "#3B82F6",
          extendedProps: {
            ...session,
          },
        };
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    console.log(transformedSessions);
    setSortedSessions(transformedSessions);
  }, [sessions, currentUser]); // Dependencies array to update when sessions or currentUser changes

  const renderEventContent = (eventInfo) => {
    return (
      <div
        className="flex flex-col justify-between items-center h-full p-1 break-words"
        style={{
          backgroundColor: eventInfo.event.backgroundColor,
          borderColor: eventInfo.event.borderColor,
          borderWidth: "1px",
          borderStyle: "solid",
          borderRadius: "5px",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          cursor: "pointer",
        }}
      >
        <div className="font-semibold text-xs sm:text-sm lg:text-base whitespace-normal">
          {eventInfo.event.title}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek,dayGridDay",
        }}
        events={sortedSessions}
        eventContent={renderEventContent}
        eventClick={onEventClick}
        key={sessions.length} // Use sessions.length as a key to force re-render
        aspectRatio={1.35}
        contentHeight="auto"
        windowResizeDelay={100}
      />
    </div>
  );
};

export default CalendarView;
