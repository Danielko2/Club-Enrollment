import React, { useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { storage } from "../config/firebase-config"; // Adjust the import path as needed

const UserDashboard = () => {
  const { currentUser, updateProfilePicture } = useAuth();
  const [userPhoto, setUserPhoto] = useState(currentUser.photoURL);

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
      </div>
    </div>
  );
};

export default UserDashboard;
