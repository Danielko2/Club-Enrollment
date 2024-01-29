// PromoteMemberForm.js
import React, { useState } from "react";

const PromoteMemberForm = ({ members, onPromote, onCancel }) => {
  const [selectedMemberUid, setSelectedMemberUid] = useState("");

  return (
    <div className="promote-member-form bg-white p-4 rounded-lg shadow space-y-4">
      <select
        value={selectedMemberUid}
        onChange={(e) => setSelectedMemberUid(e.target.value)}
        className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select a member</option>
        {members.map((member) => (
          <option key={member.uid} value={member.uid}>
            {member.nickname}
          </option>
        ))}
      </select>
      <div className="flex justify-between space-x-4">
        <button
          onClick={() => onPromote(selectedMemberUid)}
          className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Promote to Admin
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PromoteMemberForm;
