"use client";

import { useState } from "react";
import { GraduationCap, Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import { API_URL, ADMIN_URL, STUDENT_URL } from "../config";

export default function LoginModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  // Login form state
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    phone: "",
    district: "",
    province: "",
  });
  const [generatedPassword, setGeneratedPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userStr = encodeURIComponent(JSON.stringify(data.user));

        if (data.user.role === "admin") {
          window.location.href = `${ADMIN_URL}/?token=${data.token}&admin_isLoggedIn=true&user=${userStr}`;
        } else {
          window.location.href = `${STUDENT_URL}/?token=${data.token}&user=${userStr}`;
        }
      } else {
        setError(data.message || "Invalid login credentials. Please check and try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const passwordToSet = Math.random().toString(36).slice(-8);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: signupData.name,
          phone_number: signupData.phone,
          district: signupData.district,
          province: signupData.province,
          password: passwordToSet
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedPassword(data.generatedPassword || passwordToSet);
      } else {
        setError(data.message || data.error || "Registration failed. Try a different phone number.");
      }
    } catch (err) {
      setError("Server connection failed. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setIsLogin(true);
    setPhone("");
    setPassword("");
    setSignupData({ name: "", phone: "", district: "", province: "" });
    setGeneratedPassword("");
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300 scale-100">

        {/* Close Button */}
        <button
          onClick={resetModal}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {generatedPassword ? "Registration Successful!" : isLogin ? "LMS Portal Login" : "Student Registration"}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {generatedPassword
                ? "Please remember & save your credentials"
                : isLogin
                  ? "Access your lessons, recordings, and course material"
                  : "Create an account to start your learning journey"}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* Render content based on state */}
          {generatedPassword ? (
            /* Registration Success Display */
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-100 dark:border-slate-800 text-left">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</span>
                  <p className="text-slate-900 dark:text-white font-medium">{signupData.phone}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated Password</span>
                  <p className="font-mono bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white mt-1 text-lg font-bold tracking-wider select-all">
                    {generatedPassword}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGeneratedPassword("");
                  setIsLogin(true);
                  setPhone(signupData.phone);
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md"
              >
                Go to Login
              </button>
            </div>
          ) : isLogin ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="modal-phone" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. 0777777777"
                />
              </div>

              <div>
                <label htmlFor="modal-password" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Verifying..." : "Login to Dashboard"}
              </button>

              <div className="text-center text-sm mt-4 text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-district" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    District
                  </label>
                  <input
                    id="reg-district"
                    type="text"
                    required
                    value={signupData.district}
                    onChange={(e) => setSignupData({ ...signupData, district: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Colombo"
                  />
                </div>

                <div>
                  <label htmlFor="reg-province" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Province
                  </label>
                  <select
                    id="reg-province"
                    required
                    value={signupData.province}
                    onChange={(e) => setSignupData({ ...signupData, province: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? "Registering..." : "Register Account"}
              </button>

              <div className="text-center text-sm mt-4 text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Login here
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Demo logins: Admin (077xxxxx77 / demo123) or Student (077xxxx67 / demo123)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
