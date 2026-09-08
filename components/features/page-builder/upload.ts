"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  uploadPageImageAction,
  type UploadedPageImage,
} from "@/lib/api/page-blocks-actions";

/**
 * Client-side upload ceiling for page-block images/video. Kept below the Server
 * Action `bodySizeLimit` in `next.config.ts` so multipart boundary/header
 * overhead never pushes a passing file over the server cap.
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "5 MB";

/**
 * Higher ceiling for the Documents block — reports (PDF/DOCX/XLSX) routinely run
 * larger than a page image. `bodySizeLimit` in `next.config.ts` is set above
 * this for multipart overhead; Strapi/S3 accept far more still.
 */
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
export const MAX_DOCUMENT_LABEL = "25 MB";

/**
 * Shared image-upload logic for the page-builder editors (`image`,
 * `image-caption`, `hero-large-split`). Guards the file size before hitting the
 * Server Action — otherwise Next throws "Body exceeded N MB limit" at the
 * framework boundary, which `startUpload` can't catch — and surfaces every
 * failure as both a toast and inline `error` text.
 */
export function usePageImageUpload(
  onUploaded: (image: UploadedPageImage) => void,
) {
  const [isUploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A slow upload resolves after the caller may have re-rendered with a new
  // `onUploaded` (a fresh closure over its own props/state); commit through the
  // latest one so the result is never applied to a stale snapshot.
  const latestOnUploaded = useRef(onUploaded);
  useEffect(() => {
    latestOnUploaded.current = onUploaded;
  });

  const fail = (message: string) => {
    setError(message);
    toast.error(message);
  };

  const upload = (file: File) => {
    setError(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      fail(
        `Imaginea depășește limita de ${MAX_UPLOAD_LABEL}. Alege un fișier mai mic.`,
      );
      return;
    }
    startUpload(async () => {
      const form = new FormData();
      form.append("files", file);
      try {
        const result = await uploadPageImageAction(form);
        if (result.error || !result.image) {
          fail(result.error ?? "Nu am putut încărca imaginea.");
          return;
        }
        latestOnUploaded.current(result.image);
      } catch {
        fail("Nu am putut încărca imaginea.");
      }
    });
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) upload(file);
  };

  return { upload, onFileInputChange, isUploading, error, fileInputRef };
}
