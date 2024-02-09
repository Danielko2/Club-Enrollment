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
import ChatComponent from "../components/ChatComponent";
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
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 my-4">
    <h3 className="text-2xl font-semibold text-gray-900 border-b pb-2 mb-4">
      Club Details
    </h3>
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-800">Description:</h4>
        <p className="text-gray-600 mt-1">
          {club.description || "Not provided"}
        </p>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-800">Location:</h4>
        <p className="text-gray-600 mt-1">{club.location || "Not provided"}</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-800">Meeting Types:</h4>
        <p className="text-gray-600 mt-1">
          {club.meetingType || "Not provided"}
        </p>
      </div>
    </div>
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
  const isUserLoggedIn = auth.currentUser != null;
  const [activeTab, setActiveTab] = useState("clubDetails");
  const [loginPrompt, setLoginPrompt] = useState("");
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
    if (!currentUser) {
      // If the user is not logged in, set a prompt message
      setLoginPrompt("You must be logged in to join the club.");
      return;
    }
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
  const handleJoinSession = async (sessionToJoin) => {
    if (!isUserLoggedIn) {
      console.error("User must be logged in to join a session");
      return;
    }

    // Find the index of the session to join in the club.sessions array
    const sessionIndex = club.sessions.findIndex((s) => {
      return (
        s.name === sessionToJoin.name &&
        s.date === sessionToJoin.date &&
        s.time === sessionToJoin.time
      );
    });

    // Fetch the user's nickname
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error("User document does not exist!");
      return;
    }
    const userNickname = userSnap.data().nickname;
    // If the session isn't found or the session is at full capacity, don't proceed
    if (
      sessionIndex === -1 ||
      club.sessions[sessionIndex].participants.length >= sessionToJoin.capacity
    ) {
      console.error("Session not found or is at full capacity");
      return;
    }

    // Create a new participant object
    const newParticipant = {
      uid: currentUser.uid,
      nickname: userNickname,
      paid: false, // Set the nickname to the user's nickname
    };

    // Create a new array with the new participant added
    const updatedParticipants = [
      ...club.sessions[sessionIndex].participants,
      newParticipant,
    ];

    try {
      // Update the session with the new list of participants
      const updatedSession = {
        ...club.sessions[sessionIndex],
        participants: updatedParticipants,
      };
      const clubRef = doc(db, "clubs", clubId);
      // Construct a new sessions array with the updated session
      const updatedSessions = [
        ...club.sessions.slice(0, sessionIndex),
        updatedSession,
        ...club.sessions.slice(sessionIndex + 1),
      ];
      await updateDoc(clubRef, { sessions: updatedSessions });

      setSelectedSession(updatedSession); // Update the local state to reflect the changes immediately
      console.log("Joined session successfully");
    } catch (error) {
      console.error("Error joining session:", error);
    }
  };

  const canJoinSession = (session) => {
    return isUserLoggedIn && session.participants.length < session.capacity;
  };
  const handleLeaveSession = async (sessionToLeave) => {
    if (!isUserLoggedIn) {
      console.error("User must be logged in to leave a session");
      return;
    }

    // Ask the user if they are sure they want to leave the session
    const isConfirmed = window.confirm(
      "Are you sure you want to leave the session?"
    );
    if (!isConfirmed) {
      // If the user cancels, early return to stop further execution
      return;
    }

    // Find the index of the session to leave in the club.sessions array
    const sessionIndex = club.sessions.findIndex((s) => {
      return (
        s.name === sessionToLeave.name &&
        s.date === sessionToLeave.date &&
        s.time === sessionToLeave.time
      );
    });

    if (sessionIndex === -1) {
      console.error("Session not found");
      return;
    }

    // Find the participant index
    const participantIndex = club.sessions[sessionIndex].participants.findIndex(
      (p) => p.uid === currentUser.uid
    );

    if (participantIndex === -1) {
      console.error("Current user is not a participant in this session");
      return;
    }

    // Create a new participants array without the current user
    const updatedParticipants = [
      ...club.sessions[sessionIndex].participants.slice(0, participantIndex),
      ...club.sessions[sessionIndex].participants.slice(participantIndex + 1),
    ];

    try {
      // Update the Firestore document
      const clubRef = doc(db, "clubs", clubId);
      const updatedSession = {
        ...club.sessions[sessionIndex],
        participants: updatedParticipants,
      };
      const updatedSessions = [
        ...club.sessions.slice(0, sessionIndex),
        updatedSession,
        ...club.sessions.slice(sessionIndex + 1),
      ];

      await updateDoc(clubRef, { sessions: updatedSessions });

      // Update the local state to reflect the changes immediately
      const newSessionsState = [...club.sessions];
      newSessionsState[sessionIndex].participants = updatedParticipants;
      setSelectedSession(updatedSession);
      console.log("Left session successfully");
    } catch (error) {
      console.error("Error leaving session:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Enhanced Sidebar */}

      <div className="flex flex-col w-64 bg-gray-900 text-gray-100 p-4 space-y-6">
        {/* Club Name and Action Buttons */}
        {/* Display login prompt message if set */}
        {loginPrompt && (
          <div className="text-center text-xl text-red-500">{loginPrompt}</div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-center text-white mb-4">
            {club.name}
          </h1>
          {!hasJoined ? (
            <button
              onClick={joinClub}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Join Club
            </button>
          ) : (
            <button
              onClick={leaveClub}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Leave Club
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="flex flex-col space-y-2">
            <li
              className={`p-2 rounded hover:bg-gray-700 ${
                activeTab === "clubDetails" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("clubDetails")}
            >
              Club Details
            </li>
            <li
              className={`p-2 rounded hover:bg-gray-700 ${
                activeTab === "members" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("members")}
            >
              Members
            </li>
            {isUserLoggedIn && hasJoined && (
              <>
                <li
                  className={`p-2 rounded hover:bg-gray-700 ${
                    activeTab === "sessions" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("sessions")}
                >
                  Sessions
                </li>
                <li
                  className={`p-2 rounded hover:bg-gray-700 ${
                    activeTab === "chat" ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-grow p-4 overflow-auto">
        {/* Content based on active tab */}
        {activeTab === "clubDetails" && (
          <>
            <ClubHeader clubName={club?.name} />
            <ClubDetails club={club} />
          </>
        )}

        {activeTab === "members" && (
          <>
            <h3 className="text-xl font-semibold">Admins:</h3>
            <AdminList adminNicknames={adminNicknames} />
            <h3 className="text-xl font-semibold">Members:</h3>
            <MemberList memberNicknames={memberNicknames} />
          </>
        )}

        {activeTab === "sessions" && isUserLoggedIn && hasJoined && (
          <>
            <h3 className="text-xl font-semibold">Sessions:</h3>
            {/* Sessions List */}
            {club?.sessions && club.sessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {club.sessions.map((session, index) => (
                  <div
                    key={index}
                    className="session-tile border p-4 cursor-pointer hover:shadow-lg"
                    onClick={() => handleSessionSelect(session)}
                  >
                    <h3 className="font-bold">{session.name}</h3>
                    <p>{new Date(session.date).toLocaleDateString()}</p>
                    <p>{session.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>No sessions found.</div>
            )}
          </>
        )}

        {activeTab === "chat" && hasJoined && isUserLoggedIn && (
          <ChatComponent clubId={clubId} />
        )}

        {/* Session Details Overlay */}
        {showSessionDetails && selectedSession && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
            <SessionDisplay
              session={selectedSession}
              onClose={closeSessionDetails}
              onJoin={handleJoinSession}
              onLeave={handleLeaveSession}
              canJoin={canJoinSession(selectedSession)}
              clubId={clubId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RegularUserDashboard;
