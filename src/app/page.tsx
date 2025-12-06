import GalleryItem from "@/components/GalleryItem";
import { data } from "@/lib/data";

export default function Home() {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 mx-auto p-4">
      {data
        .filter((item) => item.type === "photo")
        .map((item) => (
          <GalleryItem
            key={item.id}
            sourse={item.attributes.image?.large ?? ""}
            width={item.attributes?.width ?? 0}
            height={item.attributes?.height ?? 0}
            aspect_ratio={item.attributes.aspect_ratio}
          />
        ))}
    </div>
  );
}
