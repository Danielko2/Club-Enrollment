import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useClubDetails } from "../hooks/useClubDetails";
import { auth } from "../config/firebase-config";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase-config";
const ClubHeader = ({ clubName }) => (
  <div className="text-3xl font-bold text-center my-6">{clubName} </div>
);

const AdminList = ({ adminNicknames }) => (
  <ul className="list-disc pl-5 my-4">
    {adminNicknames.map((nickname, index) => (
      <li key={index} className="text-lg py-1">
        {nickname}
      </li> // Display the nickname
    ))}
  </ul>
);

const ClubDetails = ({ club }) => (
  <div className="bg-white rounded-lg p-6 shadow-lg my-4">
    <h3 className="text-xl font-semibold">Description:</h3>
    <p className="text-gray-600 mt-2">{club.description}</p>
    <h3 className="text-xl font-semibold mt-4">Location:</h3>
    <p className="text-gray-600 mt-2">{club.location}</p>
    <h3 className="text-xl font-semibold mt-4">Meeting Types:</h3>
    <p className="text-gray-600 mt-2">{club.meetingType}</p>
  </div>
);

const MemberList = ({ memberNicknames }) => (
  <ul className="list-disc pl-5 my-4">
    {memberNicknames.map((nickname, index) => (
      <li key={index} className="text-lg py-1">
        {nickname}
      </li>
    ))}
  </ul>
);

const RegularUserDashboard = () => {
  const { clubId } = useParams();
  const { club, loading, error, memberNicknames } = useClubDetails(clubId);
  const currentUser = auth.currentUser;
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (club && club.members && currentUser) {
      setHasJoined(club.members.includes(currentUser.uid));
    }
  }, [club, currentUser]);

  const joinClub = async () => {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error("User document does not exist!");
      return;
    }
    const userNickname = userSnap.data().nickname;

    const clubRef = doc(db, "clubs", clubId);
    try {
      await updateDoc(clubRef, {
        members: arrayUnion({ uid: currentUser.uid, nickname: userNickname }),
      });
      console.log("Joined club successfully");
      // refetchMemberList();
    } catch (error) {
      console.error("Error joining club:", error);
    }
  };
  const leaveClub = async () => {
    if (!currentUser) {
      console.error("No user is signed in to leave the club");
      return;
    }

    const clubRef = doc(db, "clubs", clubId);
    try {
      // Remove the current user's UID from the club's members array
      await updateDoc(clubRef, {
        members: arrayRemove(currentUser.uid),
      });
      setHasJoined(false); // Update local state to reflect the change
      console.log("Left club successfully");
      // refetchMemberList();
    } catch (error) {
      console.error("Error leaving club:", error);
    }
  };
  if (loading) return <div className="text-center text-xl">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-xl text-red-500">Error: {error}</div>
    );

  const adminNicknames = Array.isArray(club?.adminNicknames)
    ? club.adminNicknames
    : [];

  return (
    <div className="user-dashboard mx-auto max-w-4xl p-6">
      {club && <ClubHeader clubName={club.name} />}
      {adminNicknames.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Admins:</h3>
          <AdminList adminNicknames={adminNicknames} />
        </>
      )}
      {club && <ClubDetails club={club} />}
      <h3 className="text-xl font-semibold mt-6">Members:</h3>
      <MemberList memberNicknames={memberNicknames} />
      {/* Join/Leave Club Button */}
      {!hasJoined ? (
        <button
          onClick={joinClub}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Join Club
        </button>
      ) : (
        <button
          onClick={leaveClub}
          className="bg-red-500 text-white p-2 rounded"
        >
          Leave Club
        </button>
      )}
      {/* Display user's membership status */}
      {hasJoined ? (
        <div>You are a member of this club.</div>
      ) : (
        <div>You are not a member of this club.</div>
      )}
    </div>
  );
};

export default RegularUserDashboard;
