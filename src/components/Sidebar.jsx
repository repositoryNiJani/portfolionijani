import { useCallback, useRef, useState } from "react";
import { FileText, Fish, Folder, Home, Mail, Moon, Sun, UserRound } from "lucide-react";
import { PROFILE } from "../data/profile.js";
import useTheme from "../lib/useTheme.js";
import LoginModal from "./LoginModal.jsx";

const NAV = [
  { id: "home", label: "Home", Icon: Home },
  { id: "about", label: "About", Icon: UserRound },
  { id: "work", label: "Work", Icon: Folder },
  { id: "contact", label: "Contact", Icon: Mail },
  { id: "resume", label: "Resume", Icon: FileText },
];

// Docked to the left edge, full height. Becomes a bottom tab bar on phones.
export default function Sidebar({ view, koiVisible, onToggleKoi }) {
  const { theme, toggleTheme } = useTheme();
  const [loginOpen, setLoginOpen] = useState(false);
  const profileClicks = useRef(0);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <>
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
          <button
            className="profile profile-trigger"
            type="button"
            aria-label="Open admin login (click 10 times)"
            title="Click 10 times to open admin login"
            onClick={() => {
              profileClicks.current += 1;
              if (profileClicks.current >= 1) {
                profileClicks.current = 0;
                setLoginOpen(true);
              }
            }}
          >
            <img src="/jani.png" alt="" width="40" height="40" />
            <span className="profile-copy">
              <strong>{PROFILE.shortName}</strong>
              <span className="status">
                <i aria-hidden="true" />
                {PROFILE.status}
              </span>
            </span>
          </button>
        </div>
      </nav>
      {loginOpen && (
        <LoginModal
          onClose={closeLogin}
          onAuthenticated={() => {
            closeLogin();
            window.location.hash = "/admin";
          }}
        />
      )}
    </>
  );
}
