import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../apiConfig';

interface FormData {
  phone_number: string;
  otp: string;
  password: string;
}

interface EyeIconProps {
  showPassword: boolean;
}

const Login: React.FC = () => {
  const [userType, setUserType] = useState("department");
  const [formData, setFormData] = useState<FormData>({
    phone_number: "",
    otp: "",
    password: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [showOtpField, setShowOtpField] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // New state for OTP cooldown
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isOtpSendingDisabled, setIsOtpSendingDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state for submitting

  const navigate = useNavigate();

  // Effect to manage OTP cooldown timer
  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prevCooldown) => {
          if (prevCooldown <= 1) {
            setIsOtpSendingDisabled(false);
            return 0;
          }
          return prevCooldown - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpCooldown]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserTypeChange = (type: string) => {
    setUserType(type);
    if (type === "farmer") {
      setFormData(prev => ({ ...prev, password: "" }));
    }
  };

  const handleCountryCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCountryCode(e.target.value);
  };

  const handlePrivacyCheck = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPrivacyChecked(e.target.checked);
  };

  const handleSendOtp = async () => {
    // Check if OTP sending is disabled
    if (isOtpSendingDisabled) {
      return;
    }

  try {
    const response = await fetch(`${API_BASE_URL}/api/send-otp/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: `${countryCode}${formData.phone_number}`,
      }),
    });

      if (!response.ok) {
        throw new Error("Failed to send OTP. Please try again.");
      }

      // Set cooldown to 120 seconds (2 minutes)
      setOtpCooldown(120);
      setIsOtpSendingDisabled(true);
      setShowOtpField(true);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state to true

    if (userType === "farmer" && !isPrivacyChecked) {
      setErrorMessage("You must agree to the Privacy Policy before logging in.");
      setIsSubmitting(false); // Set submitting state to false if error
      return;
    }

    try {
      const loginResponse = await fetch(
        `${API_BASE_URL}/api/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: `${countryCode}${formData.phone_number}`,
            otp_code: formData.otp,
            ...(userType === "department" && { password: formData.password }),
          }),
        }
      );

      if (!loginResponse.ok) {
        throw new Error("Invalid credentials. Please try again. OR If you have registered, your account must be approved by the admin.");
      }

      const data = await loginResponse.json();
      localStorage.setItem("token", data.token);

      if (data.user_type === "Farmer") {
        navigate("/farmer-dashboard");
      } else if (data.user_t === "Staff") {
        navigate("/staff-dashboard");
      } else {
        throw new Error("Invalid user type. Please contact support.");
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false); // Set submitting state to false after submitting
    }
  };

  const EyeIcon: React.FC<EyeIconProps> = ({ showPassword }) => (
    showPassword ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 cursor-pointer"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </svg>
    )
  );

  return (
    <div className="flex flex-col h-screen md:flex-row">
      {/* Left Side - Hidden on mobile */}
      <div className="hidden bg-green-500 md:block md:w-3/5">
        <div
          className="w-full h-full bg-cover"
          style={{ backgroundImage: "url('/final.svg')" }}
        ></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col items-center justify-center w-full px-4 py-8 md:w-2/5 md:px-16 md:py-0">
        {/* Logo Section */}
        <div className="mb-6 text-center md:mb-8">
          <div className="text-2xl font-bold md:text-4xl">Welcome to</div>
          <img 
            src="/images/logoblack.png" 
            alt="KrishiSat Logo" 
            className="w-32 h-auto mx-auto mt-2 md:w-48"
          />
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center p-1 mb-4 bg-gray-100 rounded-full shadow-inner md:mb-6">
          <button
            type="button"
            onClick={() => handleUserTypeChange("department")}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 md:px-8 md:py-2 md:text-lg ${
              userType === "department" 
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            Department
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeChange("farmer")}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 md:px-8 md:py-2 md:text-lg ${
              userType === "farmer" 
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            Farmer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-[75%]">
          {/* Phone Number Field */}
          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-700">Phone Number</label>
            <div className="flex items-center p-2 border border-black rounded-md shadow-lg" style={{ backgroundColor: "#F4F4F4" }}>
              <select
                value={countryCode}
                onChange={handleCountryCodeChange}
                className="pr-2 text-gray-700 bg-transparent border-r border-black outline-none"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+61">+61</option>
              </select>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="flex-grow pl-2 text-sm bg-transparent outline-none"
                required
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isOtpSendingDisabled}
                className={`flex items-center ml-2 text-sm font-bold md:text-base ${
                  isOtpSendingDisabled ? 'text-gray-400 cursor-not-allowed' : ''
                }`}
              >
                {isOtpSendingDisabled 
                  ? `Resend OTP (${otpCooldown}s)` 
                  : 'Send OTP'}
                <span className="ml-1">➤</span>
              </button>
            </div>
          </div>

          {/* OTP Field */}
          {showOtpField && (
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700">Enter your OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter your OTP"
                className="w-full p-2 text-sm border border-black rounded-md shadow-lg outline-none"
                style={{ backgroundColor: "#F4F4F4" }}
                required
              />
            </div>
          )}

          {/* Password Field */}
          {userType === "department" && (
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full p-2 text-sm border border-black rounded-md shadow-lg outline-none"
                  style={{ backgroundColor: "#F4F4F4" }}
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <EyeIcon showPassword={showPassword} />
                </div>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {userType === "farmer" && (
            <div className="flex items-start mb-4 md:mb-6">
              <input
                type="checkbox"
                className="mt-1 shadow-lg"
                onChange={handlePrivacyCheck}
              />
              <p className="ml-2 text-xs text-gray-600 md:text-sm">
                By logging in, you agree to abide by the company's{" "}
                <a href="/privacy-policy" className="text-green-500 underline">
                  Policies and Terms of Service
                </a>
                .
              </p>
            </div>
          )}

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {/* Login Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-[200px] py-2 text-lg font-semibold text-white rounded-full transition-all 
                ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:scale-105 hover:bg-gray-800'}`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-t-2 border-white rounded-full animate-spin"></div>
                  Logging in...
                </div>
              ) : 'Login'}
            </button>
          </div>
        </form>

        {/* Sign-Up Link */}
        <div className="w-full mt-4 text-center">
          <span className="text-xs text-gray-600 md:text-sm">Don't have an account? </span>
          <button
            onClick={() => navigate("/register-user")}
            className="text-xs font-semibold text-green-500 md:text-sm"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;