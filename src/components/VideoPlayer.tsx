"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hover state
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls logic
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      // We don't need to manually set isPlaying here if we use onPlay/onPause events
      videoRef.current.play().catch((err) => {
        console.log("Autoplay blocked", err);
      });
    }
  }, [autoPlay]); // Removed handleMouseMove dependency as it's not needed for initial autoplay trigger

  // Sync state with video events - THE FIX
  const onPlay = () => {
    setIsPlaying(true);
    handleMouseMove();
  };

  const onPause = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
      // State updates are handled by onPlay/onPause
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // prevent closing controls
    const value = parseFloat(e.target.value);
    if (videoRef.current && duration > 0) {
      const newTime = (value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(value);
      setCurrentTime(newTime);
    }
  };

  // Improved Progress Bar Click/Hover Logic
  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    setHoverPosition(clampedPos * 100);
    setHoverTime(clampedPos * duration);
  };

  const handleProgressBarMouseLeave = () => {
    setHoverTime(null);
    setHoverPosition(null);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(pos * 100);
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      setIsMuted(!isMuted);
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      videoRef.current.muted = newVolume === 0;
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch((err) => console.error(err));
      // State update handled by event listener usually, but optimistic update is fine too if we add listener
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={playerRef}
      className="relative group bg-black rounded-xl overflow-hidden shadow-2xl max-h-[85vh] w-auto flex flex-col justify-center"
      // aspect-video
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        e.stopPropagation();
        // Toggle play on container click only if controls aren't main target,
        // but we have a dedicated overlay for play/pause usually.
        // Just keeping it simple: container click toggles play generally works well.
        togglePlay();
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          // handled by onPause but explicit ended check usually good
        }}
      />

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-full text-white animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-10 md:size-16"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 md:p-8 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Container - Interaction Layer */}
        <div
          ref={progressBarRef}
          className="mb-4 relative w-full h-4 flex items-center cursor-pointer group/progress"
          onMouseMove={handleProgressBarMouseMove}
          onMouseLeave={handleProgressBarMouseLeave}
          onClick={handleProgressBarClick}
        >
          {/* Visual Timeline Track */}
          <div className="absolute left-0 right-0 h-1.5 bg-white/30 rounded-full overflow-hidden">
            {/* Buffer/Background Bar */}
            <div className="absolute inset-0 bg-white/20 w-full" />

            {/* Hover Indicator (Lighter Bar) */}
            {hoverPosition !== null && (
              <div
                className="absolute top-0 h-full bg-white/50 pointer-events-none"
                style={{ left: 0, width: `${hoverPosition}%` }}
              />
            )}

            {/* Play Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Draggable Handle (Visible on hover) */}
          <div
            className="absolute h-3 w-3 bg-red-600 rounded-full scale-0 group-hover/progress:scale-100 transition-transform z-10 pointer-events-none"
            style={{
              left: `${progress}%`,
              transform: `translate(-50%, 0) scale(${showControls ? 1 : 0})`,
            }} /* Simplify transform logic in JS or keep CSS hover */
          />
          {/* Re-implementing handle purely with CSS hover on group + absolute positioning logic is tricky for exact centering without left%. 
               Actually, the previous handle was inside the width-controlled div. 
               Let's keep it clean: A separate handle div absolutely positioned by % is standard.
           */}
          <div
            className="absolute h-3.5 w-3.5 bg-red-600 rounded-full shadow scale-0 group-hover/progress:scale-100 transition-transform z-10"
            style={{
              left: `${progress}%`,
              transform: "translateX(-50%) scale(1)",
            }}
          ></div>

          {/* Timeline Hover Tooltip */}
          {hoverPosition !== null && hoverTime !== null && (
            <div
              className="absolute bottom-full mb-2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-20"
              style={{
                left: `clamp(20px, ${hoverPosition}%, calc(100% - 20px))`,
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Hidden Range Input for Accessibility/Native Drag Behavior */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.01"
            value={progress}
            onChange={handleSeek}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="hover:text-red-500 transition-colors focus:outline-none"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <span className="text-sm min-w-20 font-medium tracking-wider select-none flex items-center justify-center">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-gray-300">
                {isMuted || volume === 0 ? (
                  // Muted Icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.75 7.75a.75.75 0 011.06-.02 5.988 5.988 0 010 8.54.75.75 0 11-1.06-1.06 4.488 4.488 0 000-6.4.75.75 0 01.02-1.06z" />
                    <path d="M20.735 9.14a.75.75 0 10-1.173-.915l-1.892 2.427-1.892-2.427a.75.75 0 00-1.173.915l1.892 2.427-1.892 2.427a.75.75 0 001.173.915l1.892-2.427 1.892 2.427a.75.75 0 001.173-.915l-1.892-2.427 1.892-2.427z" />
                    {/* Fallback to simple strike-through if needed, but the path above is a specific "X" or similar. 
                        Let's use a standard muted slash icon for clarity similar to Heroicons `speaker-x-mark` */}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 9.75L21.75 12M17.25 12L21.75 9.75"
                      opacity="0"
                    />{" "}
                    {/* Hidden reference */}
                  </svg>
                ) : volume < 0.5 ? (
                  // Low Volume (Half)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.75 7.75a.75.75 0 011.06-.02 5.988 5.988 0 010 8.54.75.75 0 11-1.06-1.06 4.488 4.488 0 000-6.4.75.75 0 01.02-1.06z" />
                  </svg>
                ) : (
                  // Full Volume
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a6.5 6.5 0 00-1.904-4.596l-1.06 1.06a5 5 0 010 7.072l1.06 1.06A6.5 6.5 0 0018.5 12zM21.5 12a9.5 9.5 0 00-2.782-6.72l-1.06 1.06a8 8 0 010 11.321l1.06 1.06A9.5 9.5 0 0021.5 12z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 h-1 bg-white/30 rounded-lg cursor-pointer accent-white"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-gray-300">
              {isFullscreen ? (
                // Exit Fullscreen Icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.75 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V5.25h-3v3a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-4.5zM3.75 16.5a.75.75 0 01.75.75v3h3a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75zm16.5-12a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-3a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75h4.5zM16.5 15a.75.75 0 01.75.75v3a.75.75 0 011.5 0v-4.5a.75.75 0 01-.75-.75h-4.5a.75.75 0 01-.75.75v3a.75.75 0 011.5 0v-3z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                // Enter Fullscreen Icon (Original)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.25h-3.75a.75.75 0 01-.75-.75zM6 3.75a.75.75 0 00-.75.75v3.75a.75.75 0 001.5 0V5.25h3.75a.75.75 0 00.75-.75 3.75a.75.75 0 00-.75-.75h-4.5zM3.75 15a.75.75 0 01.75.75v3.75h3.75a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75zM15 19.5a.75.75 0 01.75.75v3.75a.75.75 0 01-.75-.75h-3.75a.75.75 0 010-1.5h3.75a.75.75 0 01.75.75zM19.5 15a.75.75 0 00-.75.75v3.75h-3.75a.75.75 0 000 1.5h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
