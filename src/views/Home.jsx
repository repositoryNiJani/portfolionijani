import { ArrowRight } from "lucide-react";
import { PROFILE } from "../data/profile.js";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Home is the pond: almost no cards, so the koi stays visible.
export default function Home() {
  return (
    <section className="home" aria-labelledby="home-title">
      <div className="home-top">
        <div className="date-card mono" aria-label="Current date">
          <span className="date-card-location">
            {PROFILE.location.toUpperCase()}
          </span>
          <span className="date-card-value">{today}</span>
        </div>
      </div>

      <div className="home-hero">
        <p className="label mono">{PROFILE.eyebrow}</p>
        <h1 id="home-title" data-view-title tabIndex={-1}>
          MY
          <br />
          PERSONAL
          <br />
          <span className="outline">PORTFOLIO</span>
        </h1>
        <div className="home-actions">
          <a className="btn-pill" href="#/work">
            Explore work
            <span className="btn-arrow">
              <ArrowRight size={18} />
            </span>
          </a>
          <p>{PROFILE.tagline}</p>
        </div>
      </div>
    </section>
  );
}
