import { useEffect, useState } from "react";
import { FileText, Fish, Folder, Home, Mail, Moon, Sun, UserRound } from "lucide-react";
import { PROFILE } from "../data/profile.js";

const NAV = [
  { id: "home", label: "Home", Icon: Home },
  { id: "about", label: "About", Icon: UserRound },
  { id: "work", label: "Work", Icon: Folder },
  { id: "contact", label: "Contact", Icon: Mail },
  { id: "resume", label: "Resume", Icon: FileText },
];

function getInitialTheme() {
  if (typeof document !== "undefined") {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") return current;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
}

// Docked to the left edge, full height. Becomes a bottom tab bar on phones.
export default function Sidebar({ view, koiVisible, onToggleKoi }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1020" : "#f4f8fc");
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <nav className="side" aria-label="Main">
      <a className="brand" href="#/home" aria-label={`${PROFILE.name}, home`}>
        <img src="/logo.png" alt="" width="34" height="34" />
        <span>{PROFILE.brand}</span>
      </a>

      <ul className="side-list">
        {NAV.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              className="side-link"
              href={`#/${id}`}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon width="22" height="22" />
              <span>{label}</span>
            </a>
          </li>
        ))}
        <li className="mobile-only">
          <button
            type="button"
            className="side-link"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </li>
      </ul>

      <div className="side-footer">
        <div className="theme-row">
          <span className="theme-row-label">
            {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            Dark mode
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Dark mode"
            className="theme-switch"
            onClick={toggleTheme}
          >
            <span className="theme-switch-thumb" aria-hidden="true" />
          </button>
        </div>
        <div className="theme-row">
          <span className="theme-row-label">
            <Fish size={16} />
            Show koi
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={koiVisible}
            aria-label="Show koi"
            className="theme-switch"
            onClick={onToggleKoi}
          >
            <span className="theme-switch-thumb" aria-hidden="true" />
          </button>
        </div>
        <div className="profile">
          <img src="/jani.png" alt="" width="40" height="40" />
          <div>
            <strong>{PROFILE.shortName}</strong>
            <span className="status">
              <i aria-hidden="true" />
              {PROFILE.status}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
