import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config"; // Update this path to your Firebase configuration
import { db } from "../config/firebase-config"; // Update this path to your Firebase configuration
import { doc, getDoc } from "firebase/firestore"; // Update this path to your Firebase configuration
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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

  const value = {
    currentUser,
    nickname,

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
