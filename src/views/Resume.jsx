import { DownloadIcon } from "../components/Icons.jsx";
import { PROFILE, RESUME } from "../data/profile.js";

export default function Resume() {
  return (
    <div className="stack">
      <div className="view-head">
        <div>
          <p className="label mono">04 / Resume</p>
          <h1 data-view-title tabIndex={-1} className="view-title">
            RESUME
          </h1>
        </div>
        <div className="head-actions">
          <a className="btn-pill" href={PROFILE.resumePdf} download>
            Download PDF
            <span className="btn-arrow">
              <DownloadIcon width="16" height="16" />
            </span>
          </a>
          {/* <button type="button" className="btn-ghost" onClick={() => window.print()}>
            Print
          </button> */}
        </div>
      </div>

      <article className="glass paper" id="resume-document">
        <header>
          <h2>{PROFILE.name}</h2>
          <p>
            {PROFILE.location} · <a href={`tel:${PROFILE.phoneHref}`}>{PROFILE.phone}</a> ·{" "}
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </p>
          <p>
            GitHub: <a href={PROFILE.github}>github.com/{PROFILE.githubHandle}</a> · LinkedIn:{" "}
            <a href={PROFILE.linkedin}>linkedin.com/in/{PROFILE.linkedinHandle}</a>
          </p>
        </header>

        <section>
          <h3 className="mono">Summary</h3>
          <p>{RESUME.summary}</p>
        </section>

        <section>
          <h3 className="mono">Technical skills</h3>
          {RESUME.skills.map(([label, value]) => (
            <p key={label}>
              <strong>{label}:</strong> {value}
            </p>
          ))}
        </section>

        <section>
          <h3 className="mono">Projects</h3>
          {RESUME.projects.map((p) => (
            <div key={p.title} className="r-project">
              <h4>
                {p.title} <span className="mono">{p.when}</span>
              </h4>
              <p className="r-meta">{p.meta}</p>
              <ul>
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h3 className="mono">Education</h3>
          <p>
            <strong>{RESUME.education.title}</strong>
            <br />
            {RESUME.education.org} <span className="mono">{RESUME.education.when}</span>
          </p>
        </section>

        <section>
          <h3 className="mono">Certifications</h3>
          {RESUME.certifications.map((c) => (
            <p key={c.title}>
              <strong>{c.title}</strong> <span className="mono">{c.when}</span>
            </p>
          ))}
        </section>
      </article>
    </div>
  );
}
