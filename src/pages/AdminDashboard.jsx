import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useClubDetails } from "../hooks/useClubDetails";
import UpdateClubForm from "../components/UpdateClubForm";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { arrayRemove } from "firebase/firestore";
import CreateSessionForm from "../components/CreateSessionForm";
import PromoteMemberForm from "../components/PromoteMemberForm";
import SessionEditForm from "../components/SessionEditForm";
import ChatComponent from "../components/ChatComponent";
const ClubHeader = ({ clubName }) => (
  <div className="text-xl font-bold text-center">{clubName}</div>
);

const AdminList = ({ adminNicknames, onDemoteAdmin }) => (
  <ul className="list-disc pl-5 my-4">
    {adminNicknames.map((nickname, index) => (
      <li
        key={index}
        className="text-lg py-1 flex justify-between items-center"
      >
        {nickname}
        {adminNicknames.length > 1 && ( // Prevent the last admin from being demoted
          <button
            onClick={() => onDemoteAdmin(nickname)}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white p-2 rounded focus:outline-none focus:shadow-outline"
          >
            Demote
          </button>
        )}
      </li>
    ))}
  </ul>
);

const MemberList = ({ members, onDeleteMember }) => (
  <ul className="list-disc pl-5 my-4">
    {members.map((member, index) => (
      <li key={index} className="flex  items-center py-1">
        <span className="text-lg">{member.nickname}</span>
        <button
          onClick={() => onDeleteMember(member.nickname)}
          className="ml-2 bg-red-500 text-white p-2 rounded"
        >
          Delete
        </button>
      </li>
    ))}
  </ul>
);

const AdminDashboardPage = () => {
  const { clubId } = useParams();
  const { club, loading, error, memberNicknames, re } = useClubDetails(clubId);
  const [selectedJoinMethod, setSelectedJoinMethod] = useState(
    club?.joiningMethod || "open"
  );
  const [currentJoinMethod, setCurrentJoinMethod] = useState("open"); // New state for current join method
  const [updateStatus, setUpdateStatus] = useState({ success: "", error: "" });
  const [showCreateSessionForm, setShowCreateSessionForm] = useState(false);
  const [showPromoteMemberForm, setShowPromoteMemberForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("clubDetails");
  const [selectedSession, setSelectedSession] = useState(null);
  const getPaidParticipantCount = (session) => {
    return session.participants.filter((p) => p.paid).length;
  };
  const [showChat, setShowChat] = useState(false);
  useEffect(() => {
    if (club && club.joiningMethod) {
      setSelectedJoinMethod(club.joiningMethod);
      setCurrentJoinMethod(club.joiningMethod);
    }
  }, [club]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const adminNicknames = Array.isArray(club?.adminNicknames)
    ? club.adminNicknames
    : [];

  const handleUpdateClubDetails = async (updatedDetails) => {
    try {
      const clubRef = doc(db, "clubs", clubId);
      await updateDoc(clubRef, updatedDetails);
      console.log("Club details updated successfully");
      setUpdateStatus({
        success: "Club details updated successfully!",
        error: "",
      });
      // Reset the success message after a few seconds
      setTimeout(() => setUpdateStatus({ success: "", error: "" }), 3000);
    } catch (error) {
      console.error("Error updating club details:", error);
      setUpdateStatus({
        success: "",
        error: "Error updating club details. Please try again.",
      });
      // Reset the error message after a few seconds
      setTimeout(() => setUpdateStatus({ success: "", error: "" }), 3000);
    }
  };

  const deleteMember = async (memberNickname) => {
    // First, get the member object to remove
    const memberToRemove = club.members.find(
      (member) => member.nickname === memberNickname
    );
    if (!memberToRemove) {
      console.error("Member not found in the club's member list!");
      return;
    }

    const clubRef = doc(db, "clubs", clubId);
    try {
      await updateDoc(clubRef, {
        members: arrayRemove(memberToRemove),
      });
      console.log(`Member ${memberNickname} removed successfully`);
      // Update the local state to remove the member from the list
      setMemberNicknames((prevNicknames) =>
        prevNicknames.filter((nickname) => nickname !== memberNickname)
      );
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleAddSessionClick = () => {
    setShowCreateSessionForm(true);
  };

  const handleCancel = () => {
    setShowCreateSessionForm(false);
  };

  const promoteMemberToAdmin = async (memberUid) => {
    // Assuming clubId is available in scope
    const clubRef = doc(db, "clubs", clubId);
    const clubSnap = await getDoc(clubRef);

    if (!clubSnap.exists()) {
      console.error("Club document does not exist!");
      return;
    }

    const clubData = clubSnap.data();
    let adminNicknames = clubData.adminNickname; // This should now be an array in Firestore

    // If it's not an array, make it an array
    if (!Array.isArray(adminNicknames)) {
      adminNicknames = []; // Start with an empty array if no adminNicknames field exists
    }

    // Fetch the member's nickname using the UID
    const memberRef = doc(db, "users", memberUid);
    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) {
      console.error("User document does not exist!");
      return;
    }
    const memberNickname = memberSnap.data().nickname;

    // Check if the member is already an admin
    if (adminNicknames.includes(memberNickname)) {
      console.error("Member is already an admin");
      return;
    }

    // Add the new admin's nickname to the array
    adminNicknames.push(memberNickname);

    // Update the club's 'adminNickname' field in Firestore
    await updateDoc(clubRef, {
      adminNickname: adminNicknames,
    });

    console.log(
      `Member with nickname ${memberNickname} promoted to admin successfully`
    );
  };

  const onDemoteAdmin = async (adminNickname) => {
    const clubRef = doc(db, "clubs", clubId);
    try {
      const clubSnap = await getDoc(clubRef);

      if (clubSnap.exists()) {
        const clubData = clubSnap.data();
        let adminNicknames = clubData.adminNickname; // This should be an array in Firestore

        // Check if the admin is in the list and remove the admin's nickname
        if (adminNicknames.includes(adminNickname)) {
          adminNicknames = adminNicknames.filter(
            (nick) => nick !== adminNickname
          );

          // Update the club's 'adminNickname' field in Firestore
          await updateDoc(clubRef, {
            adminNickname: adminNicknames,
          });

          // Update local state
          setAdminNicknames(adminNicknames); // Assuming you have a state called adminNicknames

          console.log(`Admin ${adminNickname} has been demoted.`);
        } else {
          console.error("Admin not found in the list!");
        }
      } else {
        console.error("Club document does not exist!");
      }
    } catch (error) {
      console.error("Error demoting admin:", error);
    }
  };

  const handleEditSession = (sessionId) => {
    const session = club.sessions.find((s) => s.id === sessionId);
    setEditingSession(session);
    // No need to set an index anymore
  };

  const handleDeleteSession = async (session) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the session: ${session.name}?`
      )
    ) {
      return; // Don't delete if the user cancels the action.
    }

    try {
      const updatedSessions = club.sessions.filter((s) => s.id !== session.id); // Remove the session at the given index
      const clubRef = doc(db, "clubs", clubId);
      await updateDoc(clubRef, { sessions: updatedSessions });
      console.log("Session deleted successfully");
      // You might want to update your state here if you store sessions in the local state as well.
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };
  const nonAdminMembers = club.members.filter(
    (member) => !adminNicknames.includes(member.nickname)
  );
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Enhanced Sidebar */}
      <div className="flex flex-col w-64 bg-gray-900 text-gray-100 p-4 space-y-6">
        {/* Club Name and Action Buttons */}
        <div>
          <h1 className="text-2xl font-bold text-center text-white mb-4">
            {club?.name}
          </h1>
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
                activeTab === "sessions" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("sessions")}
            >
              Sessions
            </li>
            <li
              className={`p-2 rounded hover:bg-gray-700 ${
                activeTab === "members" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("members")}
            >
              Members
            </li>
            <li
              className={`p-2 rounded hover:bg-gray-700 ${
                activeTab === "chat" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content area based on active tab */}
      <div className="flex-grow p-4 overflow-auto">
        {activeTab === "clubDetails" && (
          <>
            {club && (
              <ClubHeader
                clubName={club.name}
                className="text-3xl font-bold mb-4"
              />
            )}
            {updateStatus.success && (
              <div className="text-green-500 text-sm font-bold my-2">
                {updateStatus.success}
              </div>
            )}
            {updateStatus.error && (
              <div className="text-red-500 text-sm font-bold my-2">
                {updateStatus.error}
              </div>
            )}
            <UpdateClubForm
              clubDetails={club}
              onUpdate={handleUpdateClubDetails}
            />
          </>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <>
            <h1 className="text-4xl font-bold text-center">Sessions</h1>
            <p className="text-xl mt-2 text-center">
              Manage and create your sessions here.
            </p>

            {/* Add Session Button and Form */}
            {showCreateSessionForm ? (
              <CreateSessionForm
                clubId={clubId}
                onCancel={() => setShowCreateSessionForm(false)}
                onSessionCreated={() => {
                  setShowCreateSessionForm(false);
                  // Logic to refresh or update the session list
                }}
              />
            ) : (
              <button
                onClick={() => setShowCreateSessionForm(true)}
                className="bg-blue-500 text-white p-2 rounded mt-4"
              >
                Add Session
              </button>
            )}

            {/* Sessions List with Payment Information */}
            {!editingSession ? (
              // Render the list of sessions with an edit button
              <div className="sessions-list">
                {club.sessions && club.sessions.length > 0 ? (
                  club.sessions.map((session, index) => (
                    <div
                      key={index}
                      className=" session-item flex justify-between items-center p-2 bg-white my-2 rounded shadow"
                    >
                      <span className="session-name text-black">
                        {session.name}
                      </span>
                      <span className="session-date text-black">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span className="group relative flex items-center cursor-pointer">
                        <span className="session-participants text-black">
                          {getPaidParticipantCount(session)} /{" "}
                          {session.participants.length} have paid
                        </span>

                        {/* This is the tooltip that shows on hover over the participant count */}
                        <div className="participant-info absolute left-full w-56 ml-2 p-2 bg-gray-100 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10">
                          <div className="text-gray-800">
                            <strong>Paid:</strong>
                            <ul>
                              {session.participants
                                .filter((p) => p.paid)
                                .map((p, index) => (
                                  <li key={index}>{p.nickname}</li>
                                ))}
                            </ul>
                          </div>
                          <div className="text-gray-800">
                            <strong>Not Paid:</strong>
                            <ul>
                              {session.participants
                                .filter((p) => !p.paid)
                                .map((p, index) => (
                                  <li key={index}>{p.nickname}</li>
                                ))}
                            </ul>
                          </div>
                        </div>
                      </span>
                      <button
                        onClick={() => handleEditSession(session.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <div>No sessions available.</div>
                )}
              </div>
            ) : (
              // Render the edit form for the selected session
              <SessionEditForm
                session={editingSession}
                clubId={clubId}
                onSave={() => {
                  setEditingSession(null); // Clear the editing session
                  setEditingSessionIndex(null); // Clear the session index
                }}
                onCancel={() => {
                  setEditingSession(null); // Clear the editing session
                  setEditingSessionIndex(null); // Clear the session index
                }}
              />
            )}
          </>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <>
            <h1 className="text-4xl font-bold text-center">Members</h1>
            <p className="text-xl mt-2 text-center">
              Manage your club members and admins here.
            </p>

            {/* Admin List */}
            {adminNicknames.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mt-6">Admins:</h3>
                <AdminList
                  adminNicknames={adminNicknames}
                  onDemoteAdmin={onDemoteAdmin}
                />
              </>
            )}

            {/* Promote Member Button */}
            {/* Promote Member Button */}
            {showPromoteMemberForm ? (
              <PromoteMemberForm
                members={nonAdminMembers} // Pass non-admin members here
                onPromote={promoteMemberToAdmin}
                onCancel={() => setShowPromoteMemberForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowPromoteMemberForm(true)}
                className="bg-blue-500 text-white p-2 rounded mt-4"
              >
                Promote Member
              </button>
            )}

            {/* Member List */}
            <h3 className="text-xl font-semibold mt-6">Members:</h3>
            {club && club.members && Array.isArray(club.members) ? (
              <MemberList
                members={club.members}
                onDeleteMember={deleteMember}
              />
            ) : (
              <div>No members found.</div>
            )}
          </>
        )}
        {activeTab === "chat" && <ChatComponent clubId={clubId} />}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
