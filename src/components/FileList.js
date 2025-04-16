import React, { useEffect, useState } from "react";
import { fetchSetFilesbyMode,markFileAsDeleted } from "../services/api";
import "../styles/FileList.css";

const FileList = ({ selectedModes, selectedSetFiles, setSelectedSetFiles }) => {
  const [fileData, setFileData] = useState([]); // Store all setfiles across modes

  useEffect(() => {
    const fetchData = async () => {
      if (!Array.isArray(selectedModes) || selectedModes.length === 0) {
        setFileData([]);
        setSelectedSetFiles({});
        return;
      }

      const newFileData = [];
      for (const mode of selectedModes) {
        const data = await fetchSetFilesbyMode(mode.id);
        if (data.files) {
          newFileData.push({ mode, files: data.files });
        }
      }
      setFileData(newFileData);

      // Keep only selected files from active modes
      setSelectedSetFiles((prev) => {
        const updatedFiles = {};
        newFileData.forEach(({ files }) => {
          files.forEach((file) => {
            if (prev[file.id]) {
              updatedFiles[file.id] = prev[file.id];
            }
          });
        });
        return updatedFiles;
      });
    };

    fetchData();
  }, [selectedModes, setSelectedSetFiles]);

  const handleCheckboxChange = (file) => {
    setSelectedSetFiles((prev) => {
      const updatedFiles = { ...prev };
      if (updatedFiles[file.id]) {
        delete updatedFiles[file.id];
      } else {
        updatedFiles[file.id] = file;
      }
      return updatedFiles;
    });
  };

  const handleDeleteFile = async (fileToDelete) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileToDelete.full_name}"?`
    );
  
    if (!confirmDelete) return;
  
    // Remove from selectedSetFiles
    setSelectedSetFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[fileToDelete.id];
      return updatedFiles;
    });
  
    // Remove from fileData state
    setFileData((prevData) =>
      prevData.map(({ mode, files }) => ({
        mode,
        files: files.filter((file) => file.id !== fileToDelete.id),
      }))
    );
  
    try {
      await markFileAsDeleted(fileToDelete); // Send full object to backend
      console.log("File sent to backend for deletion:", fileToDelete);
      alert(`"${fileToDelete.full_name}" has been successfully deleted.`);
    } catch (error) {
      console.error("Failed to send deleted file to backend:", error);
      alert(`Failed to delete "${fileToDelete.full_name}". Please try again.`);
    }
  };
  
  return (
    <div>
      <ul className="mode-list">
        {fileData.map(({ mode, files }) => (
          <li key={mode.id} className="mode-item">
            <h3 className="mode-name">{mode.name}</h3>
            <ul className="file-list">
              {files.map((file) => (
                <li key={file.id} className="file-item">
                  <input
                    type="checkbox"
                    id={file.id}
                    checked={!!selectedSetFiles[file.id]}
                    onChange={() => handleCheckboxChange(file)}
                  />
                  <label htmlFor={file.id}>{file.full_name}</label>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFile(file)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {/* {console.log("Selected Set Files:", selectedSetFiles)}   */}
    </div>
  );
};

export default FileList;
