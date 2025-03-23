import React, { useState } from "react";
import Navbar from "./Navbar";
import FileList from "./FileList";
import FileDataTable from "./FileDataTable";
import GlobalFile from "./GlobalFile";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [showGlobal, setShowGlobal] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div>
      {/* Pass data and handlers to Navbar */}
      <Navbar
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedFile={selectedFile}
      />

      <div className={`dashboard-container ${showGlobal ? "" : "expanded"}`}>
        {/* Editable File Data Table */}
        <div className="section data-table">
          <h2>File Data Table</h2>
          <FileDataTable selectedFile={selectedFile} />
        </div>

        {/* File List */}
        <div className="section file-list">
          <h2>Available Files</h2>
          <FileList setSelectedFile={setSelectedFile} />
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
