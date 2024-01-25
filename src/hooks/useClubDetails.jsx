import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { onSnapshot } from "firebase/firestore";
export const useClubDetails = (clubId) => {
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberNicknames, setMemberNicknames] = useState([]);

  // Function to fetch member nicknames based on UIDs
  const fetchMemberNicknames = async (members) => {
    const nicknames = await Promise.all(
      members.map(async (member) => {
        const userRef = doc(db, "users", member.uid);
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

    const unsubscribe = onSnapshot(
      doc(db, "clubs", clubId),
      (docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          setClub(data);

          // Extract and set the adminNicknames
          const adminNicknames = Array.isArray(data.adminNickname)
            ? data.adminNickname
            : [data.adminNickname].filter(Boolean);
          data.adminNicknames = adminNicknames;

          // Fetch and set the memberNicknames if members exist
          if (data.members && Array.isArray(data.members)) {
            const memberNicknamesArray = data.members.map(
              (member) => member.nickname
            );
            setMemberNicknames(memberNicknamesArray);
          }
          setLoading(false);
        } else {
          setError("Club does not exist");
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError("Failed to fetch club details");
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [clubId]);

  return { club, loading, error, memberNicknames };
};
