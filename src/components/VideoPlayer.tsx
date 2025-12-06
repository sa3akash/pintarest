"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({ src, poster, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
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
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
             playPromise.then(() => {
                 setIsPlaying(true);
                 handleMouseMove(); // Start hiding controls if autoplay succeeds
             }).catch(err => {
                 console.log("Autoplay blocked", err);
                 setIsPlaying(false);
             })
        }
    }
  }, [autoPlay, handleMouseMove]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setShowControls(true); // Show controls when pausing
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
        videoRef.current.play();
        handleMouseMove(); // Start auto-hide timer when playing
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, handleMouseMove]);

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
    const value = parseFloat(e.target.value);
    if (videoRef.current && duration > 0) {
       const newTime = (value / 100) * duration;
       videoRef.current.currentTime = newTime;
       setProgress(value);
       setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      if (videoRef.current) {
          videoRef.current.volume = newVolume;
          setVolume(newVolume);
          setIsMuted(newVolume === 0);
      }
  }

  const toggleFullscreen = () => {
      if (!playerRef.current) return;
      if (!document.fullscreenElement) {
          playerRef.current.requestFullscreen().catch(err => console.error(err));
      } else {
          document.exitFullscreen();
      }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
      // Cleanup on unmount
      return () => {
          if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      }
  }, []);

  return (
    <div 
        ref={playerRef} 
        className="relative group bg-black rounded-xl overflow-hidden shadow-2xl max-h-[85vh] w-auto aspect-video flex flex-col justify-center"
        onMouseMove={handleMouseMove}
        onClick={(e) => {
            // Click on video toggles play, unless clicking controls
            e.stopPropagation(); 
        }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
        }}
      />

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-full text-white animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking controls
      >
        {/* Progress Bar */}
        <div className="mb-4 relative w-full h-1 bg-white/30 rounded-full cursor-pointer group/progress">
           <div 
             className="absolute top-0 left-0 h-full bg-red-600 rounded-full" 
             style={{ width: `${progress}%` }} 
           />
           <input 
             type="range" 
             min="0" 
             max="100" 
             value={progress} 
             onChange={handleSeek}
             className="absolute top-[-6px] left-0 w-full h-4 opacity-0 cursor-pointer z-10"
           />
        </div>

        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-red-500 transition-colors">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <span className="text-sm font-medium tracking-wider">
               {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
             {/* Volume */}
             <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="hover:text-gray-300">
                    {isMuted || volume === 0 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.5 12a6.5 6.5 0 00-1.904-4.596l-1.06 1.06a5 5 0 010 7.072l1.06 1.06A6.5 6.5 0 0018.5 12zM21.5 12a9.5 9.5 0 00-2.782-6.72l-1.06 1.06a8 8 0 010 11.321l1.06 1.06A9.5 9.5 0 0021.5 12z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.75 7.75a.75.75 0 011.06-.02 5.988 5.988 0 010 8.54.75.75 0 11-1.06-1.06 4.488 4.488 0 000-6.4.75.75 0 01.02-1.06z" />
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
                    className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 h-1 bg-white/30 rounded-lg cursor-pointer" 
                />
             </div>

             {/* Fullscreen */}
             <button onClick={toggleFullscreen} className="hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.25h-3.75a.75.75 0 01-.75-.75zM6 3.75a.75.75 0 00-.75.75v3.75a.75.75 0 001.5 0V5.25h3.75a.75.75 0 00.75-.75 3.75a.75.75 0 00-.75-.75h-4.5zM3.75 15a.75.75 0 01.75.75v3.75h3.75a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75zM15 19.5a.75.75 0 01.75.75v3.75a.75.75 0 01-.75-.75h-3.75a.75.75 0 010-1.5h3.75a.75.75 0 01.75.75zM19.5 15a.75.75 0 00-.75.75v3.75h-3.75a.75.75 0 000 1.5h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 00-.75-.75z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M3.75 15a.75.75 0 01.75.75v3.75h3.75a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-4.5a.75.75 0 01.75-.75zM15 19.5a.75.75 0 01.75-.75h3.75v-3.75a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                     {/* Simplified fullscreen icons for brevity, using standard SVG paths above roughly */}
                    <path d="M3.75 3.75v4.5c0 .414.336.75.75.75s.75-.336.75-.75V4.5h3.75c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-4.5c-.414 0-.75.336-.75.75zm16.5 16.5v-4.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75v3.75h-3.75c-.414 0-.75.336-.75.75s.336.75.75.75h4.5c.414 0 .75-.336.75-.75zm0-16.5h-4.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.75v3.75c0 .414.336.75.75.75s.75-.336.75-.75v-4.5c0-.414-.336-.75-.75-.75zm-16.5 16.5h4.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.75v-3.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75v4.5c0 .414.336.75.75.75z"/>
                </svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
