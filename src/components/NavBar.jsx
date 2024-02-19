import React, { useState } from "react";
import DungeonIcon from "../assets/icons/castle.png";
import Quill from "../assets/icons/quill.png";
import Flag from "../assets/icons/flag.png";
import Pigeon from "../assets/icons/pigeon.png";
import Logo from "../assets/icons/logo.png";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import defaultProfilePic from "../assets/default-avatar.png";

const Navbar = () => {
  const { currentUser, logout, userPhotoURL } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/register");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="flex justify-between items-center p-4 fixed top-0 right-0 left-0 bg-white z-10">
      {/* Logo */}
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-10 w-15 mr-2" />
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-4">
        {/* Conditional rendering depending on user authentication status */}
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
                <img src={Pigeon} alt="Contact" className="h-5 w-5 mr-2" />{" "}
                Contact
              </a>
            </li>
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
            {/* User Profile and Dropdown */}
            <li className="relative">
              <img
                src={userPhotoURL || defaultProfilePic}
                alt="User profile"
                className="h-8 w-8 rounded-full object-cover cursor-pointer"
                onClick={toggleDropdown}
                style={{
                  cursor: "pointer",
                  transition: "box-shadow 0.3s ease-in-out",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.boxShadow =
                    "0 0 0 3px rgba(66, 153, 225, 0.5)")
                }
                onMouseLeave={(e) => (e.target.style.boxShadow = "none")}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                  <a
                    href="/userdashboard"
                    className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white"
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-left w-full block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
