"use client";

import React, { useRef } from "react";
import Image from "next/image";

interface Props {
  sourse: string; // This will be the video file link for preview/hover
  thumbnail: string; // The static image
  width: number;
  height: number;
  aspect_ratio: number;
  color: string;
  onClick?: () => void;
}

const GalleryItemVideo = ({ sourse, thumbnail, width, height, color, onClick }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        // Autoplay play policy might block this without interaction
        console.log("Video play failed", error);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to start
    }
  };

  return (
    <div 
      onClick={onClick}
      className="break-inside-avoid mb-4 relative group rounded-xl overflow-hidden cursor-zoom-in"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        style={{ backgroundColor: color }}
        className="w-full h-full absolute top-0 left-0 -z-10"
      />
      
      {/* Thumbnail Image (Visible when video is not playing) */}
      <Image
        src={thumbnail}
        alt="gallery video thumbnail"
        width={width}
        height={height}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={false}
        className="object-cover w-full h-auto group-hover:opacity-0 transition-opacity duration-300"
      />

      {/* Video Element (Autoplays on hover) */}
       <video
        ref={videoRef}
        src={sourse}
        width={width}
        height={height}
        loop
        muted
        playsInline
        className="object-cover w-full h-full absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      {/* Video Indicator Icon (Top Right) */}
      <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full backdrop-blur-sm z-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
          <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
        </svg>
      </div>

       {/* Overlay (Similar to Photo) */}
       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-end">
                {/* Save button could go here */}
            </div>
            {/* Can add share buttons here if needed, consistent with photos */}
        </div>
      </div>
    </div>
  );
};

export default GalleryItemVideo;
