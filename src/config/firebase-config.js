// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/firestore"; 
import {getFirestore, connectFirestoreEmulator} from "firebase/firestore"
import { getAuth, connectAuthEmulator } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAokpORBmHrEqD-68rEcFEVS_r3lvipJsI",
  authDomain: "dungeonconnect-2402b.firebaseapp.com",
  projectId: "dungeonconnect-2402b",
  storageBucket: "dungeonconnect-2402b.appspot.com",
  messagingSenderId: "616616663894",
  appId: "1:616616663894:web:c248debb076ea820bdd4f7",
  measurementId: "G-RHLD94WBBT"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
// Check if running on localhost to use the emulator
if (window.location.hostname === "localhost") {
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  export { auth };

  export { db };