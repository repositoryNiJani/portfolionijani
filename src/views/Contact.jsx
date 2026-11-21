import { useMemo, useState } from "react";
import { ArrowIcon, Sprite } from "../components/Icons.jsx";
import { PROFILE, SOCIALS } from "../data/profile.js";

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
