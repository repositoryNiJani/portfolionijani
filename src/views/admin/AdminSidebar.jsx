import { ArrowLeft, LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";
import { PROFILE } from "../../data/profile.js";
import useTheme from "../../lib/useTheme.js";

export default function AdminSidebar({
  sections,
  activeSection,
  sectionCounts,
  busy,
  onSelect,
  onSignOut,
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="admin-sidebar">
      <a className="admin-brand" href="#/admin" aria-label="Admin dashboard">
        <img src="/logo.webp" alt="" width="34" height="34" />
        <span>
          <strong>JANI</strong>
          <small>Admin console</small>
        </span>
      </a>

      <p className="admin-nav-title">MANAGEMENT</p>
      <nav className="admin-nav" aria-label="Database sections">
        <button
          type="button"
          className={activeSection === "overview" ? "active" : ""}
          onClick={() => onSelect("overview")}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        {sections.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={activeSection === id ? "active" : ""}
            onClick={() => onSelect(id)}
          >
            <Icon size={18} />
            {label}
            <span>{sectionCounts[id]}</span>
          </button>
        ))}
      </nav>

      <footer className="admin-sidebar-footer">
        <a href="#/home" aria-label="View portfolio">
          <ArrowLeft size={17} />
          <span>View portfolio</span>
        </a>
        <button
          type="button"
          onClick={onSignOut}
          disabled={busy}
          aria-label="Sign out"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
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
        <div className="profile admin-profile">
          <img src="/jani.webp" alt="" width="40" height="40" />
          <span className="profile-copy">
            <strong>{PROFILE.shortName}</strong>
            <span className="status">
              <i aria-hidden="true" />
              {PROFILE.status}
            </span>
          </span>
        </div>
      </footer>
    </aside>
  );
}
