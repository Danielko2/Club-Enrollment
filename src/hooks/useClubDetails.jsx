import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
export const useClubDetails = (clubId) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clubId) {
      setError("No club ID provided");
      setLoading(false);
      return;
    }

    const fetchClubDetails = async () => {
      setLoading(true);
      try {
        const clubRef = doc(db, "clubs", clubId);
        const clubSnapshot = await getDoc(clubRef);
        if (clubSnapshot.exists()) {
          const data = clubSnapshot.data();
          const adminNicknamesArray = Array.isArray(data.adminNickname)
            ? data.adminNickname
            : data.adminNickname
            ? [data.adminNickname] // Make sure this is not undefined or null
            : []; // Default to an empty array if adminNickname is not present
          data.adminNicknames = adminNicknamesArray; // Note the plural 'nicknames' here
          setClub(data);
        } else {
          setError("Club does not exist");
        }
      } catch (err) {
        setError("Failed to fetch club details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  return { club, loading, error };
};
