import React from "react";
import DungeonIcon from "../assets/icons/castle.png";
import Quill from "../assets/icons/quill.png";
import Flag from "../assets/icons/flag.png";
import Pigeon from "../assets/icons/pigeon.png";
import Logo from "../assets/icons/logo.png";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { currentUser, logout, nickname, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/register");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  return (
    <nav className="flex justify-between items-center p-4 absolute top-0 right-0 w-full">
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-10 w-15 mr-2" />{" "}
        {/* Increase the size of the logo */}
      </div>
      <ul className="flex space-x-4">
        {!currentUser ? (
          <>
            <li>
              <a
                href="/"
                className="text-gray-700 hover:text-gray-300 transition-colors duration-200 flex items-center"
              >
                <img src={DungeonIcon} alt="Home" className="h-5 w-5 mr-2" />
                Home
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a
                href="/userdashboard"
                className="text-gray-700 hover:text-gray-300 transition-colors duration-200 flex items-center"
              >
                <img src={DungeonIcon} alt="Home" className="h-5 w-5 mr-2" />
                Dashboard
              </a>
            </li>
          </>
        )}

        <li>
          <a
            href="/clubs"
            className="text-gray-700 hover:text-gray-300 transition-colors duration-200 flex items-center"
          >
            <img src={Flag} alt="Clubs" className="h-5 w-5 mr-2" />
            Clubs
          </a>
        </li>
        <li>
          <a
            href="/contact"
            className="text-gray-700 hover:text-gray-300 transition-colors duration-200 flex items-center"
          >
            <img src={Pigeon} alt="Contact" className="h-5 w-5 mr-2" />
            Contact
          </a>
        </li>
        {!currentUser ? (
          <>
            <li>
              <a
                href="/register"
                className="text-gray-700 hover:text-gray-300 transition-colors duration-200 flex items-center"
              >
                <img
                  src={Quill}
                  alt="Register/Login"
                  className="h-5 w-5 mr-2"
                />
                Register/Login
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <span className="text-gray-700 hover:text-gray-300 transition-colors duration-200 flex items-center">
                Welcome, {nickname}{" "}
                {/* Display nickname if available, otherwise email */}
              </span>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-300 transition-colors duration-200"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
