import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/api";
import "../styles/CreateProject.css";

const CreateProject = () => {
  const [name, setName] = useState("");
  const [customers, setCustomers] = useState(["PRS"]);
  const [newCustomer, setNewCustomer] = useState("");
  const [clockRate, setClockRate] = useState("");
  const [mv4, setMv4] = useState("");
  const [mv6, setMv6] = useState("");
  const [cphy, setCphy] = useState(false);
  const [dphy, setDphy] = useState(false);
  const [regmapFile, setRegmapFile] = useState(null);
  const [regmapBinFile, setRegmapBinFile] = useState(null);
  

  const navigate = useNavigate();

  // Fetch username from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddCustomer = () => {
    if (newCustomer && !customers.includes(newCustomer)) {
      setCustomers([...customers, newCustomer]);
      setNewCustomer("");
    }
  };

  const handleRemoveCustomer = (customer) => {
    setCustomers(customers.filter((c) => c !== customer));
  };

  const handleRadioChange = (type) => {
    if (type === "cphy") {
      setCphy(true);
      setDphy(false);
    } else {
      setCphy(false);
      setDphy(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({ name, customers, clockRate, mv4, mv6, regmapFile, regmapBinFile });
      navigate("/dashboard");
    } catch (err) {
      alert(err || "Project creation failed");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="project-form">
        {/* User Header */}
        <div className="user-header">
          <span className="username">Hi, {user.name}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Centered Title */}
        <h2 className="project-title">Create New Project</h2>

        {/* Project Name */}
        <div className="form-group">
          <h4>Project Name</h4>
          <input
            type="text"
            placeholder="Enter Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Customers Section */}
        <div className="customer-section">
          <h4>Customers</h4>
          <div className="customer-input">
            <input
              type="text"
              placeholder="Add Customer"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              className="customer-textbox"
            />
            <button type="button" className="add-customer-btn" onClick={handleAddCustomer}>
              Add
            </button>
          </div>

          <div className="customer-list">
            {customers.map((customer) => (
              <span key={customer} className="customer-item">
                {customer}
                <button
                  type="button"
                  className="small-btn remove-btn"
                  onClick={() => handleRemoveCustomer(customer)}
                >
                  ❌
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Interface Type Section */}
        <div className="form-group">
          <h4>Interface Type</h4>
          <div className="radio-section">
            <label>
              <input type="radio" checked={cphy} onChange={() => handleRadioChange("cphy")} /> CPHY
            </label>
            <label>
              <input type="radio" checked={dphy} onChange={() => handleRadioChange("dphy")} /> DPHY
            </label>
          </div>
        </div>

        {/* Clock Rate */}
        <div className="form-group">
          <h4>Clock Rate</h4>
          <input
            type="text"
            placeholder="Enter Clock Rate"
            value={clockRate}
            onChange={(e) => setClockRate(e.target.value)}
            required
          />
        </div>

        {/* MV Headers */}
        <div className="form-group">
          <h4>MV4 Header</h4>
          <input type="text" placeholder="Enter MV4 Header" value={mv4} onChange={(e) => setMv4(e.target.value)} />
        </div>

        <div className="form-group">
          <h4>MV6 Header</h4>
          <input type="text" placeholder="Enter MV6 Header" value={mv6} onChange={(e) => setMv6(e.target.value)} />
        </div>

        {/* File Uploads */}
        <div className="file-upload">
          <h4>Upload Regmap File</h4>
          <input type="file" onChange={(e) => setRegmapFile(e.target.files[0])} />
        </div>

        <div className="file-upload">
          <h4>Upload Regmap Bin File</h4>
          <input type="file" onChange={(e) => setRegmapBinFile(e.target.files[0])} />
        </div>

        {/* Submit button centered */}
        <div className="submit-container">
          <button type="submit" className="submit-button">
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
