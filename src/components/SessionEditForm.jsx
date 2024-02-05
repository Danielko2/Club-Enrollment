import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useClubDetails } from "../hooks/useClubDetails";

const SessionEditForm = ({ session, clubId, onSave, onCancel }) => {
  const [editSessionDetails, setEditSessionDetails] = useState({ ...session });
  const isOnlineSession = session.link ? true : false; // Determine if the session is online based on the presence of a link
  const { club, loading, error } = useClubDetails(clubId);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditSessionDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleSave = async () => {
    if (club && !loading && !error) {
      const updatedSessions = [...club.sessions];
      const sessionIndex = club.sessions.findIndex(
        (s) =>
          s.name === session.name &&
          s.date === session.date &&
          s.time === session.time
      );

      if (sessionIndex === -1) {
        console.error("Session to update not found");
        return; // Exit early if the session isn't found
      }

      updatedSessions[sessionIndex] = editSessionDetails;

      try {
        const clubRef = doc(db, "clubs", clubId);
        await updateDoc(clubRef, { sessions: updatedSessions });
        onSave(updatedSessions); // Pass the updated sessions back to the parent component
      } catch (error) {
        console.error("Error updating session:", error);
      }
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl m-4 max-w-2xl w-full relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-3xl font-bold text-gray-600 hover:text-gray-800"
          aria-label="Close session edit form"
        >
          &times;
        </button>
        <h2 className="font-bold text-2xl mb-4 text-gray-800">
          Edit Session: {session.name}
        </h2>
        <div className="mb-4">
          <input
            name="name"
            value={editSessionDetails.name}
            onChange={handleChange}
            placeholder="Session Name"
            className="form-input mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          <input
            name="date"
            type="date"
            value={editSessionDetails.date}
            onChange={handleChange}
            className="form-input mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          <input
            name="time"
            type="time"
            value={editSessionDetails.time}
            onChange={handleChange}
            className="form-input mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm"
          />
        </div>
        <div className="mb-4">
          {isOnlineSession ? (
            <input
              name="link"
              value={editSessionDetails.link}
              onChange={handleChange}
              placeholder="Session Link"
              className="form-input mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm"
            />
          ) : (
            <input
              name="location"
              value={editSessionDetails.location}
              onChange={handleChange}
              placeholder="Session Location"
              className="form-input mt-1 block w-full rounded-md text-black
               border-gray-300 shadow-sm"
            />
          )}
        </div>
        <div className="mb-4">
          <textarea
            name="description"
            value={editSessionDetails.description}
            onChange={handleChange}
            placeholder="Session Description"
            className="form-textarea mt-1 block w-full rounded-md text-black border-gray-300 shadow-sm"
            rows="3"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-capacity"
          >
            Capacity
          </label>
          <input
            id="session-capacity"
            name="capacity"
            type="number"
            min="1" // Minimum capacity
            value={editSessionDetails.capacity}
            onChange={handleChange}
            className="form-input mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm"
            required
          />
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-fee"
          >
            Session Fee
          </label>
          <input
            id="session-fee"
            name="fee"
            type="number"
            min="0" // Minimum fee set to 0
            step="0.01" // Allow decimal for the fee
            value={editSessionDetails.fee}
            onChange={handleChange}
            className="form-input mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm"
            placeholder="Enter session fee"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionEditForm;
