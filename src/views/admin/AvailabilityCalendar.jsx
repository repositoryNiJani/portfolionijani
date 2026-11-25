import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabase.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TABLE = "availability_events";

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeLabel(value) {
  if (!value) return "";
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function emptyDraft(date) {
  return { id: null, availability_date: date, activity: "", start_time: "", end_time: "", notes: "" };
}

export default function AvailabilityCalendar() {
  const [entries, setEntries] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draggedId, setDraggedId] = useState("");
  const [dropDate, setDropDate] = useState("");

  const view = useMemo(() => {
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const cells = [];
    for (let index = 0; index < base.getDay(); index += 1) cells.push(null);
    for (let day = 1; day <= new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate(); day += 1) {
      cells.push(new Date(base.getFullYear(), base.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return {
      cells,
      label: base.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      today: dateKey(today),
    };
  }, [monthOffset]);

  const entriesByDate = useMemo(() => {
    const grouped = new Map();
    for (const entry of entries) {
      const current = grouped.get(entry.availability_date) || [];
      current.push(entry);
      grouped.set(entry.availability_date, current);
    }
    return grouped;
  }, [entries]);

  useEffect(() => {
    let active = true;
    async function loadEntries() {
      setLoading(true);
      setError("");
      try {
        if (!supabase) throw new Error("Admin access is unavailable.");
        const { data, error: loadError } = await supabase
          .from(TABLE)
          .select("*")
          .order("availability_date")
          .order("start_time");
        if (loadError) throw loadError;
        if (active) setEntries(data || []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Could not load calendar availability.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadEntries();
    return () => {
      active = false;
    };
  }, []);

  async function saveEntry(event) {
    event.preventDefault();
    if (!supabase || busy || !draft) return;
    const activity = draft.activity.trim();
    const notes = (draft.notes || "").trim();
    if (!activity) {
      setError("Enter what you will be doing.");
      return;
    }
    if (draft.end_time <= draft.start_time) {
      setError("End time must be later than start time.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        availability_date: draft.availability_date,
        activity,
        start_time: draft.start_time,
        end_time: draft.end_time,
        notes: notes || null,
      };
      const query = supabase.from(TABLE);
      const { data, error: saveError } = draft.id == null
        ? await query.insert(payload).select("*").single()
        : await query.update(payload).eq("id", draft.id).select("*").single();
      if (saveError) throw saveError;
      setEntries((current) => [
        ...current.filter((entry) => entry.id !== data.id),
        data,
      ].sort((a, b) =>
        a.availability_date.localeCompare(b.availability_date) ||
        a.start_time.localeCompare(b.start_time),
      ));
      setDraft(null);
      setNotice(draft.id == null ? "Availability added." : "Availability updated.");
    } catch (saveError) {
      setError(saveError.message || "Could not save this availability.");
    } finally {
      setBusy(false);
    }
  }

  async function moveEntry(entryId, newDate) {
    if (!supabase || !entryId || !newDate) return;
    const entry = entries.find((item) => String(item.id) === String(entryId));
    if (!entry || entry.availability_date === newDate) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data, error: moveError } = await supabase
        .from(TABLE)
        .update({ availability_date: newDate })
        .eq("id", entry.id)
        .select("*")
        .single();
      if (moveError) throw moveError;
      setEntries((current) =>
        current
          .map((item) => (item.id === data.id ? data : item))
          .sort((a, b) =>
            a.availability_date.localeCompare(b.availability_date) ||
            a.start_time.localeCompare(b.start_time),
          ),
      );
      setNotice(`Moved “${entry.activity}” to ${new Date(`${newDate}T00:00:00`).toLocaleDateString()}.`);
    } catch (moveError) {
      setError(moveError.message || "Could not move this availability.");
    } finally {
      setBusy(false);
      setDraggedId("");
      setDropDate("");
    }
  }

  async function deleteEntry() {
    if (!supabase || !draft?.id || busy) return;
    if (!window.confirm("Delete this availability? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error: deleteError } = await supabase.from(TABLE).delete().eq("id", draft.id);
      if (deleteError) throw deleteError;
      setEntries((current) => current.filter((entry) => entry.id !== draft.id));
      setDraft(null);
      setNotice("Availability deleted.");
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete this availability.");
    } finally {
      setBusy(false);
    }
  }

  function openEntry(event, entry) {
    event.stopPropagation();
    setError("");
    setNotice("");
    setDraft({ ...entry, start_time: entry.start_time.slice(0, 5), end_time: entry.end_time.slice(0, 5) });
  }

  return (
    <section className="availability-calendar">
      <div className="admin-section-heading">
        <div>
          <p className="label mono">Workspace / Schedule</p>
          <h2>Availability calendar</h2>
        </div>
        <button
          className="btn-pill admin-add-button"
          type="button"
          onClick={() => {
            setError("");
            setNotice("");
            setDraft(emptyDraft(dateKey(new Date())));
          }}
        >
          <Plus size={18} /> Add availability
        </button>
      </div>
      <p className="availability-help">
        Select a date to add what you’ll be doing and when. Drag an entry to another date to move it.
      </p>
      {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}
      {notice && <p className="admin-alert" role="status">{notice}</p>}

      <div className="availability-calendar-header">
        <button
          className="admin-icon-button"
          type="button"
          aria-label="Previous month"
          onClick={() => setMonthOffset((current) => current - 1)}
        >
          <ChevronLeft size={20} />
        </button>
        <h3>{view.label}</h3>
        <button
          className="admin-icon-button"
          type="button"
          aria-label="Next month"
          onClick={() => setMonthOffset((current) => current + 1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="availability-grid" role="grid" aria-label={`${view.label} availability calendar`}>
        {WEEKDAYS.map((day) => (
          <div className="availability-weekday" role="columnheader" key={day}>{day}</div>
        ))}
        {view.cells.map((date, index) => {
          if (!date) return <div className="availability-day empty" role="gridcell" aria-hidden="true" key={`empty-${index}`} />;
          const key = dateKey(date);
          const dateEntries = entriesByDate.get(key) || [];
          const isToday = key === view.today;
          return (
            <div
              className={`availability-day${isToday ? " today" : ""}${dropDate === key ? " drop-target" : ""}`}
              role="gridcell"
              tabIndex={0}
              aria-label={`${date.toLocaleDateString()}, ${dateEntries.length} availability entries`}
              key={key}
              onClick={() => {
                setError("");
                setNotice("");
                setDraft(emptyDraft(key));
              }}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setError("");
                  setNotice("");
                  setDraft(emptyDraft(key));
                }
              }}
              onDragOver={(event) => {
                if (!draggedId) return;
                event.preventDefault();
                setDropDate(key);
              }}
              onDragLeave={() => setDropDate("")}
              onDrop={(event) => {
                event.preventDefault();
                const entryId = event.dataTransfer.getData("text/plain") || draggedId;
                void moveEntry(entryId, key);
              }}
            >
              <span className="availability-day-number">{date.getDate()}</span>
              <span className="availability-day-items">
                {dateEntries.map((entry) => (
                  <button
                    className="availability-event"
                    type="button"
                    key={entry.id}
                    draggable={!busy}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      event.dataTransfer.setData("text/plain", String(entry.id));
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedId(String(entry.id));
                    }}
                    onDragEnd={() => {
                      setDraggedId("");
                      setDropDate("");
                    }}
                    onClick={(event) => openEntry(event, entry)}
                    onKeyDown={(event) => event.stopPropagation()}
                    title={`${timeLabel(entry.start_time)}–${timeLabel(entry.end_time)} · ${entry.activity}`}
                  >
                    {timeLabel(entry.start_time)} {entry.activity}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      {loading && (
        <p className="admin-empty">
          <LoaderCircle className="admin-spin" size={18} /> Loading availability…
        </p>
      )}
      {!loading && entries.length === 0 && (
        <p className="availability-empty"><CalendarDays size={18} /> No availability scheduled yet.</p>
      )}

      {draft && (
        <div
          className="admin-editor-backdrop"
          role="presentation"
          onClick={() => !busy && setDraft(null)}
        >
          <section
            className="admin-editor availability-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="admin-editor-header">
              <div>
                <p className="label mono">{draft.id == null ? "Schedule / New" : "Schedule / Edit"}</p>
                <h2 id="availability-editor-title">{draft.id == null ? "Set availability" : "Edit availability"}</h2>
              </div>
              <button
                className="admin-icon-button"
                type="button"
                onClick={() => setDraft(null)}
                disabled={busy}
                aria-label="Close availability form"
              >
                <X size={20} />
              </button>
            </header>
            <form className="availability-form" onSubmit={saveEntry}>
              <div className="availability-form-fields">
                <label className="admin-field availability-field-wide">
                  What will you do?
                  <input
                    type="text"
                    maxLength={120}
                    required
                    autoFocus
                    value={draft.activity}
                    onChange={(event) => setDraft((current) => ({ ...current, activity: event.target.value }))}
                    placeholder="e.g. Available for a meeting"
                  />
                </label>
                <label className="admin-field">
                  Date
                  <input
                    type="date"
                    required
                    value={draft.availability_date}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, availability_date: event.target.value }))
                    }
                  />
                </label>
                <label className="admin-field">
                  Start time
                  <input
                    type="time"
                    required
                    value={draft.start_time}
                    onChange={(event) => setDraft((current) => ({ ...current, start_time: event.target.value }))}
                  />
                </label>
                <label className="admin-field">
                  End time
                  <input
                    type="time"
                    required
                    value={draft.end_time}
                    onChange={(event) => setDraft((current) => ({ ...current, end_time: event.target.value }))}
                  />
                </label>
                <label className="admin-field availability-field-wide">
                  Notes (optional)
                  <textarea
                    rows={3}
                    maxLength={1000}
                    value={draft.notes || ""}
                    onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                  />
                </label>
              </div>
              {error && <p className="admin-alert admin-alert-error availability-form-error" role="alert">{error}</p>}
              <footer className="admin-editor-footer">
                {draft.id != null && (
                  <button
                    className="btn-ghost availability-delete"
                    type="button"
                    onClick={deleteEntry}
                    disabled={busy}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button className="btn-ghost" type="button" onClick={() => setDraft(null)} disabled={busy}>
                  Cancel
                </button>
                <button className="btn-pill" type="submit" disabled={busy}>
                  {busy ? <LoaderCircle className="admin-spin" size={18} /> : <Save size={18} />}
                  {busy ? "Saving…" : "Save"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
      <p className="availability-drag-hint"><Clock3 size={15} /> Times are shown in your local timezone.</p>
    </section>
  );
}
