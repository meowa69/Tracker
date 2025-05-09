import Sidebar from "../Components/Sidebar";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import EditProfileModal from "./../Modal/EditProfileModal";
import PasswordResetModal from "./../Modal/PasswordResetModal";
import axios from "axios";

function Settings() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user_profile"));
    if (storedUser) {
      setName(storedUser.name || "");
      setUsername(storedUser.username || "");
      setRole(storedUser.role || "");
      setProfilePic(storedUser.profilePic || null);
      console.log("Loaded from localStorage:", storedUser);
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "You are not logged in!", "error");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched User Data:", response.data);

      if (response.data) {
        const storedUser = JSON.parse(localStorage.getItem("user_profile")) || {};
        const userData = {
          name: response.data.name,
          username: response.data.user_name,
          role: response.data.role,
          profilePic: storedUser.profilePic || // Prefer existing local profilePic
            (response.data.profile_picture
              ? response.data.profile_picture.startsWith("http")
                ? response.data.profile_picture
                : `http://127.0.0.1:8000${response.data.profile_picture}`
              : null),
        };

        setName(userData.name);
        setUsername(userData.username);
        setRole(userData.role);
        setProfilePic(userData.profilePic);

        localStorage.setItem("user_profile", JSON.stringify(userData));
        console.log("Saved to localStorage:", userData);
      }
    } catch (error) {
      console.error("Error fetching user details:", error.response?.data || error);
      Swal.fire("Error", "Failed to fetch user details", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    console.log("profilePic updated:", profilePic);
  }, [profilePic]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full overflow-y-auto p-6">
        <div className="font-poppins font-bold uppercase p-4 text-[#494444] text-[35px]">
          <h1>Settings</h1>
        </div>
        <div className="w-full border rounded-lg shadow-lg p-8">
          <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#408286] flex items-center justify-center bg-[#408286]">
                {console.log("Rendering profilePic:", profilePic)}
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      console.log("Image failed to load:", profilePic);
                    }}
                    onLoad={() => console.log("Image loaded successfully:", profilePic)}
                  />
                ) : (
                  <span className="text-white text-2xl font-semibold font-poppins">
                    {getInitials(name)}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-[#408286] font-poppins uppercase">{name}</h2>
                <p className="text-sm text-gray-600 flex gap-2 font-poppins">
                  Username: <span className="font-medium font-poppins">{username}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1 flex gap-2 font-poppins">
                  Role: <span className="font-medium font-poppins text-[#408286]">{role}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-white text-sm font-poppins font-semibold bg-[#408286] hover:bg-[#356f6f] rounded-md px-4 py-2"
            >
              Edit
            </button>
          </div>
          
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            name={name}
            setName={setName}
            profilePic={profilePic}
            setProfilePic={setProfilePic}
            fetchUserData={fetchUserData}
          />
          <PasswordResetModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;