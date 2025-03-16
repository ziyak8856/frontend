import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/api";
import "../styles/CreateProject.css";

const CreateProject = () => {
  const [name, setName] = useState("");
  const [customers, setCustomers] = useState(["PRS"]);
  const [newCustomer, setNewCustomer] = useState("");
  const [clockRate, setClockRate] = useState("");
  const [cphy, setCphy] = useState(false);
  const [dphy, setDphy] = useState(false);
  const [regmapFile, setRegmapFile] = useState(null);
  const [regmapBinFile, setRegmapBinFile] = useState(null);
  const [showMv4, setShowMv4] = useState(false);
  const [showMv6, setShowMv6] = useState(false);
  const [selectedLinesmv4, setSelectedLinesmv4] = useState([]);
  const [selectedLinesmv6, setSelectedLinesmv6] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
 
  const mv4Groups = [
    "$mv4[speed:[*spd*],temp:[*temperature*],voltage:[*vltg*],power:[*pwr*]]",
    "$mv4[rate:[*rt*],capacity:[*cap*],efficiency:[*eff*],signal:[*sig*]]",
    "$mv4[load:[*ld*],torque:[*trq*],frequency:[*freq*],current:[*curr*]]",
    "$mv4[pressure:[*pres*],flow:[*flw*],altitude:[*alt*],angle:[*ang*]]",
  ];
  const mv6Groups = [
    "$mv6[speed:[*spdp*],temp:[*tempera*],voltage:[*vltg*],power:[*pwr*]]",
    "$mv6[rate:[*rti*],capacity:[*cap*],efficiency:[*effi*],signal:[*sig*]]",
  ];

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAddCustomer = () => {
    if (newCustomer && !customers.includes(newCustomer)) {
      setCustomers([...customers, newCustomer]);
      setNewCustomer("");
    }
  };

  const handleCheckboxChange = (line, setSelectedLines) => {
    setSelectedLines((prev) =>
      prev.includes(line) ? prev.filter((item) => item !== line) : [...prev, line]
    );
  };

  const handleRemoveCustomer = (customer) => {
    setCustomers(customers.filter((c) => c !== customer));
  };

  const handleRadioChange = (type) => {
    setCphy(type === "cphy");
    setDphy(type === "dphy");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (!name) return setError("Project Name is required.");
    if (customers.length === 0) return setError("At least one customer is required.");
    if (!cphy && !dphy) return setError("Please select an Interface Type (CPHY/DPHY).");
    if (!clockRate) return setError("Clock Rate is required.");
    if (showMv4 && selectedLinesmv4.length === 0) return setError("At least one MV4 selection is required.");
    if (showMv6 && selectedLinesmv6.length === 0) return setError("At least one MV6 selection is required.");
    if (!regmapFile) return setError("Regmap file is required.");
    if (!regmapBinFile) return setError("Regmap Bin file is required.");
    
    setError("");
    // console.log(name, customers, clockRate, cphy, dphy, selectedLinesmv4, selectedLinesmv6, regmapFile, regmapBinFile);
  //   const formData = new FormData();
  //   formData.append("customers", JSON.stringify(customers));
  //   formData.append("clockRate", clockRate);
  //   formData.append("interfaceType", cphy ? "CPHY" : "DPHY");
       
  //  // console.log(formData.getAll("name"));
  //    formData.forEach((value, key) => {
  //     console.log(key, value);  
  //    });
    // try {
    //   await createProject(formData);
    //   navigate("/dashboard");
    // } catch (err) {
    //   setError(err.message || "Project creation failed.");
    // }
    const projectData = new FormData();
    projectData.append("name", name);
    projectData.append("mv4", showMv4 ? selectedLinesmv4.join(", ") : "");
    projectData.append("mv6", showMv6 ? selectedLinesmv6.join(", ") : "");
    projectData.append("regmap", regmapFile);
    projectData.append("regmapBin", regmapBinFile);

    try {
      const response = await createProject(projectData);
      localStorage.setItem("projectId", response.projectId); // Store project ID in local storage
      console.log(`Project created successfully: ID ${response.projectId}`);
    } catch (error) {
      setError(`Error: ${error}`|| "Project creation failed.");
    } 
    
    
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("projectId");
    navigate("/");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="project-form">
        <div className="user-header">
          <span className="username">Hi, {user?.name}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <h2 className="project-title">Create New Project</h2>
        
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

        <div className="form-group">
          <label className="h4">
            <input type="checkbox" checked={showMv4} onChange={() => setShowMv4(!showMv4)} /> Add MV4 Header
          </label>
          {showMv4 && (
            <div className="mv-container">
              {mv4Groups.map((line, index) => (
                <label key={index} className="mv-line">
                  <input
                    type="checkbox"
                    checked={selectedLinesmv4.includes(line)}
                    onChange={() => handleCheckboxChange(line, setSelectedLinesmv4)}
                  />
                  {line}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="h4">
            <input type="checkbox" checked={showMv6} onChange={() => setShowMv6(!showMv6)} /> Add MV6 Header
          </label>
          {showMv6 && (
            <div className="mv-container">
              {mv6Groups.map((line, index) => (
                <label key={index} className="mv-line">
                  <input
                    type="checkbox"
                    checked={selectedLinesmv6.includes(line)}
                    onChange={() => handleCheckboxChange(line, setSelectedLinesmv6)}
                  />
                  {line}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="file-upload">
          <h4>Upload Regmap File</h4>
          <input type="file" onChange={(e) => setRegmapFile(e.target.files[0])} />
        </div>

        <div className="file-upload">
          <h4>Upload Regmap Bin File</h4>
          <input type="file" onChange={(e) => setRegmapBinFile(e.target.files[0])} />
        </div>
        {error && <div className="error-message">{error}</div>}
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
