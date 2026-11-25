import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { Sprite } from "../../components/Icons.jsx";
import { PROFILE, SOCIALS } from "../../data/profile.js";
import { MESSAGE_TYPES } from "../../data/messages.js";
import { sendMessage } from "../../lib/api.js";
import { supabase } from "../../lib/supabase.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatScheduleTime(value) {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ScheduleCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [availabilityEntries, setAvailabilityEntries] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadAvailability() {
      try {
        if (!supabase) throw new Error("Availability calendar is unavailable.");
        const { data, error } = await supabase
          .from("availability_events")
          .select("id, availability_date, activity, start_time, end_time")
          .order("availability_date")
          .order("start_time");
        if (error) throw error;
        if (active) setAvailabilityEntries(data || []);
      } catch (error) {
        if (active) setAvailabilityError(error.message || "Could not load availability.");
      } finally {
        if (active) setAvailabilityLoading(false);
      }
    }
    loadAvailability();
    return () => {
      active = false;
    };
  }, []);

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

  const entriesByDate = useMemo(() => {
    const grouped = new Map();
    for (const entry of availabilityEntries) {
      const current = grouped.get(entry.availability_date) || [];
      current.push(entry);
      grouped.set(entry.availability_date, current);
    }
    return grouped;
  }, [availabilityEntries]);

  useEffect(() => {
    if (!selectedDate) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedDate(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedDate]);

  const selectedEntries = selectedDate ? entriesByDate.get(selectedDate) || [] : [];

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
          const dateKey = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dateEntries = entriesByDate.get(dateKey) || [];
          return (
            <div
              key={dateKey}
              className={`heatmap-day${isToday ? " today" : ""}${dateEntries.length ? " has-schedule" : ""}`}
              role="gridcell"
              aria-current={isToday ? "date" : undefined}
              aria-label={`${new Date(`${dateKey}T00:00:00`).toLocaleDateString()}, ${dateEntries.length} availability entries`}
              tabIndex={0}
              onClick={() => setSelectedDate(dateKey)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedDate(dateKey);
                }
              }}
            >
              <span className="heatmap-day-num">{day}</span>
              {dateEntries.map((entry) => (
                <span className="schedule-entry" key={entry.id}>
                  <strong>
                    {formatScheduleTime(entry.start_time)}
                    {" – "}
                    {formatScheduleTime(entry.end_time)}
                  </strong>
                  <span>{entry.activity}</span>
                </span>
              ))}
            </div>
          );
        })}
      </div>
      {availabilityLoading && <p className="schedule-availability-status">Loading availability…</p>}
      {availabilityError && (
        <p className="schedule-availability-status schedule-availability-error" role="status">
          Availability could not be loaded: {availabilityError}
        </p>
      )}
      {selectedDate &&
        createPortal(
          <div
            className="preview-modal schedule-availability-backdrop"
            role="presentation"
            onClick={() => setSelectedDate(null)}
          >
            <section
              className="preview-modal-inner schedule-availability-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-availability-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="preview-modal-header">
                <h2 id="schedule-availability-title">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
                <button
                  type="button"
                  className="preview-modal-close schedule-modal-close"
                  aria-label="Close availability details"
                  autoFocus
                  onClick={() => setSelectedDate(null)}
                >
                  <X size={20} />
                </button>
              </header>
              <div className="preview-modal-body schedule-availability-body">
                {availabilityLoading ? (
                  <p className="schedule-no-availability">Loading availability…</p>
                ) : availabilityError ? (
                  <p className="schedule-no-availability" role="alert">
                    Availability details are unavailable right now.
                  </p>
                ) : selectedEntries.length ? (
                  <div className="schedule-availability-list">
                    {selectedEntries.map((entry) => (
                      <article className="schedule-availability-item" key={entry.id}>
                        <p className="schedule-availability-time">
                          {formatScheduleTime(entry.start_time)} – {formatScheduleTime(entry.end_time)}
                        </p>
                        <h3>{entry.activity}</h3>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="schedule-no-availability">No availability scheduled for this date.</p>
                )}
              </div>
            </section>
          </div>,
          document.body,
        )}
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

function readCameFrom() {
  const query = window.location.hash.split("?")[1] || "";
  return new URLSearchParams(query).get("came_from")?.trim() || "Portfolio - Contact Me";
}

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState({ text: "", error: false });
  const [sending, setSending] = useState(false);
  const [cameFrom, setCameFrom] = useState(() => readCameFrom());

  useEffect(() => {
    const updateSource = () => setCameFrom(readCameFrom());
    window.addEventListener("hashchange", updateSource);
    return () => window.removeEventListener("hashchange", updateSource);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    const address = email.trim();
    const m = message.trim();
    if (!n || !type || !m) {
      setNote({ text: "Please enter your name, choose a message type, and add a message.", error: true });
      return;
    }
    if (n.length > 100 || address.length > 200 || m.length > 5000 || cameFrom.length > 200) {
      setNote({
        text: "Name, email, message, or source is longer than the allowed limit.",
        error: true,
      });
      return;
    }

    setSending(true);
    setNote({ text: "", error: false });
    try {
      await sendMessage({ name: n, email: address, type, cameFrom, message: m });
      setName("");
      setEmail("");
      setType("");
      setMessage("");
      setNote({ text: "Your message has been saved. Thank you!", error: false });
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
            <label>
              Message type
              <select
                name="message_type"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Choose a type</option>
                {MESSAGE_TYPES.map((messageType) => (
                  <option key={messageType.value} value={messageType.value}>
                    {messageType.label}
                  </option>
                ))}
              </select>
            </label>
            {cameFrom !== "Portfolio - Contact Me" && (
              <p className="contact-source-note">Regarding: {cameFrom}</p>
            )}
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
              {note.text || "Your message will be saved to my portfolio inbox."}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
