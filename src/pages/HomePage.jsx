// HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
//import Navbar from "../components/Navbar";
import HowItWorks from "../components/HowItWorks";
import backgroundImage from "../assets/smok.png";
const HomePage = () => {
  const navigate = useNavigate();

  const handleJoinClick = () => {
    // Navigate to the register page
    navigate("/register");
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      {/* Flex container for centering content */}
      <div className="flex-grow=0 flex flex-col items-center  pt-20">
        {" "}
        {/* Adjust pt-20 based on Navbar height */}
        {/* Centered content container */}
        <div className="w-full max-w-md px-4 text-center">
          <h1 className="text-4xl font-bold">Welcome to the Dungeon Connect</h1>
          <p className="mt-2">
            Connect with other Dungeons & Dragons enthusiasts
          </p>
          <button
            onClick={handleJoinClick}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded "
          >
            Join Now
          </button>
        </div>
      </div>
      <HowItWorks />
    </div>
  );
};

export default HomePage;
