// components/LocationAutocomplete.js
import React, { useState, useEffect } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places"]; // This array is static and defined outside the component
const LocationAutocomplete = ({ onLocationSelect, defaultValue }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [inputValue, setInputValue] = useState(defaultValue || "");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = (autocomplete) => {
    setAutocomplete(autocomplete);
  };
  useEffect(() => {
    // Update the input value when the defaultValue changes
    setInputValue(defaultValue);
  }, [defaultValue]);
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place) {
        setInputValue(place.formatted_address);
        onLocationSelect(place);
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  if (loadError) {
    return <div>Error loading locations</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter location"
        className="border-2 p-2 w-full rounded"
      />
    </Autocomplete>
  );
};

export default LocationAutocomplete;
