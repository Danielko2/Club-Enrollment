import React from "react";
import { auth } from "../config/firebase-config";
import PayPalComponent from "../components/PayPalComponent"; // Import the PayPalComponent
import { useState } from "react";
import GoogleMapReact from "google-map-react";
const SessionDisplay = ({
  session,
  onClose,
  onJoin,
  canJoin,
  onLeave,
  clubId,
}) => {
  if (!session) return <div>Select a session to see the details</div>;
  const currentUser = auth.currentUser;
  // Determine if the session is online based on whether a link is provided
  const isOnlineSession = session.link && session.link.trim() !== "";
  const isParticipant = session.participants.some(
    (p) => p.uid === currentUser?.uid
  );
  const isPaid = session.participants.some(
    (participant) => participant.uid === currentUser?.uid && participant.paid
  );
  const handlePaymentSuccess = () => {
    setUserHasPaid(true); // Update the local state to reflect that the user has paid
  };
  const [userHasPaid, setUserHasPaid] = useState(isPaid);

  const SessionLocationMap = ({ sessionDetails }) => {
    const createMapOptions = (maps) => {
      return {
        disableDefaultUI: false,
        mapTypeControl: true,
        streetViewControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      };
    };

    const handleApiLoaded = ({ map, maps }) => {
      const { lat, lng, name } = sessionDetails.marker;

      // Create an advanced marker on the map
      // Note: Based on the current API, you should use 'new maps.Marker' or 'new maps.AdvancedMarkerView'

      const advancedMarker = new maps.Marker({
        position: { lat, lng },
        map,
        title: name,
      });

      // Add any additional options that AdvancedMarkerElement supports

      // Add a click event listener to the advanced marker
      advancedMarker.addListener("click", function () {
        // Construct the Google Maps URL with directions
        const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        // Open the URL in a new tab/window
        window.open(directionUrl, "_blank");
      });
    };

    return (
      <div style={{ height: "400px", width: "100%" }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyA6L3TeotodM-MldE9-l16zvbGGbnyEFTo" }}
          defaultCenter={{
            lat: sessionDetails.marker.lat,
            lng: sessionDetails.marker.lng,
          }}
          defaultZoom={11}
          options={createMapOptions}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={handleApiLoaded}
        />
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg m-4 max-w-xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold"
          aria-label="Close session details"
        >
          &times;
        </button>
        <h2 className="font-bold text-xl mb-2">{session.name}</h2>
        <p>
          <strong>Date:</strong> {session.date}
        </p>
        <p>
          <strong>Time:</strong> {session.time}
        </p>
        {/* Conditionally render link or location */}
        {isOnlineSession ? (
          <p>
            <strong>Link:</strong>{" "}
            <a href={session.link} target="_blank" rel="noopener noreferrer">
              Join Session
            </a>
          </p>
        ) : (
          <p>
            <strong>Location:</strong> {session.location}
          </p>
        )}
        <p>
          <strong>Description:</strong> {session.description}
        </p>
        <p>
          <strong>Participants:</strong>
        </p>
        <ul>
          {session.participants &&
            session.participants.map((participant, index) => (
              <li key={index}>{participant.nickname}</li>
            ))}
        </ul>
        {isParticipant && !userHasPaid ? (
          <div className="items-center text-center">
            <p>
              You have joined the session. Please proceed with the payment.{" "}
              {session.fee}$ will be charged.
            </p>
            <PayPalComponent
              amount={session.fee}
              clubId={clubId} // Pass the current club ID
              sessionId={session.id}
              onPaymentSuccess={handlePaymentSuccess}
            />
            <SessionLocationMap sessionDetails={session} />
            <button
              onClick={() => onLeave(session)}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded "
            >
              Leave Session
            </button>
          </div>
        ) : null}

        {isParticipant && userHasPaid ? (
          <div className="text-center">
            <div className="text-green-500">
              You have paid for this session. Thank you!
            </div>
            <button
              onClick={() => onLeave(session)}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Leave Session
            </button>
          </div>
        ) : null}

        {!isParticipant && canJoin ? (
          <button
            onClick={() => onJoin(session)}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Join Session
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SessionDisplay;
