import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { initKoiPond } from "./koiPond.js";
import Pond from "./components/Pond.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./views/guest/Home.jsx";
import About from "./views/guest/About.jsx";
import Work from "./views/guest/Work.jsx";
import Contact from "./views/guest/Contact.jsx";
import Resume from "./views/guest/Resume.jsx";
import Admin from "./views/admin/Admin.jsx";
import { PROFILE } from "./data/profile.js";
import { getPortfolio } from "./lib/api.js";

const VIEWS = { home: Home, about: About, work: Work, contact: Contact, resume: Resume, admin: Admin };
const TITLES = {
  home: "Portfolio",
  about: "About",
  work: "Projects",
  contact: "Contact",
  resume: "Resume",
  admin: "Admin",
};

// The URL hash is the single source of truth: #/home, #/about, ...
// so back/forward and deep links work without a router library.
const readHash = () => {
  const id = window.location.hash.replace(/^#\/?/, "");
  return id in VIEWS ? id : "home";
};

export default function App() {
  const appRef = useRef(null);
  const contentRef = useRef(null);
  const firstRender = useRef(true);
  const [view, setView] = useState(readHash);
  const isAdminRoute = view === "admin";
  const needsPortfolio = !isAdminRoute && (view === "about" || view === "work");
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [koiVisible, setKoiVisible] = useState(() => {
    try {
      return localStorage.getItem("koi-visible") !== "false";
    } catch {
      return true;
    }
  });

  // The koi swims over the whole window and follows the pointer.
  useEffect(() => {
    if (isAdminRoute) return undefined;
    return initKoiPond(appRef.current);
  }, [isAdminRoute]);

  useEffect(() => {
    if (!needsPortfolio) {
      setPortfolio(null);
      setPortfolioLoading(false);
      setPortfolioError("");
      return undefined;
    }

    let active = true;
    setPortfolioLoading(true);
    setPortfolioError("");
    getPortfolio()
      .then((data) => {
        if (active) setPortfolio(data);
      })
      .catch((error) => {
        if (active) {
          setPortfolioError(error.message || "Could not load portfolio content.");
        }
      })
      .finally(() => {
        if (active) setPortfolioLoading(false);
      });

    return () => {
      active = false;
    };
  }, [needsPortfolio, reloadToken]);

  useEffect(() => {
    if (isAdminRoute) return;
    appRef.current
      ?.querySelector(".koi-pond")
      ?.style.setProperty("display", koiVisible ? "block" : "none");
    try {
      localStorage.setItem("koi-visible", String(koiVisible));
    } catch {}
  }, [isAdminRoute, koiVisible]);

  useEffect(() => {
    const onHashChange = () => {
      const next = readHash();
      const apply = () => setView(next);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && !reduce) {
        document.startViewTransition(() => flushSync(apply));
      } else {
        apply();
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // After a view change: update the title, reset scroll, move focus to the heading.
  useEffect(() => {
    document.title = `${TITLES[view]} | ${PROFILE.name}`;
    contentRef.current?.scrollTo({ top: 0 });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    contentRef.current
      ?.querySelector("[data-view-title]")
      ?.focus({ preventScroll: true });
  }, [view]);

  const go = useCallback((id) => {
    window.location.hash = `/${id}`;
  }, []);

  const View = VIEWS[view];

  return (
    <div className={`app${isAdminRoute ? " app-admin" : ""}`} ref={appRef}>
      <Pond />
      {!isAdminRoute && (
        <Sidebar
          view={view}
          koiVisible={koiVisible}
          onToggleKoi={() => setKoiVisible((visible) => !visible)}
        />
      )}
      <div className="content" ref={contentRef}>
        <div className="content-inner">
          {!isAdminRoute && <p className="crumb mono">jani.portfolio / 2026</p>}
          <main className="view" key={view}>
            {needsPortfolio ? (
              portfolioLoading || (!portfolio && !portfolioError) ? (
                <section className="glass block" role="status">
                  Loading portfolio content…
                </section>
              ) : portfolioError ? (
                <section className="glass block" role="alert">
                  <h1 className="view-title">Portfolio unavailable</h1>
                  <p className="sub">{portfolioError}</p>
                  <button
                    type="button"
                    className="btn-pill"
                    onClick={() => setReloadToken((token) => token + 1)}
                  >
                    Try again
                  </button>
                </section>
              ) : (
                <View go={go} portfolio={portfolio} />
              )
            ) : (
              <View go={go} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
