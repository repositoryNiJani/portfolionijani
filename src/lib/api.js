import { supabase, imageUrl } from "./supabase.js";

const PORTFOLIO_CACHE_KEY = "portfolio-content-v1";

export function getCachedPortfolio(view) {
  try {
    const cached = sessionStorage.getItem(`${PORTFOLIO_CACHE_KEY}-${view}`);
    if (!cached) return null;

    const portfolio = JSON.parse(cached);
    if (view === "work" && Array.isArray(portfolio?.projects)) return portfolio;
    if (
      view === "about" &&
      portfolio?.about &&
      Array.isArray(portfolio.education) &&
      Array.isArray(portfolio.projects) &&
      Array.isArray(portfolio.skills)
    ) {
      return portfolio;
    }
  } catch {
    return null;
  }
  return null;
}

function cachePortfolio(view, portfolio) {
  try {
    sessionStorage.setItem(
      `${PORTFOLIO_CACHE_KEY}-${view}`,
      JSON.stringify(portfolio),
    );
  } catch {
    // The portfolio still works when browser storage is unavailable or full.
  }
}

export async function getPortfolio(view) {
  if (!supabase) throw new Error("aray boss may problema tayo");

  if (view === "work") {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, title, short_name, type, role, client, start_date, end_date, status, summary, description, highlights, tech_stack, image, images, live_url, repo_url",
      )
      .order("created_at")
      .order("id");
    if (error) throw error;

    const portfolio = {
      projects: data.map((project) => ({
        ...project,
        image: imageUrl(project.image),
        images: (project.images ?? [])
          .filter((image) => image?.src)
          .map((image) => ({ ...image, src: imageUrl(image.src) })),
      })),
    };
    cachePortfolio(view, portfolio);
    return portfolio;
  }

  const [about, education, projects, skills] = await Promise.all([
    supabase
      .from("about")
      .select("description, looking_for, location, image")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("education")
      .select("id, type, title, organization, description, year, image")
      .order("created_at")
      .order("id"),
    supabase.from("projects").select("id"),
    supabase.from("technical_skills").select("id, type, name, image"),
  ]);

  for (const r of [about, education, projects, skills]) {
    if (r.error) throw r.error;
  }
  if (!about.data) throw new Error("No profile record found in the about table.");

  const portfolio = {
    about: { ...about.data, image: imageUrl(about.data.image) },
    education: education.data.map((e) => ({ ...e, image: imageUrl(e.image) })),
    projects: projects.data,
    skills: skills.data.map((s) => ({ ...s, image: imageUrl(s.image) })),
  };
  cachePortfolio(view, portfolio);
  return portfolio;
}

// Saves a contact-form message (visitors can insert but never read).
export async function sendMessage({ name, email, type, cameFrom, message }) {
  if (!supabase) throw new Error("aray boss may problema tayo");
  const { error } = await supabase
    .from("contact_inquiries")
    .insert({
      name: name.trim(),
      email: email?.trim() || null,
      message_type: type,
      came_from: cameFrom?.trim() || "Portfolio - Contact Me",
      message: message.trim(),
    });
  if (error) throw error;
}
