import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/api"; // Import API function
import Navbar from "./Navbar";

const CreateProject = () => {
  const [name, setName] = useState("");
  const [mv4, setMv4] = useState("");
  const [mv6, setMv6] = useState("");
  const [regmapPath, setRegmapPath] = useState("");
  const [regmapBinPath, setRegmapBinPath] = useState("");
  // const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user?.name) {
  //     setUsername(user.name);
  //   }
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject({ name, mv4, mv6, regmap_path: regmapPath, regmap_binpath: regmapBinPath });
      navigate("/dashboard");
    } catch (err) {
      alert(err || "Project creation failed");
    }
  };

  return (
    <div>
      <Navbar />
    <div className="container">
      <h2>Create New Project</h2>
      {/* <h3>Hi, {username} 👋</h3> */}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="MV4 Content" value={mv4} onChange={(e) => setMv4(e.target.value)} />
        <textarea placeholder="MV6 Content" value={mv6} onChange={(e) => setMv6(e.target.value)} />
        <input type="text" placeholder="Regmap Path" value={regmapPath} onChange={(e) => setRegmapPath(e.target.value)} required />
        <input type="text" placeholder="Regmap Bin Path" value={regmapBinPath} onChange={(e) => setRegmapBinPath(e.target.value)} required />
        <button type="submit">Create Project</button>
      </form>
    </div>
    </div>
  );
};

export default CreateProject;
