"use client";

import { useState, type ReactNode } from "react";

/**
 * Click-to-load wrapper around a third-party <iframe> (a map, an arbitrary
 * embed) — the same gate as `VideoFacade`, for frames that have no poster.
 *
 * Until the visitor presses the button there is no iframe in the DOM at all,
 * so the page makes no request to the third party and nothing is written to
 * the visitor's device. `notice` names who gets loaded and that they may set
 * cookies, which is what turns the click into informed consent and keeps the
 * site free of a consent banner.
 *
 * Deliberately stateless beyond `activated`: the choice is not remembered
 * between blocks or page loads, because storing it would itself be storage on
 * the visitor's device — the thing the gate exists to avoid.
 */
export function ThirdPartyFrame({
  src,
  title,
  actionLabel,
  notice,
  icon,
  allowFullScreen = false,
}: {
  src: string;
  title: string;
  actionLabel: string;
  notice: string;
  icon: ReactNode;
  allowFullScreen?: boolean;
}) {
  const [activated, setActivated] = useState(false);

  if (activated) {
    return (
      <iframe
        src={src}
        title={title}
        allowFullScreen={allowFullScreen}
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`${actionLabel}: ${title}`}
      className="group flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 bg-[#f8fafc] px-6 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#007d58]"
    >
      <span
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eafaf4] text-[#007d58] transition-transform group-hover:scale-105"
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-[#1c1c81] group-hover:underline">
        {actionLabel}
      </span>
      <span className="max-w-md text-xs leading-relaxed text-[#5b6779]">
        {notice}
      </span>
    </button>
  );
}
