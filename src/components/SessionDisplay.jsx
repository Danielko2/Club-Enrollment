import React from "react";

const SessionDisplay = ({ session, onClose }) => {
  if (!session) return <div>Select a session to see the details</div>;

  // Determine if the session is online based on whether a link is provided
  const isOnlineSession = session.link && session.link.trim() !== "";

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg m-4 max-w-xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold"
          aria-label="Close session details"
        >
          &times;
        </button>
        <h2 className="font-bold text-xl mb-2">{session.name}</h2>
        <p>
          <strong>Date:</strong> {session.date}
        </p>
        <p>
          <strong>Time:</strong> {session.time}
        </p>
        {/* Conditionally render link or location */}
        {isOnlineSession ? (
          <p>
            <strong>Link:</strong>{" "}
            <a href={session.link} target="_blank" rel="noopener noreferrer">
              Join Session
            </a>
          </p>
        ) : (
          <p>
            <strong>Location:</strong> {session.location}
          </p>
        )}
        <p>
          <strong>Description:</strong> {session.description}
        </p>
      </div>
    </div>
  );
};

export default SessionDisplay;
