// Crisp inline SVG icons (no icon-library dependency).
const I = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const IconGrid = (p) => (
  <I {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></I>
);
export const IconRoute = (p) => (
  <I {...p}><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19h7a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7h7" /></I>
);
export const IconTruck = (p) => (
  <I {...p}><path d="M1 8h13v9H1z" /><path d="M14 11h4l3 3v3h-7" /><circle cx="6" cy="19" r="1.8" /><circle cx="17" cy="19" r="1.8" /></I>
);
export const IconUser = (p) => (
  <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></I>
);
