"use client";

import React, { useState, useEffect, useCallback } from "react";
import GalleryItem from "./GalleryItem";
import GalleryItemVideo from "./GalleryItemVideo";
import VideoPlayer from "./VideoPlayer";
import Image from "next/image";

interface ImageAttributes {
  id: number;
  slug: string;
  description: string;
  width: number;
  height: number;
  status: string;
  created_at: string;
  updated_at: string;
  title: string;
  aspect_ratio: number;
  liked: boolean;
  image: {
    small: string;
    medium: string;
    large: string;
    download: string;
    download_link: string;
  };
  alt: string;
  colors: string[];
}

interface VideoAttributes extends ImageAttributes {
  video: {
    preview_src: string;
    video_files: { link: string; width: number; height: number }[];
    thumbnail: { medium: string; large: string };
  };
}

type GalleryItemType =
  | { type: "photo"; id: string; attributes: ImageAttributes }
  | { type: "video"; id: string; attributes: VideoAttributes };

interface GalleryGridProps {
  items: GalleryItemType[];
}

export default function GalleryGrid({ items }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % items.length
    );
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null
        ? null
        : (prev - 1 + items.length) % items.length
    );
  }, [items.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev, handleClose]);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 mx-auto p-4">
        {items.map((item, index) => {
          if (item.type === "video") {
            const videoAttr = item.attributes as VideoAttributes;
            return (
              <GalleryItemVideo
                key={item.id}
                sourse={videoAttr.video.preview_src}
                thumbnail={videoAttr.video.thumbnail.medium}
                width={item.attributes.width}
                height={item.attributes.height}
                aspect_ratio={item.attributes.aspect_ratio}
                color={item.attributes.colors?.[0] ?? "#f0f0f0"}
                onClick={() => setSelectedIndex(index)}
              />
            );
          }
          return (
            <GalleryItem
              key={item.id}
              sourse={item.attributes.image?.medium ?? ""}
              width={item.attributes?.width ?? 0}
              height={item.attributes?.height ?? 0}
              aspect_ratio={item.attributes.aspect_ratio}
              color={item.attributes.colors?.[0] ?? "#f0f0f0"}
              onClick={() => setSelectedIndex(index)}
            />
          );
        })}
      </div>

      {/* Lightbox Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation - Left */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 text-white/70 hover:text-white p-2 z-50 hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* Main Content Container */}
          <div
            className="relative w-full h-full p-4 md:p-10 flex items-center justify-center"
            onClick={handleClose}
          >
            <div
              className="relative max-w-7xl max-h-full w-auto h-auto flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === "video" ? (
                <VideoPlayer
                  src={(selectedItem.attributes as VideoAttributes).video.video_files[0].link}
                  autoPlay={true}
                />
              ) : (
                <Image
                  src={selectedItem.attributes.image?.large ?? ""}
                  alt={selectedItem.attributes.alt ?? "Gallery Image"}
                  width={selectedItem.attributes.width}
                  height={selectedItem.attributes.height}
                  className="object-contain max-h-[85vh] w-auto h-auto rounded-md shadow-2xl"
                  priority
                />
              )}

              {/* ID / Title Info (Optional) */}
              <div className="mt-4 text-white font-medium text-center">
                <p>{selectedItem.attributes.title || "Untitled"}</p>
              </div>
            </div>
          </div>

          {/* Navigation - Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 text-white/70 hover:text-white p-2 z-50 hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
