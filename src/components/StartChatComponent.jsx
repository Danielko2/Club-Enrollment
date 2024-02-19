import React, { useState, useEffect, useRef } from "react";
import { db } from "../config/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../hooks/AuthContext";
import defaultProfilePic from "../assets/default-avatar.png";
const StartChatComponent = ({ clubId }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser, nickname } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    // Fetch all members of the specific club from the 'clubs' collection
    const fetchClubMembers = async () => {
      const clubRef = doc(db, "clubs", clubId);
      const clubSnap = await getDoc(clubRef);

      if (clubSnap.exists()) {
        const clubData = clubSnap.data();
        const memberIds = clubData.members.map((member) => member.uid);
        const memberDetails = await Promise.all(
          memberIds.map(async (id) => {
            const userRef = doc(db, "users", id);
            const userSnap = await getDoc(userRef);
            return userSnap.exists()
              ? { id: userSnap.id, ...userSnap.data() }
              : null;
          })
        );
        setClubMembers(
          memberDetails.filter((user) => user && user.id !== currentUser.uid)
        );
      }
    };

    fetchClubMembers();
  }, [clubId, currentUser]);
  useEffect(() => {
    // This will run every time the 'messages' array changes, which includes when
    // a new message is added to the chat.
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const startOrGetChat = async (otherUserId) => {
    const clubChatsRef = collection(db, "clubs", clubId, "privateChats");
    const q = query(
      clubChatsRef,
      where("participants", "array-contains", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    let chatRef;

    const existingChat = querySnapshot.docs.find((doc) =>
      doc.data().participants.includes(otherUserId)
    );

    if (existingChat) {
      console.log("Chat already exists: ", existingChat.id);
      chatRef = existingChat.ref;
    } else {
      // Create a new chat if one doesn't exist
      const newChatDoc = await addDoc(clubChatsRef, {
        participants: [currentUser.uid, otherUserId],
        messages: [],
      });
      console.log("New chat started: ", newChatDoc.id);
      chatRef = newChatDoc;
    }

    setCurrentChatId(chatRef.id);
    // Subscribe to chat messages
    const messagesRef = collection(chatRef, "messages");
    const unsubscribe = onSnapshot(
      query(messagesRef, orderBy("createdAt", "asc")),
      (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(fetchedMessages);
      }
    );

    // Clean up subscription on unmount
    return unsubscribe;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      const messagesRef = collection(
        db,
        "clubs",
        clubId,
        "privateChats",
        currentChatId,
        "messages"
      );

      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: currentUser.uid,
        nickname: nickname,
        photoURL: currentUser.photoURL || defaultProfilePic, // Use the currentUser's photoURL or a default if not available
      });

      setNewMessage("");
      scrollToBottom();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="flex w-full max-w-md mx-auto my-4 bg-gray-200 rounded-xl shadow-lg">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        <div
          className="flex-grow overflow-y-auto p-2"
          style={{ maxHeight: "400px" }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-center space-x-2 my-2 p-3 rounded-lg shadow ${
                message.uid === currentUser.uid
                  ? "ml-auto bg-blue-500 text-white" // Right-aligned for current user
                  : "bg-white" // Left-aligned for others
              } max-w-xs`}
            >
              <img
                src={message.photoURL || defaultProfilePic} // Use message.photoURL or a default image
                alt="Profile"
                className="h-6 w-6 rounded-full object-cover" // Smaller profile picture
              />
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between">
                  <strong className="text-sm">{message.nickname}</strong>{" "}
                  {/* Smaller text */}
                  <span className="text-xs text-white-500">
                    {message.createdAt
                      ? formatTimestamp(message.createdAt)
                      : "..."}
                  </span>
                </div>
                <p className="text-sm break-words">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {currentChatId && (
          <div className="p-4 bg-white rounded-b-xl">
            <form onSubmit={sendMessage} className="flex">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-r-lg uppercase transition-colors duration-200"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Club Members List */}
      <div className="w-1/5 p-2 border-l border-gray-300">
        <h3 className="mb-2 text-sm font-semibold">Club Members</h3>
        <div className="overflow-y-auto" style={{ height: "400px" }}>
          {clubMembers.map((member) => (
            <div
              key={member.id}
              className={`cursor
  -pointer p-1 ${
    member.id === selectedMemberId
      ? "bg-blue-500 text-white"
      : "hover:bg-gray-300"
  }`}
              onClick={() => {
                startOrGetChat(member.id);
                setSelectedMemberId(member.id); // Set the selected member ID
              }}
            >
              {member.nickname}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default StartChatComponent;
