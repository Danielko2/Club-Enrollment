import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setUserPhotoURL(user?.photoURL);
      if (user) {
        // Fetch the nickname from Firestore and set it in context
        fetchAndSetNickname(user.uid);
      } else {
        setNickname(""); // Reset nickname if user logs out
      }
      setLoading(false);
    });

    const fetchAndSetNickname = async (uid) => {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setNickname(userSnap.data().nickname);
      }
    };

    return unsubscribe;
  }, []);
  const updateProfilePicture = async (photoURL) => {
    setUserPhotoURL(photoURL); // Update the context state
    if (currentUser) {
      // Update the Firebase Auth user profile
      await updateProfile(currentUser, { photoURL });
      // Trigger a re-render in components using the AuthContext
    }
  };

  const value = {
    currentUser,
    nickname,
    userPhotoURL, // Include the userPhotoURL in the context
    updateProfilePicture, // Provide the update method to the context
    setNickname,
    login: (email, password) =>
      signInWithEmailAndPassword(auth, email, password),
    register: (email, password) =>
      createUserWithEmailAndPassword(auth, email, password),
    logout: () => auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
