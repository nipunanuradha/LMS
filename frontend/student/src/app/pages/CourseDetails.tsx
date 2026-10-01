import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Bell, Video, FileText, ExternalLink as ExternalLinkIcon, Download, Check, Eye, Maximize, Minimize, Volume2, VolumeX, Gauge, SlidersHorizontal, ChevronDown, Lock, Unlock, CreditCard, Calendar, CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import {
  mockCourses,
  mockRecordings,
  mockNotices,
  mockPDFs,
  mockExternalLinks,
  getDaysRemaining,
} from "../utils/mockData";
import { API_URL } from "../config";
import { ThemeToggle } from "../components/ThemeToggle";

type TabType = "recordings" | "notes" | "links" | "notices";

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

export const QUALITY_FILTERS: Record<string, string> = {
  auto: "none",
  "1080p": "contrast(1.08) saturate(1.06) brightness(1.01)",
  "720p": "contrast(1.02)",
  "480p": "blur(0.6px) contrast(0.98)",
  "360p": "blur(1.4px) contrast(0.95)",
  "240p": "blur(2.2px) contrast(0.92) brightness(0.96)",
  "144p": "blur(3.4px) contrast(0.88) brightness(0.94)",
};

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

  // Month-wise access state
  const [months, setMonths] = useState<any[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState<number | null>(null);
  const [selectedMonthData, setSelectedMonthData] = useState<any>(null);
  const [hasFullEnrollment, setHasFullEnrollment] = useState(false);
  const [currentUserObj, setCurrentUserObj] = useState<any>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payTargetMonth, setPayTargetMonth] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [paymentTimeoutInfo, setPaymentTimeoutInfo] = useState<{ orderId: string; message: string } | null>(null);

  const recordings = dbRecordings;
  const notices = dbNotices;
  const pdfs = dbPDFs;
  const links = dbLinks;

  // 1. Fetch Month Access Status
  const fetchMonthAccess = async (userObj: any, keepSelectedId?: number | null) => {
    try {
      const res = await fetch(`${API_URL}/api/student/${userObj.id}/courses/${courseId}/month-access`);
      if (res.ok) {
        const data = await res.json();
        setHasFullEnrollment(!!data.hasFullEnrollment || !!data.isAdmin);
        const fetchedMonths = data.months || [];
        setMonths(fetchedMonths);

        // Pick selected month
        let targetId = keepSelectedId;
        if (!targetId && fetchedMonths.length > 0) {
          const curMonthNum = new Date().getMonth() + 1;
          const currentMonthObj = fetchedMonths.find((m: any) => m.month_number === curMonthNum);
          targetId = currentMonthObj ? currentMonthObj.id : fetchedMonths[0].id;
        }

        if (targetId) {
          const activeObj = fetchedMonths.find((m: any) => m.id === targetId) || fetchedMonths[0];
          setSelectedMonthId(targetId);
          setSelectedMonthData(activeObj);
          fetchContentForMonth(targetId, !!activeObj?.is_unlocked);
        }
      }
    } catch (err) {
      console.error("Failed to fetch month access:", err);
    }
  };

  // 2. Fetch Content & Recordings for Selected Month
  const fetchContentForMonth = async (monthId: number | null, isUnlocked?: boolean) => {
    try {
      // First, fetch course notices/announcements (public to enrolled students)
      try {
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
      } catch (e) {
        console.error("Failed to load course notices:", e);
      }

      // Check if user has permission to view this month's materials
      const monthObj = months.find((m: any) => m.id === monthId);
      const canAccess = isUnlocked !== undefined ? isUnlocked : !!monthObj?.is_unlocked;

      // If month is locked, do NOT fire requests to protected endpoints to prevent 403 console errors
      if (!canAccess) {
        setDbPDFs([]);
        setDbLinks([]);
        setDbRecordings([]);
        return;
      }

      const token = localStorage.getItem("token");
      const currentStoredUser = localStorage.getItem("currentUser");
      const parsedUser = currentStoredUser ? JSON.parse(currentStoredUser) : currentUserObj;
      const userIdParam = parsedUser?.id ? `&user_id=${parsedUser.id}` : "";

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (parsedUser?.id) {
        headers["x-user-id"] = String(parsedUser.id);
      }

      const monthQuery = monthId ? `?course_month_id=${monthId}${userIdParam}` : "";

      const [contentResponse, recordingsResponse] = await Promise.all([
        fetch(`${API_URL}/api/courses/${courseId}/content${monthQuery}`, { headers }),
        fetch(`${API_URL}/api/courses/${courseId}/recordings${monthQuery}`, { headers })
      ]);

      if (contentResponse.ok) {
        const contents = await contentResponse.json();
        const notes = contents.filter((c: any) => c.content_type === 'pdf').map((c: any) => ({
          id: String(c.id),
          title: c.title,
          downloadUrl: c.content_url,
          size: "PDF Document"
        }));
        const exLinks = contents.filter((c: any) => c.content_type === 'link').map((c: any) => ({
          id: String(c.id),
          title: c.title,
          url: c.content_url,
          description: ""
        }));
        setDbPDFs(notes);
        setDbLinks(exLinks);
      } else {
        // Locked / Unauthorized
        setDbPDFs([]);
        setDbLinks([]);
      }

      if (recordingsResponse.ok) {
        const recs = (await recordingsResponse.json()).map((c: any) => ({
          id: String(c.id),
          title: c.title,
          videoUrl: c.video_url,
          embedCode: c.embed_code,
          duration: "Class Video",
          watched: false
        }));
        setDbRecordings(recs);
      } else {
        // Locked / Unauthorized
        setDbRecordings([]);
      }
    } catch (err) {
      console.error("Failed to load month materials:", err);
    }
  };

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }
    const userObj = JSON.parse(currentUser);
    setCurrentUserObj(userObj);

    const init = async () => {
      try {
        const courseRes = await fetch(`${API_URL}/api/courses/${courseId}`);
        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourse(cData);
        }
        await fetchMonthAccess(userObj);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [courseId, navigate]);

  // When selected month changes, load its videos and materials
  useEffect(() => {
    if (selectedMonthId) {
      const activeObj = months.find((m) => m.id === selectedMonthId);
      if (activeObj) {
        setSelectedMonthData(activeObj);
        fetchContentForMonth(selectedMonthId, !!activeObj.is_unlocked);
      } else {
        fetchContentForMonth(selectedMonthId, false);
      }
    }
  }, [selectedMonthId]);

  // Handle PayHere Secure Real Gateway Payment
  const handlePayHerePayment = async () => {
    if (!currentUserObj || !payTargetMonth) return;
    setIsProcessingPayment(true);
    try {
      // 1. Request secure payment initiation from backend
      // Backend validates user, calculates hash using PAYHERE_MERCHANT_SECRET from .env, and returns parameters
      const initRes = await fetch(`${API_URL}/api/student/payhere/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserObj.id,
          course_id: parseInt(courseId as string),
          course_month_id: payTargetMonth.id
        })
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        alert(initData.error || "Failed to initiate payment gateway.");
        setIsProcessingPayment(false);
        return;
      }

      // Check if PayHere SDK script is loaded in window
      if (typeof (window as any).payhere === "undefined") {
        alert("PayHere payment gateway is currently loading or unavailable. Please check your internet connection.");
        setIsProcessingPayment(false);
        return;
      }

      const paymentObject = {
        sandbox: !!initData.sandbox,
        merchant_id: initData.merchant_id,
        return_url: window.location.href,
        cancel_url: window.location.href,
        notify_url: initData.notify_url,
        order_id: initData.order_id,
        items: initData.items,
        amount: initData.amount,
        currency: initData.currency,
        hash: initData.hash,
        first_name: initData.first_name,
        last_name: initData.last_name,
        email: initData.email,
        phone: initData.phone,
        address: initData.address,
        city: initData.city,
        country: initData.country
      };

      // PayHere Callbacks
      (window as any).payhere.onCompleted = async function (orderId: string) {
        console.log("PayHere payment completed in client:", orderId);
        setIsProcessingPayment(true);
        setIsVerifyingPayment(true);
        setPaymentTimeoutInfo(null);
        setPaymentSuccessMsg(null);

        // Notify backend of client completion for pending tracking (does NOT fulfill access)
        fetch(`${API_URL}/api/payhere/confirm-success`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            user_id: currentUserObj?.id,
            course_id: courseId,
            course_month_id: payTargetMonth.id
          })
        }).catch((err) => console.warn("Pending payment tracking notification note:", err));

        // Poll backend GET /api/payhere/payment-status?order_id=XXX
        // Every 2 seconds up to 10 attempts (20 seconds max)
        const maxAttempts = 10;
        let attempts = 0;
        let verified = false;

        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const statusRes = await fetch(`${API_URL}/api/payhere/payment-status?order_id=${encodeURIComponent(orderId)}`);
            if (statusRes.ok) {
              const statusData = await statusRes.json();
              if (statusData.status === "success") {
                clearInterval(pollInterval);
                verified = true;
                setIsVerifyingPayment(false);

                // Refresh month access & unlocked course materials
                await fetchMonthAccess(currentUserObj, payTargetMonth.id);
                fetchContentForMonth(payTargetMonth.id, true);

                setPaymentSuccessMsg(`🎉 Success! Access for ${payTargetMonth.title} has been unlocked.`);
                setTimeout(() => {
                  setShowPaymentModal(false);
                  setPaymentSuccessMsg(null);
                  setIsProcessingPayment(false);
                }, 2000);
                return;
              }
            }
          } catch (pollErr) {
            console.warn(`Payment status poll attempt ${attempts} failed:`, pollErr);
          }

          if (attempts >= maxAttempts && !verified) {
            clearInterval(pollInterval);
            setIsVerifyingPayment(false);
            setIsProcessingPayment(false);
            setPaymentTimeoutInfo({
              orderId,
              message: "Payment is being confirmed and may take a minute. Please refresh shortly — if it doesn't unlock within 5 minutes, contact support with your order ID:"
            });
          }
        }, 2000);
      };

      (window as any).payhere.onDismissed = function () {
        console.log("PayHere payment popup closed by user.");
        setIsProcessingPayment(false);
      };

      (window as any).payhere.onError = function (error: any) {
        console.error("PayHere error:", error);
        alert(`Payment gateway error: ${error || "Something went wrong"}`);
        setIsProcessingPayment(false);
      };

      // Launch PayHere Popup Modal
      (window as any).payhere.startPayment(paymentObject);

    } catch (err: any) {
      console.error("PayHere initiation error:", err);
      alert(err.message || "Network error. Could not connect to payment gateway.");
      setIsProcessingPayment(false);
    }
  };

  // Handle secure payment via PayHere gateway
  const handleConfirmPayment = async () => {
    if (!currentUserObj || !payTargetMonth) return;
    await handlePayHerePayment();
  };

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

  // Month is unlocked ONLY if this specific month has been paid for
  const isCurrentMonthUnlocked = !!selectedMonthData?.is_unlocked;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="bg-card shadow-xs border-b border-border transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {course.category || "Course"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {hasFullEnrollment
                  ? "Full Course Access Active"
                  : expiryDate && daysRemaining > 0
                    ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in initial 30-day enrollment period to purchase months`
                    : "Permanent access active for all your purchased months"}
              </p>
            </div>

            {/* Quick Month Status */}
            {selectedMonthData && (
              <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-xl border border-border">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Selected Access</div>
                  <div className="text-sm font-semibold text-foreground">{selectedMonthData.title}</div>
                </div>
                {isCurrentMonthUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40">
                    <Unlock className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : selectedMonthData.is_pending ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/60 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pending Unlocking
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setPayTargetMonth(selectedMonthData);
                      setShowPaymentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Pay Rs. {Number(selectedMonthData.monthly_price).toLocaleString()}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── 12-MONTH SELECTOR STRIP ───────────────────────────────────────────── */}
      <div className="bg-card/70 border-b border-border backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Academic Year Months (January – December)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {months.map((m) => {
              const isSelected = m.id === selectedMonthId;
              const isUnlocked = m.is_unlocked;
              const isPending = !!m.is_pending && !isUnlocked;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMonthId(m.id);
                    setSelectedMonthData(m);
                    setCurrentVideo(null);
                    if (!isUnlocked) {
                      setPayTargetMonth(m);
                      setShowPaymentModal(true);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                    : isUnlocked
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                      : isPending
                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  title={isUnlocked ? `${m.title} is Unlocked` : isPending ? `${m.title} - Payment Verification Pending Unlocking` : `Click to pay for ${m.title}`}
                >
                  {isUnlocked ? (
                    <Unlock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                  ) : isPending ? (
                    <Loader2 className={`w-3.5 h-3.5 shrink-0 animate-spin ${isSelected ? "text-white" : "text-amber-600 dark:text-amber-400"}`} />
                  ) : (
                    <Lock className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-amber-500"}`} />
                  )}
                  <span className="font-semibold">{m.title.split(" ")[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${isSelected
                    ? "bg-white/20 text-white"
                    : isUnlocked
                      ? "bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100"
                      : isPending
                        ? "bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 font-semibold"
                        : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                    }`}>
                    {isUnlocked ? "Paid" : isPending ? "Pending Unlocking" : `Rs. ${Number(m.monthly_price).toLocaleString()}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* If month is locked, show Lock Overlay or Pending Unlocking Notice */}
        {!isCurrentMonthUnlocked ? (
          selectedMonthData?.is_pending ? (
            <div className="bg-card rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/50 p-8 text-center max-w-xl mx-auto my-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-300 dark:border-amber-700 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/50 mb-3">
                Payment Verification in Progress
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {selectedMonthData?.title} — Pending Unlocking
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                We have received your payment initiation for <strong>{selectedMonthData?.title}</strong>. Our system is verifying the transaction with PayHere. Your access will unlock automatically as soon as confirmation arrives.
              </p>

              {selectedMonthData?.pending_order_id && (
                <div className="bg-muted/50 p-3.5 rounded-xl border border-border max-w-sm mx-auto mb-5 text-left text-xs">
                  <span className="text-muted-foreground block text-[11px] mb-1">Order Reference:</span>
                  <code className="font-mono font-bold text-foreground break-all">{selectedMonthData.pending_order_id}</code>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <button
                  onClick={async () => {
                    if (currentUserObj) {
                      await fetchMonthAccess(currentUserObj, selectedMonthData.id);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Re-check Status
                </button>
                <button
                  onClick={() => {
                    setPayTargetMonth(selectedMonthData);
                    setShowPaymentModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Retry Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center max-w-xl mx-auto my-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-300 dark:border-amber-800">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {selectedMonthData?.title} is Locked
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                You haven't unlocked the recordings and study materials for <strong>{selectedMonthData?.title}</strong> yet. Complete the monthly payment to get instant lifetime access for this month's content.
              </p>

              <div className="bg-muted/40 p-4 rounded-xl border border-border max-w-sm mx-auto mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Month:</span>
                  <span className="font-semibold text-foreground">{selectedMonthData?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Class Fee:</span>
                  <span className="font-bold text-blue-600 text-base">
                    Rs. {Number(selectedMonthData?.monthly_price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPayTargetMonth(selectedMonthData);
                  setShowPaymentModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer w-full max-w-sm"
              >
                <CreditCard className="w-4 h-4" />
                Pay for {selectedMonthData?.title} (Rs. {Number(selectedMonthData?.monthly_price || 0).toLocaleString()})
              </button>
            </div>
          )
        ) : (
          <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden transition-colors">
            <div className="border-b border-border">
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
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab === tab.id
                        ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400" : "bg-muted text-muted-foreground"
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
                    <p className="text-muted-foreground text-center py-8">No notices available for this course</p>
                  ) : (
                    notices.map((notice) => (
                      <div key={notice.id} className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-blue-900 dark:text-blue-200 font-semibold">{notice.title}</h3>
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            {new Date(notice.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-blue-950 dark:text-blue-100 text-sm leading-relaxed">{notice.content}</p>
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
                            {/* Live Quality Badge on top-left of video */}
                            <div className="absolute top-3 left-3 z-30 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded text-[11px] font-mono font-medium text-white/90 border border-white/10 flex items-center gap-1.5 pointer-events-none shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <span>{currentQualityOption.shortLabel}</span>
                              {currentQualityOption.badge && (
                                <span className="text-[10px] text-blue-400 font-bold ml-0.5">{currentQualityOption.badge}</span>
                              )}
                            </div>

                            {/* Media Filter Wrapper (Applies instant visual quality transformation on-the-fly) */}
                            <div
                              className="w-full h-full relative transition-[filter] duration-200 ease-out"
                              style={{ filter: QUALITY_FILTERS[selectedQuality] || "none" }}
                            >
                              {hasEmbed ? (
                                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: displayEmbed }} />
                              ) : ytEmbedUrl ? (
                                <iframe
                                  src={ytEmbedUrl}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  frameBorder="0"
                                />
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
                                    crossOrigin="anonymous"
                                    className="w-full h-full aspect-video"
                                    src={getVideoSource(activeRec.videoUrl, selectedQuality)}
                                    onTimeUpdate={(e) => {
                                      currentPlayTimeRef.current = e.currentTarget.currentTime;
                                    }}
                                    onLoadedMetadata={() => {
                                      if (videoRef.current && currentPlayTimeRef.current > 0) {
                                        videoRef.current.currentTime = currentPlayTimeRef.current;
                                        if (isPlayingRef.current) {
                                          videoRef.current.play().catch(() => { });
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

                            {/* YouTube Click Protection Shields (Placed above the media) */}
                            {((hasEmbed && displayEmbed.includes("youtube.com")) || ytEmbedUrl) && (
                              <>
                                <div className="absolute top-0 left-0 right-0 z-20"
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
                                <div className="absolute bottom-0 right-0 z-20"
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
                                <div className="absolute bottom-0 left-0 z-20"
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

                            {/* Fullscreen Button */}
                            <button
                              onClick={toggleFullscreen}
                              className="absolute bottom-3 right-3 z-30 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all focus:outline-none cursor-pointer"
                              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
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
                                    className={`px-2 py-0.5 text-xs rounded transition-all font-medium cursor-pointer ${playbackSpeed === speed
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
                                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected
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
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-1 ${isSelected ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400"
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
                    <p className="text-muted-foreground text-center py-8">No recordings available</p>
                  ) : (
                    <div className="flex flex-col overflow-y-auto overflow-x-auto max-h-[480px] gap-3 pb-3 pr-1 custom-scrollbar">
                      {recordings.map((recording) => (
                        <div
                          key={recording.id}
                          className="flex items-center gap-4 p-4 bg-muted/50 dark:bg-card border border-border rounded-xl hover:bg-muted transition-colors shrink-0 min-w-[500px] sm:min-w-0 w-full"
                        >
                          <button
                            onClick={() => setCurrentVideo(recording.id)}
                            className="flex-1 flex items-center gap-3 text-left min-w-0 cursor-pointer"
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Video className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{recording.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{recording.duration}</p>
                            </div>
                          </button>

                          <button
                            onClick={() => toggleWatched(recording.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer text-xs font-semibold ${watchedVideos.has(recording.id)
                              ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 hover:bg-green-200"
                              : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                              }`}
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">
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
                    <p className="text-muted-foreground text-center py-8">No notes available</p>
                  ) : (
                    pdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="flex items-center justify-between p-4 bg-muted/50 dark:bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-950/60 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{pdf.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{pdf.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={pdf.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent text-foreground border border-border rounded-xl transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </a>
                          <a
                            href={pdf.downloadUrl}
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-xs"
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
                    <p className="text-muted-foreground text-center py-8">No external materials available</p>
                  ) : (
                    links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-4 bg-muted/50 dark:bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/60 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ExternalLinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{link.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 truncate">{link.url}</p>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DIRECT PAYMENT SIMULATION MODAL ────────────────────────────────────── */}
      {showPaymentModal && payTargetMonth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">Course Month Payment</h3>
                  <p className="text-xs text-muted-foreground">{payTargetMonth.title}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isProcessingPayment) setShowPaymentModal(false);
                }}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1.5 rounded-lg hover:bg-muted cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {isVerifyingPayment ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Verifying your payment...</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Please wait a moment while we verify the official confirmation from PayHere and securely unlock your access.
                  </p>
                </div>
              ) : paymentTimeoutInfo ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">Payment Verification in Progress</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed px-2">
                    {paymentTimeoutInfo.message}
                  </p>
                  <div className="bg-muted p-3 rounded-lg border border-border inline-block">
                    <span className="text-[11px] text-muted-foreground block mb-0.5">Your Order Reference ID:</span>
                    <code className="text-xs font-mono font-bold text-foreground select-all bg-background px-2 py-1 rounded border border-border">
                      {paymentTimeoutInfo.orderId}
                    </code>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setPaymentTimeoutInfo(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      Close & Check Later
                    </button>
                  </div>
                </div>
              ) : paymentSuccessMsg ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">Payment Successful!</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {paymentSuccessMsg}
                  </p>
                </div>
              ) : (
                <>
                  {/* Bill Summary */}
                  <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Course:</span>
                      <span className="font-medium text-foreground">{course.title}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Month:</span>
                      <span className="font-medium text-foreground">{payTargetMonth.title}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between items-baseline">
                      <span className="text-sm font-semibold text-foreground">Total Fee:</span>
                      <span className="text-xl font-bold text-blue-600">
                        Rs. {Number(payTargetMonth.monthly_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Info */}
                  <div className="p-3.5 rounded-xl border border-blue-600/40 bg-blue-50/60 dark:bg-blue-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">💳</span>
                      <div>
                        <div className="text-xs font-bold text-foreground">Online Payment (Cards & Wallets)</div>
                        <div className="text-[11px] text-muted-foreground">Visa, MasterCard, Frimi, Genie, eZ Cash</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                      Instant
                    </span>
                  </div>

                  {/* Payment Info banner */}
                  <div className="text-[11px] text-muted-foreground bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 p-3 rounded-xl flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>PayHere Secure Gateway:</strong> Pay instantly using Visa, MasterCard, Frimi, Genie, or eZ Cash. 256-bit SSL encrypted & secure.
                    </span>
                  </div>

                  {/* Payment Terms & Legal Agreement Notice */}
                  <p className="text-[11px] text-center text-muted-foreground leading-normal px-2">
                    By proceeding with payment, you agree to our{" "}
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700"
                    >
                      Terms of Service
                    </a>
                    ,{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700"
                    >
                      Privacy Policy
                    </a>
                    , and{" "}
                    <a
                      href="/refund-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-semibold underline hover:text-blue-700"
                    >
                      Refund Policy
                    </a>
                    .
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleConfirmPayment}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment
                        ? "Connecting Gateway..."
                        : `Pay with PayHere (Rs. ${Number(payTargetMonth.monthly_price).toLocaleString()})`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
