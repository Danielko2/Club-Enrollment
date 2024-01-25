import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const useClubDetails = (clubId) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberNicknames, setMemberNicknames] = useState([]);

  // Function to fetch member nicknames based on UIDs
  const fetchMemberNicknames = async (memberUids) => {
    const nicknames = await Promise.all(
      memberUids.map(async (uid) => {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data().nickname : null;
      })
    );
    return nicknames.filter((n) => n); // Filter out null values
  };

  // Function to refetch the member nicknames list
  // const refetchMemberList = async () => {
  //   try {
  //     const clubRef = doc(db, "clubs", clubId);
  //     const clubSnapshot = await getDoc(clubRef);
  //     if (clubSnapshot.exists()) {
  //       const data = clubSnapshot.data();
  //       if (data.members) {
  //         const memberNicknamesArray = await fetchMemberNicknames(
  //           data.members.nickname
  //         );
  //         setMemberNicknames(memberNicknamesArray); // Update only memberNicknames state
  //       }
  //     } else {
  //       setError("Club does not exist");
  //     }
  //   } catch (err) {
  //     setError("Failed to fetch club members");
  //     console.error(err);
  //   }
  // };

  // Effect to fetch club details and member nicknames
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
          data.adminNicknames = adminNicknamesArray; // Add adminNicknames to the club data
          setClub(data);
          console.log(data);
          // Fetch member nicknames if members array exists
          if (data.members) {
            const memberNicknamesArray = await fetchMemberNicknames(
              data.members
            );
            setMemberNicknames(memberNicknamesArray);
          }
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

  return { club, loading, error, memberNicknames };
};
