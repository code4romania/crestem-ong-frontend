"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { uploadMediaAssetAction } from "@/lib/api/media-library-actions";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_LABEL,
} from "@/components/features/page-builder/upload";

const stripExt = (name: string) => name.replace(/\.[^.]+$/, "");

export function useMediaUpload(onDone: (createdDocumentId?: string) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();

  const open = () => fileInputRef.current?.click();

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const isMedia = file.type.startsWith("image/") || file.type.startsWith("video/");
    const cap = isMedia ? MAX_UPLOAD_BYTES : MAX_DOCUMENT_BYTES;
    const label = isMedia ? MAX_UPLOAD_LABEL : MAX_DOCUMENT_LABEL;
    if (file.size > cap) {
      toast.error(`Fișierul depășește limita de ${label}. Alege un fișier mai mic.`);
      return;
    }

    startUpload(async () => {
      const form = new FormData();
      form.append("file", file);
      form.append("titlu", stripExt(file.name));
      const result = await uploadMediaAssetAction(form);
      if (result.error || !result.asset) {
        toast.error(result.error ?? "Nu am putut încărca fișierul.");
        return;
      }
      toast.success("Fișier adăugat în bibliotecă.");
      onDone(result.asset.documentId);
    });
  };

  return { open, isUploading, fileInputRef, onFileInputChange };
}
