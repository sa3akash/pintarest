import Image from "next/image";
import React from "react";

interface Props {
    sourse: string;
    width: number;
    height: number;
    aspect_ratio: number;
}

const GalleryItem = ({ height,sourse,width, aspect_ratio }: Props) => {
  return (
    <div className="break-inside-avoid mb-4">
      <Image
        src={sourse}
        alt="gallery image"
        width={width}
        height={height}
        className="object-cover w-full h-auto "
      />
      <div>
        <span>image {aspect_ratio}</span>
      </div>
    </div>
  );
};

export default GalleryItem;
