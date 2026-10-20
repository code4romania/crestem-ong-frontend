"use client";

import { useState, type ReactNode } from "react";

/**
 * Click-to-load wrapper around a third-party <iframe> (a map, a form, any
 * embedded site).
 *
 * Same contract as the video block's `VideoFacade`: until the visitor clicks,
 * there is no iframe in the DOM, so the page makes no request to the provider
 * and nothing is written to the visitor's device. The button names the
 * provider and warns that it may set cookies, which turns the click into
 * informed consent and keeps the site free of a consent banner.
 *
 * The choice is deliberately not remembered between blocks or page loads:
 * storing it would itself be storage on the visitor's device.
 */
export function FrameFacade({
  src,
  title,
  providerLabel,
  icon,
  className = "h-full w-full",
  allowFullScreen = false,
}: {
  src: string;
  title: string;
  /** Who gets loaded, as the visitor would recognise it ("Google Maps", a hostname). */
  providerLabel: string;
  icon: ReactNode;
  /** Size classes, applied to both the placeholder and the iframe so nothing jumps on click. */
  className?: string;
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
        className={`${className} border-0`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Încarcă ${providerLabel}: ${title}`}
      className={`${className} group flex cursor-pointer flex-col items-center justify-center gap-3 bg-[#f8fafc] px-6 text-center focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#007d58]`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eafaf4] text-[#007d58] transition-transform group-hover:scale-105">
        {icon}
      </span>
      <span className="text-sm font-semibold text-[#1c1c81]">
        Încarcă {providerLabel}
      </span>
      <span className="max-w-xs text-xs leading-relaxed text-[#5b6779]">
        Prin încărcare, {providerLabel} poate seta cookies.
      </span>
    </button>
  );
}
