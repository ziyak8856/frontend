import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Set auth headers
const getAuthHeaders = () => ({
  headers: { Authorization: localStorage.getItem("token") },
});

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed. Please try again.";
  }
};

// Create new project
export const createProject = async ({ name, mv4, mv6, regmap_path, regmap_binpath }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects`, 
      { name, mv4, mv6, regmap_path, regmap_binpath }, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Project creation failed.";
  }
};
