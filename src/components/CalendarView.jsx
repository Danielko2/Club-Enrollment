import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const CalendarView = ({ sessions, onEventClick, currentUser }) => {
  const [sortedSessions, setSortedSessions] = useState([]);

  const [filter, setFilter] = useState("");
  // Handle changes to the filter checkboxes
  const handleFilterChange = (filterName) => {
    // If the filter is already set, clear it. Otherwise, set the new filter.
    setFilter((prevFilter) => (prevFilter === filterName ? "" : filterName));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter("");
  };
  useEffect(() => {
    let filteredSessions = sessions;

    // Apply filter based on the selected filter value
    if (filter === "isParticipant") {
      filteredSessions = filteredSessions.filter((session) =>
        session.participants.some((p) => p.uid === currentUser?.uid)
      );
    } else if (filter === "isPaid") {
      filteredSessions = filteredSessions.filter((session) =>
        session.participants.some((p) => p.uid === currentUser?.uid && p.paid)
      );
    } else if (filter === "notPaid") {
      filteredSessions = filteredSessions.filter((session) =>
        session.participants.some((p) => p.uid === currentUser?.uid && !p.paid)
      );
    }
    const transformedSessions = filteredSessions
      .map((session) => {
        const dateTime = `${session.date}T${session.time}:00`;
        const isUserJoined = session.participants.some(
          (participant) => participant.uid === currentUser?.uid
        );
        const isUserPaid = session.participants.some(
          (participant) =>
            participant.uid === currentUser?.uid && participant.paid
        );

        let sessionTitle = session.name;
        let backgroundColor = "#60A5FA"; // Default blue color for all events

        if (isUserJoined) {
          backgroundColor = "#34D399"; // Green color when joined
          sessionTitle += isUserPaid ? " - Paid" : " - Not Paid"; // Add "Paid" or "Not Paid" only if joined
        }

        return {
          title: sessionTitle + (session.time ? ` - ${session.time}` : ""),
          start: dateTime,
          backgroundColor: backgroundColor,
          borderColor: "#3B82F6", // Default border color for all events
          extendedProps: {
            ...session,
            isUserPaid,
          },
        };
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    console.log(transformedSessions);
    setSortedSessions(transformedSessions);
  }, [sessions, currentUser, filter]); // Dependencies array to update when sessions or currentUser changes

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
      <div className="flex space-x-4 mb-4">
        {/* Filter UI elements */}
        {/* Updated to use filter state */}
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filter === "isParticipant"}
            onChange={() => handleFilterChange("isParticipant")}
          />
          <span>Participant</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filter === "isPaid"}
            onChange={() => handleFilterChange("isPaid")}
          />
          <span>Paid</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filter === "notPaid"}
            onChange={() => handleFilterChange("notPaid")}
          />
          <span>Not Paid</span>
        </label>

        {/* Clear Filters Button */}
        <button onClick={clearFilters} className="px-4 py-2 border rounded">
          Clear Filters
        </button>
      </div>

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
