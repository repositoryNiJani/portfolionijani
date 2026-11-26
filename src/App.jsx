import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { initKoiPond } from "./koiPond.js";
import Pond from "./components/Pond.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { PROFILE } from "./data/profile.js";
import { getCachedPortfolio, getPortfolio } from "./lib/api.js";
import { supabase } from "./lib/supabase.js";

const Home = lazy(() => import("./views/guest/Home.jsx"));
const About = lazy(() => import("./views/guest/About.jsx"));
const Work = lazy(() => import("./views/guest/Work.jsx"));
const Contact = lazy(() => import("./views/guest/Contact.jsx"));
const Resume = lazy(() => import("./views/guest/Resume.jsx"));
const Admin = lazy(() => import("./views/admin/Admin.jsx"));

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
  const id = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  return id in VIEWS ? id : "home";
};

export default function App() {
  const appRef = useRef(null);
  const contentRef = useRef(null);
  const firstRender = useRef(true);
  const [view, setView] = useState(readHash);
  const [isAdminSignedIn, setIsAdminSignedIn] = useState(false);
  const isAdminRoute = view === "admin";
  const needsPortfolio = !isAdminRoute && (view === "about" || view === "work");
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioView, setPortfolioView] = useState(null);
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

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    let authEventVersion = 0;
    let verificationId = 0;
    const verifyAdminSession = async (session) => {
      const currentVerification = ++verificationId;
      if (!session) {
        setIsAdminSignedIn(false);
        return;
      }

      try {
        const { data: isAdmin, error } = await supabase.rpc("is_admin");
        if (error) throw error;
        if (active && currentVerification === verificationId) {
          setIsAdminSignedIn(isAdmin === true);
        }
      } catch (error) {
        if (active && currentVerification === verificationId) {
          setIsAdminSignedIn(false);
          console.error("Could not verify the current admin session.", error);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventVersion += 1;
      if (!session) {
        void verifyAdminSession(null);
        return;
      }
      window.setTimeout(() => {
        if (active) void verifyAdminSession(session);
      }, 0);
    });
    const initialAuthEventVersion = authEventVersion;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Could not check the current admin session.", error);
          return;
        }
        if (authEventVersion === initialAuthEventVersion) {
          void verifyAdminSession(data.session);
        }
      })
      .catch((error) => {
        if (active && authEventVersion === initialAuthEventVersion) {
          setIsAdminSignedIn(false);
          console.error("Could not check the current admin session.", error);
        }
      });

    return () => {
      active = false;
      verificationId += 1;
      subscription.unsubscribe();
    };
  }, []);

  // The koi swims over the whole window and follows the pointer.
  useEffect(() => {
    if (isAdminRoute) return undefined;
    return initKoiPond(appRef.current);
  }, [isAdminRoute]);

  useEffect(() => {
    if (!needsPortfolio) {
      setPortfolioLoading(false);
      setPortfolioError("");
      return undefined;
    }

    let active = true;
    const cached = getCachedPortfolio(view);
    if (cached) {
      setPortfolio(cached);
      setPortfolioView(view);
      setPortfolioLoading(false);
    } else {
      setPortfolioLoading(true);
    }
    setPortfolioError("");
    getPortfolio(view)
      .then((data) => {
        if (active) {
          setPortfolio(data);
          setPortfolioView(view);
        }
      })
      .catch((error) => {
        if (active) {
          if (cached) {
            console.error("Could not refresh portfolio content.", error);
          } else {
            setPortfolioError(error.message || "Could not load portfolio content.");
          }
        }
      })
      .finally(() => {
        if (active) setPortfolioLoading(false);
      });

    return () => {
      active = false;
    };
  }, [needsPortfolio, reloadToken, view]);

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
          isAdminSignedIn={isAdminSignedIn}
          koiVisible={koiVisible}
          onToggleKoi={() => setKoiVisible((visible) => !visible)}
        />
      )}
      <div className="content" ref={contentRef}>
        <div className="content-inner">
          {!isAdminRoute && <p className="crumb mono">jani.portfolio / 2026</p>}
          <main className="view" key={view}>
            <Suspense
              fallback={
                <section className="glass block" role="status">
                  Loading view…
                </section>
              }
            >
              {needsPortfolio ? (
                portfolioLoading ||
                (!portfolio && !portfolioError) ||
                (portfolio && portfolioView !== view && !portfolioError) ? (
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
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
