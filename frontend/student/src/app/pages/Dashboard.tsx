import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraduationCap, LogOut, User, Clock } from "lucide-react";
import { mockCourses, getDaysRemaining } from "../utils/mockData";

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
        const response = await fetch(`http://localhost:5000/api/student/${loggedInUser.id}/courses`);
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
    navigate("/");
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("lmsUsers") || "[]");
    const updatedUsers = users.map((u: any) => {
      if (u.id === user.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    localStorage.setItem("lmsUsers", JSON.stringify(updatedUsers));
    setUser({ ...user, password: newPassword });
    setShowEditPassword(false);
    setNewPassword("");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-400 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900">ICT Academy With Anuradha Athukorala</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-800 rounded-lg shadow-md p-6 mb-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2">Welcome Back, {user.name}!</h1>
              <p className="text-blue-100">Continue your learning journey</p>
            </div>
            <button
              onClick={() => setShowEditPassword(!showEditPassword)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
          </div>

          {showEditPassword && (
            <form onSubmit={handlePasswordUpdate} className="mt-4 pt-4 border-t border-blue-500">
              <label className="block text-sm mb-2">Change Password</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        <div>
          <h2 className="mb-6">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const expiryDate = course.expiry_date || course.expiryDate;
              const daysRemaining = getDaysRemaining(expiryDate);
              const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
              const isExpired = daysRemaining < 0;

              const accents = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];
              const accent = course.accent || accents[course.id % accents.length] || "#2563EB";
              const category = course.category || "Web Dev";
              const thumbnail = course.thumbnail_url || course.thumbnail;

              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300 flex flex-col"
                >
                  {/* Thumbnail Section */}
                  <div className="w-full h-40 bg-gray-100 rounded-md mb-4 overflow-hidden relative shrink-0">
                    {thumbnail ? (
                      <img src={thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: accent }}>
                        {category}
                      </div>
                    )}
                  </div>

                  {/* Card Content Section */}
                  <div className="flex flex-col flex-1">
                    <h3 className="mb-4 font-semibold text-lg text-gray-800">{course.title}</h3>

                    <div className="mt-auto">
                      <div
                        className={`flex items-center gap-2 ${isExpired
                          ? "text-red-600"
                          : isExpiringSoon
                            ? "text-orange-600"
                            : "text-gray-600"
                          }`}
                      >
                        <Clock className="w-5 h-5" />
                        <span className="text-sm">
                          {isExpired ? (
                            "Access expired"
                          ) : (
                            <>
                              <span className="font-semibold">{daysRemaining}</span> day
                              {daysRemaining !== 1 ? "s" : ""} remaining
                            </>
                          )}
                        </span>
                      </div>

                      {!isExpired && (
                        <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${isExpiringSoon ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-blue-500 to-green-500"
                              }`}
                            style={{
                              width: `${Math.min(100, (daysRemaining / 90) * 100)}%`,
                            }}
                          />
                        </div>
                      )}

                      <div className="mt-4 text-sm text-gray-500">
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
