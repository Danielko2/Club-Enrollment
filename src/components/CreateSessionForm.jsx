import React, { useState } from "react";
import { db } from "../config/firebase-config";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

const CreateSessionForm = ({ clubId, onCancel }) => {
  const [sessionDetails, setSessionDetails] = useState({
    name: "",
    date: "",
    time: "",
    link: "",
    description: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // perform validation checks here

    try {
      const clubRef = doc(db, "clubs", clubId);

      await updateDoc(clubRef, {
        sessions: arrayUnion(sessionDetails),
      });
      // Reset form
      setSessionDetails({
        name: "",
        date: "",
        time: "",
        link: "",
        description: "",
      });

      // Set a success message
      setSuccessMessage("Session created successfully!");
      setErrorMessage(""); // Clear any previous errors

      // Reset the success message after a few seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      // Handle errors, set error message
      setErrorMessage("Failed to create session. Please try again.");
      setSuccessMessage(""); // Clear any previous success message

      // Reset the error message after a few seconds
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSessionDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-name"
          >
            Session Name
          </label>
          <input
            id="session-name"
            name="name"
            type="text"
            value={sessionDetails.name}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter session name"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-date"
          >
            Session Date
          </label>
          <input
            id="session-date"
            name="date"
            type="date"
            value={sessionDetails.date}
            required
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-time"
          >
            Session Start Time
          </label>
          <input
            id="session-time"
            name="time"
            type="time"
            value={sessionDetails.time}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-link"
          >
            Session Link
          </label>
          <input
            id="session-link"
            name="link"
            type="url"
            value={sessionDetails.link}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="http://"
          />
        </div>
        <div>
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="session-description"
          >
            Session Description
          </label>
          <textarea
            id="session-description"
            name="description"
            value={sessionDetails.description}
            onChange={handleChange}
            required
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Describe the session"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Session
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSessionForm;
