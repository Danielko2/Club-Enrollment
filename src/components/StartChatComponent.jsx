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

const StartChatComponent = ({ clubId }) => {
  const [clubMembers, setClubMembers] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser, nickname } = useAuth();
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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

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
      createdAt: serverTimestamp(), // This will save the timestamp
      uid: currentUser.uid,
      nickname: nickname || "Anonymous", // Save the user's nickname
    });

    setNewMessage(""); // Clear the input field after sending
  };
  const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="flex w-full max-w-4xl mx-auto my-4 bg-gray-200 rounded-xl shadow-lg">
      {/* Club Members List */}
      <div className="w-1/4 p-4 border-r border-gray-300">
        <h3 className="mb-4 font-semibold">Club Members</h3>
        <div className="overflow-y-auto h-96">
          {" "}
          {/* Adjust height as needed */}
          {clubMembers.map((member) => (
            <div
              key={member.id}
              className="cursor-pointer p-2 hover:bg-gray-300"
            >
              <span onClick={() => startOrGetChat(member.id)}>
                {member.nickname}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-3/4 flex flex-col">
        <div className="flex-grow overflow-y-auto p-2 h-96">
          {" "}
          {/* Fixed height for scrollable area */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 my-2 bg-white rounded-lg shadow ${
                message.uid === currentUser.uid
                  ? "ml-auto bg-blue-300"
                  : "mr-auto"
              }`}
            >
              <strong>{message.nickname}</strong>: {message.text}
              <em className="block text-right text-xs text-gray-600">
                {message.createdAt ? formatTimestamp(message.createdAt) : "..."}
              </em>
            </div>
          ))}
          <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
        </div>
        {currentChatId && (
          <div className="p-4 bg-white rounded-b-xl">
            <div className="flex mt-4">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                autoComplete="off"
              />
              <button
                onClick={sendMessage}
                className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-r-lg uppercase transition-colors duration-200"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StartChatComponent;
