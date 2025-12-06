import GalleryGrid from "@/components/GalleryGrid";
import { data } from "@/lib/data";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <GalleryGrid items={data as any} />
    </div>
  );
}
