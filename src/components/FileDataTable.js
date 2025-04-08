import React, { useState, useEffect } from "react";
import {
  fetchTableNameBySettingId,
  fetchTableData,
  addRowAPI,
  updateRowAPI,
} from "../services/api";
import "../styles/FileData.css"; // Ensure this path is correct
const FileDataTable = ({ selectedSetFiles }) => {
  const [tableNames, setTableNames] = useState({});
  const [tableData, setTableData] = useState([]);
  const [editedCells, setEditedCells] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [columns, setColumns] = useState(["serial_number", "Tunning_param"]);
  const [displayFormat, setDisplayFormat] = useState("hex");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  useEffect(() => {
    const fetchTableNames = async () => {
      setLoading(true);
      setError("");
      try {
        const newTableNames = { ...tableNames };
        const fetchPromises = Object.values(selectedSetFiles).map(async (file) => {
          if (!newTableNames[file.setting_id]) {
            const tableName = await fetchTableNameBySettingId(file.setting_id);
            newTableNames[file.setting_id] = tableName || "Unknown Table";
          }
        });
        await Promise.all(fetchPromises);
        setTableNames(newTableNames);
      } catch {
        setError("Failed to fetch table names.");
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(selectedSetFiles).length > 0) {
      fetchTableNames();
    } else {
      setTableData([]);
      setColumns(["serial_number", "Tunning_param"]);
      setTableNames({});
    }
  }, [selectedSetFiles]);

  useEffect(() => {
    const fetchData = async () => {
      if (!Object.keys(tableNames).length) return;

      setLoading(true);
      setError("");

      try {
        const mergedData = {};
        let newColumns = ["serial_number", "Tunning_param"];

        const fetchPromises = Object.values(selectedSetFiles).map(async (file) => {
          const tableName = tableNames[file.setting_id];
          const columnName = file.name;

          if (tableName && columnName) {
            const data = await fetchTableData(tableName, columnName);
            if (data?.rows) {
              newColumns.push(columnName);
              data.rows.forEach((row) => {
                const id = row.id;
                if (!mergedData[id]) {
                  mergedData[id] = {
                    id: row.id,
                    serial_number: row.serial_number,
                    Tunning_param: row.Tunning_param,
                    setting_id: file.setting_id,
                  };
                }
                mergedData[id][columnName] = row[columnName] || "-";
              });
            }
          }
        });

        await Promise.all(fetchPromises);
        setColumns([...new Set(newColumns)]);

        const mergedArray = Object.values(mergedData).sort((a, b) => a.serial_number - b.serial_number);
        setTableData(mergedArray);
      } catch {
        setError("Failed to fetch table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableNames]);

  const convertValue = (value) => {
    if (!value || value === "-") return "-";
    return displayFormat === "hex" ? value.toString().toUpperCase() : parseInt(value, 16);
  };

  const handleChange = (e, rowId, colName) => {
    const newValue = e.target.value;
    setEditedCells(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [colName]: newValue,
      }
    }));
    setTableData(prev =>
      prev.map(row =>
        row.id === rowId ? { ...row, [colName]: newValue } : row
      )
    );
  };

  const handleAddRow = async (refRow, position) => {
    const tableName = tableNames[refRow.setting_id];
    if (!tableName) return;
  
    // Construct rowData to send to backend
    const rowData = {};
    columns.forEach(col => {
      if (col === "Tunning_param") {
        rowData[col] = ""; // Empty string for Tunning_param
      } else if (col !== "id" && col !== "serial_number" && col !== "setting_id") {
        rowData[col] = 1200; // Default value
      }
    });
    const defaultValue = 1200;
    const response = await addRowAPI(tableName, refRow.id, position, rowData,defaultValue);
  
    if (response?.success && response?.newRow) {
      const newRow = { ...response.newRow, setting_id: refRow.setting_id };
      setTableData(prevData => {
        const index = prevData.findIndex(row => row.id === refRow.id);
        const insertAt = position === "above" ? index : index + 1;
        const newData = [...prevData];
        newData.splice(insertAt, 0, newRow);
        return newData;
      });
  
      // Focus edit on Tunning_param cell of the new row
      setEditingCell({ rowId: response.newRow.id, colName: "Tunning_param" });
    }
  };
  

  const handleSaveAll = async () => {
    for (const rowId in editedCells) {
      const changes = editedCells[rowId];
      const settingId = tableData.find(row => row.id == rowId)?.setting_id;
      const tableName = tableNames[settingId];

      if (!tableName) continue;

      for (const colName in changes) {
        const value = changes[colName];
        await updateRowAPI(tableName, rowId, colName, value);
      }
    }

    setEditedCells({});
    alert("Changes saved successfully!");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "100%", overflowX: "auto", position: "relative" }}>
      {/* Toggle hex/decimal display format */}
      <button
        onClick={() => setDisplayFormat(displayFormat === "hex" ? "dec" : "hex")}
        style={{
          marginBottom: "12px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Switch to {displayFormat === "hex" ? "Decimal" : "Hexadecimal"}
      </button>
      <div style={{ position: "relative", marginLeft: "30px" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          backgroundColor: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f1f1" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Serial</th>
            {columns
              .filter(col => col !== "serial_number" && col !== "id")
              .map(col => (
                <th key={col} style={{ padding: "12px", textAlign: "left" }}>
                  {col}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {/* + Button Above First Row */}
          {tableData.length > 0 && (
            <tr style={{ height: "0px", position: "relative" }}>
              <td colSpan={columns.length} style={{ padding: 0, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "-35px",
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                >
                  <button
                    onClick={() => handleAddRow(tableData[0], "above")}
                    style={{
                      fontSize: "14px",
                      padding: "4px 8px",
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      backgroundColor: "#e9ecef",
                      cursor: "pointer",
                      lineHeight: "1"
                    }}
                  >
                    +
                  </button>
                </div>
              </td>
            </tr>
          )}
  
          {/* Data Rows with in-between + buttons */}
          {tableData.map((row, rowIndex) => (
            <React.Fragment key={row.id}>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{row.serial_number}</td>
                {columns
                  .filter(col => col !== "serial_number" && col !== "id")
                  .map(col => (
                    <td
                      key={`${row.id}-${col}`}
                      onDoubleClick={() => setEditingCell({ rowId: row.id, colName: col })}
                      style={{
                        padding: "10px",
                        backgroundColor: editedCells?.[row.id]?.[col]
                          ? "#fff3cd"
                          : "transparent",
                        cursor: "pointer"
                      }}
                    >
                      {editingCell?.rowId === row.id && editingCell?.colName === col ? (
                        <input
                          autoFocus
                          value={editedCells?.[row.id]?.[col] ?? row[col]}
                          onChange={(e) => handleChange(e, row.id, col)}
                          onBlur={() => setEditingCell(null)}
                          style={{
                            width: "100%",
                            padding: "6px",
                            fontSize: "14px",
                            boxSizing: "border-box"
                          }}
                        />
                      ) : col !== "Tunning_param" ? (
                        convertValue(row[col])
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
              </tr>
  
              {/* + Button Between Rows */}
              <tr style={{ height: "0px", position: "relative" }}>
                <td colSpan={columns.length} style={{ padding: 0, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "-35px",
                      top: "50%",
                      transform: "translateY(-50%)"
                    }}
                  >
                    <button
                      onClick={() => handleAddRow(row, "below")}
                      style={{
                        fontSize: "14px",
                        padding: "4px 8px",
                        borderRadius: "50%",
                        border: "1px solid #ccc",
                        backgroundColor: "#e9ecef",
                        cursor: "pointer",
                        lineHeight: "1"
                      }}
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
      {/* Save All Changes Button */}
      {Object.keys(editedCells).length > 0 && (
        <button
          onClick={handleSaveAll}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Save All Changes
        </button>
      )}
    </div>
  );
  
};

export default FileDataTable;