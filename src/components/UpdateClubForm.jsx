import React, { useState } from "react";

const UpdateClubForm = ({ clubDetails, onUpdate }) => {
  const [description, setDescription] = useState(clubDetails.description || "");
  const [location, setLocation] = useState(clubDetails.location || "");
  const [meetingType, setMeetingType] = useState(
    clubDetails.meetingType || "online"
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdate({
      description,
      location,
      meetingType,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-5 rounded shadow-md bg-white"
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Description:
        </label>
        <textarea
          id="description"
          rows="4"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="location"
        >
          Location:
        </label>
        <input
          id="location"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="meetingType"
        >
          Meeting Types:
        </label>
        <select
          id="meetingType"
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={meetingType}
          onChange={(e) => setMeetingType(e.target.value)}
        >
          <option value="online">Online</option>
          <option value="in-person">In Person</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Update Club
      </button>
    </form>
  );
};

export default UpdateClubForm;
