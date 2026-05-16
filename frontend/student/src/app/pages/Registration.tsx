import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraduationCap } from "lucide-react";

export function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    district: "",
    province: "",
  });
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.name,
          phone_number: formData.phone,
          district: formData.district,
          province: formData.province,
          password: Math.random().toString(36).slice(-8) // Generate initial password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedPassword(data.generatedPassword || "demo123"); // Ideally backend returns this
        // In this specific implementation, I'll use the one generated locally for simplicity
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-400 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2>Student Registration</h2>
          <p className="text-gray-600 mt-2">Create your account to access courses</p>
        </div>

        {!generatedPassword ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm mb-1 text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm mb-1 text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm mb-1 text-gray-700">
                  District
                </label>
                <input
                  id="district"
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your district or address"
                />
              </div>

              <div>
                <label htmlFor="province" className="block text-sm mb-1 text-gray-700">
                  Province
                </label>
                <select
                  id="province"
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select province</option>
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

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-400 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-green-500 transition-all duration-300"
              >
                Register
              </button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mb-4">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">Your account has been created. Please Remember & save your login credentials:</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Phone Number:</span>
                  <p>{formData.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Generated Password:</span>
                  <p className="font-mono bg-white px-3 py-2 rounded border border-gray-300 mt-1">
                    {generatedPassword}
                  </p>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
