// Brand and project artwork that is not provided by Lucide.

export const Sprite = ({ id, className }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <use href={`/sprites.svg#${id}`} />
  </svg>
);

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
