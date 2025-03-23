import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import userIcon from "../assets/icons8-user-50-2.png";
import projectIcon from "../assets/project.png";
import { uploadRegmap } from "../services/api";
const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const projectName = localStorage.getItem("projectName") || "No Project Selected";
  const projectId = localStorage.getItem("projectId");
  const [selectedModes, setSelectedModes] = useState([]);
  const [selectedMkclTables, setSelectedMkclTables] = useState([]);
  const [valueType, setValueType] = useState("hex");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const modes = ["Mode 1", "Mode 2", "Mode 3"];
  const mkclTables = ["MKCL Table 1", "MKCL Table 2"];

  const toggleSelection = (item, setSelected) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleLogout = () => {
    ["token", "user", "projectId", "projectName"].forEach(item => localStorage.removeItem(item));
    navigate("/");
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setSelectedFile(file);
        setMessage(""); // Clear previous message
    }
};
    const handleUpload = async () => {
      if (!selectedFile) {
          setMessage("Please select a file first.");
          return;
      }
      if (!projectId || !projectName) {
          setMessage("Project ID or Name is missing.");
          return;
      }

      try {
            // console.log("Uploading file:", selectedFile);
            // console.log("Project ID:", projectId);
            // console.log("Project Name:", projectName);

            await uploadRegmap({
                file: selectedFile,
                projectId,
                name: projectName
            });

            setMessage("Regmap uploaded successfully!");
            setSelectedFile(null);
      } catch (error) {
          console.error("Upload failed:", error);
          setMessage("Failed to upload regmap: " + error.message);
      }
    };
 
  return (
    <nav className="navbar">
      {/* Top Section: User Info & Actions */}
      <div className="navbar-top">
        <div className="user-project">
          <img src={userIcon} alt="User Icon" className="user-icon" />
          <span className="project-name">{user ? user.name : "Not Logged In"}</span>
          <img src={projectIcon} alt="Project Icon" className="project-icon" />
          <h2 className="project-name">{projectName}</h2>
        </div>

        <div className="navbar-buttons">
        <label className="upload-btn">
                Upload Regmap
                <input type="file" onChange={handleFileChange} className="file-input" />
            </label>
            
            <button className="nav-btn" onClick={handleUpload} disabled={!selectedFile}>
                Submit
            </button>

            {message &&window.alert(message)} {/* Display message */} {/* Display message */}
          <select className="nav-select">
            <option value="">Select Customer</option>
            <option value="Customer A">Customer A</option>
            <option value="Customer B">Customer B</option>
          </select>
          <button className="nav-btn">Add Customer</button>
          <button className="nav-btn">Edit</button>
          <button className="nav-btn">Save to DB</button>
          <button className="nav-btn">Create Setfile</button>
          <button className="nav-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Bottom Section: Mode, MKCL Tables & Value Selection */}
      <div className="navbar-bottom">
        {/* Mode Selection */}
        <div className="mode-section">
          <h3>MODES:</h3>
          <div className="radio-container">
            {modes.map((mode) => (
              <label key={mode} className="radio-label">
                <input
                  type="checkbox"
                  checked={selectedModes.includes(mode)}
                  onChange={() => toggleSelection(mode, setSelectedModes)}
                />
                {mode}
              </label>
            ))}
            <button className="nav-btn">Add Mode</button>
          </div>
        </div>

        {/* MKCL Table Selection */}
        <div className="mkcl-section">
          <h3>MKCL TABLES:</h3>
          <div className="radio-container">
            {mkclTables.map((table) => (
              <label key={table} className="radio-label">
                <input
                  type="checkbox"
                  checked={selectedMkclTables.includes(table)}
                  onChange={() => toggleSelection(table, setSelectedMkclTables)}
                />
                {table}
              </label>
            ))}
            <button className="nav-btn">Add MKCL Table</button>
          </div>
        </div>

        {/* Value Type Selection */}
        <div className="value-section">
          <h3>VALUE:</h3>
          <div className="radio-container">
            {['hex', 'dec'].map((type) => (
              <label key={type} className="radio-label">
                <input
                  type="radio"
                  name="valueType"
                  value={type}
                  checked={valueType === type}
                  onChange={() => setValueType(type)}
                />
                {type.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
