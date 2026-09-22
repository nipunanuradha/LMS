import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { API_URL } from "../config";

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

    const passwordToSet = Math.random().toString(36).slice(-8);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.name,
          phone_number: formData.phone,
          district: formData.district,
          province: formData.province,
          password: passwordToSet
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedPassword(data.generatedPassword || passwordToSet);
      } else {
        setError(data.message || data.error || "Registration failed");
      }
    } catch (err) {
      setError("Server connection failed. Please check if backend is running.");
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground transition-colors duration-200 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Student Registration</h2>
          <p className="text-muted-foreground mt-2">Create your account to access courses</p>
        </div>

        {!generatedPassword ? (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-200 dark:border-red-900/40">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                  District
                </label>
                <input
                  id="district"
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your district or address"
                />
              </div>

              <div>
                <label htmlFor="province" className="block text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                  Province
                </label>
                <select
                  id="province"
                  required
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Register
              </button>

              <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Login here
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4 text-center">Registration Successful!</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Please save your login credentials:
            </p>

            <div className="bg-muted p-4 rounded-xl space-y-3 mb-6">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Phone Number:</span>
                <p className="font-semibold text-foreground">{formData.phone}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Generated Password:</span>
                <p className="font-mono bg-background px-3 py-1.5 rounded-lg border border-border text-lg font-bold text-foreground mt-1">
                  {generatedPassword}
                </p>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Continue to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
