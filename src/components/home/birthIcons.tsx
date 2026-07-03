/* Inline icon set for the Birth Details modal — ported verbatim from
   design-reference/birth-modal/birth-modal.jsx. Decorative; they inherit
   `currentColor` and sit next to real text/labels. */
import type { ReactElement } from "react";

export const icons: Record<string, ReactElement> = {
  search: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="8" cy="8" r="5.2" />
      <path d="M12 12l3.5 3.5" />
    </svg>
  ),
  pin: (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.6c-2.7 0-4.8 2.1-4.8 4.8 0 3.4 4.8 7.9 4.8 7.9s4.8-4.5 4.8-7.9c0-2.7-2.1-4.8-4.8-4.8z" />
      <circle cx="8" cy="6.4" r="1.8" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7.5l3 3 6-7" />
    </svg>
  ),
  alert: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="7" cy="7" r="5.7" />
      <path d="M7 4.3v3.3M7 9.6v.01" />
    </svg>
  ),
  lock: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3" y="6.2" width="8" height="5.4" rx="1.4" />
      <path d="M4.7 6.2V4.8a2.3 2.3 0 0 1 4.6 0v1.4" />
    </svg>
  ),
  info: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7" cy="7" r="5.7" />
      <path d="M7 6.6v3.1M7 4.5v.01" />
    </svg>
  ),
  back: (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4 7l4 4" />
    </svg>
  ),
  x: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  ),
};
