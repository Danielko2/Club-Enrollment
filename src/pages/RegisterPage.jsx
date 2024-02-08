import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "../hooks/AuthContext";
const RegisterLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(true);
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const { setNickname: setAuthNickname } = useAuth();
  const navigate = useNavigate();
  const [needsNickname, setNeedsNickname] = useState(false); // New state for nickname prompt
  const resetFields = () => {
    setEmail("");
    setPassword("");
    setNickname("");
    setMessage("");
  };

  const checkUserDocument = async (user) => {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      // If the document doesn't exist, you are already setting the needsNickname state to true
      setNeedsNickname(true);
    } else {
      // If the document exists, you are navigating to the clubs page
      navigate("/clubs");
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await checkUserDocument(result.user);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const handleNicknameSubmission = async () => {
    const nicknameExistsResult = await nicknameExists(nickname);
    setMessage("");
    if (nicknameExistsResult) {
      setMessage("Nickname already exists. Please choose a different one.");
      return;
    }
    const user = auth.currentUser;
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      nickname: nickname,
    });

    setNeedsNickname(false); // Close the nickname prompt
    setAuthNickname(nickname);
    navigate("/clubs");
  };

  const nicknameExists = async (nickname) => {
    const nicknamesRef = collection(db, "users");
    const q = query(nicknamesRef, where("nickname", "==", nickname));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // returns true if nickname exists, false otherwise
  };

  const register = async () => {
    const nicknameExistsResult = await nicknameExists(nickname);
    if (nicknameExistsResult) {
      setMessage("Nickname already exists. Please choose a different one.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // This will create the 'users' collection if it doesn't exist
      setDoc(doc(db, "users", user.uid), {
        email: user.email,
        nickname: nickname,
      });
      setMessage("Registration successful!");

      navigate("/clubs"); // Navigate to clubs after registration
      resetFields();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Login successful!");

      navigate("/clubs"); // Redirect to clubs page after successful login
      resetFields();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) {
      register();
    } else {
      login();
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    resetFields();
  };
  return (
    <div className="flex justify-center">
      {needsNickname ? (
        // Only render the nickname input and submit button
        <div className="p-4 border rounded">
          <input
            type="text"
            placeholder="Enter nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleNicknameSubmission}
          >
            Submit Nickname
          </button>
          {message && <p className="text-red-500">{message}</p>}
        </div>
      ) : (
        // Render the rest of the form only if `needsNickname` is false
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2 text-center">
            {isRegistering ? "Register" : "Login"}
          </h2>
          {message && <p className="text-red-500">{message}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {isRegistering && (
              <input
                className="p-2 border rounded"
                type="text"
                placeholder="Enter nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required={isRegistering}
              />
            )}
            <input
              className="p-2 border rounded"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="p-2 border rounded"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isRegistering ? "Register" : "Login"}
            </button>
          </form>
          <button
            onClick={toggleForm}
            className="mt-4 text-blue-500 hover:underline"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>

          <button
            onClick={signInWithGoogle}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterLoginPage;
