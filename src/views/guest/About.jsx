import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight } from "lucide-react";
import {
  ABOUT,
  BUSINESS,
  PROFILE,
  SKILLS,
} from "../../data/profile.js";

const JUMPS = [
  ["overview", "Overview"],
  ["business", "Business"],
  ["skills", "Skills"],
  ["education", "Education"],
];

// "#id" links would change the URL hash and the view, so jump with scrolling.
const jump = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const pad = (n) => String(n).padStart(2, "0");

const SKILL_TYPES = {
  "01": "web_interface",
  "02": "data",
  "03": "access_integrity",
  "04": "other",
  "05": "design_media",
  "06": "documents_office",
};

function getVerificationUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function About({ go, portfolio }) {
  const { about, education, projects, skills } = portfolio;
  const [modalImage, setModalImage] = useState(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [whyCardFlipped, setWhyCardFlipped] = useState(false);
  const aboutFacts = ABOUT.facts
    .map((fact) => {
      if (fact.label === "Based in") return { ...fact, value: about.location };
      if (fact.label === "Looking for") return { ...fact, value: about.looking_for };
      return fact;
    })
    .filter((fact) => fact.value);
  const certCount = education.filter((item) => item.type === "certificate").length;

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
          <img src={about.image || "/404.svg"} alt={PROFILE.name} decoding="async" />
          <div className="photo-cap">
            <h2>The Developer</h2>
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
            <p className="lead">{about.description}</p>
          </div>
          <dl className="facts">
            {aboutFacts.map((f) => (
              <div key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <dl className="stats">
          <div>
            <dd className="mono">{pad(projects.length)}</dd>
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
          {SKILLS.groups.map((group) => {
            const groupSkills = skills.filter(
              (skill) => skill.type === SKILL_TYPES[group.index],
            );
            if (groupSkills.length === 0) return null;
            return (
              <article key={group.index} className="inner-card">
                <p className="label mono">{group.index}</p>
                <h3>{group.title}</h3>
                <p>{group.text}</p>
                <ul className="chips" aria-label={`${group.title} skills`}>
                  {groupSkills.map((skill) => (
                    <li key={skill.id} className="chip">
                      <img
                        src={skill.image || "/404.svg"}
                        alt=""
                        className="chip-ic"
                        loading="lazy"
                        decoding="async"
                      />
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section id="education" className="glass block">
        <p className="label mono">Education & certification</p>
        <h2 className="display-h">Education</h2>
        <div className="cards-3">
          {education.map((item) => {
            const verificationUrl = getVerificationUrl(item.description);
            return (
              <article key={item.id} className="inner-card education-card">
                <p className="label mono">
                  {item.type === "degree" ? "Degree" : "Certificate"}
                </p>
                <h3>{item.title}</h3>
                {item.organization && <p>{item.organization}</p>}
                {item.year && <p className="when mono">{item.year}</p>}
                <button
                  type="button"
                  className="education-card-image"
                  onClick={() =>
                    setModalImage({
                      src: item.image || "/404.svg",
                      alt: `${item.title} preview`,
                      title: item.title,
                      verificationUrl,
                    })
                  }
                  aria-label={`Open ${item.title} image`}
                >
                  <img
                    src={item.image || "/404.svg"}
                    alt={`${item.title} preview`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              </article>
            );
          })}
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
              {modalImage.verificationUrl && (
                <div className="preview-modal-verification">
                  <p>Verification link</p>
                  <a
                    href={modalImage.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {modalImage.verificationUrl}
                  </a>
                </div>
              )}
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
