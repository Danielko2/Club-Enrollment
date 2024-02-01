import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useState, useEffect } from "react";
import RegularUserDashboard from "../pages/RegularUserDashboard";
import AdminDashboardPage from "../pages/AdminDashboard";
import { db } from "../config/firebase-config";
import { doc, getDoc } from "firebase/firestore";
const ClubDashboardPage = () => {
  const { clubId } = useParams();
  const { currentUser } = useAuth();
  const [club, setClub] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const fetchClubAndUserDetails = async () => {
      // Fetch the current user's nickname
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userNickname = userDoc.exists() ? userDoc.data().nickname : null;

      // Fetch club details
      const clubRef = doc(db, "clubs", clubId);
      const clubSnapshot = await getDoc(clubRef);
      if (clubSnapshot.exists()) {
        const clubData = clubSnapshot.data();
        setClub(clubData); // Set the club data in state

        // Check if the current user's nickname matches the admin's nickname

        setIsAdmin(clubData.adminNickname.includes(userNickname));
      } else {
        console.log("No such club!");
        setIsAdmin(false);
      }
    };

    if (currentUser) {
      fetchClubAndUserDetails();
    } else {
      setIsAdmin(false);
    }
  }, [clubId, currentUser, db]);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {isAdmin ? (
        // Render admin components
        <AdminDashboardPage />
      ) : (
        // Render regular user components
        <RegularUserDashboard />
      )}
    </div>
  );
};
export default ClubDashboardPage;
