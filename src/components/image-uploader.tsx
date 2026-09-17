"use client";

import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
};

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ImageUploader({
  value,
  onChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files?.length || uploading) return;

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      let nextUrls = [...value];

      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(
            `${file.name}: please use JPG, PNG or WebP.`,
          );
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(
            `${file.name}: maximum image size is 10MB.`,
          );
        }

        const safeName = file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "-",
        );

        const blob = await upload(
          `products/${Date.now()}-${safeName}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/admin/upload",
            onUploadProgress: ({ percentage }) => {
              setProgress(Math.round(percentage));
            },
          },
        );

        nextUrls = [...nextUrls, blob.url];
        onChange(nextUrls);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
      setProgress(0);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeImage(url: string) {
    onChange(value.filter((item) => item !== url));
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden border border-line bg-ivory"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                sizes="(min-width: 640px) 160px, 50vw"
                className="object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 bg-black/75 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white"
                aria-label={`Remove image ${index + 1}`}
              >
                Remove
              </button>

              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">
                  Main image
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) =>
          void handleFiles(event.target.files)
        }
        className="sr-only"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex min-h-12 w-full items-center justify-center border border-line px-4 text-xs font-medium uppercase tracking-[0.14em] transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading
          ? `Uploading ${progress}%…`
          : "Upload product photos"}
      </button>

      <p className="text-xs leading-5 text-stone">
        JPG, PNG or WebP. Maximum 10MB per image.
        You can select multiple photos at once. The first
        image will be used as the main product image.
      </p>

      {error && (
        <p className="text-sm text-sale" role="alert">
          {error}
        </p>
      )}

      <input
        type="hidden"
        name="images"
        value={value.join("\n")}
      />
    </div>
  );
}