export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Solid gradient-friendly verified checkmark badge.
export function Verified({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="m12 1.6 2.6 1.9 3.2-.3 1 3.1 2.7 1.8-1 3.1 1 3.1-2.7 1.8-1 3.1-3.2-.3L12 22.4l-2.6-1.9-3.2.3-1-3.1L2.5 16l1-3.1-1-3.1 2.7-1.8 1-3.1 3.2.3L12 1.6Z" />
      <path d="m8.4 12.2 2.4 2.4 4.8-4.8" fill="none" stroke="#04121f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Plus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...strokeProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Minus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...strokeProps}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Globe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...strokeProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}

export function Share({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...strokeProps}>
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="m8.3 10.8 7.4-4.3M8.3 13.2l7.4 4.3" />
    </svg>
  );
}

export function Clock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...strokeProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function Wallet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...strokeProps}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V9" />
      <path d="M3 7.5V17a2.5 2.5 0 0 0 2.5 2.5h13A2.5 2.5 0 0 0 21 17v-5.5A2.5 2.5 0 0 0 18.5 9H3" />
      <path d="M16.5 14.2h.01" strokeWidth="2.4" />
    </svg>
  );
}
