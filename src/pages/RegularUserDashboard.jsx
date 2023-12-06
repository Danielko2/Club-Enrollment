import React from "react";
import { useParams } from "react-router-dom";
import { useClubDetails } from "../hooks/useClubDetails";

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

const RegularUserDashboard = () => {
  const { clubId } = useParams();
  const { club, loading, error } = useClubDetails(clubId);

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
      <ClubDetails club={club} />
      {adminNicknames.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Admins:</h3>
          <AdminList adminNicknames={adminNicknames} />
        </>
      )}
      {/* Add more user-specific components here */}
    </div>
  );
};

export default RegularUserDashboard;
