import React, { useState, useEffect } from "react";
import "./dashboard.css";

const API_BASE_URL = "http://localhost:3000";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("master");
  const [masterData, setMasterData] = useState([]);
  const [infoData, setInfoData] = useState([]);
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masterForm, setMasterForm] = useState({
    name: "",
    category: "",
    image: null,
    Aisle: "",
    Size: "",
  });
  const [infoForm, setInfoForm] = useState({
    Name: "",
    Type: "",
    Alcohol_Content: "",
    Country: "",
    Flavor: "",
    Age: "",
    Best_For: "",
  });
  const [offersForm, setOffersForm] = useState({
    category: "",
    size: "",
    brand: "",
    flavors: "",
  });
  const [message, setMessage] = useState(null);

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const masterResponse = await fetch(`${API_BASE_URL}/getliquormaster`);
      const masterRecords = await masterResponse.json();
      setMasterData(masterRecords);

      const infoResponse = await fetch(`${API_BASE_URL}/getliquorinfo`);
      const infoRecords = await infoResponse.json();
      setInfoData(infoRecords);

      const offersResponse = await fetch(`${API_BASE_URL}/getoffers`);
      const offersRecords = await offersResponse.json();
      setOffersData(offersRecords);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setMessage({ type: "error", text: "Failed to load data." });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMasterSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append("name", masterForm.name);
    formData.append("category", masterForm.category);
    formData.append("Aisle", masterForm.Aisle);
    formData.append("Size", masterForm.Size);
    formData.append("image", masterForm.image);

    try {
      const response = await fetch(`${API_BASE_URL}/addliquormaster`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();
      setMasterForm({
        name: "",
        category: "",
        image: null,
        Aisle: "",
        Size: "",
      });
      setMessage({
        type: "success",
        text: "Liquor Master record added successfully!",
      });
      fetchData(); // Refresh data after adding a new record
    } catch (error) {
      console.error("Error adding liquor master:", error);
      setMessage({
        type: "error",
        text: "Failed to add liquor master record.",
      });
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/addliquorinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(infoForm),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();
      setInfoForm({
        Name: "",
        Type: "",
        Alcohol_Content: "",
        Country: "",
        Flavor: "",
        Age: "",
        Best_For: "",
      });
      setMessage({
        type: "success",
        text: "Liquor Info record added successfully!",
      });
      fetchData(); // Refresh data after adding a new record
    } catch (error) {
      console.error("Error adding liquor info:", error);
      setMessage({ type: "error", text: "Failed to add liquor info record." });
    }
  };

  const handleOffersSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/addoffer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offersForm),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await response.json();
      setOffersForm({
        category: "",
        size: "",
        brand: "",
        flavors: "",
      });
      setMessage({
        type: "success",
        text: "Offer record added successfully!",
      });
      fetchData(); // Refresh data after adding a new record
    } catch (error) {
      console.error("Error adding offer:", error);
      setMessage({ type: "error", text: "Failed to add offer record." });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMasterForm({ ...masterForm, image: file });
    }
  };

  const renderMasterForm = () => (
    <form onSubmit={handleMasterSubmit} className="form-grid">
      {Object.keys(masterForm).map((key) => {
        if (key === "image") {
          const previewUrl = masterForm.image
            ? URL.createObjectURL(masterForm.image)
            : null;
          return (
            <div key={key} className="form-group">
              <label className="form-label">{key}:</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handleImageChange}
                required
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="table-image"
                  style={{ marginTop: "0.5rem" }}
                />
              )}
            </div>
          );
        }
        return (
          <div key={key} className="form-group">
            <label className="form-label">{key}:</label>
            <input
              type="text"
              className="form-input"
              value={masterForm[key]}
              onChange={(e) =>
                setMasterForm({ ...masterForm, [key]: e.target.value })
              }
              required
            />
          </div>
        );
      })}
      <div className="form-button-container">
        <button type="submit" className="form-button">
          Add Liquor Master
        </button>
      </div>
    </form>
  );

  const renderInfoForm = () => (
    <form onSubmit={handleInfoSubmit} className="form-grid">
      {Object.keys(infoForm).map((key) => (
        <div key={key} className="form-group">
          <label className="form-label">{key}:</label>
          <input
            type="text"
            className="form-input"
            value={infoForm[key]}
            onChange={(e) =>
              setInfoForm({ ...infoForm, [key]: e.target.value })
            }
            required
          />
        </div>
      ))}
      <div className="form-button-container">
        <button type="submit" className="form-button">
          Add Liquor Info
        </button>
      </div>
    </form>
  );

  const renderOffersForm = () => (
    <form onSubmit={handleOffersSubmit} className="form-grid">
      {Object.keys(offersForm).map((key) => (
        <div key={key} className="form-group">
          <label className="form-label">{key}:</label>
          <input
            type="text"
            className="form-input"
            value={offersForm[key]}
            onChange={(e) =>
              setOffersForm({ ...offersForm, [key]: e.target.value })
            }
            required
          />
        </div>
      ))}
      <div className="form-button-container">
        <button type="submit" className="form-button">
          Add Offer
        </button>
      </div>
    </form>
  );

  const renderMasterTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead className="table-head">
          <tr>
            <th className="table-cell">ID</th>
            <th className="table-cell">Name</th>
            <th className="table-cell">Category</th>
            <th className="table-cell">Image</th>
            <th className="table-cell">Aisle</th>
            <th className="table-cell">Size</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {masterData.map((item) => (
            <tr key={item.id}>
              <td className="table-cell">{item.id}</td>
              <td className="table-cell">{item.name}</td>
              <td className="table-cell">{item.category}</td>
              <td className="table-cell">
                <img src={item.image} alt={item.name} className="table-image" />
              </td>
              <td className="table-cell">{item.Aisle}</td>
              <td className="table-cell">{item.Size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderInfoTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead className="table-head">
          <tr>
            <th className="table-cell">ID</th>
            <th className="table-cell">Name</th>
            <th className="table-cell">Type</th>
            <th className="table-cell">Alcohol Content</th>
            <th className="table-cell">Country</th>
            <th className="table-cell">Flavor</th>
            <th className="table-cell">Age</th>
            <th className="table-cell">Best For</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {infoData.map((item) => (
            <tr key={item.Id}>
              <td className="table-cell">{item.Id}</td>
              <td className="table-cell">{item.Name}</td>
              <td className="table-cell">{item.Type}</td>
              <td className="table-cell">{item["Alcohol Content"]}</td>
              <td className="table-cell">{item.Country}</td>
              <td className="table-cell">{item.Flavor}</td>
              <td className="table-cell">{item.Age}</td>
              <td className="table-cell">{item["Best For"]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOffersTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead className="table-head">
          <tr>
            <th className="table-cell">ID</th>
            <th className="table-cell">Category</th>
            <th className="table-cell">Size</th>
            <th className="table-cell">Brand</th>
            <th className="table-cell">Flavors</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {offersData.map((item) => (
            <tr key={item.id}>
              <td className="table-cell">{item.id}</td>
              <td className="table-cell">{item.category}</td>
              <td className="table-cell">{item.size}</td>
              <td className="table-cell">{item.brand}</td>
              <td className="table-cell">{item.flavors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          onClick={() => {
            setActiveTab("master");
            setMessage(null);
          }}
          className={`tab-button ${activeTab === "master" ? "active-tab" : ""}`}
        >
          Liquor Master
        </button>
        <button
          onClick={() => {
            setActiveTab("info");
            setMessage(null);
          }}
          className={`tab-button ${activeTab === "info" ? "active-tab" : ""}`}
        >
          Liquor Info
        </button>
        <button
          onClick={() => {
            setActiveTab("offers");
            setMessage(null);
          }}
          className={`tab-button ${activeTab === "offers" ? "active-tab" : ""}`}
        >
          Offers
        </button>
      </div>

      {message && (
        <div
          className={`message ${
            message.type === "success" ? "success-message" : "error-message"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="content-card">
        <h1 className="heading">
          {activeTab === "master"
            ? "Liquor Master"
            : activeTab === "info"
            ? "Liquor Info"
            : "Offers"}{" "}
          Dashboard
        </h1>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading data...</div>
        ) : (
          <>
            {/* Form Section */}
            <div className="form-section">
              <h2 className="sub-heading">Add New Record</h2>
              {activeTab === "master"
                ? renderMasterForm()
                : activeTab === "info"
                ? renderInfoForm()
                : renderOffersForm()}
            </div>

            {/* Table Section */}
            <div>
              <h2 className="sub-heading">Current Data</h2>
              {activeTab === "master"
                ? renderMasterTable()
                : activeTab === "info"
                ? renderInfoTable()
                : renderOffersTable()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
