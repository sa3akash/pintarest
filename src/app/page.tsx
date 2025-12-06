/* eslint-disable @typescript-eslint/no-explicit-any */
import GalleryGrid from "@/components/GalleryGrid";
import { data } from "@/lib/data";

export default function Home() {
  return (
    <div className="min-h-screen">
      <GalleryGrid items={data as any} />
    </div>
  );
}
