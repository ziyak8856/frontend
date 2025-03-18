import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css"; // Import the separate CSS file

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("projectId");
    localStorage.removeItem("projectName");
    navigate("/");
  };

  return (
    <nav className="navbar">
      
      <div className="user-info">
        {user ? <span>{user.name}</span> : <span>Not Logged In</span>}
        {user && <button onClick={handleLogout} className="logout-btn">Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
