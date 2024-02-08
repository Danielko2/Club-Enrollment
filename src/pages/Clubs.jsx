import React, { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-config"; // Ensure you have a firebase.js file exporting configured db
import ClubForm from "../components/ClubForm";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  // const [newClubName, setNewClubName] = useState("");
  const [loginPrompt, setLoginPrompt] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();
  // Function to open the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  const handleAddClubClick = () => {
    if (!currentUser) {
      // If there is no current user, set the login prompt message
      setLoginPrompt("Please log in to add a club.");
      return;
    }
    // If the user is logged in, open the modal
    setLoginPrompt(""); // Clear any existing login prompt
    openModal();
  };
  // Listen for real-time updates from Firestore
  useEffect(() => {
    const q = query(collection(db, "clubs"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clubsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClubs(clubsArray);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto p-6 text-center">
      <button
        onClick={handleAddClubClick}
        className="mb-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Club
      </button>

      {/* Display login prompt message if set */}
      {loginPrompt && <p className="text-red-500">{loginPrompt}</p>}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="mt-2">
                      <ClubForm closeModal={closeModal} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <Link
            key={club.id}
            to={`/club-dashboard/${club.id}`}
            className="flex flex-col justify-between p-6 bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition-shadow duration-300"
          >
            <h5 className="text-xl font-bold text-gray-900">{club.name}</h5>
            {/* You can add additional club details here */}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Clubs;
