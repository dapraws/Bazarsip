"use client";

import { useEffect, useRef, useState } from "react";
import { sizedImage } from "@/lib/image";

type CloudinaryFolder =
  | "bazarsip/products"
  | "bazarsip/categories"
  | "bazarsip/users";

interface ImageUploadProps {
  folder: CloudinaryFolder;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  hint?: string;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function ImageUpload({
  folder,
  value,
  onChange,
  multiple = false,
  label,
  hint,
}: ImageUploadProps) {
  const widgetRef = useRef<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const images: string[] = multiple
    ? Array.isArray(value)
      ? (value as string[])
      : value
        ? [value as string]
        : []
    : value
      ? [value as string]
      : [];

  // The widget is built once and kept, so its callback would otherwise close
  // over whatever the props were at that moment. Picking ten photos fires ten
  // success events; reading a captured array each time meant nine of them
  // were overwritten and only the last survived.
  const imagesRef = useRef(images);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Resync only once the parent has caught up, so a render in the middle of
  // a batch cannot roll the accumulator back.
  if (images.length >= imagesRef.current.length) {
    imagesRef.current = images;
  }

  useEffect(() => {
    if (window.cloudinary) {
      setScriptLoaded(true);
      return;
    }

    // The product form renders two uploaders. Without this check the second
    // one starts a duplicate download of the same 300KB bundle, because the
    // first has not finished defining window.cloudinary yet.
    const SRC = "https://upload-widget.cloudinary.com/global/all.js";
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SRC}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  // The widget now outlives a single open, so it has to be cleaned up when
  // the form goes away, otherwise its iframe stays behind.
  useEffect(() => {
    return () => {
      widgetRef.current?.destroy?.();
      widgetRef.current = null;
    };
  }, []);

  function openWidget() {
    if (!scriptLoaded || !window.cloudinary) return;

    // Reuse it. Destroying and rebuilding on every open tears down and
    // recreates the widget's iframe, which is what made adding photos feel
    // slow on a phone.
    if (widgetRef.current) {
      widgetRef.current.open();
      return;
    }

    async function generateSignature(
      callback: (sig: string) => void,
      paramsToSign: Record<string, any>,
    ) {
      try {
        const res = await fetch("/api/cloudinary/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paramsToSign }),
        });
        const data = await res.json();
        callback(data.signature);
      } catch (err) {
        console.error("Signature fetch failed:", err);
      }
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        uploadSignature: generateSignature,
        folder,
        multiple,
        // Catalogue photos are picked in bulk straight from the phone gallery.
        maxFiles: multiple ? 30 : 1,
        sources: ["local", "url", "camera"],
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],

        // Scale down in the browser before anything is sent. A phone camera
        // produces roughly 4000px and several megabytes; the largest place
        // any of this is shown is a product page, so the rest of those pixels
        // are paid for on the seller's mobile data and then thrown away.
        maxImageWidth: 1600,
        maxImageFileSize: 2_000_000,

        // Generous on purpose. The resize above is what keeps uploads small;
        // this limit only exists to reject something absurd. At 5MB it was
        // refusing ordinary phone photos outright instead of shrinking them.
        maxFileSize: 25_000_000,
        cropping: false,
        showAdvancedOptions: false,
        showCompletedButton: true,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#E5E7EB",
            tabIcon: "#2563EB",
            menuIcons: "#6B7280",
            textDark: "#111827",
            textLight: "#FFFFFF",
            link: "#2563EB",
            action: "#2563EB",
            inactiveTabIcon: "#9CA3AF",
            error: "#EF4444",
            inProgress: "#2563EB",
            complete: "#10B981",
            sourceBg: "#F9FAFB",
          },
        },
      },
      (error: any, result: any) => {
        if (error) {
          console.error("Upload widget error:", error);
          return;
        }

        if (result.event === "success") {
          const newUrl: string = result.info.secure_url;

          if (multiple) {
            // Advance the ref here rather than waiting for the next render.
            // Selecting five photos fires five events in the same tick, so
            // React has not re-rendered between them; reading the rendered
            // value each time would rebuild the list from the same starting
            // point and keep only the last upload.
            const next = [...imagesRef.current, newUrl];
            imagesRef.current = next;
            onChangeRef.current(next);
          } else {
            onChangeRef.current(newUrl);
          }
        }
      },
    );

    widgetRef.current.open();
  }

  function removeImage(index: number) {
    if (multiple) {
      onChange(images.filter((_, i) => i !== index));
    } else {
      onChange("");
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div
          className={`grid gap-3 ${
            multiple
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              : "grid-cols-1 max-w-xs"
          }`}
        >
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square"
            >
              <img
                src={sizedImage(url, 300)}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {multiple && index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Main
                </div>
              )}
            </div>
          ))}

          {multiple && (
            <button
              type="button"
              onClick={openWidget}
              disabled={!scriptLoaded}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs mt-1">Tambah foto</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state drop zone */}
      {images.length === 0 && (
        <button
          type="button"
          onClick={openWidget}
          disabled={!scriptLoaded}
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-8 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-3 text-sm font-medium">
              {multiple ? "Unggah foto" : "Unggah foto"}
            </p>
            <p className="mt-1 text-xs">
              {multiple
                ? "Ketuk untuk pilih banyak foto dari galeri"
                : "Ketuk untuk pilih foto"}
            </p>
            <p className="mt-1 text-xs">JPG, PNG, atau WebP. Maksimal 5MB.</p>
          </div>
        </button>
      )}

      {/* Replace button for single image */}
      {!multiple && images.length > 0 && (
        <button
          type="button"
          onClick={openWidget}
          disabled={!scriptLoaded}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Replace image
        </button>
      )}

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
