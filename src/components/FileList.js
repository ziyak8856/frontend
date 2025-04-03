import React, { useEffect, useState } from "react";
import { fetchSetFilesbyMode } from "../services/api";
import "../styles/FileList.css";

const FileList = ({ selectedModes, selectedSetFiles, setSelectedSetFiles }) => {
  const [fileData, setFileData] = useState([]); // Store all setfiles across modes

  useEffect(() => {
    const fetchData = async () => {
      if (!Array.isArray(selectedModes) || selectedModes.length === 0) {
        setFileData([]);
        setSelectedSetFiles({}); // Reset selected files
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
        delete updatedFiles[file.id]; // Unselect file
      } else {
        updatedFiles[file.id] = file; // Select file
      }
      return updatedFiles;
    });
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
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
