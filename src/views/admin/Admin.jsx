import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  LoaderCircle,
  Mail,
  Plus,
  Save,
  Upload,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { imageUrl, supabase } from "../../lib/supabase.js";
import AdminSidebar from "./AdminSidebar.jsx";

const SECTIONS = [
  { id: "about", label: "About", Icon: UserRound, table: "about" },
  { id: "education", label: "Education", Icon: GraduationCap, table: "education" },
  { id: "projects", label: "Projects", Icon: BriefcaseBusiness, table: "projects" },
  { id: "skills", label: "Skills", Icon: Wrench, table: "technical_skills" },
  { id: "messages", label: "Messages", Icon: Mail, table: "contact_messages" },
];

const FIELDS = {
  about: [
    { name: "name", label: "Name", required: true },
    { name: "description", label: "Bio", kind: "textarea", required: true },
    { name: "looking_for", label: "Looking for", optional: true },
    { name: "location", label: "Location", optional: true },
    { name: "studying_since", label: "Studying since", type: "number", optional: true },
    { name: "image", label: "Profile image", kind: "image", optional: true },
  ],
  education: [
    { name: "type", label: "Type", kind: "select", options: ["degree", "certificate"], required: true },
    { name: "title", label: "Title", required: true },
    { name: "organization", label: "Organization", optional: true },
    {
      name: "description",
      label: "Verification link",
      type: "url",
      optional: true,
      hint: "Paste a public link where guests can verify this credential.",
    },
    { name: "year", label: "Year", optional: true },
    { name: "image", label: "Education image", kind: "image", optional: true },
    { name: "sort_order", label: "Display order", type: "number", required: true },
  ],
  projects: [
    { name: "slug", label: "URL slug", required: true },
    { name: "title", label: "Project title", required: true },
    { name: "short_name", label: "Short name", optional: true },
    { name: "type", label: "Group", kind: "select", options: ["main", "side"], required: true },
    { name: "kind", label: "Project type", optional: true },
    { name: "role", label: "Role", optional: true },
    { name: "client", label: "Client or organization", optional: true },
    { name: "start_date", label: "Start date", type: "date", optional: true },
    { name: "end_date", label: "End date", type: "date", optional: true },
    { name: "summary", label: "Summary", kind: "textarea", optional: true },
    { name: "highlights", label: "Highlights (one per line)", kind: "lines", optional: true },
    { name: "tech_stack", label: "Technologies (one per line)", kind: "lines", optional: true },
    { name: "image", label: "Cover image", kind: "image", optional: true },
    {
      name: "images",
      label: "Gallery images (JSON array)",
      kind: "json",
      optional: true,
      hint: 'Example: [{"src":"images/project.png","alt":"Project screen"}]',
    },
    { name: "live_url", label: "Live URL", type: "url", optional: true },
    { name: "repo_url", label: "Repository URL", type: "url", optional: true },
    { name: "sort_order", label: "Display order", type: "number", required: true },
  ],
  skills: [
    {
      name: "type",
      label: "Group",
      kind: "select",
      options: ["web_interface", "data", "access_integrity", "other"],
      required: true,
    },
    { name: "name", label: "Skill", required: true },
    { name: "image", label: "Skill icon", kind: "image", optional: true },
    { name: "sort_order", label: "Display order", type: "number", required: true },
  ],
};

const EMPTY_RECORDS = {
  about: [],
  education: [],
  projects: [],
  skills: [],
  messages: [],
};

const valueFor = (field, value) => {
  if (value == null) return "";
  if (field.kind === "lines") return Array.isArray(value) ? value.join("\n") : "";
  if (field.kind === "json") return JSON.stringify(value, null, 2);
  return String(value);
};

function recordTitle(section, record) {
  if (section === "about") return record.name || "About";
  if (section === "projects") return record.title || "Untitled project";
  if (section === "education") return record.title || "Untitled education";
  if (section === "skills") return record.name || "Untitled skill";
  return record.name || "Contact message";
}

function makePayload(section, draft) {
  const payload = {};
  for (const field of FIELDS[section]) {
    const raw = draft[field.name] ?? "";
    if (field.kind === "lines") {
      payload[field.name] = raw
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.kind === "json") {
      try {
        const value = raw.trim() ? JSON.parse(raw) : [];
        if (!Array.isArray(value)) throw new Error("Gallery images must be a JSON array.");
        payload[field.name] = value;
      } catch (error) {
        throw new Error(error.message || "Gallery images must be valid JSON.");
      }
    } else if (field.type === "number") {
      const value = raw.trim();
      payload[field.name] = value === "" ? null : Number(value);
      if (payload[field.name] !== null && !Number.isFinite(payload[field.name])) {
        throw new Error(`${field.label} must be a valid number.`);
      }
    } else {
      const value = raw.trim();
      payload[field.name] = !value && field.optional ? null : value;
    }
  }
  return payload;
}

function initialDraft(section, record) {
  return Object.fromEntries(
    FIELDS[section].map((field) => [
      field.name,
      valueFor(
        field,
        record?.[field.name] ??
          (field.kind === "select" ? field.options[0] : field.name === "sort_order" ? 0 : ""),
      ),
    ]),
  );
}

function AdminField({ field, value, onChange, onUploadStateChange, disabled }) {
  const id = `admin-${field.name}`;
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const controlProps = {
    id,
    name: field.name,
    value,
    required: field.required,
    onChange: (event) => onChange(field.name, event.target.value),
  };

  async function uploadImage(file) {
    if (!file || uploading || disabled) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image must be 10 MB or smaller.");
      return;
    }
    if (!supabase) {
      setUploadError("Admin access is unavailable.");
      return;
    }

    setUploading(true);
    setUploadError("");
    onUploadStateChange(field.name, true);
    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
      const uniqueId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const path = `images/${uniqueId}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });
      if (uploadError) throw uploadError;
      onChange(field.name, path);
    } catch (error) {
      setUploadError(error.message || "Could not upload this image.");
    } finally {
      setUploading(false);
      onUploadStateChange(field.name, false);
    }
  }

  if (field.kind === "image") {
    const preview = value ? imageUrl(value) : null;
    return (
      <div className="admin-field admin-field-wide">
        <span>{field.label}</span>
        <div
          className={`admin-image-dropzone${dragging ? " is-dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const [file] = event.dataTransfer.files;
            if (file) uploadImage(file);
          }}
        >
          {preview && <img className="admin-image-preview" src={preview} alt="Current upload" />}
          <Upload size={22} aria-hidden="true" />
          <p>{uploading ? "Uploading image…" : "Drop an image here or choose a file"}</p>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => fileInput.current?.click()}
            disabled={disabled || uploading}
          >
            Browse images
          </button>
          {value && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onChange(field.name, "")}
              disabled={disabled || uploading}
            >
              Remove image
            </button>
          )}
          <small>Images up to 10 MB are uploaded to Supabase Storage.</small>
          <input
            ref={fileInput}
            className="admin-image-input"
            type="file"
            accept="image/*"
            aria-label={`Upload ${field.label.toLowerCase()}`}
            onChange={(event) => {
              const [file] = event.target.files;
              if (file) uploadImage(file);
              event.target.value = "";
            }}
            disabled={disabled || uploading}
          />
        </div>
        {uploadError && (
          <small className="admin-image-error" role="alert">
            {uploadError}
          </small>
        )}
      </div>
    );
  }

  return (
    <label className={`admin-field${field.kind === "textarea" || field.kind === "lines" || field.kind === "json" ? " admin-field-wide" : ""}`}>
      <span>{field.label}</span>
      {field.kind === "select" ? (
        <select {...controlProps}>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ) : field.kind === "textarea" || field.kind === "lines" || field.kind === "json" ? (
        <textarea {...controlProps} rows={field.kind === "json" ? 6 : 4} />
      ) : (
        <input {...controlProps} type={field.type || "text"} />
      )}
      {field.hint && <small>{field.hint}</small>}
    </label>
  );
}

export default function Admin({ go }) {
  const [access, setAccess] = useState("checking");
  const [activeSection, setActiveSection] = useState("overview");
  const [records, setRecords] = useState(EMPTY_RECORDS);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [uploadingFields, setUploadingFields] = useState(() => new Set());
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadRecords = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all([
        supabase.from("about").select("*").order("id").limit(1),
        supabase.from("education").select("*").order("sort_order"),
        supabase.from("projects").select("*").order("sort_order"),
        supabase.from("technical_skills").select("*").order("sort_order"),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      ]);
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      setRecords({
        about: results[0].data ?? [],
        education: results[1].data ?? [],
        projects: results[2].data ?? [],
        skills: results[3].data ?? [],
        messages: results[4].data ?? [],
      });
    } catch (loadError) {
      setError(loadError.message || "Could not load data from the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAccess("unavailable");
      return undefined;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && !session) go("home");
    });

    async function checkAccess() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!data.session) {
          go("home");
          return;
        }
        const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
        if (adminError) throw adminError;
        if (active) setAccess(isAdmin === true ? "allowed" : "denied");
      } catch (authError) {
        if (active) {
          setError(authError.message || "Could not verify admin access.");
          setAccess("error");
        }
      }
    }

    checkAccess();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [go]);

  useEffect(() => {
    if (access === "allowed") loadRecords();
  }, [access, loadRecords]);

  useEffect(() => {
    if (activeSection !== "about") return;
    const record = records.about[0] ?? null;
    const recordId = record?.id ?? null;
    if (editing?.section === "about" && editing.id === recordId) return;
    setEditing({ section: "about", id: recordId });
    setDraft(initialDraft("about", record));
    setUploadingFields(new Set());
  }, [activeSection, records.about, editing?.section, editing?.id]);

  const sectionCounts = useMemo(
    () => ({
      about: records.about.length,
      education: records.education.length,
      projects: records.projects.length,
      skills: records.skills.length,
      messages: records.messages.length,
    }),
    [records],
  );

  function startEditing(section, record = null) {
    setEditing({ section, id: record?.id ?? null });
    setDraft(initialDraft(section, record));
    setUploadingFields(new Set());
    setNotice("");
    setError("");
  }

  async function saveRecord(event) {
    event.preventDefault();
    if (!supabase || !editing || uploadingFields.size > 0) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const payload = makePayload(editing.section, draft);
      const section = editing.section;
      const table = SECTIONS.find((item) => item.id === section).table;
      let request = supabase.from(table);
      if (editing.id == null) {
        request = request.insert(payload);
        if (section === "about") request = request.select("id").single();
      } else {
        request = request.update(payload).eq("id", editing.id);
      }
      const { data: savedRecord, error: saveError } = await request;
      if (saveError) throw saveError;
      if (section === "about") {
        setEditing({ section, id: savedRecord?.id ?? editing.id });
      } else {
        setEditing(null);
      }
      setNotice("Changes saved to the database.");
      await loadRecords();
    } catch (saveError) {
      setError(saveError.message || "Could not save your changes.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRecord(section, record) {
    if (!supabase || !window.confirm(`Delete “${recordTitle(section, record)}”? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const table = SECTIONS.find((item) => item.id === section).table;
      const { error: deleteError } = await supabase.from(table).delete().eq("id", record.id);
      if (deleteError) throw deleteError;
      setNotice("Record deleted.");
      await loadRecords();
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete this record.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      go("home");
    } catch (signOutError) {
      setError(signOutError.message || "Could not sign out.");
    } finally {
      setBusy(false);
    }
  }

  if (access !== "allowed") {
    const message = {
      checking: "Verifying your admin account…",
      unavailable: "Admin access is unavailable.",
      denied: "This account does not have admin access.",
      error: error || "Could not verify admin access.",
    }[access];
    return (
      <section className="admin-access">
        <p className="label mono">Portfolio admin</p>
        <h1 data-view-title tabIndex={-1} className="view-title">ADMIN</h1>
        <p>{message}</p>
        {access !== "checking" && (
          <button type="button" className="btn-ghost" onClick={() => go("home")}>
            <ArrowLeft size={16} /> Return to portfolio
          </button>
        )}
      </section>
    );
  }

  const currentSection = SECTIONS.find((section) => section.id === activeSection);
  const currentRecords = currentSection ? records[activeSection] : [];
  const renderFields = (section) =>
    FIELDS[section].map((field) => (
      <AdminField
        key={field.name}
        field={field}
        value={draft[field.name] ?? ""}
        onChange={(name, value) =>
          setDraft((current) => ({ ...current, [name]: value }))
        }
        disabled={busy}
        onUploadStateChange={(name, isUploading) =>
          setUploadingFields((current) => {
            const next = new Set(current);
            if (isUploading) next.add(name);
            else next.delete(name);
            return next;
          })
        }
      />
    ));

  return (
    <div className="admin-shell">
      <AdminSidebar
        sections={SECTIONS}
        activeSection={activeSection}
        sectionCounts={sectionCounts}
        busy={busy}
        onSignOut={signOut}
        onSelect={(section) => {
          setActiveSection(section);
          if (section === "about") {
            if (activeSection !== "about") {
              startEditing(section, records.about[0] ?? null);
            }
          } else {
            setEditing(null);
          }
          setNotice("");
          setError("");
        }}
      />
      <div className="admin-main">
        <div className="admin-page">
          <header className="view-head admin-header">
            <div>
              <p className="label mono">Portfolio admin / Database</p>
              <h1 data-view-title tabIndex={-1} className="view-title">
                MANAGE YOUR PORTFOLIO
              </h1>
            </div>
            <p className="head-note">Edit the content stored in your Supabase database.</p>
          </header>

          <section className="admin-content glass block">
          {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}
          {notice && <p className="admin-alert" role="status">{notice}</p>}

          {activeSection === "overview" ? (
            <section className="admin-overview">
              <div className="admin-section-heading">
                <div>
                  <p className="label mono">Workspace</p>
                  <h2>Database overview</h2>
                </div>
                <button className="btn-ghost" type="button" onClick={loadRecords} disabled={loading}>
                  {loading ? <LoaderCircle className="admin-spin" size={16} /> : "Refresh"}
                </button>
              </div>
              <div className="admin-stat-grid">
                {SECTIONS.map(({ id, label, Icon }) => (
                  <button
                    className="admin-stat-card"
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                  >
                    <span className="admin-stat-icon"><Icon size={20} /></span>
                    <span className="admin-stat-label">{label}</span>
                    <strong>{sectionCounts[id]}</strong>
                    <span className="admin-stat-link">Manage {label.toLowerCase()} →</span>
                  </button>
                ))}
              </div>
              <p className="admin-help">
                Changes are saved directly to Supabase. Row-level security still controls which
                records this account can edit.
              </p>
            </section>
          ) : activeSection === "messages" ? (
            <section>
              <div className="admin-section-heading">
                <div>
                  <p className="label mono">Inbox</p>
                  <h2>Contact messages</h2>
                </div>
                <button className="btn-ghost" type="button" onClick={loadRecords} disabled={loading}>
                  {loading ? <LoaderCircle className="admin-spin" size={16} /> : "Refresh"}
                </button>
              </div>
              {loading ? (
                <p className="admin-empty">Loading messages…</p>
              ) : records.messages.length ? (
                <div className="admin-record-list">
                  {records.messages.map((record) => (
                    <article className="admin-record admin-message-card" key={record.id}>
                      <div className="admin-record-heading">
                        <div>
                          <h3>{record.name}</h3>
                          <p>{record.email || "No email provided"} · {new Date(record.created_at).toLocaleString()}</p>
                        </div>
                        <button
                          className="admin-icon-button danger"
                          type="button"
                          onClick={() => deleteRecord("messages", record)}
                          disabled={busy}
                          aria-label={`Delete message from ${record.name}`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <p className="admin-message-text">{record.message}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">No contact messages yet.</p>
              )}
            </section>
          ) : activeSection === "about" ? (
            <section>
              <div className="admin-section-heading">
                <div>
                  <p className="label mono">Database / About</p>
                  <h2>{draft.name || "About profile"}</h2>
                </div>
              </div>
              <p className="admin-help">
                Edit your profile details directly below. Changes are saved to Supabase.
              </p>
              {loading ? (
                <p className="admin-empty">Loading profile…</p>
              ) : (
                <form className="admin-about-form" onSubmit={saveRecord}>
                  <div className="admin-fields admin-about-fields">
                    {renderFields("about")}
                  </div>
                  <div className="admin-about-actions">
                    <button
                      className="btn-pill"
                      type="submit"
                      disabled={busy || uploadingFields.size > 0}
                    >
                      {busy ? (
                        <LoaderCircle className="admin-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {busy ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          ) : (
            <section>
              <div className="admin-section-heading">
                <div>
                  <p className="label mono">Database / {currentSection.label}</p>
                  <h2>{currentSection.label}</h2>
                </div>
                <button className="btn-pill admin-add-button" type="button" onClick={() => startEditing(activeSection)}>
                  <Plus size={18} /> Add {activeSection === "skills" ? "skill" : activeSection === "projects" ? "project" : "record"}
                </button>
              </div>
              {loading ? (
                <p className="admin-empty">Loading records…</p>
              ) : currentRecords.length ? (
                <div className="admin-record-list">
                  {currentRecords.map((record) => (
                    <article className="admin-record" key={record.id}>
                      <div>
                        <h3>{recordTitle(activeSection, record)}</h3>
                        <p>
                          {activeSection === "projects"
                            ? `${record.type} project${record.kind ? ` · ${record.kind}` : ""}`
                            : activeSection === "education"
                              ? `${record.type} · ${record.organization || "No organization"}`
                              : record.type.replaceAll("_", " ")}
                        </p>
                      </div>
                      <div className="admin-record-actions">
                        <button className="btn-ghost" type="button" onClick={() => startEditing(activeSection, record)}>
                          Edit
                        </button>
                        <button
                          className="admin-icon-button danger"
                          type="button"
                          onClick={() => deleteRecord(activeSection, record)}
                          disabled={busy}
                          aria-label={`Delete ${recordTitle(activeSection, record)}`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty">
                  No records yet. Use the button above to add one.
                </p>
              )}
            </section>
          )}

          {editing && editing.section !== "about" && (
            <div className="admin-editor-backdrop" role="presentation">
              <section className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="admin-editor-title">
                <header className="admin-editor-header">
                  <div>
                    <p className="label mono">{editing.id == null ? "New record" : "Edit record"}</p>
                    <h2 id="admin-editor-title">{editing.id == null ? "Add" : "Edit"} {editing.section}</h2>
                  </div>
                  <button className="admin-icon-button" type="button" onClick={() => setEditing(null)} aria-label="Close editor" disabled={busy || uploadingFields.size > 0}>
                    <X size={20} />
                  </button>
                </header>
                <form className="admin-editor-form" onSubmit={saveRecord}>
                  <div className="admin-fields">
                    {renderFields(editing.section)}
                  </div>
                  <footer className="admin-editor-footer">
                    <button className="btn-ghost" type="button" onClick={() => setEditing(null)} disabled={busy || uploadingFields.size > 0}>
                      Cancel
                    </button>
                    <button className="btn-pill" type="submit" disabled={busy || uploadingFields.size > 0}>
                      {busy ? <LoaderCircle className="admin-spin" size={18} /> : <Save size={18} />}
                      {busy ? "Saving…" : "Save changes"}
                    </button>
                  </footer>
                </form>
              </section>
            </div>
          )}
          </section>
        </div>
      </div>
    </div>
  );
}
