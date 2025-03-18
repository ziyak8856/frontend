import React from "react";

const FileList = ({ setSelectedFile }) => {
  const files = ["config1.txt", "settings2.json", "data3.csv", "log4.txt", "results5.json", "notes6.txt","config1.txt", "settings2.json", "data3.csv", "log4.txt", "results5.json", "notes6.txt","config1.txt", "settings2.json", "data3.csv", "log4.txt", "results5.json", "notes6.txt","config1.txt", "settings2.json", "data3.csv", "log4.txt", "results5.json", "notes6.txt"];

  return (
    <ul>
      {files.map((file, index) => (
        <li key={index}>
          <button onClick={() => setSelectedFile(file)}>{file}</button>
        </li>
      ))}
    </ul>
  );
};

export default FileList;
