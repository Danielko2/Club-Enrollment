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
import SessionDisplay from "../components/SessionDisplay";
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
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  useEffect(() => {
    const checkMembership = () => {
      if (club && club.members && currentUser) {
        const isMember = club.members.some(
          (member) => member.uid === currentUser.uid
        );
        setHasJoined(isMember);
      }
    };

    checkMembership();
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
      setHasJoined(true);
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
      // Find the member object for the current user
      const clubSnap = await getDoc(clubRef);
      if (!clubSnap.exists()) {
        console.error("Club document does not exist!");
        return;
      }
      const clubData = clubSnap.data();
      const memberToRemove = clubData.members.find(
        (member) => member.uid === currentUser.uid
      );
      if (!memberToRemove) {
        console.error("Member not found in the club's member list!");
        return;
      }

      // Remove the member object from the club's members array
      await updateDoc(clubRef, {
        members: arrayRemove(memberToRemove),
      });
      setHasJoined(false); // Update local state to reflect the change
      console.log("Left club successfully");
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

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true); // Show the session details overlay
  };

  const closeSessionDetails = () => {
    setShowSessionDetails(false); // Hide the session details overlay
  };
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
      {/* Sessions List */}
      <h3 className="text-xl font-semibold mt-6">Sessions:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {club?.sessions.map((session, index) => (
          <div
            key={index}
            className="session-tile border p-4 cursor-pointer hover:shadow-lg"
            onClick={() => handleSessionSelect(session)}
          >
            <h3 className="font-bold">{session.name}</h3>
            <p>{new Date(session.date).toLocaleDateString()}</p>
            <p>{session.time}</p>
            {/* Add other brief details you want to show in the tile */}
          </div>
        ))}
      </div>

      {/* Session Details Overlay */}
      {showSessionDetails && (
        <div className="session-details-overlay">
          <SessionDisplay
            session={selectedSession}
            onClose={closeSessionDetails}
          />
        </div>
      )}
    </div>
  );
};

export default RegularUserDashboard;
