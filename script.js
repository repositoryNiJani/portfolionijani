(function () {
  var solo = document.getElementById("solo"),
    heroToggle = document.getElementById("hero-toggle"),
    hero = document.getElementById("top"),
    tip = document.getElementById("tip"),
    cards = [].slice.call(document.querySelectorAll(".pc"));
  var names = ["About", "How I help", "Skills", "Projects", "Contact"],
    stage = 0;
  function label() {
    cards.forEach(function (c, i) {
      var f = c.classList.contains("flipped");
      c.tabIndex = stage === 0 ? -1 : 0;
      c.setAttribute(
        "aria-label",
        f ? "Go to " + names[i] : "Turn over card " + (i + 1),
      );
      c.setAttribute("aria-hidden", stage === 0 ? "true" : "false");
    });
    solo.tabIndex = stage === 0 ? 0 : -1;
    solo.setAttribute("aria-hidden", stage === 0 ? "false" : "true");
    heroToggle.setAttribute(
      "aria-label",
      stage === 0
        ? "Open the portfolio cards"
        : "Return the cards to their starting position",
    );
  }
  function set(s) {
    stage = s;
    hero.className = "hero s" + s;
    layout();
    tip.textContent =
      s === 0
        ? "Tap the card to begin."
        : cards.some(function (c) {
              return c.classList.contains("flipped");
            })
          ? "Tap a turned card to jump to that section."
          : "Tap a card to turn it over.";
    label();
  }
  function toggleHero() {
    set(stage === 0 ? 1 : 0);
  }
  solo.addEventListener("click", function () {
    if (stage === 0) set(1);
  });
  heroToggle.addEventListener("click", toggleHero);
  cards.forEach(function (c) {
    c.addEventListener("click", function (e) {
      if (stage === 0) {
        e.preventDefault();
        return;
      }
      if (!c.classList.contains("flipped")) {
        e.preventDefault();
        c.classList.add("flipped");
        set(1);
      }
    });
  });
  function layout() {
    var W = hero.clientWidth,
      H = hero.clientHeight,
      deck = document.getElementById("deck");
    var phone = W < 700,
      g = phone ? 10 : Math.max(8, Math.min(20, W * 0.014)),
      w,
      ch,
      xs,
      ys;
    if (phone) {
      w = Math.max(
        64,
        Math.min(104, (W - 32 - 2 * g) / 3, ((H - 282 - g) / 2) * 0.6),
      );
      ch = (w * 5) / 3;
      xs = [-1, 0, 1, -0.5, 0.5].map(function (m) {
        return m * (w + g);
      });
      ys = [-(ch + g), -(ch + g), -(ch + g), 0, 0];
    } else {
      ch = Math.max(150, Math.min(383, (H - 282) / 1.15));
      w = Math.min(ch * 0.6, (W - 32 - 4 * g) / 5);
      ch = (w * 5) / 3;
      xs = [-2, -1, 0, 1, 2].map(function (m) {
        return m * (w + g);
      });
      ys = [0, 0, 0, 0, 0];
    }
    hero.style.setProperty("--w", w + "px");
    hero.style.setProperty("--g", g + "px");
    hero.style.setProperty("--h", ch + "px");
    deck.style.bottom = (phone ? 96 : 46) + "px";
    var sw = phone ? Math.min(150, W * 0.4) : Math.min(230, Math.max(w, 170)),
      sh = (sw * 5) / 3,
      V = 0.42 * sh;
    solo.style.width = sw + "px";
    solo.style.marginLeft = -sw / 2 + "px";
    solo.style.bottom = -(sh - V) + "px";
    tip.style.bottom = (stage === 0 ? V + 30 : phone ? 66 : 14) + "px";
    cards.forEach(function (c, i) {
      c.style.setProperty("--x", xs[i] + "px");
      c.style.setProperty("--y", ys[i] + "px");
    });
  }
  window.addEventListener("resize", layout);
  set(0);
  var gu = document.getElementById("gu");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      function (en) {
        gu.classList.toggle("on", !en[0].isIntersecting);
      },
      { threshold: 0.1 },
    ).observe(hero);
  }
  document.querySelectorAll(".cp").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.dataset.copy,
        done = function () {
          b.textContent = "Copied!";
          setTimeout(function () {
            b.textContent = "Copy";
          }, 1600);
        };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(done, function () {
          fb(t, done);
        });
      } else fb(t, done);
    });
  });
  function fb(t, done) {
    var a = document.createElement("textarea");
    a.value = t;
    a.style.position = "fixed";
    a.style.opacity = "0";
    document.body.appendChild(a);
    a.select();
    try {
      document.execCommand("copy");
    } catch {}
    document.body.removeChild(a);
    done();
  }
  var cf = document.getElementById("cform"),
    cfn = document.getElementById("cfn");
  cf.addEventListener("submit", function (e) {
    e.preventDefault();
    var n = document.getElementById("cn").value.trim(),
      m = document.getElementById("cm").value.trim();
    if (!m) {
      cfn.className = "cfn err";
      cfn.textContent = "Please write a message first.";
      return;
    }
    var url =
      "mailto:xdjohnnysumulong12@gmail.com?subject=" +
      encodeURIComponent("Portfolio message" + (n ? " from " + n : "")) +
      "&body=" +
      encodeURIComponent(m + (n ? "\n\n" + n : ""));
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    cfn.className = "cfn";
    cfn.textContent =
      "Opening your email app… if nothing opens, email me at xdjohnnysumulong12@gmail.com.";
  });
  var tb = [].slice.call(document.querySelectorAll(".themes button"));
  var developerCard = document.getElementById("developer-card"),
    developerCardTimer;
  function flipDeveloperCard() {
    developerCard.classList.remove("theme-flip");
    void developerCard.offsetWidth;
    developerCard.classList.add("theme-flip");
    window.clearTimeout(developerCardTimer);
    developerCardTimer = window.setTimeout(function () {
      developerCard.classList.remove("theme-flip");
    }, 750);
  }
  developerCard.addEventListener("animationend", function (e) {
    if (e.animationName === "developer-card-flip") {
      window.clearTimeout(developerCardTimer);
      developerCard.classList.remove("theme-flip");
    }
  });
  function theme(t, save) {
    var currentTheme =
      document.documentElement.getAttribute("data-theme") || "blue";
    if (t === "blue") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    tb.forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.t === t);
    });
    if (save && currentTheme !== t) flipDeveloperCard();
    if (save) {
      try {
        localStorage.setItem("jani-theme", t);
      } catch {}
    }
  }
  tb.forEach(function (b) {
    b.addEventListener("click", function () {
      theme(b.dataset.t, true);
    });
  });
  theme(document.documentElement.getAttribute("data-theme") || "light", false);
  var projectModal = document.getElementById("project-modal"),
    projectTitle = document.getElementById("project-modal-title"),
    projectMeta = document.getElementById("project-modal-meta"),
    projectDetails = document.getElementById("project-modal-details"),
    projectLabel = document.getElementById("project-modal-label"),
    projectClose = document.getElementById("project-modal-close"),
    projectDetailView = document.getElementById("project-detail-view"),
    projectDetailContent = document.getElementById("project-detail-content"),
    projectDetailBack = document.getElementById("project-detail-back");
  var projectFolders = {
    main: {
      title: "Main Projects",
      description: "School and client projects",
      count: "3 projects",
    },
    side: {
      title: "Side Projects",
      description: "Independent projects and contributions",
      count: "2 projects",
    },
  };
  var activeProjectFolder, projectCarouselTimer;
  projectClose.setAttribute("autofocus", "");
  function stopProjectCarousel() {
    window.clearInterval(projectCarouselTimer);
    projectCarouselTimer = null;
  }
  function initProjectCarousel() {
    stopProjectCarousel();
    var carousel = projectDetailContent.querySelector(".project-carousel"),
      track = carousel.querySelector(".project-carousel-track"),
      slides = [].slice.call(track.children),
      dots = [].slice.call(carousel.querySelectorAll(".project-carousel-dot")),
      index = 0;
    var reducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      focused = false;
    function showSlide(next) {
      index = (next + slides.length) % slides.length;
      track.style.transform = "translateX(" + -index * 100 + "%)";
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }
    function pause() {
      window.clearInterval(projectCarouselTimer);
      projectCarouselTimer = null;
    }
    function play() {
      if (
        reducedMotion ||
        projectCarouselTimer ||
        focused ||
        !projectModal.open
      )
        return;
      projectCarouselTimer = window.setInterval(function () {
        showSlide(index + 1);
      }, 4500);
    }
    carousel
      .querySelector("[data-carousel-prev]")
      .addEventListener("click", function () {
        pause();
        showSlide(index - 1);
        play();
      });
    carousel
      .querySelector("[data-carousel-next]")
      .addEventListener("click", function () {
        pause();
        showSlide(index + 1);
        play();
      });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        pause();
        showSlide(Number(dot.dataset.carouselSlide));
        play();
      });
    });
    carousel.addEventListener("focusin", function () {
      focused = true;
      pause();
    });
    carousel.addEventListener("focusout", function (e) {
      if (!carousel.contains(e.relatedTarget)) {
        focused = false;
        play();
      }
    });
    play();
  }
  function showProjectFolder(category) {
    var folder = projectFolders[category],
      list = projectDetails.querySelector(
        '[data-folder-list="' + category + '"]',
      );
    stopProjectCarousel();
    activeProjectFolder = category;
    projectLabel.textContent = "Project folder";
    projectTitle.textContent = folder.title;
    projectMeta.textContent = folder.description + " · " + folder.count;
    projectDetails
      .querySelectorAll("[data-folder-list]")
      .forEach(function (items) {
        items.hidden = true;
      });
    list.hidden = false;
    projectDetailView.hidden = true;
    projectDetailContent.replaceChildren();
  }
  document.querySelectorAll(".project-folder").forEach(function (folder) {
    folder.addEventListener("click", function () {
      showProjectFolder(folder.dataset.folder);
      projectModal.showModal();
      projectClose.focus();
    });
  });
  document.querySelectorAll(".project-file").forEach(function (file) {
    file.addEventListener("click", function () {
      var template = projectDetails.querySelector(
        'template[data-project-detail="' + file.dataset.project + '"]',
      );
      projectLabel.textContent = "Project details";
      projectTitle.textContent = file.querySelector("strong").textContent;
      projectMeta.textContent = file.querySelector("small").textContent;
      projectDetails
        .querySelectorAll("[data-folder-list]")
        .forEach(function (items) {
          items.hidden = true;
        });
      projectDetailContent.replaceChildren(
        document
          .getElementById("project-carousel-template")
          .content.cloneNode(true),
        template.content.cloneNode(true),
      );
      projectDetailView.hidden = false;
      initProjectCarousel();
    });
  });
  projectDetailBack.addEventListener("click", function () {
    showProjectFolder(activeProjectFolder);
  });
  document
    .getElementById("project-modal-close")
    .addEventListener("click", function () {
      projectModal.close();
    });
  projectModal.addEventListener("click", function (e) {
    if (e.target === projectModal) projectModal.close();
  });
  projectModal.addEventListener("close", stopProjectCarousel);
  var educationModal = document.getElementById("education-modal"),
    educationTitle = document.getElementById("education-modal-title"),
    educationMeta = document.getElementById("education-modal-meta"),
    educationDate = document.getElementById("education-modal-date");
  function openEducation(card) {
    educationTitle.textContent = card.querySelector("h3").textContent;
    educationMeta.textContent = card.querySelector("p").textContent;
    educationDate.textContent = card.querySelector(".when").textContent;
    educationModal.showModal();
    document.getElementById("education-modal-close").focus();
  }
  document.querySelectorAll("#education .edu").forEach(function (card) {
    card.addEventListener("click", function () {
      openEducation(card);
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEducation(card);
      }
    });
  });
  document
    .getElementById("education-modal-close")
    .addEventListener("click", function () {
      educationModal.close();
    });
  educationModal.addEventListener("click", function (e) {
    if (e.target === educationModal) educationModal.close();
  });
  var mobileToggle = document.getElementById("mobile-menu-toggle"),
    mobileMenu = document.getElementById("mobile-menu");
  function closeMobileMenu() {
    mobileMenu.hidden = true;
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-label", "Open navigation menu");
  }
  mobileToggle.addEventListener("click", function () {
    var opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    mobileToggle.setAttribute("aria-expanded", opening ? "true" : "false");
    mobileToggle.setAttribute(
      "aria-label",
      opening ? "Close navigation menu" : "Open navigation menu",
    );
  });
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });
  document.addEventListener("click", function (e) {
    if (
      !mobileMenu.hidden &&
      !mobileMenu.contains(e.target) &&
      !mobileToggle.contains(e.target)
    )
      closeMobileMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (projectModal.open) {
      e.preventDefault();
      projectModal.close();
    }
    if (educationModal.open) {
      e.preventDefault();
      educationModal.close();
    }
    if (!mobileMenu.hidden) closeMobileMenu();
  });
  var entryFlow = document.getElementById("entry-flow"),
    entryChoices = document.getElementById("entry-choices"),
    resumeView = document.getElementById("resume-view"),
    portfolioView = document.getElementById("portfolio-view"),
    portfolioExitTimer;
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fadeInView(view) {
    if (prefersReducedMotion) return;
    view.classList.remove("view-fade-in");
    void view.offsetWidth;
    view.classList.add("view-fade-in");
  }
  function selectPortfolio() {
    document.body.dataset.view = "portfolio";
    fadeInView(portfolioView);
    window.scrollTo(0, 0);
    entryFlow.classList.add("leaving");
    window.clearTimeout(portfolioExitTimer);
    portfolioExitTimer = window.setTimeout(
      function () {
        entryFlow.hidden = true;
        entryFlow.classList.remove("leaving");
      },
      prefersReducedMotion ? 0 : 420,
    );
  }
  function selectResume() {
    closeMobileMenu();
    window.open("/Jhonny_Sumulong_Resume.pdf", "_blank", "noopener,noreferrer");
  }
  function selectChoices() {
    resumeView.hidden = true;
    entryChoices.hidden = false;
    fadeInView(entryChoices);
    document.body.dataset.view = "gateway";
    entryFlow.scrollTop = 0;
  }
  document
    .getElementById("choose-resume")
    .addEventListener("click", selectResume);
  document
    .getElementById("choose-portfolio")
    .addEventListener("click", selectPortfolio);
  document
    .getElementById("resume-back")
    .addEventListener("click", selectChoices);
  document
    .getElementById("resume-to-portfolio")
    .addEventListener("click", selectPortfolio);
  document
    .getElementById("open-resume")
    .addEventListener("click", function (e) {
      e.preventDefault();
      selectResume();
    });
  document
    .getElementById("open-resume-mobile")
    .addEventListener("click", function (e) {
      e.preventDefault();
      closeMobileMenu();
      selectResume();
    });
  var topnav = document.getElementById("topnav"),
    lastY = window.scrollY,
    links = [].slice.call(topnav.querySelectorAll(".nl a"));
  window.addEventListener(
    "scroll",
    function () {
      var y = window.scrollY;
      if (y < hero.offsetHeight * 0.6) topnav.classList.remove("show");
      else if (y < lastY - 4) topnav.classList.add("show");
      else if (y > lastY + 4) topnav.classList.remove("show");
      lastY = y;
      var cur = "";
      links.forEach(function (a) {
        var t = document.querySelector(a.getAttribute("href"));
        if (t && t.getBoundingClientRect().top <= 160)
          cur = a.getAttribute("href");
      });
      links.forEach(function (a) {
        a.classList.toggle("on", a.getAttribute("href") === cur);
      });
    },
    { passive: true },
  );
})();
