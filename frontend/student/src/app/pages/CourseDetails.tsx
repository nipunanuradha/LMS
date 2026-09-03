import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Bell, Video, FileText, ExternalLink as ExternalLinkIcon, Download, Check, Eye, Maximize, Minimize, Volume2, VolumeX, Gauge, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  mockCourses,
  mockRecordings,
  mockNotices,
  mockPDFs,
  mockExternalLinks,
  getDaysRemaining,
} from "../utils/mockData";
import { API_URL } from "../config";

type TabType = "notices" | "recordings" | "notes" | "links";

export interface VideoQualityOption {
  id: string;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  ytQuality: string;
  badge?: string;
}

export const QUALITY_OPTIONS: VideoQualityOption[] = [
  { id: "auto", label: "Auto (Original)", shortLabel: "Auto", width: 0, height: 0, ytQuality: "default" },
  { id: "1080p", label: "1080p Full HD", shortLabel: "1080p", width: 1920, height: 1080, ytQuality: "hd1080", badge: "FHD" },
  { id: "720p", label: "720p HD", shortLabel: "720p", width: 1280, height: 720, ytQuality: "hd720", badge: "HD" },
  { id: "480p", label: "480p Standard", shortLabel: "480p", width: 854, height: 480, ytQuality: "large", badge: "SD" },
  { id: "360p", label: "360p Medium", shortLabel: "360p", width: 640, height: 360, ytQuality: "medium" },
  { id: "240p", label: "240p Low", shortLabel: "240p", width: 426, height: 240, ytQuality: "small" },
  { id: "144p", label: "144p (114p Data Saver)", shortLabel: "144p", width: 256, height: 144, ytQuality: "tiny", badge: "Saver" },
];

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&enablejsapi=1`;
  }
  return null;
}

function getVideoSource(url: string, quality: string): string {
  if (!url) return "";
  const opt = QUALITY_OPTIONS.find((q) => q.id === quality);
  if (!opt || opt.id === "auto") return url;

  // Cloudinary transform support
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/w_${opt.width},c_limit,q_auto/`);
  }

  // Multi-resolution filename pattern support (e.g. video_1080p.mp4 -> video_720p.mp4)
  if (/(?:_|-)(1080p|720p|480p|360p|240p|144p)\.(mp4|webm|m4v)/i.test(url)) {
    return url.replace(/(?:_|-)(1080p|720p|480p|360p|240p|144p)\.(mp4|webm|m4v)/i, `_${opt.shortLabel}.$2`);
  }

  return url;
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const match = url.match(regExp);
  if (match && match[3]) {
    return `https://player.vimeo.com/video/${match[3]}?api=1`;
  }
  return null;
}

export function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("notices");
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quality State and Refs
  const [selectedQuality, setSelectedQuality] = useState<string>(() => {
    return localStorage.getItem("preferred_video_quality") || "auto";
  });
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [qualityToast, setQualityToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const currentPlayTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);

  // Real-time tracking of iframe playback timestamp and play state
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== "object") return;

        // YouTube API infoDelivery messages
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.currentTime === "number") {
            currentPlayTimeRef.current = data.info.currentTime;
          }
          if (typeof data.info.playerState === "number") {
            // 1: PLAYING, 2: PAUSED, 3: BUFFERING
            isPlayingRef.current = data.info.playerState === 1 || data.info.playerState === 3;
          }
        }

        // Vimeo API messages
        if (data.event === "timeupdate" && data.data && typeof data.data.seconds === "number") {
          currentPlayTimeRef.current = data.data.seconds;
        }
        if (data.event === "play") {
          isPlayingRef.current = true;
        }
        if (data.event === "pause") {
          isPlayingRef.current = false;
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, []);

  // Close quality dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(e.target as Node)) {
        setQualityMenuOpen(false);
      }
    };
    if (qualityMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [qualityMenuOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const applyQuality = (qualityId: string) => {
    const opt = QUALITY_OPTIONS.find((q) => q.id === qualityId) || QUALITY_OPTIONS[0];

    // If HTML5 video is active, save its current time and play state
    if (videoRef.current) {
      currentPlayTimeRef.current = videoRef.current.currentTime;
      isPlayingRef.current = !videoRef.current.paused;
    }

    setSelectedQuality(opt.id);
    localStorage.setItem("preferred_video_quality", opt.id);

    setQualityToast(`Quality: ${opt.shortLabel}${opt.badge ? ` (${opt.badge})` : ""}`);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setQualityToast(null);
    }, 2500);

    const iframe = containerRef.current?.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      try {
        const src = iframe.src || "";
        if (src.includes("youtube.com") || (iframe.outerHTML && iframe.outerHTML.includes("youtube.com"))) {
          // Handshake
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "listening" }),
            "*"
          );
          // Set quality without reloading iframe
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "setPlaybackQuality", args: [opt.ytQuality] }),
            "*"
          );
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "setPlaybackQualityRange", args: [opt.ytQuality, opt.ytQuality] }),
            "*"
          );
          // Keep playing from current timestamp seamlessly
          if (currentPlayTimeRef.current > 0) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "seekTo", args: [currentPlayTimeRef.current, true] }),
              "*"
            );
          }
          if (isPlayingRef.current) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: "command", func: "playVideo", args: [] }),
              "*"
            );
          }
        } else if (src.includes("vimeo.com")) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: "setQuality", value: opt.shortLabel === "Auto" ? "auto" : opt.shortLabel }),
            "*"
          );
          if (currentPlayTimeRef.current > 0) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: "seekTo", value: currentPlayTimeRef.current }),
              "*"
            );
          }
          if (isPlayingRef.current) {
            iframe.contentWindow.postMessage(
              JSON.stringify({ method: "play" }),
              "*"
            );
          }
        }
      } catch (e) {
        console.error("Error communicating quality with iframe player:", e);
      }
    }
  };

  const applySpeedAndVolume = (speed: number, vol: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      videoRef.current.volume = vol;
    }

    const iframe = containerRef.current?.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      try {
        const src = iframe.src || "";
        if (src.includes("youtube.com") || (iframe.outerHTML && iframe.outerHTML.includes("youtube.com"))) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "setPlaybackRate", args: [speed, true] }),
            "*"
          );
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "setVolume", args: [vol * 100] }),
            "*"
          );
        } else if (src.includes("vimeo.com")) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: "setPlaybackRate", value: speed }),
            "*"
          );
          iframe.contentWindow.postMessage(
            JSON.stringify({ method: "setVolume", value: vol }),
            "*"
          );
        }
      } catch (e) {
        console.error("Error communicating with iframe player:", e);
      }
    }
  };

  // Real-time canvas downsampling engine for direct video files (MP4, WebM, etc.)
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (selectedQuality === "auto") {
      canvas.style.display = "none";
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    canvas.style.display = "block";
    const opt = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) || QUALITY_OPTIONS[0];

    const updateCanvasResolution = () => {
      const vW = video.videoWidth || 1280;
      const vH = video.videoHeight || 720;
      const aspect = vW / vH;
      const targetH = opt.height || 720;
      const targetW = Math.round(targetH * aspect);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    updateCanvasResolution();

    const drawFrame = () => {
      if (!video || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (ctx && video.readyState >= 2) {
        updateCanvasResolution();
        try {
          ctx.imageSmoothingEnabled = opt.id !== "144p";
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (e) {
          // Cross-origin fallback
        }
      }
    };

    let isLooping = false;
    const loop = () => {
      if (!isLooping) return;
      drawFrame();
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    const handlePlay = () => {
      isLooping = true;
      loop();
    };

    const handlePause = () => {
      isLooping = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      drawFrame();
    };

    const handleSeeked = () => {
      drawFrame();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadedmetadata", updateCanvasResolution);

    if (!video.paused && !video.ended) {
      isLooping = true;
      loop();
    } else {
      drawFrame();
    }

    return () => {
      isLooping = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadedmetadata", updateCanvasResolution);
    };
  }, [currentVideo, selectedQuality]);

  useEffect(() => {
    const timer = setTimeout(() => {
      applySpeedAndVolume(playbackSpeed, volume);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentVideo, playbackSpeed, volume]);

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
        const response = await fetch(`${API_URL}/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          const userObj = JSON.parse(currentUser);
          const enrollResponse = await fetch(`${API_URL}/api/student/${userObj.id}/courses`);
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
          const contentResponse = await fetch(`${API_URL}/api/courses/${courseId}/content`);
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
          const recordingsResponse = await fetch(`${API_URL}/api/courses/${courseId}/recordings`);
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
          const notificationsResponse = await fetch(`${API_URL}/api/courses/${courseId}/notifications`);
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
                  const currentQualityOption = QUALITY_OPTIONS.find((q) => q.id === selectedQuality) || QUALITY_OPTIONS[0];

                  let displayEmbed = activeRec.embedCode;
                  if (hasEmbed && displayEmbed.includes("youtube.com/embed/")) {
                    // Strip native fullscreen
                    displayEmbed = displayEmbed.replace(/allowfullscreen(="[^"]*")?/gi, "");
                    // Inject cleaner params into raw YouTube iframe code if not present
                    if (!displayEmbed.includes("?")) {
                      displayEmbed = displayEmbed.replace(
                        /youtube\.com\/embed\/([^"?\s>]+)/g,
                        "youtube.com/embed/$1?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&enablejsapi=1"
                      );
                    } else {
                      displayEmbed = displayEmbed.replace(
                        /youtube\.com\/embed\/([^"?\s>]+)\?/g,
                        "youtube.com/embed/$1?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&enablejsapi=1&"
                      );
                    }
                  }

                  return (
                    <div className="max-w-2xl mx-auto mb-6">
                      <div ref={containerRef} className="bg-black rounded-lg overflow-hidden flex flex-col relative group">
                        {/* Quality change on-screen toast badge */}
                        {qualityToast && (
                          <div className="absolute top-4 right-4 z-40 bg-gray-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium border border-gray-700 shadow-xl flex items-center gap-2 pointer-events-none transition-all">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                            <span>{qualityToast}</span>
                          </div>
                        )}

                        {/* Player wrapper */}
                        <div className={`relative ${isFullscreen ? "w-screen h-screen flex items-center justify-center bg-black" : "aspect-video w-full"}`}>
                          {hasEmbed ? (
                            <>
                              {displayEmbed.includes("youtube.com") && (
                                <>
                                  <div className="absolute top-0 left-0 right-0 z-10"
                                    style={{
                                      height: isFullscreen ? '100px' : '75px',
                                      background: 'rgba(0,0,0,0)',
                                      cursor: 'default'
                                    }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    touch-action="none"
                                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                                  <div className="absolute bottom-0 right-0 z-10"
                                    style={{
                                      width: isFullscreen ? '500px' : '400px',
                                      height: isFullscreen ? '100px' : '80px',
                                      background: 'rgba(0,0,0,0)',
                                      cursor: 'default'
                                    }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                                  <div className="absolute bottom-0 left-0 z-10"
                                    style={{
                                      width: isFullscreen ? '220px' : '180px',
                                      height: isFullscreen ? '80px' : '65px',
                                      background: 'rgba(0,0,0,0)',
                                      cursor: 'default'
                                    }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                                </>
                              )}
                              <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: displayEmbed }} />

                              <button
                                onClick={toggleFullscreen}
                                className="absolute bottom-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all focus:outline-none"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                              >
                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                              </button>
                            </>
                          ) : ytEmbedUrl ? (
                            <>
                              <div className="absolute top-0 left-0 right-0 z-10"
                                style={{
                                  height: isFullscreen ? '100px' : '75px',
                                  background: 'rgba(0,0,0,0)',
                                  cursor: 'default'
                                }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                              <div className="absolute bottom-0 right-0 z-10"
                                style={{
                                  width: isFullscreen ? '500px' : '400px',
                                  height: isFullscreen ? '100px' : '80px',
                                  background: 'rgba(0,0,0,0)',
                                  cursor: 'default'
                                }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />
                              <div className="absolute bottom-0 left-0 z-10"
                                style={{
                                  width: isFullscreen ? '220px' : '180px',
                                  height: isFullscreen ? '80px' : '65px',
                                  background: 'rgba(0,0,0,0)',
                                  cursor: 'default'
                                }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }} />

                              <iframe
                                src={ytEmbedUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                frameBorder="0"
                              />

                              <button
                                onClick={toggleFullscreen}
                                className="absolute bottom-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all focus:outline-none"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                              >
                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                              </button>
                            </>
                          ) : vimeoEmbedUrl ? (
                            <iframe
                              src={vimeoEmbedUrl}
                              className="w-full h-full aspect-video"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              frameBorder="0"
                            />
                          ) : (
                            <div className="relative w-full h-full aspect-video flex items-center justify-center bg-black">
                              <video
                                ref={videoRef}
                                key={currentVideo}
                                controls
                                className="w-full h-full aspect-video"
                                src={getVideoSource(activeRec.videoUrl, selectedQuality)}
                                onTimeUpdate={(e) => {
                                  currentPlayTimeRef.current = e.currentTarget.currentTime;
                                }}
                                onLoadedMetadata={() => {
                                  if (videoRef.current && currentPlayTimeRef.current > 0) {
                                    videoRef.current.currentTime = currentPlayTimeRef.current;
                                    if (isPlayingRef.current) {
                                      videoRef.current.play().catch(() => {});
                                    }
                                  }
                                }}
                                onPlay={() => {
                                  isPlayingRef.current = true;
                                  if (videoRef.current) {
                                    videoRef.current.playbackRate = playbackSpeed;
                                    videoRef.current.volume = volume;
                                  }
                                }}
                                onPause={() => {
                                  isPlayingRef.current = false;
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                              <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                                style={{ display: selectedQuality === "auto" ? "none" : "block" }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Speed, Quality & Volume Control Panel (Always visible at the bottom) */}
                        <div className="bg-gray-900 text-white p-3 flex flex-wrap items-center justify-between gap-4 border-t border-gray-800 z-30">
                          {/* Volume section */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const newVol = volume === 0 ? 1 : 0;
                                setVolume(newVol);
                                applySpeedAndVolume(playbackSpeed, newVol);
                              }}
                              className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white cursor-pointer"
                              title={volume === 0 ? "Unmute" : "Mute"}
                            >
                              {volume === 0 ? (
                                <VolumeX className="w-5 h-5 text-red-500" />
                              ) : (
                                <Volume2 className="w-5 h-5 text-blue-500" />
                              )}
                            </button>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-400">Vol:</span>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setVolume(val);
                                  applySpeedAndVolume(playbackSpeed, val);
                                }}
                                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              />
                              <span className="text-xs font-mono w-8 text-right">
                                {Math.round(volume * 100)}%
                              </span>
                            </div>
                          </div>

                          {/* Speed section */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Gauge className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-gray-400">Speed:</span>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-850 rounded-lg p-0.5 border border-gray-700">
                              {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => {
                                    setPlaybackSpeed(speed);
                                    applySpeedAndVolume(speed, volume);
                                  }}
                                  className={`px-2 py-0.5 text-xs rounded transition-all font-medium cursor-pointer ${
                                    playbackSpeed === speed
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                                  }`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quality section */}
                          <div className="relative flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-gray-400">Quality:</span>
                            </div>

                            <div className="relative" ref={qualityMenuRef}>
                              <button
                                onClick={() => setQualityMenuOpen(!qualityMenuOpen)}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 hover:bg-gray-750 active:bg-gray-700 text-white text-xs font-medium rounded-lg border border-gray-700 transition-colors shadow-sm focus:outline-none cursor-pointer"
                                title="Select playback quality (144p - 1080p)"
                              >
                                <span>{currentQualityOption.shortLabel}</span>
                                {currentQualityOption.badge && (
                                  <span className="px-1.5 py-0.2 bg-blue-600/80 text-[10px] rounded text-white font-semibold">
                                    {currentQualityOption.badge}
                                  </span>
                                )}
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${qualityMenuOpen ? "rotate-180" : ""}`} />
                              </button>

                              {qualityMenuOpen && (
                                <div 
                                  className="absolute bottom-full mb-2 right-0 w-52 bg-gray-900/95 backdrop-blur-md border border-gray-750 rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden"
                                >
                                  <div className="px-3 py-1.5 border-b border-gray-800 text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                                    <span>Video Quality</span>
                                    <span className="text-[10px] text-blue-400 font-normal">Resolution</span>
                                  </div>
                                  <div className="max-h-60 overflow-y-auto py-1">
                                    {QUALITY_OPTIONS.map((opt) => {
                                      const isSelected = selectedQuality === opt.id;
                                      return (
                                        <button
                                          key={opt.id}
                                          onClick={() => {
                                            applyQuality(opt.id);
                                            setQualityMenuOpen(false);
                                          }}
                                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                            isSelected
                                              ? "bg-blue-600/20 text-blue-400 font-medium"
                                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {isSelected ? (
                                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                            ) : (
                                              <span className="w-3.5 shrink-0" />
                                            )}
                                            <span className="truncate">{opt.label}</span>
                                          </div>
                                          {opt.badge && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-1 ${
                                              isSelected ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400"
                                            }`}>
                                              {opt.badge}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {recordings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recordings available</p>
                ) : (
                  <div className="flex flex-col overflow-y-auto overflow-x-auto max-h-[480px] gap-3 pb-3 pr-1">
                    {recordings.map((recording) => (
                      <div
                        key={recording.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors shrink-0 min-w-[500px] sm:min-w-0 w-full"
                      >
                        <button
                          onClick={() => setCurrentVideo(recording.id)}
                          className="flex-1 flex items-center gap-3 text-left min-w-0"
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
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shrink-0 ${watchedVideos.has(recording.id)
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
