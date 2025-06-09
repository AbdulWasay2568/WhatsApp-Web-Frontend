// Login.tsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/Auth";
import { loginUser } from "../services/apis/auth.service"; 

const Login = () => {
  const navigation = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await loginUser({ email, password });
      const { userId, token } = response;
      if (userId) {
        setUser(userId, token);
      } else {
        setLoginError("Unexpected response. Missing userId.");
      }
      navigation('/chat');
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error.response?.data?.message || "Invalid credentials or server error."
      );
    }
  };

  return (
    // ✅ Your JSX stays the same
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="Email"
            required
            className="p-3 border border-gray-300 rounded-md"
          />
          {emailError && <p className="text-sm text-red-500 -mt-2">{emailError}</p>}

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLoginError("");
            }}
            placeholder="Password"
            required
            className="p-3 border border-gray-300 rounded-md"
          />

          {loginError && <p className="text-sm text-red-500 -mt-2">{loginError}</p>}

          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Login
          </button>
        </form>

        <p
          className="mt-3 text-sm text-blue-600 hover:underline cursor-pointer"
          onClick={() => navigation("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p className="mt-5 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} BridgeSkills | All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
