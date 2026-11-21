// All portfolio text lives here, so the views stay free of content.
// Everything below comes from the previous version of the site.

export const PROFILE = {
  name: "Jhonny M. Sumulong",
  shortName: "Jhonny Sumulong",
  brand: "JANI",
  eyebrow: "Web developer / BSIS",
  tagline: "Explore my work and experience",
  status: "Open for work",
  email: "xdjohnnysumulong12@gmail.com",
  phone: "0939 833 1593",
  phoneHref: "+639398331593",
  location: "Dasmariñas City, Cavite",
  coordinates: "14.3294° N",
  github: "https://github.com/repositoryNiJani",
  githubHandle: "repositoryNiJani",
  linkedin: "https://linkedin.com/in/jhonny-sumulong",
  linkedinHandle: "jhonny-sumulong",
  resumePdf: "/Jhonny_Sumulong_Resume.pdf",
  treeEmbed:
    "https://contreebution.vercel.app/?u=repositoryniJani&type=cherry&season=winter&leaf=pixel&color=6ad0c8&embed=1",
};

export const ABOUT = {
  bio: "I’m Jhonny M. Sumulong, a BSIS student at Kolehiyo ng Lungsod ng Dasmariñas and a web developer who works with Laravel, React, and MySQL. I’ve designed and built database-driven systems for a local business and a student-government transparency portal.",
  facts: [
    { label: "Based in", value: "Dasmariñas City, Cavite" },
    { label: "Studying", value: "BS Information Systems, 2023 – Present" },
    {
      label: "Looking for",
      value: "An OJT in information systems or web development",
    },
  ],
};

export const BUSINESS = {
  title: "How I can help your business grow",
  intro:
    "I build practical web tools that save time, organize work, and make it easier for customers to reach you.",
  cards: [
    {
      index: "01",
      kicker: "Automate",
      title: "Give your team time back",
      text: "Automate repetitive tasks like scheduling and record keeping, so your team can spend less time on manual work and more time serving customers.",
    },
    {
      index: "02",
      kicker: "Organize",
      title: "Keep operations organized",
      text: "Put important information into clear, reliable systems with the right access for each person, building on my experience with business scheduling and transparent records.",
    },
    {
      index: "03",
      kicker: "Connect",
      title: "Help customers reach you",
      text: "Create a responsive website or portal that explains what you offer and gives potential customers a simple way to get in touch.",
    },
  ],
  why: "Because you can trust me to make it happen.",
  note: "I’ll learn how your business works first and focus on practical improvements, not promise a specific revenue number.",
  cta: "Let’s talk about your business",
};

// `icon` is an id in /public/sprites.svg
export const SKILLS = {
  title: "Technical skills",
  intro: "A clear view of the tools I use and the work they help me deliver.",
  groups: [
    {
      index: "01",
      title: "Websites & interfaces",
      text: "Responsive, easy-to-use pages that help customers understand your services and take the next step.",
      items: [
        { name: "HTML5", icon: "l-html", image: "/html.png" },
        { name: "CSS3", icon: "l-css", image: "/css.png" },
        { name: "JavaScript", icon: "l-js", image: "/js.png" },
        { name: "React", icon: "l-react", image: "/react.png" },
        { name: "Bootstrap", icon: "l-bs", image: "/bootstrap.png" },
      ],
    },
    {
      index: "02",
      title: "Business systems & data",
      text: "Web applications that organize everyday work, reduce manual tracking, and keep records in one place.",
      items: [
        { name: "PHP", icon: "l-php", image: "/php.png" },
        { name: "Laravel", icon: "l-laravel", image: "/laravel.png" },
        { name: "MySQL", icon: "l-mysql", image: "/mysql.png" },
        { name: "SQL", icon: "l-db" },
        { name: "Database design", icon: "l-db" },
      ],
    },
    {
      index: "03",
      title: "Access & record integrity",
      text: "Practical safeguards that help the right people access information and make important changes traceable.",
      items: [
        { name: "Authentication", icon: "l-key" },
        { name: "Role-based access", icon: "l-lock" },
        { name: "SHA-256 audit ledger", icon: "l-chain" },
      ],
    },
    {
      index: "04",
      title: "Planning & delivery",
      text: "Tools for planning a system before development, tracking changes, and sharing clear project documentation.",
      items: [
        { name: "Git", icon: "l-git", image: "/git.png" },
        { name: "GitHub", icon: "l-gh", image: "/github.png" },
        { name: "Draw.io", icon: "l-drawio", image: "/draw.png" },
        { name: "Figma", icon: "l-figma", image: "/figma.png" },
        { name: "Word", icon: "l-word", image: "/word.png" },
        { name: "Excel", icon: "l-excel", image: "/excel.png" },
        { name: "PowerPoint", icon: "l-ppt", image: "/ppt.png" },
        { name: "AI coding assistants", icon: "l-ai" },
      ],
    },
  ],
};

export const EDUCATION = [
  {
    title: "BS Information Systems",
    org: "Kolehiyo ng Lungsod ng Dasmariñas",
    when: "2023 – Present",
    kind: "Degree",
    image: "/404.svg",
    imageAlt: "BS Information Systems education preview",
  },
  {
    title: "Introduction to Cybersecurity",
    org: "Cisco",
    when: "March 2025",
    kind: "Certificate",
    image: "/404.svg",
    imageAlt: "Introduction to Cybersecurity certificate preview",
  },
  {
    title: "Ethical Hacker",
    org: "Cisco",
    when: "March 2025",
    kind: "Certificate",
    image: "/404.svg",
    imageAlt: "Ethical Hacker certificate preview",
  },
];

export const SOCIALS = [
  {
    name: "GitHub",
    sub: "repositoryNiJani",
    href: "https://github.com/repositoryNiJani",
    icon: "l-gh",
  },
  {
    name: "LinkedIn",
    sub: "jhonny-sumulong",
    href: "https://www.linkedin.com/in/jhonny-sumulong-a2441a208/",
    icon: "s-in",
  },
  {
    name: "Instagram",
    sub: "Say hi on Instagram",
    href: "https://www.instagram.com/_jhniiii/",
    icon: "s-ig",
  },
  {
    name: "Facebook",
    sub: "Message me on Facebook",
    href: "https://www.facebook.com/janiii25",
    icon: "s-fb",
  },
  {
    name: "Discord",
    sub: "Chat on Discord",
    href: "https://discord.gg/AUQQSRNuK",
    icon: "s-dc",
  },
  {
    name: "Email",
    sub: "Send me an email",
    href: "mailto:xdjohnnysumulong12@gmail.com",
    icon: "s-mail",
  },
];

export const RESUME = {
  summary:
    "BSIS student at Kolehiyo ng Lungsod ng Dasmariñas and web developer (Laravel, React, MySQL) who has designed and built database-driven systems for a local business and a student-government transparency portal. Experienced in role-based access control, audit logging, database design. Seeking an OJT in information systems or web development related jobs.",
  skills: [
    ["Languages", "PHP, JavaScript, SQL, HTML5, CSS3"],
    ["Frameworks", "Laravel, React, Bootstrap"],
    ["Database", "MySQL, database design and normalization"],
    [
      "Security",
      "Role-based access control, authentication, SHA-256 hash-chained audit ledger",
    ],
    [
      "Tools",
      "Git, GitHub, Draw.io (flowcharts, ERDs), AI coding assistants (all generated code reviewed and tested)",
    ],
    ["Office", "Microsoft Word, Excel, PowerPoint"],
  ],
  projects: [
    {
      title: "School Transparency and Engagement Portal (STEP)",
      when: "Feb 2025 – Present",
      meta: "Laravel, React, MySQL | Web Developer, Project Manager, System Architect | SADU, Kolehiyo ng Lungsod ng Dasmariñas",
      bullets: [
        "Led design and development of a platform that lets students trace how the Central Student Government spends project live budgets, with each transaction visible from start to finish.",
        "Built a tamper-evident ledger that chains approved projects with SHA-256 hashes, so altered records can be detected and students can verify spending.",
        "Implemented authentication and role-based access control; transactions are verified by the CSG council and system administrator.",
        "Managed project requirements and timeline, and designed the system architecture and database.",
      ],
    },
    {
      title: "Employee Scheduling System",
      when: "Feb – May 2025",
      meta: "PHP, JavaScript, Bootstrap, MySQL | Web Developer, System Architect | GLM Bakery (client project)",
      bullets: [
        "Gathered requirements from the owner and designed the architecture and database for a system that assigns employees to dates based on availability.",
        "Replaced manual scheduling with automatic schedule switching and record keeping.",
      ],
    },
    {
      title: "Book Borrowing System",
      when: "Nov 2024",
      meta: "PHP, MySQL, Bootstrap, HTML | Web Developer | Academic project",
      bullets: [
        "Built a system for requesting books and tracking borrow dates, with automatic penalties for late or unreturned books.",
      ],
    },
  ],
  education: {
    title: "Bachelor of Science in Information Systems (BSIS)",
    org: "Kolehiyo ng Lungsod ng Dasmariñas",
    when: "2023 – Present",
  },
  certifications: [
    { title: "Introduction to Cybersecurity, Cisco", when: "March 2025" },
  ],
};
