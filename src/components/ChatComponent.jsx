import React, { useState, useEffect, useRef } from "react";
import { db } from "../config/firebase-config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../hooks/AuthContext";

const ChatComponent = ({ clubId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { currentUser } = useAuth(); // Use the hook to access the current user
  const endOfMessagesRef = useRef(null); // Create a reference to the end of the messages list
  const { nickname } = useAuth();

  useEffect(() => {
    if (clubId) {
      const messagesRef = collection(db, "clubs", clubId, "messages");
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          isCurrentUser: doc.data().uid === currentUser.uid, // Flag to identify current user's messages
          ...doc.data(),
        }));
        setMessages(loadedMessages);
        scrollToBottom(); // Scroll to bottom when messages are initially loaded
      });

      return unsubscribe; // Detach listener when unmounting
    }
  }, [clubId, currentUser.uid]);
  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages are updated
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      const messagesRef = collection(db, "clubs", clubId, "messages");

      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(), // Use serverTimestamp for consistency
        uid: currentUser.uid,
        nickname: nickname, // Add the nickname to the message
      });

      setNewMessage("");
      scrollToBottom(); // Scroll to bottom when a new message is sent
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="p-4 bg-gray-200 rounded-xl shadow-lg w-full max-w-lg mx-auto my-4">
      <div className="flex flex-col space-y-4 max-h-[500px] overflow-y-auto p-2">
        <ul className="space-y-1">
          {messages.map((message) => (
            <li key={message.id} className="break-all">
              <div
                className={`p-3 rounded-lg shadow ${
                  message.isCurrentUser
                    ? "bg-blue-300 text-blue-800"
                    : "bg-white text-gray-800"
                } ${
                  message.isCurrentUser
                    ? "rounded-br-none ml-auto"
                    : "rounded-bl-none mr-auto"
                } max-w-[75%]`}
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-semibold ${
                      message.isCurrentUser ? "text-blue-800" : "text-gray-600"
                    }`}
                  >
                    {message.nickname || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.createdAt
                      ? new Date(
                          message.createdAt.seconds * 1000
                        ).toLocaleTimeString([], { timeStyle: "short" })
                      : "Loading..."}
                  </span>
                </div>
                <p className="mt-1 text-sm">{message.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <div ref={endOfMessagesRef} />
      </div>
      <form onSubmit={sendMessage} className="flex mt-4">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-l-lg p-2 border-t mr-0 border-l border-b border-gray-300 bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-4 rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 uppercase border-blue-600 border-t border-b border-r transition-colors duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
