import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { API_URL, ADMIN_URL, LANDING_URL } from "../config";

export function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");
    
    if (token && userParam) {
      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", decodeURIComponent(userParam));
      navigate("/dashboard");
    } else {
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        navigate("/dashboard");
      } else {
        window.location.href = `${LANDING_URL}/?login=true`;
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          localStorage.setItem("admin_isLoggedIn", "true");
          const userStr = encodeURIComponent(JSON.stringify(data.user));
          window.location.href = `${ADMIN_URL}/?token=${data.token}&admin_isLoggedIn=true&user=${userStr}`;
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Invalid login credentials");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    }
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
          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Login to access your courses</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-200 dark:border-red-900/40">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="07XXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Login
            </button>

            <div className="text-center text-sm pt-2">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Register here
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Please enter your registered phone number & password.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
