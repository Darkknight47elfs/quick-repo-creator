import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import FarmMap from "./FarmMap";
import { API_BASE_URL } from '../apiConfig';

const SuccessModal = ({ message, onClose, isError = false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in duration-300">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isError ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {isError ? (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h2 className={`mb-4 text-2xl font-bold text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {isError ? 'Oops! Something went wrong' : 'Success!'}
        </h2>
        <div className="mb-6 text-gray-700 text-center whitespace-pre-line leading-relaxed">{message}</div>
        <button
          onClick={onClose}
          className={`w-full px-6 py-3 text-white font-semibold transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default function StaffDashboard() {
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmerForm, setFarmerForm] = useState({
    user_name: "",
    phone_number: "",
    state: "",
    district: "",
    organization_name: "",
    padashekaram_name: "",
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [currentFarmerId, setCurrentFarmerId] = useState(null); 
  const [farmData, setFarmData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setIsError(false);
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      const accessToken = localStorage.getItem("token");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/staffprofile/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }

        const data = await response.json();
        setStaffData(data);
      } catch (error) {
        setError("Failed to load staff data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [navigate]);

  // Fetch states and districts
  useEffect(() => {
    const fetchStatesAndDistricts = async () => {
      try {
        const statesResponse = await fetch(
          `${API_BASE_URL}/api/states/`
        );
        const districtsResponse = await fetch(
          `${API_BASE_URL}/api/districts/`
        );

        if (!statesResponse.ok || !districtsResponse.ok) {
          throw new Error("Failed to fetch states or districts");
        }

        const statesData = await statesResponse.json();
        const districtsData = await districtsResponse.json();

        setStates(statesData);
        setDistricts(districtsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStatesAndDistricts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFarmerForm({ ...farmerForm, [name]: value });
  };

  const formatErrorMessage = (errorData) => {
    if (typeof errorData === 'string') return errorData;
    
    if (Array.isArray(errorData)) {
      return errorData.join('\n');
    }
    
    if (typeof errorData === 'object' && errorData !== null) {
      let message = '';
      
      // Handle field-specific errors
      for (const [field, errors] of Object.entries(errorData)) {
        if (Array.isArray(errors)) {
          message += `${field.charAt(0).toUpperCase() + field.slice(1)}: ${errors.join(', ')}\n`;
        } else if (typeof errors === 'string') {
          message += `${field.charAt(0).toUpperCase() + field.slice(1)}: ${errors}\n`;
        }
      }
      
      // Handle non-field errors (like detail)
      if (errorData.detail && !message.includes(errorData.detail)) {
        message += errorData.detail;
      }
      
      return message.trim();
    }
    
    return "Unknown error occurred. Please try again.";
  };

  const handleRegisterFarmer = async () => {
    setIsSubmitting(true);
    const accessToken = localStorage.getItem("token");
  
    // Add country code to phone number
    const fullPhoneNumber = `+91${farmerForm.phone_number}`;
  
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/register/farmer/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...farmerForm,
            phone_number: fullPhoneNumber  
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setModalMessage("Farmer registered successfully!");
        setIsError(false);
        setShowModal(true);
        
        // Set the current farmer ID
        setCurrentFarmerId(responseData.id);

        // Reset form and update staff data
        setFarmerForm({
          user_name: "",
          phone_number: "",
          state: "",
          district: "",
          organization_name: "",
          padashekaram_name: "",
        });

        // Update staff data with the new farmer
        setStaffData((prevData) => ({
          ...prevData,
          added_farmers: [...(prevData?.added_farmers || []), responseData],
        }));
      } else {
        const errorMessage = formatErrorMessage(responseData);
        setModalMessage(`Registration failed:\n${errorMessage}`);
        setIsError(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error registering farmer:", error);
      setModalMessage("An error occurred while registering the farmer. Please try again.");
      setIsError(true);
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // This function would be called when farm details are successfully added
  const handleFarmAddedSuccess = (message) => {
    setModalMessage(message);
    setIsError(false);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
        <div className="p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 text-center font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-lg">
                  {staffData?.user_name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <p className="text-sm sm:text-lg font-bold text-gray-800">Welcome back, {staffData?.user_name}!</p>
              <p className="text-xs sm:text-sm text-emerald-600 font-medium">Staff Dashboard</p>
            </div>
          </div>
          <button
            className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={() => navigate("/")}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline font-medium">Logout</span>
          </button>
        </div>
      </div>
    
      {/* Main Content */}
      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-88px)] gap-4 sm:gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Enhanced Farmer Onboarding Section */}
        <div className="xl:w-96 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Add New Farmer</h1>
          </div>
    
          <div className="space-y-4 sm:space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="user_name"
                  value={farmerForm.user_name}
                  onChange={handleInputChange}
                  placeholder="Enter farmer's full name"
                  className="w-full p-3 sm:p-4 pl-10 sm:pl-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/50 text-sm sm:text-base"
                />
                <svg className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
    
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all duration-200">
                <div className="flex items-center px-3 sm:px-4 bg-emerald-50 border-r border-gray-200">
                  <span className="text-xs sm:text-sm font-medium text-emerald-700">🇮🇳 +91</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="tel"
                    name="phone_number"
                    value={farmerForm.phone_number}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full p-3 sm:p-4 pl-10 sm:pl-12 bg-white/50 focus:outline-none text-sm sm:text-base"
                    maxLength="10"
                  />
                  <svg className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>
    
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
              <div className="relative">
                <select
                  name="state"
                  value={farmerForm.state}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 pl-10 sm:pl-12 pr-8 sm:pr-10 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/50 appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg className="absolute right-3 sm:right-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
    
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
              <div className="relative">
                <select
                  name="district"
                  value={farmerForm.district}
                  onChange={handleInputChange}
                  className="w-full p-3 sm:p-4 pl-10 sm:pl-12 pr-8 sm:pr-10 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/50 appearance-none cursor-pointer text-sm sm:text-base"
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <svg className="absolute right-3 sm:right-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
    
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
              <div className="relative">
                <input
                  type="text"
                  name="organization_name"
                  value={farmerForm.organization_name}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  className="w-full p-3 sm:p-4 pl-10 sm:pl-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white/50 text-sm sm:text-base"
                />
                <svg className="absolute left-3 sm:left-4 top-3 sm:top-4 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
    
          <button
            className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-emerald-700 hover:to-teal-700'
            }`}
            onClick={handleRegisterFarmer}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registering...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Register Farmer</span>
              </div>
            )}
          </button>
        </div>
    
        {/* Enhanced Map and Farmers Section */}
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6">
          {/* Enhanced Map Section with Responsive Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Farm Mapping System</span>
                </h2>
                {currentFarmerId && (
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium">
                    Farmer ID: {currentFarmerId}
                  </div>
                )}
              </div>
            </div>
            {/* Responsive Map Container */}
            <div className="relative w-full">
              <div className="aspect-[16/10] sm:aspect-[16/9] lg:aspect-[2/1] xl:aspect-[3/2] min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]">
                <div className="absolute inset-0 w-full h-full">
                  <FarmMap 
                    farmerId={currentFarmerId} 
                    key={currentFarmerId} 
                    onFarmAdded={handleFarmAddedSuccess} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Added Farmers Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Registered Farmers</span>
              </h2>
              <div className="px-2 sm:px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium">
                {staffData?.added_farmers?.length || 0} Total
              </div>
            </div>
            
            {staffData?.added_farmers?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {staffData.added_farmers.map((farmer, index) => (
                  <Link
                    key={index}
                    to={`/farmer-profile/${farmer.id}`}
                    className="group p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      {farmer.profile_image ? (
                        <img
                          src={farmer.profile_image}
                          alt="Farmer Profile"
                          className="w-16 h-16 rounded-full object-cover shadow-lg border-3 border-white group-hover:shadow-xl transition-shadow duration-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white group-hover:shadow-xl transition-shadow duration-200">
                          <span className="text-white font-bold text-lg">
                            {farmer.farmer_id?.charAt(0)?.toUpperCase() || 'F'}
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {farmer.farmer_id}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Click to view</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Farmers Added Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Start by registering your first farmer using the form on the left. Once registered, they'll appear here for easy access.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Success/Error Modal */}
      {showModal && (
        <SuccessModal 
          message={modalMessage} 
          onClose={closeModal} 
          isError={isError} 
        />
      )}
    </div>
  );
}