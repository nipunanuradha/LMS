import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Bell, Video, FileText, ExternalLink as ExternalLinkIcon, Download, Check, Eye } from "lucide-react";
import {
  mockCourses,
  mockRecordings,
  mockNotices,
  mockPDFs,
  mockExternalLinks,
  getDaysRemaining,
} from "../utils/mockData";

type TabType = "notices" | "recordings" | "notes" | "links";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(regExp);
  if (match && match[3]) {
    return `https://player.vimeo.com/video/${match[3]}`;
  }
  return null;
}

export function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("notices");
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbRecordings, setDbRecordings] = useState<any[]>([]);
  const [dbPDFs, setDbPDFs] = useState<any[]>([]);
  const [dbLinks, setDbLinks] = useState<any[]>([]);
  const [dbNotices, setDbNotices] = useState<any[]>([]);

  const recordings = dbRecordings;
  const notices = dbNotices;
  const pdfs = dbPDFs;
  const links = dbLinks;

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          const userObj = JSON.parse(currentUser);
          const enrollResponse = await fetch(`http://localhost:5000/api/student/${userObj.id}/courses`);
          let expiry = null;
          if (enrollResponse.ok) {
            const enrolledCourses = await enrollResponse.json();
            const matchingEnroll = enrolledCourses.find((c: any) => String(c.id) === String(courseId));
            if (matchingEnroll) {
              expiry = matchingEnroll.expiry_date;
            }
          }
          setCourse({
            ...data,
            expiryDate: expiry
          });

          // Fetch content
          const contentResponse = await fetch(`http://localhost:5000/api/courses/${courseId}/content`);
          if (contentResponse.ok) {
            const contents = await contentResponse.json();
            const notes = contents.filter((c: any) => c.content_type === 'pdf').map((c: any) => ({
              id: String(c.id),
              title: c.title,
              downloadUrl: c.content_url,
              size: "N/A"
            }));
            const exLinks = contents.filter((c: any) => c.content_type === 'link').map((c: any) => ({
              id: String(c.id),
              title: c.title,
              url: c.content_url,
              description: ""
            }));
            setDbPDFs(notes);
            setDbLinks(exLinks);
          }

          // Fetch video recordings
          const recordingsResponse = await fetch(`http://localhost:5000/api/courses/${courseId}/recordings`);
          if (recordingsResponse.ok) {
            const recs = (await recordingsResponse.json()).map((c: any) => ({
              id: String(c.id),
              title: c.title,
              videoUrl: c.video_url,
              embedCode: c.embed_code,
              duration: "Duration N/A",
              watched: false
            }));
            setDbRecordings(recs);
          }

          // Fetch course notifications (Notices)
          const notificationsResponse = await fetch(`http://localhost:5000/api/courses/${courseId}/notifications`);
          if (notificationsResponse.ok) {
            const nots = (await notificationsResponse.json()).map((c: any) => ({
              id: String(c.id),
              title: c.title,
              content: c.message,
              date: c.created_at
            }));
            setDbNotices(nots);
          }
        }
      } catch (err) {
        console.error("Failed to fetch course details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, navigate]);

  useEffect(() => {
    const watched = localStorage.getItem(`watched_${courseId}`);
    if (watched) {
      setWatchedVideos(new Set(JSON.parse(watched)));
    }
  }, [courseId]);

  const toggleWatched = (videoId: string) => {
    const newWatched = new Set(watchedVideos);
    if (newWatched.has(videoId)) {
      newWatched.delete(videoId);
    } else {
      newWatched.add(videoId);
    }
    setWatchedVideos(newWatched);
    localStorage.setItem(`watched_${courseId}`, JSON.stringify([...newWatched]));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  const expiryDate = course.expiryDate || course.expiry_date;
  const daysRemaining = expiryDate ? getDaysRemaining(expiryDate) : 0;

  const tabs = [
    { id: "notices" as TabType, label: "Notices", icon: Bell, count: notices.length },
    { id: "recordings" as TabType, label: "Recordings", icon: Video, count: recordings.length },
    { id: "notes" as TabType, label: "Notes / PDFs", icon: FileText, count: pdfs.length },
    { id: "links" as TabType, label: "External Materials", icon: ExternalLinkIcon, count: links.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2">{course.title}</h1>
              <p className="text-gray-600">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Access expired"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentVideo(null);
                    }}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "notices" && (
              <div className="space-y-4">
                {notices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notices available</p>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-blue-900">{notice.title}</h3>
                        <span className="text-sm text-blue-600">
                          {new Date(notice.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{notice.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "recordings" && (
              <div className="space-y-6">
                {currentVideo && (() => {
                  const activeRec = recordings.find((r) => r.id === currentVideo);
                  if (!activeRec) return null;
                  const hasEmbed = activeRec.embedCode && activeRec.embedCode.trim() !== "";
                  const ytEmbedUrl = getYouTubeEmbedUrl(activeRec.videoUrl);
                  const vimeoEmbedUrl = getVimeoEmbedUrl(activeRec.videoUrl);

                  let displayEmbed = activeRec.embedCode;
                  if (hasEmbed && displayEmbed.includes("youtube.com/embed/")) {
                    // Inject cleaner params into raw YouTube iframe code if not present
                    if (!displayEmbed.includes("?")) {
                      displayEmbed = displayEmbed.replace(
                        /youtube\.com\/embed\/([^"?\s>]+)/g,
                        "youtube.com/embed/$1?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
                      );
                    } else {
                      displayEmbed = displayEmbed.replace(
                        /youtube\.com\/embed\/([^"?\s>]+)\?/g,
                        "youtube.com/embed/$1?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&"
                      );
                    }
                  }

                  return (
                    <div className="max-w-2xl mx-auto mb-6">
                      {hasEmbed ? (
                        <div className="bg-black rounded-lg overflow-hidden aspect-video w-full relative">
                          {displayEmbed.includes("youtube.com") && (
                            <>
                              {/* Top bar click blocker overlay */}
                              <div className="absolute top-0 left-0 right-0 h-[75px] z-10"
                                style={{ background: 'rgba(0,0,0,0)', cursor: 'default' }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                              {/* Bottom bar click blocker overlay */}
                              <div className="absolute bottom-0 right-0 h-[60px] z-10"
                                style={{ background: 'rgba(0,0,0,0)', cursor: 'default' }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                            </>
                          )}
                          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: displayEmbed }} />
                        </div>
                      ) : ytEmbedUrl ? (
                        <div className="bg-black rounded-lg overflow-hidden aspect-video w-full relative">
                          {/* Top bar click blocker overlay */}
                          <div className="absolute top-0 left-0 right-0 h-[75px] z-10"
                            style={{ background: 'rgba(0,0,0,0)', cursor: 'default' }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                          {/* Bottom bar click blocker overlay */}
                          <div className="absolute bottom-0 right-0 w-[350px] h-[60px] z-10"
                            style={{ background: 'rgba(0,0,0,0)', cursor: 'default' }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />

                          <iframe
                            src={ytEmbedUrl}
                            className="w-full h-full aspect-video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            frameBorder="0"
                          />
                        </div>
                      ) : vimeoEmbedUrl ? (
                        <div className="bg-black rounded-lg overflow-hidden aspect-video w-full">
                          <iframe
                            src={vimeoEmbedUrl}
                            className="w-full h-full aspect-video"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            frameBorder="0"
                          />
                        </div>
                      ) : (
                        <div className="bg-black rounded-lg overflow-hidden">
                          <video
                            key={currentVideo}
                            controls
                            className="w-full aspect-video"
                            src={activeRec.videoUrl}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {recordings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recordings available</p>
                ) : (
                  <div className="space-y-3">
                    {recordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => setCurrentVideo(recording.id)}
                          className="flex-1 flex items-center gap-3 text-left"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <Video className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{recording.title}</p>
                            <p className="text-sm text-gray-500">{recording.duration}</p>
                          </div>
                        </button>

                        <button
                          onClick={() => toggleWatched(recording.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${watchedVideos.has(recording.id)
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-white text-gray-600 hover:bg-gray-200 border border-gray-300"
                            }`}
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-sm hidden sm:inline">
                            {watchedVideos.has(recording.id) ? "Watched" : "Mark as Watched"}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                {pdfs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notes available</p>
                ) : (
                  pdfs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pdf.title}</p>
                          <p className="text-sm text-gray-500">{pdf.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={pdf.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </a>
                        <a
                          href={pdf.downloadUrl}
                          download
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "links" && (
              <div className="space-y-3">
                {links.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No external materials available</p>
                ) : (
                  links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ExternalLinkIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{link.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                        <p className="text-xs text-blue-600 mt-2 truncate">{link.url}</p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
