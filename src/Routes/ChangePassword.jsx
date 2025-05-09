import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ChangePassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("resetUsername");
    if (!storedUsername) {
      navigate("/forgot-password");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault(); // Prevent form submission from reloading the page
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/change-password", {
        username,
        newPassword,
      });

      Swal.fire({
        title: "Success!",
        text: "Your password has been successfully reset.",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then(() => {
        sessionStorage.removeItem("resetUsername");
        navigate("/login");
      });
    } catch (err) {
      setError("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 relative backdrop-blur">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50 backdrop-blur-md"
        style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}
      ></div>

      <div
        className="relative p-8 inset-0 bg-cover bg-center opacity-95 shadow-lg w-[80%] h-[700px] rounded-lg"
        style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex rounded-lg justify-center items-center">
          <div>
            <form onSubmit={handleChangePassword}>
              <div className="flex justify-center items-center">
                <img
                  src="src/assets/Images/CityC_Logo.png"
                  alt="City Logo"
                  className="w-[250px] mb-4"
                />
              </div>

              <h1 className="text-white text-2xl font-bold uppercase mb-2">
                Change Your Password
              </h1>
              <p className="text-white text-md mb-4">
                Enter a new password below to change your password.
              </p>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              {/* New Password Input with Show/Hide Toggle */}
              <div className="w-full mb-2 relative">
                <label className="block text-white text-left mb-1">
                  New Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-400"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
              </div>

              {/* Confirm Password Input with Show/Hide Toggle */}
              <div className="w-full mb-4 relative">
                <label className="block text-white text-left mb-1">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-400"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
              </div>

              <button
                type="submit"
                onClick={handleChangePassword}
                className="w-full bg-[#5FA8AD] text-white font-bold py-2 rounded-lg hover:bg-[#52969b] transition duration-200"
              >
                RESET PASSWORD
              </button>
            </form>

            <Link to="/login" className="text-white text-sm mt-4 hover:underline">
              &lt; Back to log in page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;