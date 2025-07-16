import React, { useState, useEffect } from "react";
import { API_BASE_URL } from '../apiConfig';

const SuccessModal = ({ message, onClose, isError = false }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className={`mb-4 text-2xl font-bold ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {isError ? 'Error!' : 'Success!'}
        </h2>
        <div className="mb-6 text-gray-700 whitespace-pre-line">{message}</div>
        <button
          onClick={onClose}
          className={`w-full px-4 py-2 text-white transition duration-300 rounded-lg ${
            isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Country code options
  const countryCodes = [
    { code: "+91", country: "India" },
    { code: "+1", country: "United States" },
    { code: "+44", country: "United Kingdom" },
    { code: "+61", country: "Australia" }
  ];

  const [formData, setFormData] = useState({
    username: "",
    countryCode: "+91",
    phoneNumber: "",
    state: "",
    district: "",
    createPassword: "",
    verifyPassword: "",
    krishibhavan: "",
    padashekaram: "",
    userType: "",
  });

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
    setIsError(false);
  };

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user types
        const userTypesResponse = await fetch(
          `${API_BASE_URL}/api/user-types/`
        );
        const userTypesData = await userTypesResponse.json();

        // Fetch states
        const statesResponse = await fetch(
          `${API_BASE_URL}/api/states/`
        );
        const statesData = await statesResponse.json();

        // Fetch districts
        const districtsResponse = await fetch(
          `${API_BASE_URL}/api/districts/`
        );
        const districtsData = await districtsResponse.json();

        setUserTypes(userTypesData);
        setStates(statesData);
        setDistricts(districtsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setModalMessage("Failed to fetch initial data. Please try again later.");
        setIsError(true);
        setShowModal(true);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phoneNumber") {
      const cleanedValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      
      // Handle non-field errors
      if (errorData.detail && !message.includes(errorData.detail)) {
        message += errorData.detail;
      }
      
      return message.trim();
    }
    
    return "Unknown error occurred. Please try again.";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Client-side validation
    if (formData.createPassword !== formData.verifyPassword) {
      setModalMessage("Passwords do not match.");
      setIsError(true);
      setShowModal(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const selectedUserType = userTypes.find(
        (type) => type.value === formData.userType
      );

      if (!selectedUserType) {
        setModalMessage("Please select a valid user type.");
        setIsError(true);
        setShowModal(true);
        setIsSubmitting(false);
        return;
      }

      // Prepare registration data
      const registerData = {
        user_name: formData.username,
        phone_number: formData.phoneNumber.startsWith(formData.countryCode) 
          ? formData.phoneNumber 
          : `${formData.countryCode}${formData.phoneNumber}`,
        create_password: formData.createPassword,
        verify_password: formData.verifyPassword,
        user_type: selectedUserType.label,
        state: Number(formData.state),
        district: Number(formData.district),
      };

      // Conditionally add organization or padashekaram based on user type
      switch (formData.userType) {
        case "Fpo":
          registerData.organization_name = formData.krishibhavan;
          break;
        case "Padasekhara Samiti":
          registerData.padashekaram_name = formData.padashekaram;
          break;
        case "Companies":
        case "Govt Officers":
        case "NGO":
          registerData.organization_name = formData.krishibhavan;
          break;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/register/staff/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = formatErrorMessage(responseData);
        setModalMessage(`Registration failed:\n${errorMessage}`);
        setIsError(true);
        setShowModal(true);
      } else {
        setModalMessage("Registration successful! You can now login with your credentials.");
        setIsError(false);
        setShowModal(true);
        setFormData({
          username: "",
          countryCode: "+91",
          phoneNumber: "",
          state: "",
          district: "",
          padashekaram: "",
          createPassword: "",
          verifyPassword: "",
          krishibhavan: "",
          userType: "",
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setModalMessage("Registration failed: Network error. Please check your connection and try again.");
      setIsError(true);
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen md:flex-row">
      {/* Left Side - Field Image (Hidden on Mobile) */}
      <div className="hidden md:block md:w-2/5">
        <div
          className="w-full h-full bg-cover"
          style={{ backgroundImage: "url('/bg2.svg')" }}
        ></div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex items-center justify-center w-full px-4 py-8 md:w-3/5 md:px-12">
        <div className="w-full max-w-lg">
          <h1 className="mb-6 text-2xl font-semibold text-start">
            Register as{" "}
            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="p-1 ml-2 bg-white border border-gray-300 rounded outline-none"
              required
            >
              <option value="">Select User Type</option>
              {userTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </h1>

          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* Username */}
            <div>
              <label className="block mb-1 text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-1 text-sm font-medium">Phone Number</label>
              <div className="flex">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="w-1/3 p-2 mr-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                  required
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                  pattern="[0-9]*"
                  required
                />
              </div>
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                required
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Dropdown */}
            <div>
              <label className="block mb-1 text-sm font-medium">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                required
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FPO Name */}
            {formData.userType === "Fpo" && (
              <div>
                <label className="block mb-1 text-sm font-medium">FPO Name</label>
                <input
                  type="text"
                  name="krishibhavan"
                  value={formData.krishibhavan}
                  onChange={handleInputChange}
                  placeholder="Enter FPO name"
                  className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                  required
                />
              </div>
            )}

            {/* Padasekharam Name */}
            {formData.userType === "Padasekhara Samiti" && (
              <div>
                <label className="block mb-1 text-sm font-medium">Padasekharam Name</label>
                <input
                  type="text"
                  name="padashekaram"
                  value={formData.padashekaram}
                  onChange={handleInputChange}
                  placeholder="Enter Padasekharam name"
                  className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                  required
                />
              </div>
            )}

            {/* Organization Name (for Companies, Govt Officers, NGO) */}
            {["Companies", "Govt Officers", "NGO"].includes(formData.userType) && (
              <div>
                <label className="block mb-1 text-sm font-medium">Organization Name</label>
                <input
                  type="text"
                  name="krishibhavan"
                  value={formData.krishibhavan}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                  required
                />
              </div>
            )}

            {/* Password Fields */}
            <div>
              <label className="block mb-1 text-sm font-medium">Create Password</label>
              <input
                type="password"
                name="createPassword"
                value={formData.createPassword}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Verify Password</label>
              <input
                type="password"
                name="verifyPassword"
                value={formData.verifyPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className="w-full p-2 border border-black rounded-md bg-[#F4F4F4] outline-none"
                required
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center w-full col-span-1 mt-4 space-x-2 md:col-span-2">
              <input type="checkbox" className="mt-0" required />
              <p className="text-sm text-gray-600">
                By registering, you agree to our{" "}
                <a href="/privacy-policy" className="text-green-500 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy-policy" className="text-green-500 underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Register Button */}
            <div className="flex justify-center col-span-1 md:col-span-2">
              <button
                type="submit"
                className="w-full md:w-[200px] py-2 text-lg font-semibold text-white bg-black rounded-full transition-all hover:scale-105"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success/Error Modal */}
      {showModal && (
        <SuccessModal 
          message={modalMessage} 
          onClose={closeModal} 
          isError={isError} 
        />
      )}
    </div>
  );
};

export default RegisterPage;