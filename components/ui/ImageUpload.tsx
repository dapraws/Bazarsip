"use client";

import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    if (window.cloudinary) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  function openWidget() {
    if (!scriptLoaded || !window.cloudinary) return;

    if (widgetRef.current) {
      widgetRef.current.destroy();
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
        maxFiles: multiple ? 10 : 1,
        sources: ["local", "url", "camera"],
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
        maxFileSize: 5_000_000,
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
            onChange([...images, newUrl]);
          } else {
            onChange(newUrl);
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
                src={url}
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
              <span className="text-xs mt-1">Add more</span>
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
              {multiple ? "Upload images" : "Upload image"}
            </p>
            <p className="mt-1 text-xs">
              {multiple
                ? "Click to browse or drag & drop multiple files"
                : "Click to browse or drag & drop"}
            </p>
            <p className="mt-1 text-xs">JPG, PNG, WebP up to 5MB</p>
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
