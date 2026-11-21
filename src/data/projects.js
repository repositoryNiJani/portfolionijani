// Project data. To add screenshots, put image files in /public/projects/
// and list their paths in `images`, for example:
//   images: [{ src: "/projects/step-1.png", alt: "STEP dashboard" }]
// To show an "Open project" button, add `live` (and/or `repo`).

export const FOLDERS = {
  main: {
    label: "Main Projects",
    path: "Desktop › MAIN PROJECTS",
    description: "School and client projects",
    items: [
      {
        id: "step",
        name: "STEP",
        full: "School Transparency and Engagement Portal (STEP)",
        kind: "School project",
        summary:
          "A student portal that makes student-government project spending and transactions easy to trace.",
        meta: "Web Developer, Project Manager, System Architect · SADU, Kolehiyo ng Lungsod ng Dasmariñas · Feb 2025 – Present",
        bullets: [
          "Led design and development of a platform that lets students trace how the Central Student Government spends project live budgets, with each transaction visible from start to finish.",
          "Built a tamper-evident ledger that chains each approved project to the previous one with SHA-256 hashes, so any altered record can be detected and students can independently verify spending.",
          "Implemented authentication and role-based access control; every transaction is verified by the CSG council and the system administrator.",
          "Own the project timeline and requirements, and designed the system architecture and database.",
        ],
        tags: ["Laravel", "React", "MySQL"],
        images: [],
      },
      {
        id: "scheduling",
        name: "Employee Scheduling",
        full: "Employee Scheduling System",
        kind: "Client project",
        summary:
          "A client system that assigns employee shifts based on availability and keeps scheduling records.",
        meta: "Web Developer, System Architect · GLM Bakery (client project) · Feb – May 2025",
        bullets: [
          "Gathered requirements from the owner and designed the architecture and database for a system that assigns employees to dates based on their availability.",
          "Replaced manual scheduling with automatic schedule switching and record keeping.",
        ],
        tags: ["PHP", "JavaScript", "Bootstrap", "MySQL"],
        images: [],
      },
      {
        id: "library",
        name: "Book Borrowing",
        full: "Book Borrowing System",
        kind: "School project",
        summary:
          "A library system for requesting books, tracking due dates, and applying late penalties.",
        meta: "Web Developer · School project · Nov 2024",
        bullets: [
          "Built a system for requesting books and tracking borrow dates, with automatic penalties for late or unreturned books.",
        ],
        tags: ["PHP", "MySQL", "Bootstrap", "HTML"],
        images: [],
      },
    ],
  },
  side: {
    label: "Side Projects",
    path: "Desktop › SIDE PROJECTS",
    description: "Independent projects and contributions",
    items: [
      {
        id: "contreebution",
        name: "Contreebution",
        full: "Contreebution",
        kind: "Side project",
        summary:
          "A visual GitHub contribution tracker featured in my portfolio.",
        meta: "Side project",
        bullets: [
          "Displays GitHub contribution activity as an interactive visual tree.",
        ],
        tags: [],
        images: [],
        live: "https://contreebution.vercel.app/",
      },
      {
        id: "bloomail",
        name: "Bloomail",
        full: "Bloomail",
        kind: "Side project",
        summary: "More details coming soon.",
        meta: "Side project",
        bullets: [],
        tags: [],
        images: [],
      },
    ],
  },
};
