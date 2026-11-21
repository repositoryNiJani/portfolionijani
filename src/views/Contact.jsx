import { useState } from "react";
import { ArrowIcon, Sprite } from "../components/Icons.jsx";
import { PROFILE, SOCIALS } from "../data/profile.js";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers: fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          window.setTimeout(() => setDone(false), 1600);
        }
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export default function Contact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState({ text: "", error: false });

  const submit = (e) => {
    e.preventDefault();
    const n = name.trim();
    const m = message.trim();
    if (!m) {
      setNote({ text: "Please write a message first.", error: true });
      return;
    }
    const url =
      `mailto:${PROFILE.email}?subject=` +
      encodeURIComponent(`Portfolio message${n ? ` from ${n}` : ""}`) +
      `&body=` +
      encodeURIComponent(m + (n ? `\n\n${n}` : ""));
    window.open(url, "_blank", "noopener");
    setNote({
      text: `Opening your email app… if nothing opens, email me at ${PROFILE.email}.`,
      error: false,
    });
  };

  return (
    <div className="stack">
      <div className="view-head">
        <div>
          <p className="label mono">03 / Contact</p>
          <h1 data-view-title tabIndex={-1} className="view-title">
            CONTACT
          </h1>
        </div>
        <p className="head-note">Find me online, or send me a message.</p>
      </div>

      <div className="contact-grid">
        <section className="glass panel" aria-labelledby="find-title">
          <h2 id="find-title">Find me online</h2>
          <div className="socials">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                className="social"
                href={s.href}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener"
              >
                <Sprite id={s.icon} className="social-ic" />
                <strong>{s.name}</strong>
                <span>{s.sub}</span>
              </a>
            ))}
          </div>
          <dl className="quick">
            <div>
              <dt className="mono">Email</dt>
              <dd>
                <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
                <CopyButton text={PROFILE.email} />
              </dd>
            </div>
            <div>
              <dt className="mono">Phone</dt>
              <dd>
                <a href={`tel:${PROFILE.phoneHref}`}>{PROFILE.phone}</a>
                <CopyButton text={PROFILE.phone} />
              </dd>
            </div>
            <div>
              <dt className="mono">Location</dt>
              <dd>{PROFILE.location}</dd>
            </div>
          </dl>
        </section>

        <section className="glass panel" aria-labelledby="form-title">
          <h2 id="form-title">Contact me</h2>
          <form className="form" onSubmit={submit} noValidate>
            <label>
              Your name
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="grow">
              Your message
              <textarea
                name="message"
                placeholder="Hi Jhonny, I’d like to talk about…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <button className="btn-pill" type="submit">
              Contact me
              <span className="btn-arrow">
                <ArrowIcon width="16" height="16" />
              </span>
            </button>
            <p
              className={`note${note.error ? " err" : ""}`}
              role="status"
              aria-live="polite"
            >
              {note.text || "This opens your email app with the message ready to send."}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
