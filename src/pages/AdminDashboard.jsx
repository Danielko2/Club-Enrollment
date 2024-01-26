import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useClubDetails } from "../hooks/useClubDetails";
import UpdateClubForm from "../components/UpdateClubForm";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
import { arrayRemove } from "firebase/firestore";
import CreateSessionForm from "../components/CreateSessionForm";

const ClubHeader = ({ clubName }) => (
  <div className="text-xl font-bold text-center">{clubName}</div>
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

const MemberList = ({ members, onDeleteMember }) => (
  <ul className="list-disc pl-5 my-4">
    {members.map((member, index) => (
      <li
        key={index}
        className="text-lg py-1 flex justify-between items-center"
      >
        {member.nickname}
        <button
          onClick={() => onDeleteMember(member.nickname)}
          className="bg-red-500 text-white p-2 rounded"
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
  return (
    <div className="admin-dashboard p-4 bg-gray-100 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
      {club && (
        <ClubHeader clubName={club.name} className="text-3xl font-bold mb-4" />
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
      <UpdateClubForm clubDetails={club} onUpdate={handleUpdateClubDetails} />

      {adminNicknames.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Admins:</h3>
          <AdminList adminNicknames={adminNicknames} />
        </>
      )}
      <h3 className="text-xl font-semibold mt-6">Members:</h3>
      {club && club.members && Array.isArray(club.members) ? (
        <MemberList members={club.members} onDeleteMember={deleteMember} />
      ) : (
        <div>No members found.</div>
      )}
      <div className="bg-gray-800 text-white text-center py-6">
        <h1 className="text-4xl font-bold">Sessions</h1>
        <p className="text-xl mt-2">
          Manage and create your D&D sessions here.
        </p>
        {showCreateSessionForm ? (
          <CreateSessionForm clubId={clubId} onCancel={handleCancel} />
        ) : (
          <button
            onClick={handleAddSessionClick}
            className="bg-blue-500 text-white p-2 rounded bg-center bg-cover mt-4"
          >
            Add Session
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
