import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MapWithDraw from "./MapWithDraw";
import { API_BASE_URL } from '../apiConfig';

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

interface Farm {
  id: string;
  custom_farm_id: string;
  rice_type: string;
  water_source: string;
  H_start_date: string;
  acres: string;
  geojson: any;
  pdfs?: any[];
}

interface NewFarm {
  custom_farm_id: string;
  rice_type: string;
  water_source: string;
  H_start_date: string;
  acres: string;
  geojson?: any;
}

// Success Modal Component
const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-green-600">Success!</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-white transition duration-300 bg-green-600 rounded-lg hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const FarmsPage: React.FC = () => {
  const { id  } = useParams<{ id: string }>();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [newFarm, setNewFarm] = useState<NewFarm>({
    custom_farm_id: "",
    rice_type: "",
    water_source: "",
    H_start_date: new Date().toISOString().split("T")[0],
    acres: "",
    geojson: null,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarms = async () => {
      const accessToken = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${API_BASE_URL}/analyze/farms/${id}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch farms");
        const data = await response.json();
        setFarms(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, [id]);

  const handleSaveFarm = async () => {
    const accessToken = localStorage.getItem("token");
  
    const url = selectedFarm
      ? `${API_BASE_URL}/analyze/update/farmers/${id}/farm/${selectedFarm.id}/`
      : `${API_BASE_URL}/analyze/farms/${id}/`;
    const method = selectedFarm ? "PATCH" : "POST";
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newFarm,
          farmer_id: parseInt(id), // Add farmer_id from URL params
        }),
      });
      if (!response.ok) throw new Error("Error saving farm");
      const savedFarm = await response.json();
      setFarms((prevFarms) =>
        selectedFarm
          ? prevFarms.map((farm) =>
              farm.id === savedFarm.id ? savedFarm : farm
            )
          : [...prevFarms, savedFarm]
      );
      resetForm();
      setSuccessMessage(selectedFarm ? "Farm updated successfully!" : "Farm created successfully!");
    } catch (error) {
      console.error(error.message);
      setSuccessMessage("Error saving farm: " + error.message);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    const accessToken = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}analyze/update/farmers/${id}/farm/${farmId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Error deleting farm");
      setFarms(farms.filter((farm) => farm.id !== farmId));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAnalyzeFarm = async (farmId) => {
    setIsProcessing(true);
    const accessToken = localStorage.getItem("token");

    try {
      // Step 1: Draw map
      const drawMapResponse = await fetch(
        `${API_BASE_URL}analyze/api/farms/${farmId}/farmers/${id}/draw-map/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!drawMapResponse.ok) throw new Error("Error in draw map API");

      // Step 2: Analyze farm
      const analyzeResponse = await fetch(
        `${API_BASE_URL}analyze/farmers/${id}/farm/${farmId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!analyzeResponse.ok) throw new Error("Error in analyze API");

      // Step 3: Generate PDF
      const generatePdfResponse = await fetch(
        `${API_BASE_URL}analyze/generatepdf/farmer/${id}/farm/${farmId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!generatePdfResponse.ok) throw new Error("Error in generate PDF API");

      const pdfResult = await generatePdfResponse.json();
      console.log("PDF Result:", pdfResult);
      setSuccessMessage("Analysis and PDF generation completed successfully!"); 
    } catch (error) {
      console.error(error.message);
      setSuccessMessage("Error during analysis process: " + error.message); 
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendNotifications = async (farmId) => {
    setIsProcessing(true);
    const accessToken = localStorage.getItem("token");

    try {
      // First call SMS API
      const smsResponse = await fetch(
        `${API_BASE_URL}/analyze/sms/send/farm/${farmId}/farmer/${id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!smsResponse.ok) throw new Error("Failed to send SMS");

      // Then call Voice API
      const voiceResponse = await fetch(
        `${API_BASE_URL}/analyze/notify_analysis_results/farm/${farmId}/farmer/${id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!voiceResponse.ok)
        throw new Error("Failed to send Voice notification");

      setSuccessMessage("SMS and Voice notifications sent successfully!"); // Set success message
    } catch (error) {
      console.error(error.message);
      setSuccessMessage("Error sending notifications: " + error.message); // Set error message
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewCropPerformance = async (farmId) => {
    const accessToken = localStorage.getItem("token");
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/analyze/crop-dash/${id}/farm/${farmId}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error("Failed to fetch crop performance data");

      navigate(`/crop-performance/${id}/farm/${farmId}/`);
    } catch (error) {
      console.error(error.message);
      setSuccessMessage("Error accessing crop performance: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setNewFarm({
      custom_farm_id: "",
      rice_type: "",
      water_source: "",
      H_start_date: new Date().toISOString().split("T")[0],
      acres: "",
      geojson: null,
    });
    setSelectedFarm(null);
    setShowForm(false);
  };

  const handleGeoJSONUpdate = (polygonGeoJSON) => {
    setNewFarm((prevFarm) => ({ ...prevFarm, geojson: polygonGeoJSON }));
  };

  const handleEditFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setNewFarm(farm);
    setShowForm(true);
  };

  return (
<div className="min-h-screen ">
  {/* Loading Overlay */}
  {isProcessing && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-b-4 rounded-full border-emerald-500 animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-white">
          Processing your request...
        </p>
      </div>
    </div>
  )}

  {/* Success Modal */}
  {successMessage && (
    <SuccessModal
      message={successMessage}
      onClose={() => setSuccessMessage(null)}
    />
  )}

  <div className="px-4 py-8 mx-auto max-w-7xl">
    {/* Header with action button */}
    <div className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
      <h1 className="mb-4 text-3xl font-bold text-emerald-800 md:mb-0">
        <span className="text-emerald-600">Farms of {id} </span> 
      </h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-5 py-2.5 text-white bg-black rounded-lg transition-colors shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        {selectedFarm ? "Edit Farm" : "Add New Farm"}
      </button>
    </div>

    {/* Map Container with styled card */}
    <div className="mb-8 overflow-hidden bg-white shadow-md rounded-xl">
      <div className="p-4 text-white bg-emerald-700">
        <h2 className="text-xl font-semibold">Farm Map View</h2>
        <p className="text-sm text-emerald-100">Draw or edit farm boundaries on the map</p>
      </div>
      <div className="w-full z-0 h-[60vh] md:h-[65vh] lg:h-[70vh]">
        <MapWithDraw
          onGeoJSONUpdate={handleGeoJSONUpdate}
          initialGeoJSON={farms.map((farm) => farm.geojson).filter(Boolean)}
        />
      </div>
    </div>

    {/* Add/Edit Form */}
    {showForm && (
      <div className="mb-8 overflow-hidden shadow-md rounded-xl">
        <div className="p-4 text-white bg-emerald-700">
          <h2 className="text-xl font-semibold">
            {selectedFarm ? "Edit Farm Details" : "Add New Farm"}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              label="Crop Type"
              value={newFarm.rice_type}
              onChange={(value) =>
                setNewFarm({ ...newFarm, rice_type: value })
              }
            />
            <FormField
              label="Water Source"
              value={newFarm.water_source}
              onChange={(value) =>
                setNewFarm({ ...newFarm, water_source: value })
              }
            />
            <FormField
              label="Start Date"
              value={newFarm.H_start_date}
              type="date"
              onChange={(value) =>
                setNewFarm({ ...newFarm, H_start_date: value })
              }
            />
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSaveFarm}
              className="px-6 py-2.5 text-white bg-black rounded-lg  transition-colors shadow-md"
            >
              {selectedFarm ? "Update Farm" : "Save Farm"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedFarm(null);
                setNewFarm({
                  custom_farm_id: "",
                  rice_type: "",
                  water_source: "",
                  H_start_date: "",
                  acres: ""
                });
              }}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Farms List */}
    <div className="overflow-hidden shadow-md rounded-xl">
      <div className="p-4 text-white bg-emerald-700">
        <h2 className="text-xl font-semibold">Farm Inventory</h2>
        <p className="text-sm text-emerald-100">Manage and monitor your farms</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-12 h-12 border-t-4 border-b-4 rounded-full border-emerald-500 animate-spin"></div>
            <p className="ml-4 text-gray-600">Loading farms...</p>
          </div>
        ) : farms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {farms.map((farm, index) => (
              <div
                key={index}
                className="flex flex-col overflow-hidden transition-shadow border border-gray-200 rounded-lg hover:shadow-lg"
              >
                <div className="p-4 ">
                  <h3 className="text-lg font-bold text-emerald-800">
                    Farm ID: {farm.custom_farm_id}
                  </h3>
                </div>
                <div className="flex-grow p-4">
                  <div className="space-y-2 text-gray-700">
                    <div className="flex">
                      <span className="font-medium w-28">Crop Type:</span>
                      <span>{farm.rice_type}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-28">Water Source:</span>
                      <span>{farm.water_source}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-28">Start Date:</span>
                      <span>{farm.H_start_date}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-28">Acre:</span>
                      <span>{farm.acres}</span>
                    </div>
                    {farm.pdfs?.length > 0 && (
                      <div className="flex">
                        <span className="font-medium w-28">Latest PDF:</span>
                        <span>
                          {new Date(farm.pdfs[0].uploaded_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1 p-1 border-t border-gray-200 bg-gray-50">
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    onClick={() => handleEditFarm(farm)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    onClick={() => handleDeleteFarm(farm.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    onClick={() => handleAnalyzeFarm(farm.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2h10a1 1 0 100-2H3zm0 4a1 1 0 000 2h6a1 1 0 100-2H3zm0 4a1 1 0 100 2h4a1 1 0 100-2H3z" clipRule="evenodd" />
                    </svg>
                    Generate Report
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    onClick={() => handleSendNotifications(farm.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                    SMS and Voice
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-3 py-1.5 col-span-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    onClick={() => handleViewCropPerformance(farm.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    View Crop Performance
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="mb-2 text-xl font-medium">No farms added yet</p>
            <p className="mb-6 text-gray-400">Click the "Add New Farm" button to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Your First Farm
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, type = "text" }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-black">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 mt-2 text-black rounded-md"
      />
    </div>
  );
};

export default FarmsPage;
