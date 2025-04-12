import React, { useState, useEffect } from "react";
import {
  fetchTableNameBySettingId,
  fetchTableData,
  addRowAPI,
  updateRowAPI,
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

  useEffect(() => {
    const fetchTableNames = async () => {
      setLoading(true);
      setError("");
      try {
        const newTableNames = { ...tableNames };
        await Promise.all(
          Object.values(selectedSetFiles).map(async (file) => {
            if (!newTableNames[file.setting_id]) {
              const tableName = await fetchTableNameBySettingId(file.setting_id);
              newTableNames[file.setting_id] = tableName || "Unknown Table";
            }
          })
        );
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

        await Promise.all(
          Object.values(selectedSetFiles).map(async (file) => {
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
          })
        );

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
    const isNewRow = newRows.some(nr => nr.tempId === rowId);
    if (isNewRow) {
      setTableData(prev =>
        prev.map(row => (row.id === rowId ? { ...row, [colName]: newValue } : row))
      );
      return;
    }

    setEditedCells(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [colName]: newValue,
      },
    }));

    setTableData(prev =>
      prev.map(row => (row.id === rowId ? { ...row, [colName]: newValue } : row))
    );
  };

  const handleAddRow = (refRow) => {
    const newTempId = `temp-${Date.now()}`;
    const index = tableData.findIndex(row => row.id === refRow.id);
    const prev = tableData[index];
    const next = tableData[index + 1];
  
    let newSerial;
    if (next) {
      newSerial = (parseFloat(prev.serial_number) + parseFloat(next.serial_number)) / 2;
    } else {
      newSerial = parseFloat(prev.serial_number) + 1;
    }
  
    const newRow = {
      id: newTempId,
      setting_id: refRow.setting_id,
      serial_number: newSerial,
      Tunning_param: "",
    };
  
    columns.forEach(col => {
      if (!["id", "serial_number", "Tunning_param", "setting_id"].includes(col)) {
        newRow[col] = 1200;
      }
    });
  
    setTableData(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newRow);
      return updated;
    });
  
    setNewRows(prev => [...prev, {
      tempId: newTempId,
      refId: next?.id ?? refRow.id,  // Take the ID of the row *below*, or fallback
      position: "below",             // insert above the row below
      rowData: newRow,
    }]);
  };
  

  const handleSaveEditedCells = async () => {
    for (const rowId in editedCells) {
      const changes = editedCells[rowId];
      const settingId = tableData.find(row => row.id == rowId)?.setting_id;
      const tableName = tableNames[settingId];
      if (!tableName) continue;

      for (const colName in changes) {
        await updateRowAPI(tableName, rowId, colName, changes[colName]);
      }
    }

    setEditedCells({});
    alert("Edited cells saved successfully!");
  };

  const handleSaveNewRows = async () => {
    // let x = 0;
  
    for (const newRow of newRows) {
      const refRow = tableData.find(r => r.id === newRow.refId);
      const settingId = refRow?.setting_id;
      const tableName = tableNames[settingId];
  
      if (!tableName) continue;
  
      const rowInState = tableData.find(r => r.id === newRow.tempId);
      if (!rowInState?.Tunning_param) {
        alert("Tunning_param is required before saving new rows.");
        return;
      }
  
      const finalRowData = {};
      columns.forEach(col => {
        if (!["id", "serial_number", "setting_id"].includes(col)) {
          finalRowData[col] = rowInState[col] ?? 1200;
        }
      });
  
      const adjustedRefId = !isNaN(parseInt(newRow.refId))
        ? parseInt(newRow.refId) 
        : newRow.refId;
  
      const response = await addRowAPI(
        tableName,
        adjustedRefId,            // reference ID with +x adjustment
        newRow.position,
        finalRowData,
        rowInState.serial_number
      );
  
      if (response?.success && response?.newRow) {
        const actualRow = { ...response.newRow, setting_id: rowInState.setting_id };
  
        setTableData(prev => {
          const index = prev.findIndex(row => row.id === newRow.tempId);
          const updated = [...prev];
          updated.splice(index, 1, actualRow);
          return updated;
        });
  
        // x++; // increment for next insertion
      }
    }
  
    setNewRows([]);
    alert("New rows saved successfully!");
  };
  const handleSaveAllChanges = async () => {
    if (Object.keys(editedCells).length > 0) {
      await handleSaveEditedCells();
    }
    if (newRows.length > 0) {
      await handleSaveNewRows();
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
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 && (
              <tr className="add-row">
                <td colSpan={columns.length}>
                  <button
                    className="add-button"
                    onClick={() => handleAddRow(tableData[0])}
                  >
                    +
                  </button>
                </td>
              </tr>
            )}

            {tableData.map((row) => (
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
                        <input
                          autoFocus
                          value={editedCells?.[row.id]?.[col] ?? row[col]}
                          onChange={(e) => handleChange(e, row.id, col)}
                          onBlur={() => setEditingCell(null)}
                          className="cell-input"
                        />
                      ) : col !== "Tunning_param" ? (
                        convertValue(row[col])
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="add-row">
                  <td colSpan={columns.length}>
                    <button
                      className="add-button"
                      onClick={() => handleAddRow(row)}
                    >
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
  {(Object.keys(editedCells).length > 0 || newRows.length > 0) && (
    <button onClick={handleSaveAllChanges} className="save-button">
      Save All Changes
    </button>
  )}
</div>

    </div>
  );
};

export default FileDataTable;
