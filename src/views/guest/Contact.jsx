import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Sprite } from "../../components/Icons.jsx";
import { PROFILE, SOCIALS } from "../../data/profile.js";
import { sendMessage } from "../../lib/api.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ScheduleCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);

  const view = useMemo(() => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const label = base.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);

    const isCurrentMonth =
      year === today.getFullYear() && month === today.getMonth();

    return { year, month, label, cells, today: today.getDate(), isCurrentMonth };
  }, [monthOffset]);

  return (
    <div className="schedule-calendar">
      <div className="schedule-header">
        <div>
          <h2 id="schedule-title">My schedule</h2>
          <p className="schedule-subtitle">Calendar</p>
        </div>
        <div className="calendar-controls" aria-label="Calendar month controls">
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={() => setMonthOffset((v) => v - 1)}
          >
             Prev
          </button>
          <span className="calendar-month">{view.label}</span>
          <button
            type="button"
            className="calendar-nav-btn"
            onClick={() => setMonthOffset((v) => v + 1)}
          >
            Next 
          </button>
        </div>
      </div>

      <div className="calendar-grid heatmap-grid" role="grid" aria-label={`${view.label} calendar`}>
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday" role="columnheader">
            {day}
          </div>
        ))}
        {view.cells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`${view.year}-${view.month}-empty-${index}`}
                className="heatmap-day empty"
                role="gridcell"
                aria-hidden="true"
              />
            );
          }

          const isToday = view.isCurrentMonth && day === view.today;
          return (
            <div
              key={`${view.year}-${view.month}-${day}`}
              className={`heatmap-day${isToday ? " today" : ""}`}
              role="gridcell"
              aria-current={isToday ? "date" : undefined}
            >
              <span className="heatmap-day-num">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState({ text: "", error: false });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    const address = email.trim();
    const m = message.trim();
    if (!n || !m) {
      setNote({ text: "Please enter your name and a message.", error: true });
      return;
    }
    if (n.length > 100 || address.length > 200 || m.length > 5000) {
      setNote({
        text: "Name, email, or message is longer than the allowed limit.",
        error: true,
      });
      return;
    }

    setSending(true);
    setNote({ text: "", error: false });
    try {
      await sendMessage({ name: n, email: address, message: m });
      setName("");
      setEmail("");
      setMessage("");
      setNote({ text: "Your message has been sent. Thank you!", error: false });
    } catch (sendError) {
      setNote({
        text: sendError.message || "Could not send your message. Please try again.",
        error: true,
      });
    } finally {
      setSending(false);
    }
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

      <section className="glass panel schedule-panel" aria-labelledby="schedule-title">
        <ScheduleCalendar />
      </section>

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
                {s.image ? (
                  <img className="social-ic" src={s.image} alt="" />
                ) : (
                  <Sprite id={s.icon} className="social-ic" />
                )}
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
          <form className="form" onSubmit={submit}>
            <label>
              Your name
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                maxLength={100}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Your email (optional)
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="grow">
              Your message
              <textarea
                name="message"
                placeholder="Hi Jhonny, I’d like to talk about…"
                maxLength={5000}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <button className="btn-pill" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
              <span className="btn-arrow">
                <ArrowRight size={16} />
              </span>
            </button>
            <p
              className={`note${note.error ? " err" : ""}`}
              role="status"
              aria-live="polite"
            >
              {note.text || "Your message goes straight to my inbox."}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
