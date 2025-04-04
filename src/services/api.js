import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Set auth headers
const getAuthHeaders = () => ({
  headers: { Authorization: localStorage.getItem("token") },
});

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed. Please try again.";
  }
};

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const fetchProjectById = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
};

// Create a new project
export const createProject = async (formData) => {
  try {
    //      formData.forEach((value, key) => {
    //   console.log(key, value);  
    //  });
    const response = await axios.post(`${API_BASE_URL}/projects`, formData, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders().headers },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Project creation failed.";
  }
};

// Fetch customers under a project
export const fetchCustomers = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers/${projectId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

// Add a new customer to a project
export const addCustomers = async (projectId, customers) => {
  try {
    // console.log(customers);
    const response = await axios.post(
      `${API_BASE_URL}/customers`,
      { projectId, customers },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Adding customers failed.";
  }
};

// Fetch all settings for a customer
export const fetchSettings = async (customerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/settings/${customerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

// Add a new setting to a customer
export const addSettings = async (settings,uniqueArray1) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/settings`, { settings,uniqueArray1 }, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Settings creation failed.";
  }
};


// Fetch all modes for a customer
export const fetchModes = async (customerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/modes/${customerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching modes:", error);
    throw error;
  }
};

// Add a new mode for a customer
export const addMode = async ({ customer_id, name }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/modes`,
      { customer_id, name },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Adding mode failed.";
  }
};

export const uploadRegmap = async ({ file, projectId, name }) => {
  try {
    const formData = new FormData();
    formData.append("regmap", file);
    formData.append("projectId", projectId);
    formData.append("name", name);
          formData.forEach((value, key) => {
      console.log(key, value);  
     });
    const response = await axios.post(`${API_BASE_URL}/projects/upload-regmap`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders().headers, // Include auth headers if needed
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Regmap upload failed.";
  }
};
export const addSetting = async (customerId, name, tableName, uniqueArray) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/settings/add`, {
      customer_id: customerId,
      name,
      table_name: tableName,
      uniqueArray1: uniqueArray
    });

    return response.data;
  } catch (error) {
    console.error("Error adding setting:", error);
    throw error;
  }
};
 
export const getCustomerById = async (customerId) => {
  try {
    console.log("customerrr",customerId);
    const response = await axios.get(`${API_BASE_URL}/customers/single/${customerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
};
export const fetchSetFilesbyMode = async (modeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/setfile/getSetFiles?mode_id=${modeId}`,getAuthHeaders());
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API error:", error);
    return { message: "Error fetching data" };
  }
};
export const fetchTableNameBySettingId = async (settingId) => {
  try {
    console.log("settingId",settingId);
    const response = await fetch(`${API_BASE_URL}/settings/getTableName/${settingId}`, getAuthHeaders());
    const data = await response.json();
    return data.table_name;
  } catch (error) {
    console.error("Error fetching table name:", error);
    return "Unknown";
  }
};
// Ensure these are correctly imported

export const fetchTableData = async (tableName, columnName) => {
  console.log("tableName:", tableName);
  console.log("columnName:", columnName);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/get-table-data`,
      { tableName, columnName }, // Send as request body
      {
        headers: { ...getAuthHeaders().headers }, // Include authentication headers
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching table data:", error);
    throw error;
  }
};

