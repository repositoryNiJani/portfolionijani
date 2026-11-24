import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight } from "lucide-react";
import { BigFolder } from "../../components/Icons.jsx";
import { FOLDERS } from "../../data/projects.js";

const formatDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
};

function toProjectItem(project) {
  const start = formatDate(project.start_date);
  const end = formatDate(project.end_date) || (start ? "Present" : "");
  const images = (project.images || []).filter((image) => image?.src);

  return {
    id: project.id ?? project.short_name ?? project.title,
    name: project.short_name || project.title,
    full: project.title,
    kind: project.type === "main" ? "Main Project" : "Side Project",
    status: project.status || "ongoing",
    summary: project.summary || project.description || "",
    meta: [project.role, project.client, [start, end].filter(Boolean).join(" – ")]
      .filter(Boolean)
      .join(" · "),
    bullets: project.highlights || [],
    tags: project.tech_stack || [],
    cover: project.image ? { src: project.image, alt: `${project.title} cover` } : null,
    images,
    live: project.live_url,
    repo: project.repo_url,
  };
}

function DocumentationCarousel({ images, name, initialIndex }) {
  const [index, setIndex] = useState(initialIndex);
  const activeImage = images[index];

  useEffect(() => {
    if (images.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (!activeImage) {
    return (
      <div className="preview-modal-empty">
        <img
          src="/404.svg"
          alt="404 - no preview available"
          className="preview-modal-404"
        />
      </div>
    );
  }

  return (
    <div className="documentation-carousel" aria-label={`${name} documentation images`}>
      <img
        key={activeImage.src}
        className="preview-modal-image documentation-carousel-image"
        src={activeImage.src}
        alt={activeImage.alt ?? `${name} screenshot`}
      />
      {images.length > 1 && (
        <div className="documentation-carousel-controls">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)}
            aria-label="Previous documentation image"
          >
            Previous
          </button>
          <div className="documentation-carousel-dots" role="group" aria-label="Choose a documentation image">
            {images.map((image, imageIndex) => (
              <button
                key={`${image.src}-${imageIndex}`}
                type="button"
                aria-label={`Show documentation image ${imageIndex + 1}`}
                aria-pressed={imageIndex === index}
                onClick={() => setIndex(imageIndex)}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIndex((current) => (current + 1) % images.length)}
            aria-label="Next documentation image"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Projects are shown like a file explorer: pick a tab, pick a folder, read the preview.
function Gallery({ images, name, onOpen }) {
  const [i, setI] = useState(0);
  if (!images.length) {
    return (
      <button
        type="button"
        className="shot shot-empty shot-open"
        onClick={() => onOpen(null)}
        aria-label={`Open ${name} preview`}
      >
        <img
          src="/404.svg"
          alt="404 - no preview available"
          className="shot-404-img"
        />
      </button>
    );
  }
  const current = images[Math.min(i, images.length - 1)];
  return (
    <div className="shot">
      <button
        type="button"
        className="shot-open-image"
        onClick={() => onOpen(current)}
        aria-label={`Open ${name} preview image`}
      >
        <img src={current.src} alt={current.alt ?? `${name} screenshot`} />
      </button>
      {images.length > 1 && (
        <div className="shot-dots" role="group" aria-label="Choose a screenshot">
          {images.map((img, n) => (
            <button
              key={img.src}
              type="button"
              aria-label={`Show screenshot ${n + 1}`}
              aria-pressed={n === i}
              onClick={() => setI(n)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Work({ portfolio, go }) {
  const folders = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(FOLDERS).map(([id, folder]) => [
          id,
          {
            ...folder,
            items: portfolio.projects
              .filter((project) => project.type === id)
              .map(toProjectItem),
          },
        ]),
      ),
    [portfolio.projects],
  );
  const [folderId, setFolderId] = useState("main");
  const [selectedId, setSelectedId] = useState(FOLDERS.main.items[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(null);

  const folder = folders[folderId];
  const query = searchQuery.trim().toLocaleLowerCase();
  const filteredItems = folder.items.filter((item) =>
    [item.name, item.full, item.kind, item.summary, ...item.tags]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query),
  );
  const project =
    filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;

  const pickFolder = (id) => {
    setFolderId(id);
    setSelectedId(folders[id].items[0]?.id ?? null);
  };

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  return (
    <div className="stack">
      <div className="view-head">
        <div>
          <p className="label mono">02 / Selected</p>
          <h1 data-view-title tabIndex={-1} className="view-title">
            PROJECTS
          </h1>
        </div>
        <div className="tabs" role="group" aria-label="Project folders">
          {Object.entries(folders).map(([id, f]) => (
            <button
              key={id}
              type="button"
              className="tab"
              aria-pressed={folderId === id}
              onClick={() => pickFolder(id)}
            >
              {f.label}
              <span className="mono">{String(f.items.length).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="work-grid">
        <section className="glass explorer" aria-label={`${folder.label} contents`}>
          <div className="explorer-bar">
            <span className="pill pill-light mono">{folder.path}</span>
            <span className="mono count">
              {query ? `${filteredItems.length} of ${folder.items.length}` : folder.items.length} items
            </span>
          </div>
          <label className="work-search">
            <input
              type="search"
              aria-label="Search projects"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search projects..."
            />
          </label>
          <div className="folders">
            {filteredItems.length > 0 ? (
              filteredItems.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="folder"
                  aria-pressed={p.id === project?.id}
                  onClick={() => setSelectedId(p.id)}
                >
                  <BigFolder active={p.id === project.id} />
                  <span>{p.name}</span>
                </button>
              ))
            ) : (
              <p className="work-search-empty">
                {folder.items.length === 0
                  ? "No projects have been added to this group yet."
                  : `No projects match “${searchQuery.trim()}”.`}
              </p>
            )}
          </div>
        </section>

        <aside className="preview" aria-live="polite" aria-label="Project preview">
          {!project ? (
            <p className="work-preview-empty">Search for a project to see its preview.</p>
          ) : (
            <>
              <p className="label label-light mono">Preview</p>
              <Gallery
                key={project.id}
                images={project.cover ? [project.cover] : project.images}
                name={project.name}
                onOpen={(image) => {
                  const images = project.images.length
                    ? project.images
                    : project.cover
                      ? [project.cover]
                      : [];
                  const initialIndex = Math.max(
                    0,
                    images.findIndex((item) => item.src === image?.src),
                  );
                  setModal({
                    images,
                    initialIndex,
                    name: project.name,
                    full: project.full,
                    kind: project.kind,
                    status: project.status,
                    meta: project.meta,
                    summary: project.summary,
                  });
                }}
              />
              <h2>{project.full}</h2>
              <div className="project-labels">
                <span className="tag-light project-label">{project.kind}</span>
                <span className={`tag-light project-label project-status status-${project.status}`}>
                  {project.status}
                </span>
              </div>
              {project.summary && <p className="summary">{project.summary}</p>}
              {project.meta && <p className="meta mono">{project.meta}</p>}
              {project.bullets.length > 0 && (
                <ul className="bullets">
                  {project.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {project.tags.length > 0 && (
                <ul className="tags" aria-label="Technologies">
                  {project.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <div className="links">
                {project.live && (
                  <a className="btn-light" href={project.live} target="_blank" rel="noopener">
                    Open project
                    <span className="btn-arrow">
                      <ArrowUpRight size={16} />
                    </span>
                  </a>
                )}
                {project.repo && (
                  <a className="btn-ghost" href={project.repo} target="_blank" rel="noopener">
                    Source code
                  </a>
                )}
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() =>
                    go(`contact?came_from=${encodeURIComponent(project.full)}`)
                  }
                >
                  Contact about this project
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {modal &&
        createPortal(
          <div
            className="preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${modal.full || modal.name} preview`}
            onClick={() => setModal(null)}
          >
            <div className="preview-modal-inner" onClick={(e) => e.stopPropagation()}>
              <div className="preview-modal-header">
                <h2>{modal.full || modal.name}</h2>
                <button
                  type="button"
                  className="preview-modal-close"
                  onClick={() => setModal(null)}
                  aria-label="Close preview"
                >
                  &times;
                </button>
              </div>
              <div className="preview-modal-body">
                <DocumentationCarousel
                  images={modal.images}
                  name={modal.name}
                  initialIndex={modal.initialIndex}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
