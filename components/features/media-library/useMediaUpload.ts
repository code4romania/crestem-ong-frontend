"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import {
  uploadMediaAssetAction,
  uploadMediaAssetsBatchAction,
} from "@/lib/api/media-library-actions";
import {
  uploadSizeError,
  MAX_BATCH_FILES,
  MAX_BATCH_BYTES,
  MAX_BATCH_LABEL,
} from "@/components/features/page-builder/upload";
import type { MediaAssetDetail } from "@/lib/api/media-library-types";

const stripExt = (name: string) => name.replace(/\.[^.]+$/, "");

/**
 * Drives the "Încarcă fișier" input. Accepts a multi-select: one file goes
 * through the single-asset action, several through the batch action. `onUploaded`
 * always receives an array (length 1 or more) of the created assets — the caller
 * decides whether to open the single-asset editor or the batch panel.
 */
export function useMediaUpload(
  onUploaded: (assets: MediaAssetDetail[]) => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();

  const open = () => fileInputRef.current?.click();

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    // Drop oversized files up front; tell the user which.
    const valid: File[] = [];
    const rejected: string[] = [];
    for (const file of picked) {
      if (uploadSizeError(file)) rejected.push(file.name);
      else valid.push(file);
    }
    if (rejected.length) {
      toast.error(
        rejected.length === 1
          ? `„${rejected[0]}" depășește limita de dimensiune și a fost ignorat.`
          : `${rejected.length} fișiere depășesc limita de dimensiune și au fost ignorate.`,
      );
    }
    if (valid.length === 0) return;

    if (valid.length > MAX_BATCH_FILES) {
      toast.error(
        `Poți încărca cel mult ${MAX_BATCH_FILES} fișiere odată. Încarcă restul separat.`,
      );
      return;
    }
    const total = valid.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_BATCH_BYTES) {
      toast.error(
        `Lotul depășește ${MAX_BATCH_LABEL}. Încarcă în loturi mai mici.`,
      );
      return;
    }

    startUpload(async () => {
      if (valid.length === 1) {
        const form = new FormData();
        form.append("file", valid[0]);
        form.append("titlu", stripExt(valid[0].name));
        const result = await uploadMediaAssetAction(form);
        if (result.error || !result.asset) {
          toast.error(result.error ?? "Nu am putut încărca fișierul.");
          return;
        }
        toast.success("Fișier adăugat în bibliotecă.");
        onUploaded([result.asset]);
        return;
      }

      const form = new FormData();
      for (const file of valid) form.append("files", file);
      const result = await uploadMediaAssetsBatchAction(form);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.failed.length) {
        toast.error(
          `${result.failed.length} din ${valid.length} fișiere nu au putut fi adăugate.`,
        );
      }
      if (result.assets.length === 0) return;
      toast.success(
        `${result.assets.length} fișiere adăugate în bibliotecă.`,
      );
      onUploaded(result.assets);
    });
  };

  return { open, isUploading, fileInputRef, onFileInputChange };
}
