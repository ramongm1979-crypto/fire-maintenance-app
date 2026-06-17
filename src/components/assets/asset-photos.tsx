"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addAssetPhotos, removeAssetPhoto } from "@/app/instalaciones/[id]/equipos/[assetId]/actions";

export function AssetPhotos({
  buildingId,
  assetId,
  photos,
}: {
  buildingId: string;
  assetId: string;
  photos: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => formData.append("photos", file));
    startTransition(async () => {
      await addAssetPhotos(buildingId, assetId, formData);
      router.refresh();
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleRemove(url: string) {
    startTransition(async () => {
      await removeAssetPhoto(buildingId, assetId, url);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((url) => (
          <div key={url} className="group relative size-20 shrink-0 overflow-hidden rounded-lg border">
            <button type="button" onClick={() => setLightbox(url)} className="block size-full">
              <Image src={url} alt="Foto del equipo" fill sizes="80px" className="object-cover" />
            </button>
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute right-0.5 top-0.5 hidden size-5 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
          className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <Camera className="size-5" />
          <span className="text-xs">{pending ? "..." : "Añadir"}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="relative h-full max-h-[80vh] w-full max-w-3xl">
            <Image src={lightbox} alt="Foto del equipo" fill className="object-contain" />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-6 top-6"
            onClick={() => setLightbox(null)}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
