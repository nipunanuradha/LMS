import { useEffect, useRef, useCallback } from "react";
import { LANDING_URL } from "../config";

const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

// Helper to determine if any HTML5 video on the page is currently playing
function isAnyVideoPlaying(): boolean {
  try {
    const videoElements = document.querySelectorAll("video");
    for (let i = 0; i < videoElements.length; i++) {
      const v = videoElements[i];
      if (!v.paused && !v.ended && v.readyState > 2) {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
}

export function useAutoLogout(timeoutMs: number = INACTIVITY_TIMEOUT_MS) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVideoPlayingRef = useRef<boolean>(false);

  const logout = useCallback(() => {
    // If a video is currently playing, do NOT logout! Reset timer instead.
    if (isVideoPlayingRef.current || isAnyVideoPlaying()) {
      resetTimer();
      return;
    }

    // Only logout if user is currently logged in
    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("currentUser");
    if (!token && !currentUser) return;

    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = LANDING_URL;
  }, []);

  const resetTimer = useCallback(() => {
    // Check if user is logged in before setting/resetting the timer
    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("currentUser");
    if (!token && !currentUser) {
      if (timerRef.current) {
        clearTimeout(timerRef.current as any);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current as any);
    }

    timerRef.current = setTimeout(() => {
      logout();
    }, timeoutMs);
  }, [logout, timeoutMs]);

  useEffect(() => {
    // Initial check
    const token = localStorage.getItem("token");
    const currentUser = localStorage.getItem("currentUser");
    if (!token && !currentUser) return;

    // Events that count as user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel"
    ];

    // Throttle event handling so it doesn't fire continuously on mousemove
    let lastActivityTime = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      // Throttle resetting to at most once every 1 second
      if (now - lastActivityTime > 1000) {
        lastActivityTime = now;
        resetTimer();
      }
    };

    // Track HTML5 video events across document (play, pause, playing, timeupdate)
    const handleVideoPlaying = () => {
      isVideoPlayingRef.current = true;
      resetTimer();
    };

    const handleVideoPaused = () => {
      // Check if any other video is still playing
      isVideoPlayingRef.current = isAnyVideoPlaying();
      resetTimer();
    };

    // Listen to iframe postMessage events (YouTube / Vimeo / Embedded Players)
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

        // YouTube player API messages:
        // playerState 1 = PLAYING, 3 = BUFFERING, 2 = PAUSED, 0 = ENDED
        if (data.event === "infoDelivery" && data.info) {
          if (typeof data.info.playerState === "number") {
            const isPlaying = data.info.playerState === 1 || data.info.playerState === 3;
            isVideoPlayingRef.current = isPlaying;
            if (isPlaying) {
              resetTimer();
            }
          }
        }

        // Vimeo / standard HTML5 postMessage events
        if (data.event === "play" || data.event === "playing") {
          isVideoPlayingRef.current = true;
          resetTimer();
        } else if (data.event === "pause" || data.event === "ended") {
          isVideoPlayingRef.current = false;
        }

        // Also if custom window events dispatched
        if (data.type === "LMS_VIDEO_STATE") {
          isVideoPlayingRef.current = !!data.isPlaying;
          if (data.isPlaying) {
            resetTimer();
          }
        }
      } catch {
        // ignore
      }
    };

    // Periodic check (every 30 seconds): If video is actively playing, keep timer fresh
    const videoHeartbeatInterval = setInterval(() => {
      if (isVideoPlayingRef.current || isAnyVideoPlaying()) {
        resetTimer();
      }
    }, 30000);

    // Start timer initially
    resetTimer();

    // Listen to user interactions across the window
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Listen to HTML5 video events using capture phase so it catches all videos
    window.addEventListener("play", handleVideoPlaying, true);
    window.addEventListener("playing", handleVideoPlaying, true);
    window.addEventListener("pause", handleVideoPaused, true);
    window.addEventListener("ended", handleVideoPaused, true);

    // Listen to iframe postMessage API
    window.addEventListener("message", handleWindowMessage);

    // Custom browser events from components if needed
    const handleCustomVideoEvent = (e: any) => {
      if (e.detail && typeof e.detail.isPlaying === "boolean") {
        isVideoPlayingRef.current = e.detail.isPlaying;
        if (e.detail.isPlaying) {
          resetTimer();
        }
      }
    };
    window.addEventListener("lms-video-playback", handleCustomVideoEvent);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current as any);
      }
      clearInterval(videoHeartbeatInterval);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      window.removeEventListener("play", handleVideoPlaying, true);
      window.removeEventListener("playing", handleVideoPlaying, true);
      window.removeEventListener("pause", handleVideoPaused, true);
      window.removeEventListener("ended", handleVideoPaused, true);
      window.removeEventListener("message", handleWindowMessage);
      window.removeEventListener("lms-video-playback", handleCustomVideoEvent);
    };
  }, [resetTimer]);
}
