import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraduationCap, LogOut, User, Clock } from "lucide-react";
import { getDaysRemaining } from "../utils/mockData";
import { API_URL, LANDING_URL, getImageUrl } from "../config";
import { ThemeToggle } from "../components/ThemeToggle";

function CourseThumbnail({ thumbnail, title, accent, category }: { thumbnail: string; title: string; accent: string; category: string }) {
  const [imgError, setImgError] = useState(false);
  if (thumbnail && !imgError) {
    return (
      <img 
        src={thumbnail} 
        alt={title} 
        onError={() => setImgError(true)}
        className="w-full h-full object-cover" 
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: accent }}>
      {category}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }
    const loggedInUser = JSON.parse(currentUser);
    setUser(loggedInUser);

    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/api/student/${loggedInUser.id}/courses`);
        const data = await response.json();
        if (response.ok) {
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = LANDING_URL;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        const updatedUser = { ...user, password: newPassword };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);

        const users = JSON.parse(localStorage.getItem("lmsUsers") || "[]");
        const updatedUsers = users.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, password: newPassword };
          }
          return u;
        });
        localStorage.setItem("lmsUsers", JSON.stringify(updatedUsers));

        alert("Password updated successfully! Please use this new password for your next login.");
        setShowEditPassword(false);
        setNewPassword("");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err);
      alert("Server connection failed. Could not update password.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="bg-card shadow-xs border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-400 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-foreground">ICT Academy With Anuradha Athukorala</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 sm:p-8 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-2xl sm:text-3xl font-bold">Welcome Back, {user.name}!</h1>
              <p className="text-blue-100">Continue your learning journey</p>
            </div>
            <button
              onClick={() => setShowEditPassword(!showEditPassword)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
          </div>

          {showEditPassword && (
            <form onSubmit={handlePasswordUpdate} className="mt-4 pt-4 border-t border-white/20">
              <label className="block text-sm mb-2 text-blue-50">Change Password</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="flex-1 px-4 py-2 rounded-xl bg-white/20 border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        <div>
          <h2 className="mb-6 text-xl font-bold text-foreground">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const expiryDate = course.expiry_date || course.expiryDate;
              const daysRemaining = getDaysRemaining(expiryDate);
              const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
              const isExpired = daysRemaining < 0;

              const accents = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];
              const accent = course.accent || accents[course.id % accents.length] || "#2563EB";
              const category = course.category || "Web Dev";
              const thumbnail = getImageUrl(course.thumbnail_url || course.thumbnail);

              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-border hover:border-blue-500/50 flex flex-col group"
                >
                  {/* Thumbnail Section */}
                  <div className="w-full h-40 bg-muted rounded-xl mb-4 overflow-hidden relative shrink-0">
                    <CourseThumbnail 
                      thumbnail={thumbnail} 
                      title={course.title} 
                      accent={accent} 
                      category={category} 
                    />
                  </div>

                  {/* Card Content Section */}
                  <div className="flex flex-col flex-1">
                    <h3 className="mb-4 font-semibold text-lg text-card-foreground group-hover:text-blue-500 transition-colors">{course.title}</h3>

                    <div className="mt-auto">
                      <div
                        className={`flex items-center gap-2 ${isExpired
                          ? "text-red-500"
                          : isExpiringSoon
                            ? "text-orange-500"
                            : "text-muted-foreground"
                          }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {isExpired ? (
                            "Access expired"
                          ) : (
                            <>
                              <span className="font-semibold text-foreground">{daysRemaining}</span> day
                              {daysRemaining !== 1 ? "s" : ""} remaining
                            </>
                          )}
                        </span>
                      </div>

                      {!isExpired && (
                        <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${isExpiringSoon ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-blue-500 to-green-500"
                              }`}
                            style={{
                              width: `${Math.min(100, (daysRemaining / 90) * 100)}%`,
                            }}
                          />
                        </div>
                      )}

                      <div className="mt-4 text-xs text-muted-foreground">
                        Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
