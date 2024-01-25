import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useClubDetails } from "../hooks/useClubDetails";
import UpdateClubForm from "../components/UpdateClubForm";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";
const ClubHeader = ({ clubName }) => (
  <div className="text-xl font-bold">{clubName}</div>
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

const MemberList = ({ memberNicknames }) => (
  <ul className="list-disc pl-5 my-4">
    {memberNicknames.map((nickname, index) => (
      <li
        key={index}
        className="text-lg py-1 flex justify-between items-center"
      >
        {nickname}
        <button
          onClick={() => deleteMember(nickname)} // You need to pass the member's UID instead
          className="bg-red-500 text-white p-2 rounded"
        >
          Delete
        </button>
      </li>
    ))}
  </ul>
);
//toggle for join method
const JoinMethodToggle = ({
  selectedMethod,
  currentMethod,
  onMethodChange,
  onSave,
}) => (
  <div className="my-4">
    <div className="flex items-center mb-2">
      <label className="flex items-center mr-4">
        <input
          type="radio"
          name="joinMethod"
          value="open"
          checked={selectedMethod === "open"}
          onChange={() => onMethodChange("open")}
          className="mr-2"
        />
        Open to All
      </label>
      <label className="flex items-center">
        <input
          type="radio"
          name="joinMethod"
          value="approval"
          checked={selectedMethod === "approval"}
          onChange={() => onMethodChange("approval")}
          className="mr-2"
        />
        Approval Needed
      </label>
    </div>
    <div className="text-sm text-gray-600">Current method: {currentMethod}</div>
    <button
      onClick={onSave}
      className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
    >
      Save Changes
    </button>
  </div>
);
const AdminDashboardPage = () => {
  const { clubId } = useParams();
  const { club, loading, error, memberNicknames, re } = useClubDetails(clubId);
  const [selectedJoinMethod, setSelectedJoinMethod] = useState(
    club?.joiningMethod || "open"
  );
  const [currentJoinMethod, setCurrentJoinMethod] = useState("open"); // New state for current join method

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
      // Assuming clubId is available here
      const clubRef = doc(db, "clubs", clubId);
      await updateDoc(clubRef, updatedDetails);
      console.log("Club details updated successfully");
    } catch (error) {
      console.error("Error updating club details:", error);
    }
  };

  // Function to delete a member from the club
  const deleteMember = async (memberUid) => {
    const clubRef = doc(db, "clubs", clubId);
    try {
      await updateDoc(clubRef, {
        members: arrayRemove(memberUid),
      });
      console.log(`Member ${memberUid} removed successfully`);
      // Refetch the member list to update the UI
      await refetchMemberList();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };
  const handleJoinMethodChange = (method) => {
    setSelectedJoinMethod(method);
  };
  const handleSaveJoinMethod = async () => {
    const clubRef = doc(db, "clubs", clubId);
    try {
      await updateDoc(clubRef, { joiningMethod: selectedJoinMethod });
      console.log("Join method updated successfully");
      setCurrentJoinMethod(selectedJoinMethod);
    } catch (error) {
      console.error("Error updating join method:", error);
    }
  };

  return (
    <div className="admin-dashboard p-4 bg-gray-100 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
      {club && (
        <ClubHeader clubName={club.name} className="text-3xl font-bold mb-4" />
      )}
      <UpdateClubForm clubDetails={club} onUpdate={handleUpdateClubDetails} />
      <JoinMethodToggle
        selectedMethod={selectedJoinMethod}
        currentMethod={currentJoinMethod}
        onMethodChange={handleJoinMethodChange}
        onSave={handleSaveJoinMethod}
      />
      {adminNicknames.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Admins:</h3>
          <AdminList adminNicknames={adminNicknames} />
        </>
      )}
      <h3 className="text-xl font-semibold mt-6">Members:</h3>
      <MemberList memberNicknames={memberNicknames} />
      {/* Add more admin-specific components here */}
    </div>
  );
};

export default AdminDashboardPage;
