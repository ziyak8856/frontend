import React, { useState } from "react";
import Navbar from "./Navbar";
import FileList from "./FileList";
import FileDataTable from "./FileDataTable";
import GlobalFile from "./GlobalFile";
import "../styles/Dashboard.css";
const Dashboard = () => {
  const [showGlobal, setShowGlobal] = useState(true);

  return (
    <div>
      <Navbar />
      <div className={`dashboard-container ${showGlobal ? "" : "expanded"}`}>
        {/* Editable File Data Table */}
        <div className="section data-table">
          <h2>File Data Table</h2>
          <FileDataTable />
        </div>

        {/* File List */}
        <div className="section file-list">
          <h2>Available Files</h2>
          <FileList />
        </div>

        {/* Global Data Section - Hide Whole Container */}
        {showGlobal && (
          <div className="section global-data">
          <button className="toggle-btn hide-btn" onClick={() => setShowGlobal(false)}>
            <span className="toggle-icon">−</span> {/* Minus Sign */}
          </button>
          <GlobalFile />
        </div>
        
        )}

        {/* Show Button when Global Data is Hidden */}
        {!showGlobal && (
          <button className="toggle-btn show-btn inside"  onClick={() => setShowGlobal(true)}>
            <span className="toggle-icon">+</span> {/* Plus Sign */}
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
