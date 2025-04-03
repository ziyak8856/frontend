import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import userIcon from "../assets/icons8-user-50-2.png";
import projectIcon from "../assets/project.png";
import { uploadRegmap, fetchCustomers,fetchModes,fetchProjectById,fetchSettings, fetchCustomerById } from "../services/api";
import AddCustomerModal from "./AddCustomerModal";
import AddModeModal from "./AddModeModal";
import AddMkclTableModal from "./AddMkclTableModal";
const Navbar = ({selectedModes,setSelectedModes}) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const projectName = localStorage.getItem("projectName") || "No Project Selected";
    const projectId = localStorage.getItem("projectId");

   // const [selectedModes, setSelectedModes] = useState([]);
    const [valueType, setValueType] = useState("hex");
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [customers, setCustomers] = useState([]); // Store customers list
    const [selectedCustomer, setSelectedCustomer] = useState(""); // Store selected customer
    const [isModalOpen, setModalOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false); // Control alert display
    const [modes, setModes] = useState([]);
    const [isModeModalOpen, setModeModalOpen] = useState(false);
    const [projectDetails, setProjectDetails] = useState(null);
    const [uniqueVariables, setUniqueVariables] = useState([]);
    const [mkclTables, setMkclTables] = useState([]);
    const [selectedMkclTables, setSelectedMkclTables] = useState([]);
    const [ismkclModalOpen, setmkclModalOpen] = useState(false);

    const toggleSelection = (item, setSelected) => {
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };
    const toggleSelectiontable = (tableName) => {
        setSelectedMkclTables((prev) =>
          prev.includes(tableName)
            ? prev.filter((t) => t !== tableName)
            : [...prev, tableName]
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
            setShowAlert(true);
            return;
        }
        if (!projectId || !projectName) {
            setMessage("Project ID or Name is missing.");
            setShowAlert(true);
            return;
        }

        try {
            await uploadRegmap({
                file: selectedFile,
                projectId,
                name: projectName
            });

            setMessage("Regmap uploaded successfully!");
            setShowAlert(true);
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed:", error);
            setMessage("Failed to upload regmap: " + error.message);
            setShowAlert(true);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails(projectId);
            fetchCustomersList(projectId);
        }
    }, [projectId]); // Runs when projectId changes

    const fetchCustomersList = async (projectId) => {
        try {
            const data = await fetchCustomers(projectId);
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        }
    };

    const handleCustomerChange = (event) => {
        event.preventDefault();
        setSelectedCustomer(event.target.value);
        setModes([]); // Clear previous modes
        setSelectedModes([]);
        console.log("Selected customer:",selectedCustomer);
    };
    useEffect(() => {
      if (selectedCustomer) {
        fetchModesList(selectedCustomer);
        fetchTables();
        // setSelectedModes([]); // Reset selected modes
      }else{
        setModes([]);
        setSelectedModes([]);
      }
    }, [selectedCustomer]);
    const fetchModesList = async (customerId) => {
      try {
        const data = await fetchModes(customerId);
        setModes(data);
        setSelectedModes([]); // Reset selected modes
      } catch (error) {
        console.error("Failed to fetch modes:", error);
      }
    };
    const handleModeSelection = (modeId) => {
      setSelectedModes((prevSelectedModes) => {
        const updatedModes = prevSelectedModes.includes(modeId)
          ? prevSelectedModes.filter((id) => id !== modeId) // Unselect mode
          : [...prevSelectedModes, modeId]; // Select mode
    
        console.log("Selected Modes:", updatedModes); // Log selected modes
        return updatedModes;
      });
    };
    const fetchProjectDetails = async (projectId) => {
      try {
          const data = await fetchProjectById(projectId);
          setProjectDetails(data);
         // console.log(data.mv4);
          extractUniqueVariables(data.mv4, data.mv6);
         // console.log(uniqueVariables)
      } catch (error) {
          console.error("Failed to fetch project details:", error);
      }
  };
    const extractUniqueVariables = (mv4, mv6) => {
      const regex = /\[\*(.*?)\*\]/g;
      let variables = new Set(); // Using Set to ensure uniqueness

      const extractFromText = (text) => {
          if (!text) return;
          let match;
          while ((match = regex.exec(text)) !== null) {
              variables.add(match[1]); // Extract matched value inside [* *]
          }
      };

      extractFromText(mv4);
     // console.log("Variables:", variables);
      extractFromText(mv6);
      //console.log("Variables:", variables);
      const uniqueArray = [...variables];
     //  console.log("Unique Array:", uniqueArray);
      setUniqueVariables([...variables]);

       // Convert Set to Array
        console.log("Unique Variables:", uniqueVariables); // Log unique variables
  };
  useEffect(() => {
    if(uniqueVariables.length)
    console.log("Updated unique variables:", uniqueVariables);
  }, [uniqueVariables]);

  const fetchTables = async () => {
    try {
      const data = await fetchSettings(selectedCustomer);
      setMkclTables(data);
      setSelectedMkclTables([]); // Reset selection on customer change
    } catch (error) {
      console.error("Error fetching MKCL tables:", error);
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

                    {showAlert && message && window.alert(message)} {/* Show alert once */}
                    
                    <select className="nav-select" value={selectedCustomer} onChange={handleCustomerChange}>
                        <option value="">Select Customer</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                    <button className="nav-btn" onClick={() => setModalOpen(true)}>Add Customer</button>
                    <AddCustomerModal 
                        isOpen={isModalOpen} 
                        onClose={() => {
                            setModalOpen(false);
                            fetchCustomersList(projectId);  // Fetch updated customers after modal closes
                        }} 
                    />
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
            <label key={mode.id} className="radio-label">
              <input
                type="checkbox"
                value={mode.id}
                checked={selectedModes.includes(mode)}
                onChange={() => handleModeSelection(mode)}
              />
              {mode.name}
            </label>
          ))}
          <button className="nav-btn" onClick={() => setModeModalOpen(true)}>Add Mode</button>
        </div>

        <AddModeModal
          isOpen={isModeModalOpen}
          onClose={() => setModeModalOpen(false)}
          customerId={selectedCustomer}
          refreshModes={() => fetchModesList(selectedCustomer)}
        />
      </div>
                {/* MKCL Table Selection */}
                <div className="mkcl-section">
        <h3>MKCL TABLES:</h3>
        <div className="radio-container">
          {mkclTables.map((table) => (
            <label key={table.table_name} className="radio-label">
              <input
                type="checkbox"
                value={table.table_name}
                checked={selectedMkclTables.includes(table)}
                onChange={() => toggleSelectiontable(table)}
              />
              {table.name}
            </label>
          ))}
          <button className="nav-btn" onClick={() => setmkclModalOpen(true)}>Add MKCL Table</button>
        </div>
      </div>

      {/* Add MKCL Table Modal */}
      <AddMkclTableModal
        isOpen={ismkclModalOpen}
        onClose={() => setmkclModalOpen(false)}
        projectName={projectName}
        customerName={selectedCustomer}
        customerId={selectedCustomer}
        uniqueArray1={uniqueVariables}
        refreshModes={() => fetchTables(selectedCustomer)}
      />

                {/* Value Type Selection */}
                
            </div>
        </nav>
    );
};

export default Navbar;
