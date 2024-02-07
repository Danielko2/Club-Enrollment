import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import necessary Firestore functions
import { db } from "../config/firebase-config";
import { useAuth } from "../hooks/AuthContext";
const PayPalComponent = ({ amount, clubId, sessionId, onPaymentSuccess }) => {
  const { currentUser } = useAuth();

  const handlePaymentSuccess = async () => {
    // Fetch the club document
    const clubRef = doc(db, "clubs", clubId);
    const clubSnap = await getDoc(clubRef);

    if (!clubSnap.exists()) {
      console.error("Club does not exist!");
      return;
    }

    const clubData = clubSnap.data();
    const sessions = clubData.sessions;

    // Find the session and update the 'paid' status for the current user
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) {
      console.error("Session does not exist!");
      return;
    }

    const updatedParticipants = sessions[sessionIndex].participants.map(
      (participant) => {
        if (participant.uid === currentUser.uid) {
          return { ...participant, paid: true }; // Update the 'paid' property to true
        }
        return participant;
      }
    );

    // Update the specific session's participants in the sessions array
    sessions[sessionIndex].participants = updatedParticipants;

    // Update the club document with the new sessions array
    await updateDoc(clubRef, {
      sessions: sessions,
    });

    // Call the function passed in as a prop

    onPaymentSuccess();
  };

  return (
    <PayPalScriptProvider
      options={{
        "client-id":
          "AaXGJYN5rDvypOMCv3kJtbohno_OkRMWegaYpLnHiNM7OMrZX97mU1lqUNSMjA6dPCEUVPzjkxQ6mzjQ",
      }}
    >
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount, // Use the amount passed in as a prop
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          return actions.order.capture().then(async (details) => {
            alert(`Transaction completed by ${details.payer.name.given_name}`);
            await handlePaymentSuccess(); // Call the function to update the 'paid' status
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalComponent;
