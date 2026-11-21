import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { initKoiPond } from "./koiPond.js";
import Pond from "./components/Pond.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./views/Home.jsx";
import About from "./views/About.jsx";
import Work from "./views/Work.jsx";
import Contact from "./views/Contact.jsx";
import Resume from "./views/Resume.jsx";
import { PROFILE } from "./data/profile.js";

const VIEWS = { home: Home, about: About, work: Work, contact: Contact, resume: Resume };
const TITLES = {
  home: "Portfolio",
  about: "About",
  work: "Projects",
  contact: "Contact",
  resume: "Resume",
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

  // The koi swims over the whole window and follows the pointer.
  useEffect(() => initKoiPond(appRef.current), []);

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
    <div className="app" ref={appRef}>
      <Pond />
      <Sidebar view={view} />
      <div className="content" ref={contentRef}>
        <div className="content-inner">
          <p className="crumb mono">jani.portfolio / 2026</p>
          <main className="view" key={view}>
            <View go={go} />
          </main>
        </div>
      </div>
    </div>
  );
}
