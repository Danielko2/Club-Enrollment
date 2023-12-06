import React, { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-config"; // Ensure you have a firebase.js file exporting configured db
import ClubForm from "../components/ClubForm";
import { Link } from "react-router-dom";
const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  // const [newClubName, setNewClubName] = useState("");

  const [showModal, setShowModal] = useState(false);

  // Function to open the modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // // Add a new club to Firestore first method
  // const addClub = async () => {
  //   if (newClubName.trim() === "") return;
  //   await addDoc(collection(db, "clubs"), { name: newClubName });
  //   setNewClubName(""); // Reset input field after submission
  // };

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
    <div className="container mx-auto p-4">
      <button onClick={openModal} className="p-2 bg-blue-500 text-white">
        Add Club
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <ClubForm closeModal={closeModal} />
          </div>
        </div>
      )}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <Link
              key={club.id}
              to={`/club-dashboard/${club.id}`}
              className="block p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100"
            >
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
                {club.name}
              </h5>
              {/* Add additional club details here */}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clubs;
