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
import { MESSAGE_STATUSES, MESSAGE_TYPES } from "../../data/messages.js";
import AvailabilityCalendar from "./AvailabilityCalendar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

const SECTIONS = [
  { id: "about", label: "About", Icon: UserRound, table: "about" },
  { id: "education", label: "Education", Icon: GraduationCap, table: "education" },
  { id: "projects", label: "Projects", Icon: BriefcaseBusiness, table: "projects" },
  { id: "skills", label: "Skills", Icon: Wrench, table: "technical_skills" },
  { id: "messages", label: "Messages", Icon: Mail, table: "contact_inquiries" },
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
  ],
  projects: [
    { name: "title", label: "Title", required: true },
    { name: "short_name", label: "Short name (optional)", optional: true },
    {
      name: "type",
      label: "Project type",
      kind: "select",
      options: ["main", "side"],
      labels: { main: "Main Project", side: "Side Project" },
      required: true,
    },
    {
      name: "status",
      label: "Status",
      kind: "select",
      options: ["ongoing", "complete", "pending"],
      labels: { complete: "Complete", ongoing: "Ongoing", pending: "Pending" },
      defaultValue: "ongoing",
      required: true,
    },
    { name: "role", label: "Role", optional: true },
    { name: "client", label: "Client organization (optional)", optional: true },
    { name: "start_date", label: "Start date", type: "date", optional: true },
    { name: "end_date", label: "End date (optional)", type: "date", optional: true },
    { name: "summary", label: "Summary", kind: "textarea", optional: true },
    { name: "highlights", label: "Highlights (one per line)", kind: "lines", optional: true },
    { name: "tech_stack", label: "Technologies (one per line)", kind: "lines", optional: true },
    { name: "image", label: "Cover image (optional)", kind: "image", optional: true },
    {
      name: "images",
      label: "Documentation images (optional)",
      kind: "gallery",
      optional: true,
      hint: "Upload multiple images to display in the project modal carousel.",
    },
    { name: "live_url", label: "Live URL (optional)", type: "url", optional: true },
    { name: "repo_url", label: "Repository (optional)", type: "url", optional: true },
  ],
  skills: [
    {
      name: "type",
      label: "Group",
      kind: "select",
      options: [
        "web_interface",
        "data",
        "access_integrity",
        "other",
        "design_media",
        "documents_office",
      ],
      labels: {
        other: "Planning & delivery",
        design_media: "Design & media",
        documents_office: "Documents & office",
      },
      required: true,
    },
    { name: "name", label: "Skill", required: true },
    { name: "image", label: "Skill icon", kind: "image", optional: true },
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
  if (field.kind === "gallery") return JSON.stringify(Array.isArray(value) ? value : []);
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
    } else if (field.kind === "gallery") {
      try {
        const value = raw.trim() ? JSON.parse(raw) : [];
        if (
          !Array.isArray(value) ||
          value.some((image) => !image || typeof image.src !== "string" || !image.src.trim())
        ) {
          throw new Error("Documentation images must be a list of uploaded images.");
        }
        payload[field.name] = value;
      } catch (error) {
        throw new Error(error.message || "Documentation images must be valid.");
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
          (field.kind === "select"
            ? field.defaultValue || field.options[0]
            : field.kind === "gallery"
              ? []
              : ""),
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

  async function uploadImage(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length || uploading || disabled) return;
    if (field.kind !== "gallery" && files.length > 1) {
      setUploadError("Choose one image for this field.");
      return;
    }
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setUploadError("Choose image files.");
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setUploadError("Each image must be 10 MB or smaller.");
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
      const uploadedImages = [];
      for (const file of files) {
        const extension =
          file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "img";
        const uniqueId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const path = `images/${uniqueId}.${extension}`;
        const { error: storageError } = await supabase.storage
          .from("portfolio")
          .upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });
        if (storageError) throw storageError;
        uploadedImages.push({ src: path, alt: file.name });
      }
      if (field.kind === "gallery") {
        const existingImages = value ? JSON.parse(value) : [];
        onChange(field.name, JSON.stringify([...existingImages, ...uploadedImages]));
      } else {
        onChange(field.name, uploadedImages[0].src);
      }
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
            uploadImage(event.dataTransfer.files);
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
              uploadImage(event.target.files);
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

  if (field.kind === "gallery") {
    const images = value ? JSON.parse(value) : [];
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
            uploadImage(event.dataTransfer.files);
          }}
        >
          {images.length > 0 && (
            <div className="admin-gallery-previews">
              {images.map((image, index) => (
                <div className="admin-gallery-item" key={`${image.src}-${index}`}>
                  <img
                    className="admin-image-preview"
                    src={imageUrl(image.src)}
                    alt={image.alt || `Documentation image ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      onChange(
                        field.name,
                        JSON.stringify(images.filter((_, imageIndex) => imageIndex !== index)),
                      )
                    }
                    disabled={disabled || uploading}
                    aria-label={`Remove documentation image ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <Upload size={22} aria-hidden="true" />
          <p>{uploading ? "Uploading images…" : "Drop images here or choose files"}</p>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => fileInput.current?.click()}
            disabled={disabled || uploading}
          >
            Browse images
          </button>
          <small>Images up to 10 MB each are uploaded to Supabase Storage.</small>
          <input
            ref={fileInput}
            className="admin-image-input"
            type="file"
            accept="image/*"
            multiple
            aria-label={`Upload ${field.label.toLowerCase()}`}
            onChange={(event) => {
              uploadImage(event.target.files);
              event.target.value = "";
            }}
            disabled={disabled || uploading}
          />
        </div>
        {field.hint && <small>{field.hint}</small>}
        {uploadError && (
          <small className="admin-image-error" role="alert">
            {uploadError}
          </small>
        )}
      </div>
    );
  }

  return (
    <label className={`admin-field${field.kind === "textarea" || field.kind === "lines" ? " admin-field-wide" : ""}`}>
      <span>{field.label}</span>
      {field.kind === "select" ? (
        <select {...controlProps}>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {field.labels?.[option] || option.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ) : field.kind === "textarea" || field.kind === "lines" ? (
        <textarea {...controlProps} rows={4} />
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
  const [listSearch, setListSearch] = useState("");
  const [educationTypeFilter, setEducationTypeFilter] = useState("all");
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState("all");
  const [skillTypeFilter, setSkillTypeFilter] = useState("all");
  const [messageTypeFilter, setMessageTypeFilter] = useState("all");
  const [messageSourceFilter, setMessageSourceFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDraft, setMessageDraft] = useState({ status: "pending", favorite: false });

  const loadRecords = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all([
        supabase.from("about").select("*").order("id").limit(1),
        supabase.from("education").select("*").order("created_at").order("id"),
        supabase.from("projects").select("*").order("created_at").order("id"),
        supabase.from("technical_skills").select("*").order("created_at").order("id"),
        supabase
          .from("contact_inquiries")
          .select("*")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false }),
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

  function openMessage(record) {
    setSelectedMessage(record);
    setMessageDraft({
      status: record.status || "pending",
      favorite: record.favorite === true,
    });
    setError("");
    setNotice("");
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
      return false;
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
      return true;
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete this record.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveMessageDetails() {
    if (!supabase || !selectedMessage) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const { data, error: updateError } = await supabase
        .from("contact_inquiries")
        .update(messageDraft)
        .eq("id", selectedMessage.id)
        .select("*")
        .single();
      if (updateError) throw updateError;
      setSelectedMessage(data);
      setNotice("Message details saved.");
      await loadRecords();
    } catch (updateError) {
      setError(updateError.message || "Could not update this message.");
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
  const messageSources = [
    ...new Set(records.messages.map((record) => record.came_from).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b));
  const filteredMessages = records.messages.filter(
    (record) =>
      (messageTypeFilter === "all" || record.message_type === messageTypeFilter) &&
      (messageSourceFilter === "all" || record.came_from === messageSourceFilter),
  );
  const search = listSearch.trim().toLocaleLowerCase();
  const filteredRecords = currentRecords.filter((record) => {
    if (activeSection === "education" && educationTypeFilter !== "all" && record.type !== educationTypeFilter) {
      return false;
    }
    if (activeSection === "projects") {
      if (projectTypeFilter !== "all" && record.type !== projectTypeFilter) return false;
      if (projectStatusFilter !== "all" && record.status !== projectStatusFilter) return false;
    }
    if (activeSection === "skills" && skillTypeFilter !== "all" && record.type !== skillTypeFilter) {
      return false;
    }

    const searchFields =
      activeSection === "education"
        ? [record.title, record.organization, record.year, record.type]
        : activeSection === "projects"
          ? [
              record.title,
              record.short_name,
              record.role,
              record.client,
              record.summary,
              ...(record.highlights || []),
              ...(record.tech_stack || []),
            ]
          : [record.name, record.type];
    return searchFields
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(search);
  });
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
          setListSearch("");
          setSelectedMessage(null);
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
                    onClick={() => {
                      setListSearch("");
                      setActiveSection(id);
                    }}
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
          ) : activeSection === "calendar" ? (
            <AvailabilityCalendar />
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
              <div className="admin-inquiry-filters">
                <label className="admin-list-filter">
                  <span>Message type</span>
                  <select
                    value={messageTypeFilter}
                    onChange={(event) => setMessageTypeFilter(event.target.value)}
                  >
                    <option value="all">All types</option>
                    {MESSAGE_TYPES.map((messageType) => (
                      <option key={messageType.value} value={messageType.value}>
                        {messageType.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-list-filter">
                  <span>Where it came from</span>
                  <select
                    value={messageSourceFilter}
                    onChange={(event) => setMessageSourceFilter(event.target.value)}
                  >
                    <option value="all">All sources</option>
                    {messageSources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {loading ? (
                <p className="admin-empty">Loading messages…</p>
              ) : filteredMessages.length ? (
                <div className="admin-message-table-wrap">
                  <table className="admin-message-table">
                    <thead>
                      <tr>
                        <th>Received</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Favorite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.map((record) => (
                        <tr
                          key={record.id}
                          tabIndex={0}
                          aria-label={`Open message from ${record.name}`}
                          onClick={() => openMessage(record)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openMessage(record);
                            }
                          }}
                        >
                          <td>{new Date(record.created_at).toLocaleString()}</td>
                          <td>
                            {MESSAGE_TYPES.find((item) => item.value === record.message_type)?.label ||
                              record.message_type}
                          </td>
                          <td>{record.came_from}</td>
                          <td>{record.name}</td>
                          <td>{record.status}</td>
                          <td>{record.favorite ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-empty">
                  {records.messages.length
                    ? "No messages match the selected filters."
                    : "No contact messages yet."}
                </p>
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
              {["education", "projects", "skills"].includes(activeSection) && (
                <div className="admin-list-controls">
                  <label className="admin-list-search">
                    <span>Search {activeSection}</span>
                    <input
                      type="search"
                      value={listSearch}
                      onChange={(event) => setListSearch(event.target.value)}
                      placeholder={`Search ${activeSection}...`}
                    />
                  </label>
                  {activeSection === "education" && (
                    <label className="admin-list-filter">
                      <span>Type</span>
                      <select
                        value={educationTypeFilter}
                        onChange={(event) => setEducationTypeFilter(event.target.value)}
                      >
                        <option value="all">All types</option>
                        <option value="degree">Degree</option>
                        <option value="certificate">Certificate</option>
                      </select>
                    </label>
                  )}
                  {activeSection === "projects" && (
                    <>
                      <label className="admin-list-filter">
                        <span>Project type</span>
                        <select
                          value={projectTypeFilter}
                          onChange={(event) => setProjectTypeFilter(event.target.value)}
                        >
                          <option value="all">All project types</option>
                          <option value="main">Main Project</option>
                          <option value="side">Side Project</option>
                        </select>
                      </label>
                      <label className="admin-list-filter">
                        <span>Status</span>
                        <select
                          value={projectStatusFilter}
                          onChange={(event) => setProjectStatusFilter(event.target.value)}
                        >
                          <option value="all">All statuses</option>
                          <option value="complete">Complete</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="pending">Pending</option>
                        </select>
                      </label>
                    </>
                  )}
                  {activeSection === "skills" && (
                    <label className="admin-list-filter">
                      <span>Group</span>
                      <select
                        value={skillTypeFilter}
                        onChange={(event) => setSkillTypeFilter(event.target.value)}
                      >
                        <option value="all">All groups</option>
                        <option value="web_interface">Web interface</option>
                        <option value="data">Data</option>
                        <option value="access_integrity">Access integrity</option>
                        <option value="other">Planning &amp; delivery</option>
                        <option value="design_media">Design &amp; media</option>
                        <option value="documents_office">Documents &amp; office</option>
                      </select>
                    </label>
                  )}
                </div>
              )}
              {loading ? (
                <p className="admin-empty">Loading records…</p>
              ) : filteredRecords.length ? (
                <div className="admin-record-list">
                  {filteredRecords.map((record) => (
                    <article className="admin-record" key={record.id}>
                      <div>
                        <h3>{recordTitle(activeSection, record)}</h3>
                        <p>
                          {activeSection === "projects"
                            ? `${record.type === "main" ? "Main" : "Side"} Project · ${record.status || "ongoing"}`
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
                  {currentRecords.length
                    ? "No records match the current search and filters."
                    : "No records yet. Use the button above to add one."}
                </p>
              )}
            </section>
          )}

          {selectedMessage && (
            <div
              className="admin-editor-backdrop"
              role="presentation"
              onClick={() => setSelectedMessage(null)}
            >
              <section
                className="admin-editor admin-inquiry-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-inquiry-title"
                onClick={(event) => event.stopPropagation()}
              >
                <header className="admin-editor-header">
                  <div>
                    <p className="label mono">Inbox / Message #{selectedMessage.id}</p>
                    <h2 id="admin-inquiry-title">{selectedMessage.name}</h2>
                  </div>
                  <button
                    className="admin-icon-button"
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    disabled={busy}
                    aria-label="Close message details"
                  >
                    <X size={20} />
                  </button>
                </header>
                <div className="admin-inquiry-body">
                  {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}
                  {notice && <p className="admin-alert" role="status">{notice}</p>}
                  <dl className="admin-inquiry-details">
                    <div>
                      <dt>Email</dt>
                      <dd>
                        {selectedMessage.email ? (
                          <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                        ) : (
                          "Not provided"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Type of message</dt>
                      <dd>
                        {MESSAGE_TYPES.find((item) => item.value === selectedMessage.message_type)?.label ||
                          selectedMessage.message_type}
                      </dd>
                    </div>
                    <div>
                      <dt>Came from</dt>
                      <dd>{selectedMessage.came_from}</dd>
                    </div>
                    <div>
                      <dt>Created at</dt>
                      <dd>{new Date(selectedMessage.created_at).toLocaleString()}</dd>
                    </div>
                    <div className="admin-inquiry-message">
                      <dt>Message</dt>
                      <dd>{selectedMessage.message}</dd>
                    </div>
                  </dl>
                  <div className="admin-inquiry-edit">
                    <label className="admin-field">
                      Status
                      <select
                        value={messageDraft.status}
                        onChange={(event) =>
                          setMessageDraft((current) => ({ ...current, status: event.target.value }))
                        }
                      >
                        {MESSAGE_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-inquiry-favorite">
                      <input
                        type="checkbox"
                        checked={messageDraft.favorite}
                        onChange={(event) =>
                          setMessageDraft((current) => ({
                            ...current,
                            favorite: event.target.checked,
                          }))
                        }
                      />
                      Favorite
                    </label>
                  </div>
                </div>
                <footer className="admin-editor-footer">
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={async () => {
                      if (await deleteRecord("messages", selectedMessage)) {
                        setSelectedMessage(null);
                      }
                    }}
                    disabled={busy}
                  >
                    Delete message
                  </button>
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    disabled={busy}
                  >
                    Close
                  </button>
                  <button
                    className="btn-pill"
                    type="button"
                    onClick={saveMessageDetails}
                    disabled={busy}
                  >
                    {busy ? "Saving…" : "Save changes"}
                  </button>
                </footer>
              </section>
            </div>
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
