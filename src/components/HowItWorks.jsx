// HowItWorks.jsx
import React from "react";
import RegisterIcon from "../assets/icons/quill.png";
import ClubsIcon from "../assets/icons/flag.png";
import PlayIcon from "../assets/icons/d20.png";

const HowItWorks = () => {
  return (
    <section className="my-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Step 1 */}
          <div className="animate-slide-in-left">
            {" "}
            {/* Using Tailwind's slide-in animation */}
            <img
              src={RegisterIcon}
              alt="Register"
              className="mx-auto h-16 w-16"
            />
            <h3 className="text-xl font-semibold mt-2">Register</h3>
            <p>Create an account on the D&D Portal</p>
          </div>

          {/* Step 2 */}
          <div className="animate-slide-in-left">
            {" "}
            {/* Same animation, but no delay */}
            <img
              src={ClubsIcon}
              alt="Find Clubs"
              className="mx-auto h-16 w-16"
            />
            <h3 className="text-xl font-semibold mt-2">Find Clubs</h3>
            <p>Search for clubs based on your interests and location</p>
          </div>

          {/* Step 3 */}
          <div className="animate-slide-in-left">
            {" "}
            {/* Same animation, still no delay */}
            <img
              src={PlayIcon}
              alt="Join Sessions"
              className="mx-auto h-16 w-16"
            />
            <h3 className="text-xl font-semibold mt-2">Join Sessions</h3>
            <p>Participate in exciting D&D sessions organized by clubs</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
