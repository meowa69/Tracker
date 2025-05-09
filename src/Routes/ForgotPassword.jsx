import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault(); // Prevent form submission from reloading the page
    if (!username) {
      setError("Please enter your username before continuing.");
      return;
    }

    try {
      // Check if the username exists in the database
      const response = await axios.post("http://127.0.0.1:8000/api/check-username", { username });

      if (response.data.exists) {
        // Store username in session storage for use in ChangePassword
        sessionStorage.setItem("resetUsername", username);
        navigate("/change-password");
      } else {
        setError("Username not found. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 relative backdrop-blur">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50 backdrop-blur-md"
        style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}
      ></div>

      {/* Main Content */}
      <div
        className="relative p-8 inset-0 bg-cover bg-center opacity-95 shadow-lg w-[80%] h-[700px] rounded-lg"
        style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex rounded-lg justify-center items-center">
          <div>
            <form onSubmit={handleResetPassword}>
              {/* Logo */}
              <div className="flex justify-center items-center">
                <img src="src/assets/Images/CityC_Logo.png" alt="City Logo" className="w-[250px] mb-4" />
              </div>

              {/* Title & Description */}
              <h1 className="text-white text-2xl font-bold uppercase mb-2">
                Forgot Your Password?
              </h1>
              <p className="text-white text-md mb-4">
                Enter your username and we’ll verify your account.
              </p>

              {/* Username Input */}
              <div className="w-full mb-4">
                <label className="block text-white text-left mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Error Message */}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              {/* Continue Button */}
              <button
                type="submit"
                onClick={handleResetPassword}
                className="w-full bg-[#5FA8AD] text-white font-bold py-2 rounded-lg hover:bg-[#52969b] transition duration-200"
              >
                CONTINUE
              </button>
            </form>

            {/* Back to Login Link */}
            <Link to="/login" className="text-white text-sm mt-4 hover:underline">
              &lt; Back to log in page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;