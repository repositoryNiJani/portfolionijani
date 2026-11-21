// Small stroke icons (1.6px), all inheriting currentColor.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </svg>
);
export const UserIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
);
export const FolderIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  </svg>
);
export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="M4 7.5l8 6 8-6" />
  </svg>
);
export const FileIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3.75h8l4 4v12.5H6zM14 3.75v4h4M9 12.5h6M9 16h6" />
  </svg>
);
export const ArrowIcon = (p) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ArrowUpRightIcon = (p) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);
export const DownloadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />
  </svg>
);
export const SunIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2.5 12H5M19 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
  </svg>
);
export const MoonIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
  </svg>
);

// Brand mark from /public/sprites.svg
export const Sprite = ({ id, className }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <use href={`/sprites.svg#${id}`} />
  </svg>
);

// Big folder used in the Work explorer
export const BigFolder = ({ active }) => (
  <svg viewBox="0 0 96 80" aria-hidden="true" className="folder-svg">
    <path
      d="M6 14a6 6 0 0 1 6-6h24l8 9h40a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z"
      fill="#12304a"
    />
    <rect x="16" y="22" width="64" height="38" rx="4" fill="#eaf2ff" />
    <path
      d="M6 32a6 6 0 0 1 6-6h72a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z"
      fill={active ? "var(--highlight)" : "var(--accent)"}
      opacity={active ? 1 : 0.82}
    />
  </svg>
);
