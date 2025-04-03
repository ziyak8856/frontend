import React, { useState } from "react";
import Navbar from "./Navbar";
import FileList from "./FileList";
import FileDataTable from "./FileDataTable";
import GlobalFile from "./GlobalFile";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [showGlobal, setShowGlobal] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedModes, setSelectedModes] = useState(null);
  const [selectedSetFiles, setSelectedSetFiles] = useState({});
  

  return (
    <div>
      {/* Pass data and handlers to Navbar */}
      <Navbar
        selectedModes={selectedModes}
        setSelectedModes={setSelectedModes}
       
      />

      <div className={`dashboard-container ${showGlobal ? "" : "expanded"}`}>
        {/* Editable File Data Table */}
        <div className="section data-table">
          <h2>File Data Table</h2>
          <FileDataTable  selectedSetFiles={selectedSetFiles} />
        </div>

        {/* File List */}
        <div className="section file-list">
          <h2>Available Files</h2>
          <FileList
          selectedModes={selectedModes}
          selectedSetFiles={selectedSetFiles}
          setSelectedSetFiles={setSelectedSetFiles}
        />
        </div>

        {/* Global Data Section */}
        {showGlobal && (
          <div className="section global-data">
            <button
              className="toggle-btn hide-btn"
              onClick={() => setShowGlobal(false)}
            >
              <span className="toggle-icon">−</span>
            </button>
            <GlobalFile />
          </div>
        )}

        {/* Show Button when Global Data is Hidden */}
        {!showGlobal && (
          <button
            className="toggle-btn show-btn inside"
            onClick={() => setShowGlobal(true)}
          >
            <span className="toggle-icon">+</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
