import React, { useState } from "react";

const FileDataTable = ({ selectedFile }) => {
  const initialData = Array.from({ length: 10 }, (_, rowIndex) => ({
    id: rowIndex + 1,
    Parameter: `Signal ${rowIndex + 1}`,
    Value: `${(rowIndex + 1) * 0.5}V`,
    KITON: `KITON-${rowIndex + 1}`,
    ZENON: `ZEN-${rowIndex + 1}`,
    SEP: `SEP-${rowIndex + 1}`,
    ZEOP: `ZEOP-${rowIndex + 1}`,
    EXTRA1: `EXTRA1-${rowIndex + 1}`,
    EXTRA2: `EXTRA2-${rowIndex + 1}`,
    EXTRA3: `EXTRA3-${rowIndex + 1}`,
    EXTRA4: `EXTRA4-${rowIndex + 1}`
  }));

  const [data, setData] = useState(initialData);

  const handleEdit = (id, field, newValue) => {
    setData(
      data.map((row) => (row.id === id ? { ...row, [field]: newValue } : row))
    );
  };

  return (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          background: "#fff",
          border: "1px solid #ddd",
          fontSize: "14px",
          tableLayout: "auto", // Allow table to expand dynamically
        }}
      >
        <thead>
          <tr style={{ background: "#007bff", color: "white" }}>
            {Object.keys(initialData[0])
              .slice(1)
              .map((header) => (
                <th
                  key={header}
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    minWidth: "120px", // Set a minimum width to avoid shrinking
                    whiteSpace: "nowrap", // Prevents text from breaking into multiple lines
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {header}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {Object.keys(row)
                .slice(1)
                .map((field) => (
                  <td
                    key={field}
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      minWidth: "120px",
                      maxWidth: "300px", // Allow expansion but set a max limit
                      wordBreak: "break-word", // Ensure text wraps within the cell
                    }}
                  >
                    <input
                      type="text"
                      value={row[field]}
                      onChange={(e) => handleEdit(row.id, field, e.target.value)}
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                        background: "transparent",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    />
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileDataTable;
