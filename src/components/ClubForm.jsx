// components/ClubForm.js
import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
const ClubForm = ({ closeModal }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [clubDetails, setClubDetails] = useState({
    name: "",
    description: "",
    meetingFrequency: "",
    adminNickname: "",
    // Add more fields as needed
  });

  const handleChange = (e) => {
    setClubDetails({ ...clubDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (clubDetails.name.trim() === "") return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error("User document does not exist!");
        return;
      }

      const userNickname = userDocSnap.data().nickname;

      const clubData = {
        ...clubDetails,
        adminNickname: [userNickname], // Set the adminNickname to the user's nickname

        joiningMethod: "open", // Set the joining method to 'open' by default
        members: [
          {
            uid: currentUser.uid, // Set the admin's UID
            nickname: userNickname, // Set the admin's nickname
          },
        ], // Set the members array to contain the admin's member object
      };

      const docRef = await addDoc(collection(db, "clubs"), clubData);
      closeModal();
      navigate(`/club-dashboard/${docRef.id}`);
    } catch (error) {
      console.error("Error adding club or fetching user nickname: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="text"
        name="name"
        value={clubDetails.name}
        onChange={handleChange}
        placeholder="Club Name"
        className="border-2 p-2 w-full rounded"
      />
      {/* <textarea
        name="description"
        value={clubDetails.description}
        onChange={handleChange}
        placeholder="Description"
        className="border-2 p-2 w-full rounded"
        rows="4" // Set the number of rows for the textarea to define its height
      /> */}
      {/* <input
        type="text"
        name="meetingFrequency"
        value={clubDetails.meetingFrequency}
        onChange={handleChange}
        placeholder="Meeting Frequency"
        className="border-2 p-2 w-full rounded"
      /> */}
      {/* Add more input fields as needed */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Add Club
      </button>
    </form>
  );
};

export default ClubForm;
