import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { storage } from "../config/firebase-config";
import { db } from "../config/firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
const UserDashboard = () => {
  const { currentUser, updateProfilePicture } = useAuth();
  const [userPhoto, setUserPhoto] = useState(currentUser.photoURL);
  const [clubs, setClubs] = useState([]); // State to store the clubs
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
    try {
      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      // Get the download URL
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update the user's auth profile
      await updateProfile(currentUser, { photoURL });
      setUserPhoto(photoURL); // Update state to re-render the component with the new photo
      updateProfilePicture(photoURL);
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  if (!currentUser) {
    return <div>Please log in to view this page.</div>;
  }

  useEffect(() => {
    if (!currentUser) return;

    // Fetch all clubs then filter in the client
    const q = query(collection(db, "clubs"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clubsArray = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((club) =>
          club.members.some((member) => member.uid === currentUser.uid)
        ); // Filter in client

      setClubs(clubsArray);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="container mx-auto my-10 p-8 border rounded shadow-lg">
      <h1 className="text-xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        {userPhoto ? (
          <img
            src={userPhoto}
            alt="User profile"
            className="w-32 h-32 rounded-full"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
            No image
          </div>
        )}
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Upload a profile picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100
        "
        />
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Your Clubs:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <Link
                key={club.id}
                to={`/club-dashboard/${club.id}`}
                className="flex flex-col justify-between p-6 bg-white rounded-lg border border-gray-200 shadow hover:shadow-lg transition-shadow duration-300"
              >
                <h5 className="text-xl font-bold text-gray-900">{club.name}</h5>
                {/* Additional club details can be added here */}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
