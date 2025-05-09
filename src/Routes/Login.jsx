import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function Login() {
  const navigate = useNavigate();
  const [user_name, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.setItem("sidebarOpen", "true");
    setError("");

    if (!user_name.trim() || !password.trim()) {
      setError("Please input credentials first.");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Clear old data
    localStorage.removeItem("userData");
    localStorage.removeItem("token");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        { user_name, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login Response:", response.data);

      if (response.status === 200 && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        navigate("/dashboard", { replace: true });
        // Push multiple history entries to prevent back navigation to login
        window.history.pushState(null, "", "/dashboard");
        window.history.pushState(null, "", "/dashboard");
      }
    } catch (err) {
      console.error("Error Response:", err.response);

      if (err.response) {
        const message = err.response.data?.message || "Invalid credentials.";
        if (message.toLowerCase().includes("password")) {
          setError("Incorrect password.");
        } else if (message.toLowerCase().includes("username")) {
          setError("Username not found.");
        } else {
          setError("Invalid username or password.");
        }
        localStorage.removeItem("token");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 relative backdrop-blur">
      <div className="absolute inset-0 bg-cover bg-center opacity-50 backdrop-blur-md" style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}></div>
      <div className="relative p-8 inset-0 bg-cover bg-center opacity-95 shadow-lg w-[80%] h-[700px] rounded-lg" style={{ backgroundImage: "url(src/assets/Images/ysalina_bridge.jpg)" }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex rounded-lg">
          {/* Left: Login Form */}
          <div className="w-1/2 flex justify-center items-center">
            <div className="bg-white bg-opacity-30 rounded-tl-lg rounded-bl-lg shadow-lg w-full h-full flex justify-center items-center">
              <div className="w-4/5">
                <h2 className="text-[30px] font-bold text-center font-poppins text-white">LOG IN</h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-white font-poppins text-[14px]">Username</label>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={user_name}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                    {error === "Username not found." && (
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                  </div>

                  <div className="mb-1 relative">
                    <label className="block text-white font-poppins text-[14px]">Password</label>
                    <input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-400"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      {error === "Incorrect password." && (
                        <p className="text-[#ffffff] text-[13px] font-poppins mt-1">{error}</p>
                      )}
                    </div>
                    <Link to="/forgot-password" className="text-white font-poppins text-[13px] hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className={`w-full flex justify-center items-center gap-2 bg-[#5FA8AD] text-white font-bold py-2 rounded-lg transition duration-200 ${loading ? 'cursor-not-allowed' : 'hover:bg-[#52969b]'}`}
                    disabled={loading}
                  >
                    {loading && <AiOutlineLoading3Quarters className="animate-spin" size={20} />}
                    {loading ? "Processing..." : "LOG IN"}
                  </button>

                  {error === "Please input credentials first." && (
                    <p className="text-white text-sm mt-2 text-center">{error}</p>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Right: Logo and Welcome Message */}
          <div className="w-full flex flex-col items-center justify-center text-white text-left px-8">
            <div className="relative top-[-50px]">
              <img src="src/assets/Images/CityC_Logo.png" alt="City Logo" className="w-[250px]" />
            </div>

            <div className="text-center relative top-[-30px]">
              <h1 className="text-xl font-semibold mb-2">WELCOME TO</h1>
              <h2 className="text-[40px] font-bold">TRANSMITTAL TRACKER SYSTEM</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;