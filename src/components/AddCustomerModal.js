import React, { useEffect, useState } from "react";
import { addCustomers } from "../services/api";
import "../styles/addcus.css";

const AddCustomerModal = ({ isOpen, onClose }) => {
    const [customerInputs, setCustomerInputs] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const projectId = localStorage.getItem("projectId");

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"; // Disable background scrolling
        } else {
            document.body.style.overflow = "auto"; // Enable scrolling when modal closes
        }
        return () => {
            document.body.style.overflow = "auto"; // Cleanup when unmounting
        };
    }, [isOpen]);

    const handleInputChange = (index, value) => {
        const updatedCustomers = [...customerInputs];
        updatedCustomers[index] = value;
        setCustomerInputs(updatedCustomers);
    };

    const handleAddMore = () => {
        setCustomerInputs([...customerInputs, ""]);
    };

    const handleSubmit = async () => {
        if (!projectId) {
            setError("Project ID is missing.");
            return;
        }

        const filteredCustomers = customerInputs.filter(name => name.trim() !== "");
        if (filteredCustomers.length === 0) {
            setError("Please enter at least one customer.");
            return;
        }

        setLoading(true);
        try {
            await addCustomers(projectId, filteredCustomers);
            setCustomerInputs([""]); // Reset input fields
            setError("");
            onClose(); // Close modal
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="h2">Add Customers</h2>
                {customerInputs.map((customer, index) => (
                    <input
                        key={index}
                        type="text"
                        value={customer}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={`Customer ${index + 1}`}
                        className="modal-input"
                    />
                ))}
                <div className="modal-buttons">
                    <button className="add-more-btn" onClick={handleAddMore}>+ Add More</button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AddCustomerModal;
