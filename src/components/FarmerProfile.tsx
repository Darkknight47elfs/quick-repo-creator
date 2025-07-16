import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FarmsPage from "./FarmsPage";
import { API_BASE_URL } from '../apiConfig';

interface FarmerData {
  user_name: string;
  farmer_id: string;
  phone_number: string;
  organization_name: string;
  state: number | null;
  state_choices: any[];
  district: number | null;
  district_choices: any[];
  padashekaram_name: string;
  profile_image: string | null;
  farms: any[];
}

const FarmerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [farmerData, setFarmerData] = useState<FarmerData>({
    user_name: "",
    farmer_id: "",
    phone_number: "",
    organization_name: "",
    state: null,
    state_choices: [],
    district: null,
    district_choices: [],
    padashekaram_name: "",
    profile_image: null,
    farms: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showFarms, setShowFarms] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const fetchFarmerData = async () => {
      const accessToken = localStorage.getItem("token");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/farmers/update/${id}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched Farmer Data:", data);
        setFarmerData(data);
      } catch (error) {
        console.error("Error fetching farmer data:", error);
        setError("Error fetching farmer details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFarmerData({ ...farmerData, [name]: value });
  };

  const uploadImage = async (file) => {
    const accessToken = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/farmers/update/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Response:", errorData);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedData = await response.json();
      console.log("Server Response:", updatedData);

      setFarmerData((prevData) => ({
        ...prevData,
        profile_image: updatedData.profile_image,
      }));

      alert("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading profile image. Please try again.");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFarmerData({ ...farmerData, profile_image: imageUrl });
      uploadImage(file);
    }
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("token");
    const formData = new FormData();

    Object.keys(farmerData).forEach((key) => {
      if (
        key !== "state_choices" &&
        key !== "district_choices" &&
        key !== "farms" &&
        farmerData[key] !== null
      ) {
        formData.append(key, farmerData[key]);
      }
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/farmers/update/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Response:", errorData);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedData = await response.json();
      console.log("Server Response:", updatedData);
      setFarmerData(updatedData);

      alert("Farmer details updated successfully!");
    } catch (error) {
      console.error("Error updating farmer data:", error);
      alert("Error updating farmer details. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirmation(true);
  };

  // const confirmDeleteAccount = async () => {
  //   const accessToken = localStorage.getItem("token");
    
  //   try {
  //     const response = await fetch(
  //       "https://krishisat-backend-dev-1066006280634.asia-south1.run.app/api/farmerprofile/",
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Token ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Error ${response.status}: ${response.statusText}`);
  //     }

  //     localStorage.removeItem("token");
  //     navigate("/login");
  //     alert("Account deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting account:", error);
  //     alert("Error deleting account. Please try again.");
  //   } finally {
  //     setShowDeleteConfirmation(false);
  //   }
  // };

  // const cancelDeleteAccount = () => {
  //   setShowDeleteConfirmation(false);
  // };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col items-start w-full p-4 md:p-10">
      <h1 className="mb-4 text-2xl font-bold md:ml-[5%] md:text-3xl md:mb-6">Farmer Profile</h1>
      <div className="flex flex-col w-full gap-6 md:flex-row md:gap-10">
        {/* Left Sidebar */}
        <div className="flex flex-col items-center p-4 rounded-[30px] md:rounded-[96px] shadow-lg w-full md:w-[378.18px] bg-[#606060]">
          <div className="relative w-24 h-24 mb-4 md:w-32 md:h-32">
            <img
              src={
                farmerData.profile_image
                  ? farmerData.profile_image
                  : "https://placehold.co/150x150"
              }
              alt="Profile"
              className="object-cover w-full h-full border-4 rounded-full"
              onError={(e) => {
                console.error("Error loading image:", farmerData.profile_image);
                (e.target as HTMLImageElement).src = "https://placehold.co/150x150";
              }}
            />
            <label className="absolute p-1.5 md:p-2 bg-gray-800 rounded-full cursor-pointer bottom-0 md:bottom-2 right-0 md:right-2">
              <svg className="w-3 h-3 text-white md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          </div>
          <p className="mb-4 text-base font-semibold text-white md:text-lg md:mb-6">
            {farmerData.farmer_id}
          </p>
          <button
            className="w-full py-2 mb-3 text-base font-semibold text-white md:py-3 md:text-lg md:mb-4"
            onClick={() => setShowFarms(!showFarms)}
          >
            {showFarms ? "Hide Farms" : "Farms"}
          </button>
          <button 
            className="w-full py-2 text-base font-semibold text-white md:py-3 md:text-lg"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-4 rounded-lg md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
              {/* Form Fields */}
              <div className="col-span-2 md:col-span-1">
                <label className="block mb-2 text-sm font-medium md:text-base">Username</label>
                <input
                  type="text"
                  name="user_name"
                  value={farmerData.user_name}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded md:text-base"
                  placeholder="Enter username"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block mb-2 text-sm font-medium md:text-base">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={farmerData.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded md:text-base"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block mb-2 text-sm font-medium md:text-base">State</label>
                <select
                  name="state"
                  value={farmerData.state || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded md:text-base"
                >
                  <option value="" disabled>Select State</option>
                  {farmerData.state_choices.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.id === farmerData.state ? `${state.name} (Current)` : state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block mb-2 text-sm font-medium md:text-base">District</label>
                <select
                  name="district"
                  value={farmerData.district || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded md:text-base"
                >
                  <option value="" disabled>Select District</option>
                  {farmerData.district_choices.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.id === farmerData.district ? `${district.name} (Current)` : district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block mb-2 text-sm font-medium md:text-base">Organization Name</label>
                <input
                  type="text"
                  name="organization_name"
                  value={farmerData.organization_name}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded md:text-base"
                  placeholder="Enter krishibhavan"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-4 md:mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-white bg-black rounded md:px-6 md:py-2 md:text-base"
            >
              Save Changes
            </button>
          </div>

          {/* FarmsPage */}
          {showFarms && <div className="z-0 mt-4 md:mt-6"><FarmsPage /></div>}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {/* {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDeleteAccount}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default FarmerProfile;