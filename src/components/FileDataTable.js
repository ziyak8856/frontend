import React, { useState, useEffect } from "react";
import { fetchTableNameBySettingId, fetchTableData } from "../services/api"; // Import API functions

const FileDataTable = ({ selectedSetFiles }) => {
  const [tableNames, setTableNames] = useState({}); // Store setting_id -> table_name mapping
  const [tableData, setTableData] = useState([]); // Store merged table data
  const [columns, setColumns] = useState(["id", "Tunning_param"]); // Store dynamically added columns
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayFormat, setDisplayFormat] = useState("hex"); // "hex" or "dec"

  useEffect(() => {
    const fetchTableNames = async () => {
      setLoading(true);
      setError("");

      try {
        const newTableNames = { ...tableNames };
        const fetchPromises = Object.values(selectedSetFiles).map(async (file) => {
          if (!newTableNames[file.setting_id]) {
            try {
              const tableName = await fetchTableNameBySettingId(file.setting_id);
              newTableNames[file.setting_id] = tableName || "Unknown Table";
            } catch (err) {
              console.error(`Error fetching table name for ${file.setting_id}:`, err);
              newTableNames[file.setting_id] = "Error Loading";
            }
          }
        });

        await Promise.all(fetchPromises);
        setTableNames(newTableNames);
      } catch (error) {
        setError("Failed to fetch table names.");
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(selectedSetFiles).length > 0) {
      fetchTableNames();
    } else {
      setTableData([]); // Clear table data when no file is selected
    }
  }, [selectedSetFiles]);

  useEffect(() => {
    const fetchData = async () => {
      if (!Object.keys(tableNames).length) return; // Wait until table names are fetched

      setLoading(true);
      setError("");

      try {
        const allData = {};
        let newColumns = ["id", "Tunning_param"]; // Always include base columns

        const fetchPromises = Object.values(selectedSetFiles).map(async (file) => {
          const tableName = tableNames[file.setting_id]; // Get table name
          const columnName = file.name; // Get column name

          if (tableName && columnName) {
            try {
              const data = await fetchTableData(tableName, columnName);
              if (data && data.rows) {
                newColumns.push(columnName); // Add the new column dynamically

                data.rows.forEach((row) => {
                  const id = row.id;
                  if (!allData[id]) {
                    allData[id] = { id, Tunning_param: row.Tunning_param };
                  }
                  allData[id][columnName] = row[columnName] || "-"; // Assign column value
                });
              }
            } catch (err) {
              console.error(`Error fetching table data for ${tableName}:`, err);
            }
          }
        });

        await Promise.all(fetchPromises);
        setColumns([...new Set(newColumns)]); // Remove duplicates
        setTableData(Object.values(allData)); // Convert to array
      } catch (error) {
        setError("Failed to fetch table data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableNames]);

  // Convert Hex to Decimal
  const convertValue = (value) => {
    if (!value || value === "-") return "-";
    return displayFormat === "hex" ? value.toString().toUpperCase() : parseInt(value, 16);
  };

  return (
    <div>
    {loading && <p>Loading data...</p>}
    {error && <p style={{ color: "red" }}>{error}</p>}
  
    {/* Radio Buttons for Hex/Decimal Selection */}
    <div>
      <label>
        <input
          type="radio"
          name="format"
          value="hex"
          checked={displayFormat === "hex"}
          onChange={() => setDisplayFormat("hex")}
        />
        Hexadecimal
      </label>
      <label style={{ marginLeft: "20px" }}>
        <input
          type="radio"
          name="format"
          value="dec"
          checked={displayFormat === "dec"}
          onChange={() => setDisplayFormat("dec")}
        />
        Decimal
      </label>
    </div>
  
    {tableData.length > 0 && (
      <div>
        <table border="1">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {/* Exclude conversion for "Tunning_param" */}
                    {col === "Tunning_param" ? row[col] : convertValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
  );  
};

export default FileDataTable;
