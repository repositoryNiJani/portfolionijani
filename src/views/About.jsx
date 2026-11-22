import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight } from "lucide-react";
import { Sprite } from "../components/Icons.jsx";
import {
  ABOUT,
  BUSINESS,
  EDUCATION,
  PROFILE,
  SKILLS,
} from "../data/profile.js";
import { FOLDERS } from "../data/projects.js";

const JUMPS = [
  ["overview", "Overview"],
  ["business", "Business"],
  ["skills", "Skills"],
  ["education", "Education"],
];

// "#id" links would change the URL hash and the view, so jump with scrolling.
const jump = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const projectCount = Object.values(FOLDERS).reduce(
  (sum, folder) => sum + folder.items.length,
  0,
);
const certCount = EDUCATION.filter((e) => e.kind === "Certificate").length;
const pad = (n) => String(n).padStart(2, "0");

export default function About({ go }) {
  const [modalImage, setModalImage] = useState(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [whyCardFlipped, setWhyCardFlipped] = useState(false);

  useEffect(() => {
    if (!modalImage && !whyModalOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setModalImage(null);
        setWhyModalOpen(false);
        setWhyCardFlipped(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalImage, whyModalOpen]);

  return (
    <div className="stack">
      <div className="view-head">
        <div>
          <p className="label mono">01 / About</p>
          <h1 data-view-title tabIndex={-1} className="view-title">
            ABOUT ME
          </h1>
        </div>
        <div className="jumps">
          {JUMPS.map(([id, label]) => (
            <button key={id} type="button" className="jump mono" onClick={() => jump(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <section id="overview" className="ab-top">
        <article className="photo-card">
          <img src="/jani.png" alt={PROFILE.name} />
          <div className="photo-cap">
            <h2>The Developer</h2>
            <p className="mono">Laravel · React · MySQL</p>
          </div>
        </article>
        <article className="glass gh-card">
          <header>
            <h2>GitHub contributions</h2>
            <a href={PROFILE.github} target="_blank" rel="noopener">
              View my GitHub profile <span aria-hidden="true">↗</span>
            </a>
          </header>
          <div className="gh-frame">
            <iframe
              src={PROFILE.treeEmbed}
              title="My GitHub contribution tree"
              loading="lazy"
            />
          </div>
        </article>
      </section>

      <section className="glass block">
        <div className="info-grid">
          <div>
            <h2 className="accent-h">Information about me</h2>
            <p className="lead">{ABOUT.bio}</p>
          </div>
          <dl className="facts">
            {ABOUT.facts.map((f) => (
              <div key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <dl className="stats">
          <div>
            <dd className="mono">{pad(projectCount)}</dd>
            <dt className="mono">Projects</dt>
          </div>
          <div>
            <dd className="mono">{pad(certCount)}</dd>
            <dt className="mono">Certifications</dt>
          </div>
          <div>
            <dd className="mono">2023</dd>
            <dt className="mono">Studying since</dt>
          </div>
        </dl>
      </section>

      <section id="business" className="glass block">
        <p className="label mono">How I help</p>
        <h2 className="display-h">{BUSINESS.title}</h2>
        <p className="sub">{BUSINESS.intro}</p>
        <div className="cards-3">
          {BUSINESS.cards.map((c) => (
            <article key={c.index} className="inner-card">
              <p className="label mono">
                {c.index} ? {c.kicker}
              </p>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          className="inner-card why why-card-trigger"
          onClick={() => {
            setWhyModalOpen(true);
            setWhyCardFlipped(true);
          }}
        >
          <p className="label mono">04 · Why me?</p>
          <p>{BUSINESS.why}</p>
          <span className="why-card-arrow" aria-hidden="true">
            <ArrowRight size={16} />
          </span>
        </button>
        <div className="cta-row">
          <p>{BUSINESS.note}</p>
          <button type="button" className="btn-pill" onClick={() => go("contact")}>
            {BUSINESS.cta}
            <span className="btn-arrow">
              <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </section>

      <section id="skills" className="glass block">
        <p className="label mono">Stack</p>
        <h2 className="display-h">{SKILLS.title}</h2>
        <p className="sub">{SKILLS.intro}</p>
        <div className="cards-2">
          {SKILLS.groups.map((g) => (
            <article key={g.index} className="inner-card">
              <p className="label mono">{g.index}</p>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
              <ul className="chips" aria-label={`${g.title} skills`}>
                {g.items.map((item) => (
                  <li key={item.name} className="chip">
                    {item.image ? (
                      <img src={item.image} alt="" className="chip-ic" />
                    ) : (
                      <Sprite id={item.icon} className="chip-ic" />
                    )}
                    {item.name}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="education" className="glass block">
        <p className="label mono">Education & certification</p>
        <h2 className="display-h">Education</h2>
        <div className="cards-3">
          {EDUCATION.map((e) => (
            <article key={e.title} className="inner-card education-card">
              <p className="label mono">{e.kind}</p>
              <h3>{e.title}</h3>
              <p>{e.org}</p>
              <p className="when mono">{e.when}</p>
              {e.image && (
                <button
                  type="button"
                  className="education-card-image"
                  onClick={() =>
                    setModalImage({
                      src: e.image,
                      alt: e.imageAlt || `${e.title} preview`,
                      title: e.title,
                      kind: e.kind,
                      org: e.org,
                      when: e.when,
                    })
                  }
                  aria-label={`Open ${e.title} image`}
                >
                  <img src={e.image} alt={e.imageAlt || `${e.title} preview`} />
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      {modalImage &&
        createPortal(
          <div
            className="preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={modalImage.title || modalImage.alt}
            onClick={() => setModalImage(null)}
          >
            <div className="preview-modal-inner" onClick={(event) => event.stopPropagation()}>
              <div className="preview-modal-header">
                <h2>{modalImage.title || "Document Details"}</h2>
                <button
                  type="button"
                  className="preview-modal-close"
                  onClick={() => setModalImage(null)}
                  aria-label="Close preview"
                >
                  &times;
                </button>
              </div>
              <div className="preview-modal-body">
                <img className="preview-modal-image" src={modalImage.src} alt={modalImage.alt} />
              </div>
            </div>
          </div>,
          document.body
        )}
      {whyModalOpen &&
        createPortal(
          <div
            className="preview-modal why-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Why me card"
            onClick={() => {
              setWhyModalOpen(false);
              setWhyCardFlipped(true);
            }}
          >
            <div className="why-modal-content" onClick={(event) => event.stopPropagation()}>
              <button
                type="button"
                className="preview-modal-close why-modal-close"
                onClick={() => {
                  setWhyModalOpen(false);
                  setWhyCardFlipped(true);
                }}
                aria-label="Close card"
              >
                &times;
              </button>
              <button
                type="button"
                className={`deck-card${whyCardFlipped ? " flipped" : ""}`}
                onClick={() => setWhyCardFlipped((value) => !value)}
                aria-label={whyCardFlipped ? "Show front of card" : "Flip card"}
              >
                <span className="deck-card-inner">
                  <span className="deck-card-face deck-card-front">
                    <p className="label mono">04 · Why me?</p>
                    <p className="deck-card-text">{BUSINESS.why}</p>
                    <p className="why-flip-hint mono">Click card to flip</p>
                  </span>
                  <span className="deck-card-face deck-card-back">
                    <img src="/back.svg" alt="Card back" className="deck-card-back-image" />
                  </span>
                </span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
