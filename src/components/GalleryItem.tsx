import Image from "next/image";
import React from "react";

interface Props {
  sourse: string;
  width: number;
  height: number;
  aspect_ratio: number;
  color: string;
}

const GalleryItem = ({ sourse, width, height, color }: Props) => {
  return (
    <div className="break-inside-avoid mb-4 relative group rounded-xl overflow-hidden">
      <div 
        style={{ backgroundColor: color }}
        className="w-full h-full absolute top-0 left-0 -z-10"
      />
      <Image
        src={sourse}
        alt="gallery image"
        width={width}
        height={height}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={false}
        className="object-cover w-full h-auto"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-zoom-in">
        <div className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-end">
                <button className="bg-red-600 text-white font-bold py-3 px-5 rounded-full hover:bg-red-700 transition  text-base">
                    Save
                </button>
            </div>
            <div className="flex justify-end gap-2">
                 <button className="bg-white/80 hover:bg-white text-black p-2 rounded-full transition backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.345 1.093m0-1.093c.324.18.696.287 1.093.345m-1.093-.345a2.25 2.25 0 011.093-.345m-1.093.345c-.324-.18-.287-.696-.345-1.093m0 1.093a2.25 2.25 0 110-2.186m0 2.186c.18.324 1.093.345 1.093.345" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5" />
                    </svg>
                 </button>
                <button className="bg-white/80 hover:bg-white text-black p-2 rounded-full transition backdrop-blur-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryItem;
