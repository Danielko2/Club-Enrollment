import React from "react";
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

const AdminDashboardPage = () => {
  const { clubId } = useParams();
  const { club, loading, error } = useClubDetails(clubId);

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
      // You may want to refetch the club details to update the UI
    } catch (error) {
      console.error("Error updating club details:", error);
    }
  };

  return (
    <div className="admin-dashboard p-4 bg-gray-100 rounded-lg shadow-md max-w-4xl mx-auto mt-10">
      {club && (
        <ClubHeader clubName={club.name} className="text-3xl font-bold mb-4" />
      )}
      <UpdateClubForm clubDetails={club} onUpdate={handleUpdateClubDetails} />
      {adminNicknames.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Admins:</h3>
          <AdminList adminNicknames={adminNicknames} />
        </>
      )}
      {/* Add more admin-specific components here */}
    </div>
  );
};

export default AdminDashboardPage;
