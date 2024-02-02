import React from "react";
import { auth } from "../config/firebase-config";
import PayPalComponent from "../components/PayPalComponent"; // Import the PayPalComponent
const SessionDisplay = ({ session, onClose, onJoin, canJoin, onLeave }) => {
  if (!session) return <div>Select a session to see the details</div>;
  const currentUser = auth.currentUser;
  // Determine if the session is online based on whether a link is provided
  const isOnlineSession = session.link && session.link.trim() !== "";
  const isParticipant = session.participants.some(
    (p) => p.uid === currentUser?.uid
  );
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
        <p>
          <strong>Participants:</strong>
        </p>
        <ul>
          {session.participants &&
            session.participants.map((participant, index) => (
              <li key={index}>{participant.nickname}</li> // Assuming each participant has a nickname property
            ))}
        </ul>
        {isParticipant ? (
          <div>
            <p>You have joined the session. Please proceed with the payment.</p>
            <PayPalComponent amount={session.fee} />

            <button
              onClick={() => onLeave(session)}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Leave Session
            </button>
          </div>
        ) : canJoin ? (
          <button
            onClick={() => onJoin(session)}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Join Session
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SessionDisplay;
