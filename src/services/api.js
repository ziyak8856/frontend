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
export const addSettings = async (settings) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/settings`, { settings }, getAuthHeaders());
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
