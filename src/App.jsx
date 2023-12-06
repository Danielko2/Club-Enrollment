import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage"; // Import your page components
import "./App.css";
import NavBar from "./components/Navbar";
import Clubs from "./pages/Clubs";
import RegisterPage from "./pages/RegisterPage";
import ClubDashboard from "./pages/ClubDashboard";
function App() {
  return (
    <div className="pt-16">
      <NavBar />
      {/* Define your routes here */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Clubs" element={<Clubs />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/club-dashboard/:clubId" element={<ClubDashboard />} />

        {/* Define more routes as needed */}
      </Routes>
    </div>
  );
}

export default App;
