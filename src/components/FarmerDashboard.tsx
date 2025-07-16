import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../apiConfig';

interface FarmerData {
  id: string;
  farmer_id: string;
  user_name: string;
  phone_number: string;
  padashekaram_name: string;
  profile_image?: string;
  farms: Farm[];
}

interface Farm {
  id: string;
  custom_farm_id: string;
  rice_type: string;
  water_source: string;
  H_start_date: string;
  acres: string;
  pdfs: PDF[];
}

interface PDF {
  farmerlatestpdf: string;
}

interface ErrorDisplayProps {
  message: string;
}

const FarmerDashboard: React.FC = () => {
  const [farmerData, setFarmerData] = useState<FarmerData | null>(null);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarmerData = async () => {
      const accessToken = localStorage.getItem("token");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/farmerprofile/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.detail || "Error fetching farmer details.");
          return;
        }

        const data = await response.json();
        setFarmerData(data);
      } catch {
        setError("Error fetching farmer details. Please try again.");
      }
    };

    fetchFarmerData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCropPerformanceClick = (id: string, farmId: string) => {
    navigate(`/crop-performance/${id}/farm/${farmId}`);
  };

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!farmerData) {
    return <LoadingDisplay />;
  }

  return (
    <div className="flex flex-col h-screen md:flex-row">
      {/* Sidebar */}
      <div className="w-full h-auto md:w-64 md:h-[calc(100vh-250px)] md:ml-[3%] mt-4 md:mt-[50px] mb-4 md:mb-[50px] shadow-2xl flex flex-col items-center rounded-2xl bg-[#606060] mx-4 md:mx-0">
        <div className="flex flex-col items-center p-2 mt-4 space-y-2 md:mt-8 md:space-y-4 md:p-0">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 mb-2 md:w-32 md:h-32 md:mb-4">
            <img
              src={farmerData.profile_image || "https://via.placeholder.com/150"}
              alt="Profile"
              className="object-cover w-full h-full border-4 rounded-full"
            />
          </div>

          {/* Details */}
          <div className="px-2 space-y-1 text-sm text-center text-white md:space-y-2 md:text-base md:text-left">
            {[
              { label: "Farmer ID", value: farmerData.id },
              { label: "Farmer ID", value: farmerData.farmer_id },
              { label: "Farmer Name", value: farmerData.user_name },
              { label: "Phone Number", value: farmerData.phone_number },
              { label: "Padashekaram", value: farmerData.padashekaram_name },
            ].map((field, index) => (
              <p key={index} className="break-words">
                <span className="font-bold">{field.label}: </span>
                {field.value}
              </p>
            ))}
          </div>

          {/* Delete Button */}
          <button className="w-full px-4 py-2 mt-2 text-sm font-semibold text-white bg-black rounded-lg md:text-lg md:w-auto md:rounded-none md:mt-0">
            Delete Account
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Top Bar */}
        <div className="flex justify-end">
          <button className="flex items-center space-x-1 md:space-x-2" onClick={handleLogout}>
            <img src="/images/logout.svg" alt="Logout" className="w-6 h-6 md:h-9 md:w-9" />
            <span className="hidden text-gray-700 md:inline">Logout</span>
          </button>
        </div>

        {/* Farms Display */}
        <div className="mt-4 md:mt-8">
          <h2 className="text-xl font-bold text-black md:text-2xl">Farms</h2>
          {farmerData.farms && farmerData.farms.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 mt-3 md:gap-4 md:mt-4 md:grid-cols-2 lg:grid-cols-3">
              {farmerData.farms.map((farm) => (
                <div
                  key={farm.id}
                  className="p-3 text-sm transition border border-gray-300 rounded-lg shadow-md cursor-pointer md:p-4 hover:shadow-lg md:text-base"
                  onClick={() => setSelectedFarm(farm)}
                >
                  <h3 className="text-base font-semibold md:text-lg">{farm.custom_farm_id}</h3>
                  <p><strong>Plant Type:</strong> {farm.rice_type}</p>
                  <p><strong>Water Source:</strong> {farm.water_source}</p>
                  <p><strong>Start Date:</strong> {farm.H_start_date}</p>
                  <p><strong>Acres:</strong> {farm.acres}</p>
                  <button
                    className="w-full px-4 py-2 mt-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleCropPerformanceClick(farmerData.id, farm.id);
                    }}
                  >
                    Crop Performance
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-gray-400 md:mt-4">No farms available.</p>
          )}
        </div>

        {/* PDF Display */}
        {selectedFarm && (
          <div className="mt-4 md:mt-8">
            <h2 className="text-lg font-bold text-black md:text-xl">
              PDF Report for {selectedFarm.custom_farm_id}
            </h2>
            {selectedFarm.pdfs && selectedFarm.pdfs.length > 0 ? (
              <div className="mt-2 md:mt-4">
                <iframe
                  src={selectedFarm.pdfs[0].farmerlatestpdf}
                  title="Farm Report"
                  width="100%"
                  height="500px"
                  className="border border-gray-600 rounded-lg h-[400px] md:h-[650px]"
                />
              </div>
            ) : (
              <p className="mt-2 text-gray-400 md:mt-4">No PDF reports available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-destructive/10">
    <h1 className="text-xl font-bold text-destructive">{message}</h1>
  </div>
);

const LoadingDisplay: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-muted">
    <h1 className="text-xl font-bold text-muted-foreground">Loading...</h1>
  </div>
);

export default FarmerDashboard;