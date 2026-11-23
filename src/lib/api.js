import { supabase, imageUrl } from "./supabase.js";

// Loads all portfolio content in one go.
export async function getPortfolio() {
  if (!supabase) throw new Error("Supabase is not configured (.env missing)");

  const [about, education, projects, skills] = await Promise.all([
    supabase.from("about").select("*").limit(1).maybeSingle(),
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("projects").select("*").order("sort_order"),
    supabase.from("technical_skills").select("*").order("sort_order"),
  ]);

  for (const r of [about, education, projects, skills]) {
    if (r.error) throw r.error;
  }
  if (!about.data) throw new Error("No profile record found in the about table.");

  return {
    about: { ...about.data, image: imageUrl(about.data.image) },
    education: education.data.map((e) => ({ ...e, image: imageUrl(e.image) })),
    projects: projects.data.map((p) => ({
      ...p,
      image: imageUrl(p.image),
      images: (p.images ?? [])
        .filter((image) => image?.src)
        .map((image) => ({ ...image, src: imageUrl(image.src) })),
    })),
    skills: skills.data.map((s) => ({ ...s, image: imageUrl(s.image) })),
  };
}

// Saves a contact-form message (visitors can insert but never read).
export async function sendMessage({ name, email, message }) {
  if (!supabase) throw new Error("Supabase is not configured (.env missing)");
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name: name.trim(), email: email?.trim() || null, message: message.trim() });
  if (error) throw error;
}
