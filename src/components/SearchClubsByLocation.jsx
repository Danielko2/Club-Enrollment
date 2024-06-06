// SearchClubsByLocation.js
import React, { useState } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"]; // This array is static and defined outside the component to
//avoid re-renders on every component update

const SearchClubsByLocation = ({ onLocationSelected, onClearSearch }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyA6L3TeotodM-MldE9-l16zvbGGbnyEFTo",
    libraries,
  });
  const [inputValue, setInputValue] = useState("");
  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setInputValue(place.name); // Update the input value with the selected place name
      onLocationSelected(place);
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleClearClick = () => {
    setInputValue(""); // Clear the input field
    onClearSearch(); // Call the passed clear search handler
  };
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center my-4">
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder="Search by location..."
          value={inputValue}
          onChange={handleInputChange}
          className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </Autocomplete>
      <button
        onClick={handleClearClick}
        className="p-2 border border-gray-300 bg-gray-100 text-gray-800 rounded-r-md hover:bg-gray-200 focus:outline-none"
      >
        Clear
      </button>
    </div>
  );
};
export default SearchClubsByLocation;
