import React, { useState, useEffect } from "react";
import {
  fetchTableNameBySettingId,
  fetchTableData,
  addRowAPI,
  updateRowAPI,
  fetchRegmap,
  deleteRowAPI,
} from "../services/api";
import "../styles/FileData.css";

const FileDataTable = ({ selectedSetFiles }) => {
  const [tableNames, setTableNames] = useState({});
const [tableData, setTableData] = useState([]);
const [editedCells, setEditedCells] = useState({});
const [editingCell, setEditingCell] = useState(null);
const [columns, setColumns] = useState(["serial_number", "Tunning_param"]);
const [displayFormat, setDisplayFormat] = useState("hex");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [newRows, setNewRows] = useState([]);
const [regmapContent, setRegmapContent] = useState("Loading regmap content...");
const [focusedRow, setFocusedRow] = useState(null);
const[deleted,setDeletedRows] = useState([]);
useEffect(() => {
  const fetchAndSetRegmap = async () => {
    const projectId = localStorage.getItem("projectId");
    if (projectId) {
      try {
        setLoading(true); // Start loading
        const data = await fetchRegmap(projectId);
        
        if (data) {
          setRegmapContent(data); // Set the fetched regmap content
        } else {
          setRegmapContent("Error: Failed to fetch or parse regmap data.");
        }
      } catch (err) {
        console.error("Error fetching regmap:", err);
        setError("Failed to fetch regmap.");
      } finally {
      
      }
    } else {
      console.warn("No projectId found in localStorage");
      setRegmapContent("No project ID found.");
      
    }
  };

  fetchAndSetRegmap();
}, []); // ✅ Only runs once when the component mounts
useEffect(() => {
  const fetchTableNames = async () => {
    setLoading(true);
    setError("");

    try {
      const newTableNames = {};

      await Promise.all(
        Object.values(selectedSetFiles).map(async (file) => {
          if (!newTableNames[file.setting_id]) {
            const tableName = await fetchTableNameBySettingId(file.setting_id);
            newTableNames[file.setting_id] = tableName || "Unknown Table";
          }
        })
      );

      if (JSON.stringify(newTableNames) !== JSON.stringify(tableNames)) {
        setTableNames(newTableNames);
      }

    } catch {
      setError("Failed to fetch table names.");
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(selectedSetFiles).length > 0) {
    fetchTableNames();
  } else {
    resetState();
  }
// ✅ Do not include tableNames to avoid loops
}, [selectedSetFiles]);

useEffect(() => {
  const fetchData = async () => {
    if (!Object.keys(tableNames).length || !Object.keys(selectedSetFiles).length) {
      resetState();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const mergedData = {};
      const dynamicColumns = new Set(["serial_number", "Tunning_param"]);

      await Promise.all(
        Object.values(selectedSetFiles).map(async (file) => {
          const tableName = tableNames[file.setting_id];
          const columnName = file.name;

          if (tableName && columnName) {
            const data = await fetchTableData(tableName, columnName);
            if (data?.rows) {
              dynamicColumns.add(columnName);
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
                mergedData[id][columnName] = row[columnName] ?? "-";
              });
            }
          }
        })
      );

      const newColumns = [...dynamicColumns];
      const mergedArray = Object.values(mergedData).sort((a, b) => a.serial_number - b.serial_number);

      setColumns((prev) => (JSON.stringify(prev) !== JSON.stringify(newColumns) ? newColumns : prev));
      setTableData((prev) => (JSON.stringify(prev) !== JSON.stringify(mergedArray) ? mergedArray : prev));

    } catch (err) {
      console.error("Error fetching table data:", err);
      setError("Failed to fetch table data.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
// ✅ Rely only on meaningful changes
}, [JSON.stringify(tableNames), JSON.stringify(selectedSetFiles)]);

// 🧹 Resets all state to defaults
const resetState = () => {
  setTableData([]);
  setColumns(["serial_number", "Tunning_param"]);
  setTableNames({});
  setEditedCells({});
  setEditingCell(null);
  setNewRows([]);
};

const convertValue = (value) => {
  if (!value || value === "-") return "-";
  return displayFormat === "hex" ? value.toString().toUpperCase() : parseInt(value, 16);
};
const handleChange = (e, rowId, colName) => {
  const newValue = e.target.value;
  const isNewRow = newRows.some(nr => nr.tempId === rowId);

  // Update tableData
  setTableData(prev => {
    return prev.map(row => {
      if (row.id !== rowId) return row;

      const updatedRow = { ...row, [colName]: newValue };

      // If Tunning_param is changed, fill values from regmap
      if (colName === "Tunning_param") {
        const regmapEntry = regmapContent[newValue]?.Value;

        if (regmapEntry !== undefined) {
          columns.forEach(col => {
            if (
              !["id", "serial_number", "setting_id", "Tunning_param"].includes(col)
            ) {
              updatedRow[col] = regmapEntry;
            }
          });
        }
      }

      return updatedRow;
    });
  });

  // Update editedCells
  if (!isNewRow) {
    setEditedCells(prev => {
      const updated = {
        ...prev[rowId],
        [colName]: newValue,
      };

      if (colName === "Tunning_param") {
        const regmapEntry = regmapContent[newValue]?.Value;

        if (regmapEntry !== undefined) {
          columns.forEach(col => {
            if (
              !["id", "serial_number", "setting_id", "Tunning_param"].includes(col)
            ) {
              updated[col] = regmapEntry;
            }
          });
        }
      }

      return {
        ...prev,
        [rowId]: updated,
      };
    });
  }
};


const handleAddRow = (refRow) => {
  const newTempId = `temp-${Date.now()}`;
  const index = tableData.findIndex(row => row.id === refRow.id);
  const prev = tableData[index];
  const next = tableData[index + 1];

  let newSerial = next
    ? (parseFloat(prev.serial_number) + parseFloat(next.serial_number)) / 2
    : parseFloat(prev.serial_number) + 1;

  const newRow = {
    id: newTempId,
    setting_id: refRow.setting_id,
    serial_number: newSerial,
    Tunning_param: "",
  };

  columns.forEach(col => {
    if (!["id", "serial_number", "Tunning_param", "setting_id"].includes(col)) {
      newRow[col] = null;
    }
  });

  setTableData(prev => {
    const updated = [...prev];
    updated.splice(index + 1, 0, newRow);
    return updated;
  });

  setNewRows(prev => [
    ...prev,
    {
      tempId: newTempId,
      refId: next?.id ?? refRow.id,
      position: "below",
      rowData: newRow,
    },
  ]);
};

const handleSaveEditedCells = async () => {
  for (const rowId in editedCells) {
    const changes = editedCells[rowId];
    const settingId = tableData.find(row => row.id == rowId)?.setting_id;
    const tableName = tableNames[settingId];
    if (!tableName) continue;

    for (const colName in changes) {
      
        const regmapEntry = regmapContent[changes[colName]]?.Value;
      await updateRowAPI(tableName, rowId, colName, changes[colName], regmapEntry);
    }
  }

  setEditedCells({});
  alert("Edited cells saved successfully!");
};

const handleSaveNewRows = async () => {
  const unsavedValidRows = [];

  for (const newRow of newRows) {
    const rowInState = tableData.find(r => r.id === newRow.tempId);
    const tunningValue = rowInState?.Tunning_param?.toString().trim();

    if (!tunningValue) {
      alert(`Tunning_param is required before saving row with serial no: ${rowInState.serial_number}`);
      return;
    }

    unsavedValidRows.push({ newRow, rowInState });
  }

  for (const { newRow, rowInState } of unsavedValidRows) {
    const refRow = tableData.find(r => r.id === newRow.refId);
    const settingId = refRow?.setting_id;
    const tableName = tableNames[settingId];
    if (!tableName) continue;

    const isComment = typeof rowInState.Tunning_param === "string" &&
                      rowInState.Tunning_param.trim().startsWith("//");

    const tuningKey = rowInState.Tunning_param?.trim();
    const regmapValue = regmapContent?.[tuningKey]?.Value ?? null;

    const finalRowData = {};
    columns.forEach(col => {
      if (!["id", "serial_number", "setting_id"].includes(col)) {
        if (col === "Tunning_param") {
          finalRowData[col] = rowInState[col];
        } else {
          finalRowData[col] = isComment ? null : (rowInState[col] ?? regmapValue);
        }
      }
    });

    const adjustedRefId = !isNaN(parseInt(newRow.refId))
      ? parseInt(newRow.refId)
      : newRow.refId;

    const response = await addRowAPI(
      tableName,
      adjustedRefId,
      newRow.position,
      finalRowData,
      regmapValue
    );

    if (response?.success && response?.newRow) {
      const actualRow = { ...response.newRow, setting_id: rowInState.setting_id };

      setTableData(prev => {
        const index = prev.findIndex(row => row.id === newRow.tempId);
        const updated = [...prev];
        updated.splice(index, 1, actualRow);
        return updated;
      });
    }
  }

  setNewRows([]);
  alert("New rows saved successfully!");
};
const handleDeleteRow = (rowId) => {
  const rowToDelete = tableData.find(row => row.id === rowId);
  if (!rowToDelete) return;

  const isTemp = rowId.toString().startsWith("temp");

  // Immediately delete temp row from frontend
  if (isTemp) {
    setTableData(prev => prev.filter(row => row.id !== rowId));
    setNewRows(prev => prev.filter(row => row.tempId !== rowId));
    return;
  }

  const confirmed = window.confirm("Are you sure you want to delete this row?");
  if (!confirmed) return;

  setDeletedRows(prev => [...prev, rowToDelete]); // Store full row object
  console.log(rowToDelete, "rowToDelete");
  setTableData(prev => prev.filter(row => row.id !== rowId)); // Remove from UI
};



const handleSaveDeletedRows = async () => {
  if (deleted.length === 0) return;

  let allSuccessful = true;

  for (const row of deleted) {
    const tableName = tableNames[row.setting_id];
    if (!tableName) continue;
    console.log(tableName, "tableName");
    console.log(row.id, "rowId");
    const response = await deleteRowAPI(tableName, row.id);

    if (!response?.success) {
      allSuccessful = false;
      console.error(`Failed to delete row with ID ${row.id}`, response);
    }
  }

  if (allSuccessful) {
    setDeletedRows([]);
    alert("All deletions saved to backend!");
  } else {
    alert("Some deletions failed. Please try again.");
  }
};


// 🧠 Unified Save Button
const handleSaveAllChanges = async () => {
  if (Object.keys(editedCells).length > 0) {
    await handleSaveEditedCells();
  }
  if (newRows.length > 0) {
    await handleSaveNewRows();
  }
  // console.log(deletedRowIds, "deletedRowIds");
  if (deleted.length > 0) {
    await handleSaveDeletedRows();
  }
};
  
return (
  <div className="file-table-container">
    <button
      onClick={() => setDisplayFormat(displayFormat === "hex" ? "dec" : "hex")}
      className="toggle-format-button"
    >
      Switch to {displayFormat === "hex" ? "Decimal" : "Hexadecimal"}
    </button>

    <div className="table-wrapper">
      <table className="file-data-table">
        <thead>
          <tr className="table-header">
            <th>Serial</th>
            {columns.filter(col => col !== "serial_number" && col !== "id").map(col => (
              <th key={col}>{col}</th>
            ))}
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 && (
            <tr className="add-row">
              <td colSpan={columns.length + 1}>
                <button className="add-button" onClick={() => handleAddRow(tableData[0])}>
                  +
                </button>
              </td>
            </tr>
          )}

          {tableData.map(row => (
            <React.Fragment key={row.id}>
              <tr className="data-row">
                <td>{row.serial_number || "-"}</td>
                {columns.filter(col => col !== "serial_number" && col !== "id").map(col => (
                  <td
                    key={`${row.id}-${col}`}
                    onDoubleClick={() => setEditingCell({ rowId: row.id, colName: col })}
                    className={`cell ${editedCells?.[row.id]?.[col] ? "edited-cell" : ""}`}
                  >
                    {editingCell?.rowId === row.id && editingCell?.colName === col ? (
                      col === "Tunning_param" ? (
                        <div className="autocomplete-wrapper">
                          <input
                            autoFocus
                            value={editedCells?.[row.id]?.[col] ?? row[col] ?? ""}
                            onChange={e => handleChange(e, row.id, col)}
                            onBlur={() => setEditingCell(null)}
                            className="cell-input"
                            onFocus={() => setFocusedRow(row.id)}
                          />
                          {focusedRow === row.id && (
                            <div className="suggestion-box">
                              {Object.keys(regmapContent)
                                .filter(key =>
                                  key
                                    .toLowerCase()
                                    .includes(
                                      (editedCells?.[row.id]?.[col] ?? row[col] ?? "").toLowerCase()
                                    )
                                )
                                .slice(0, 50)
                                .map((key, index) => (
                                  <div
                                    key={index}
                                    className="suggestion-item"
                                    onMouseDown={() => {
                                      handleChange({ target: { value: key } }, row.id, col);
                                      setEditingCell(null);
                                    }}
                                  >
                                    {key}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          autoFocus
                          value={editedCells?.[row.id]?.[col] ?? row[col] ?? ""}
                          onChange={e => handleChange(e, row.id, col)}
                          onBlur={() => setEditingCell(null)}
                          className="cell-input"
                        />
                      )
                    ) : col !== "Tunning_param" ? (
                      convertValue(row[col])
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr className="add-row">
                <td colSpan={columns.length + 1}>
                  <button className="add-button" onClick={() => handleAddRow(row)}>
                    +
                  </button>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>

    <div className="button-group">
      {(Object.keys(editedCells).length > 0 || deleted.length > 0||newRows.length > 0) && (
        <button onClick={handleSaveAllChanges} className="save-button">
          Save All Changes
        </button>
      )}
    </div>
  </div>
);

  
};

export default FileDataTable;
