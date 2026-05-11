import type { SVGProps } from "react";

const base = "w-[14px] h-[14px]";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={base} {...props}>
      <path d="M13.5 21v-7.5h2.55l.38-2.97H13.5V8.64c0-.86.24-1.45 1.48-1.45h1.58V4.53c-.27-.04-1.21-.12-2.3-.12-2.28 0-3.84 1.39-3.84 3.94v2.2H7.86v2.97h2.56V21h3.08z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={base} {...props}>
      <path d="M6.94 5.5a1.94 1.94 0 11-3.88 0 1.94 1.94 0 013.88 0zM3.4 8.7h3.05V20H3.4V8.7zm5.6 0h2.92v1.55h.04c.4-.76 1.4-1.56 2.88-1.56 3.08 0 3.65 2.03 3.65 4.66V20h-3.05v-5.2c0-1.24-.02-2.83-1.72-2.83-1.73 0-2 1.35-2 2.74V20H9V8.7z" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={base} {...props}>
      <path d="M21.6 7.2a2.51 2.51 0 00-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.83.43A2.51 2.51 0 002.4 7.2 26.2 26.2 0 002 12a26.2 26.2 0 00.4 4.8 2.51 2.51 0 001.77 1.77C5.75 19 12 19 12 19s6.25 0 7.83-.43a2.51 2.51 0 001.77-1.77A26.2 26.2 0 0022 12a26.2 26.2 0 00-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  );
}

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={base} {...props}>
      <path d="M19.05 4.91A10 10 0 0012 2C6.48 2 2 6.48 2 12c0 1.76.46 3.49 1.34 5.01L2 22l5.13-1.34A10 10 0 0012 22c5.52 0 10-4.48 10-10 0-2.67-1.04-5.18-2.95-7.09zM12 20.13a8.13 8.13 0 01-4.16-1.14l-.3-.18-3.05.8.81-2.97-.2-.31A8.12 8.12 0 0112 3.87c4.49 0 8.13 3.65 8.13 8.13 0 4.49-3.64 8.13-8.13 8.13zm4.46-6.09c-.24-.12-1.45-.71-1.67-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42l-.47-.01a.9.9 0 00-.66.31c-.22.24-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.12.16 1.73 2.65 4.2 3.71.59.25 1.04.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.45-.59 1.66-1.16.21-.57.21-1.06.14-1.16-.06-.1-.22-.16-.46-.28z" />
    </svg>
  );
}
