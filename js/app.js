(() => {
  "use strict";

  const data = window.COURSE_DATA;
  if (!data) {
    console.error("Course data could not be loaded.");
    return;
  }

  const speakerPalette = [
    "#6c1a25",
    "#a77b3e",
    "#2e7772",
    "#345f86",
    "#4e3f68",
    "#8b4d3d"
  ];

  const assessmentPalette = [
    "#6c1a25",
    "#c59a58",
    "#2e7772",
    "#345f86",
    "#310000",
    "#4e3f68"
  ];

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const getInitials = (name) => {
    if (!name || name.toLowerCase().includes("to be announced")) return "TBA";
    const cleaned = name.replace(/\([^)]*\)/g, " ").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const weekGrid = document.querySelector("[data-week-grid]");
  const filterContainer = document.querySelector("[data-filters]");
  const filterStatus = document.querySelector("[data-filter-status]");
  const speakerSessions = document.querySelector("[data-speaker-sessions]");
  const assessmentsContainer = document.querySelector("[data-assessments]");
  const outcomesContainer = document.querySelector("[data-outcomes]");

  function renderFilters() {
    if (!filterContainer) return;

    filterContainer.innerHTML = data.filters.map((filter, index) => `
      <button
        class="filter-button${index === 0 ? " is-active" : ""}"
        type="button"
        data-filter="${escapeHtml(filter.id)}"
        aria-pressed="${index === 0 ? "true" : "false"}"
      >${escapeHtml(filter.label)}</button>
    `).join("");
  }

  function renderWeeks() {
    if (!weekGrid) return;

    weekGrid.innerHTML = data.weeks.map((week) => {
      const due = week.due ? `
        <div class="due-box">
          <span>Assignment due</span>
          <strong>${escapeHtml(week.due)}</strong>
        </div>
      ` : "";

      const speakerLink = week.category === "faculty" ? `
        <a class="week-speaker-link" href="#week-${week.week}-speakers">View this week’s speakers</a>
      ` : "";

      const noMilestone = !due && !speakerLink ? `<span class="empty-milestone">Focus on the week’s research work.</span>` : "";

      return `
        <article
          class="week-card reveal"
          data-category="${escapeHtml(week.category)}"
          data-week-label="${String(week.week).padStart(2, "0")}"
        >
          <header class="week-card-header">
            <span class="week-number">Week ${week.week}</span>
            <span class="week-phase">${escapeHtml(week.phase)}</span>
          </header>
          <div class="week-card-body">
            <span class="week-label">${escapeHtml(week.label)}</span>
            <h3>${escapeHtml(week.title)}</h3>
            <p>${escapeHtml(week.description)}</p>
          </div>
          <footer class="week-card-footer">
            ${due}
            ${speakerLink}
            ${noMilestone}
          </footer>
        </article>
      `;
    }).join("");
  }

  function setWeekFilter(filterId) {
    const cards = [...document.querySelectorAll(".week-card")];
    let visibleCount = 0;

    cards.forEach((card) => {
      const show = filterId === "all" || card.dataset.category === filterId;
      card.classList.toggle("is-filtered-out", !show);
      card.setAttribute("aria-hidden", String(!show));
      if (show) visibleCount += 1;
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
      const active = button.dataset.filter === filterId;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (filterStatus) {
      filterStatus.textContent = `Showing ${visibleCount} of ${cards.length} weeks.`;
    }
  }

  function setupFilters() {
    filterContainer?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      setWeekFilter(button.dataset.filter);
    });

    setWeekFilter("all");
  }

  function renderSpeakers() {
    if (!speakerSessions) return;

    speakerSessions.innerHTML = data.speakerSessions.map((session, sessionIndex) => `
      <article class="speaker-session reveal" id="week-${session.week}-speakers" data-delay="${sessionIndex * 60}">
        <header class="session-header">
          <div class="session-title-group">
            <span class="session-week" aria-hidden="true">${session.week}</span>
            <div>
              <span>Week ${session.week}</span>
              <h3>${escapeHtml(session.label)}</h3>
            </div>
          </div>
          <span class="session-count">${session.speakers.length} presentation slots</span>
        </header>
        <ol class="speaker-grid">
          ${session.speakers.map((speaker, speakerIndex) => {
            const paletteIndex = (sessionIndex * 3 + speakerIndex) % speakerPalette.length;
            const accent = speakerPalette[paletteIndex];
            const affiliation = speaker.affiliation
              ? `<span class="speaker-affiliation">${escapeHtml(speaker.affiliation)}</span>`
              : "";
            const status = speaker.status
              ? `<span class="speaker-status">${escapeHtml(speaker.status)}</span>`
              : "";

            return `
              <li class="speaker-card" style="--speaker-accent: ${accent}">
                <span class="speaker-time">${escapeHtml(speaker.time)}</span>
                <div class="speaker-identity">
                  <span class="speaker-avatar" aria-hidden="true">${escapeHtml(getInitials(speaker.name))}</span>
                  <div>
                    <p class="speaker-name">${escapeHtml(speaker.name)}</p>
                    ${affiliation}
                  </div>
                </div>
                <span class="speaker-topic-label">Presentation</span>
                <p class="speaker-title">${escapeHtml(speaker.title)}</p>
                ${status}
              </li>
            `;
          }).join("")}
        </ol>
      </article>
    `).join("");
  }

  function renderAssessments() {
    if (!assessmentsContainer) return;

    assessmentsContainer.innerHTML = data.assessments.map((item, index) => `
      <article class="assessment-item" style="--assessment-color: ${assessmentPalette[index % assessmentPalette.length]}">
        <div class="assessment-points" aria-label="${item.points} points">${item.points}</div>
        <div class="assessment-copy">
          <div class="assessment-title-row">
            <h3>${escapeHtml(item.label)}</h3>
            <span>${item.points}% of course grade</span>
          </div>
          <p>${escapeHtml(item.detail)}</p>
          <div class="assessment-bar" aria-hidden="true">
            <span style="width: ${item.points}%"></span>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderOutcomes() {
    if (!outcomesContainer) return;

    outcomesContainer.innerHTML = data.outcomes.map((outcome, index) => `
      <article class="outcome-card reveal" data-delay="${index * 55}">
        <span class="outcome-number">${escapeHtml(outcome.number)}</span>
        <h3>${escapeHtml(outcome.title)}</h3>
        <p>${escapeHtml(outcome.text)}</p>
      </article>
    `).join("");
  }

  function setupMobileNavigation() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) setOpen(false);
    });
  }

  function setupHeaderAndBackToTop() {
    const header = document.querySelector("[data-header]");
    const backToTop = document.querySelector("[data-back-to-top]");

    const update = () => {
      const scrolled = window.scrollY > 24;
      header?.classList.toggle("is-scrolled", scrolled);
      backToTop?.classList.toggle("is-visible", window.scrollY > 700);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function setupActiveNavigation() {
    if (!("IntersectionObserver" in window)) return;

    const navLinks = [...document.querySelectorAll(".primary-nav a[href^='#']")];
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, {
      rootMargin: "-25% 0px -62% 0px",
      threshold: [0.05, 0.2, 0.45]
    });

    sections.forEach((section) => observer.observe(section));
  }

  function setupRevealMotion() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = [...document.querySelectorAll(".reveal")];

    elements.forEach((element) => {
      const delay = Number(element.dataset.delay || 0);
      element.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");

    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.08
    });

    elements.forEach((element) => observer.observe(element));
  }

  function setupPrint() {
    const button = document.querySelector("[data-print]");
    if (!button) return;

    button.addEventListener("click", () => {
      setWeekFilter("all");
      window.setTimeout(() => window.print(), 80);
    });
  }

  renderFilters();
  renderWeeks();
  renderSpeakers();
  renderAssessments();
  renderOutcomes();

  setupFilters();
  setupMobileNavigation();
  setupHeaderAndBackToTop();
  setupActiveNavigation();
  setupPrint();
  setupRevealMotion();
})();
