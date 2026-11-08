(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const nextTheme = theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    themeToggle.setAttribute("title", `Switch to ${nextTheme} mode`);
  }

  applyTheme(root.dataset.theme || (systemTheme.matches ? "dark" : "light"));
  themeToggle.hidden = false;

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem("academic-home-theme", nextTheme);
    } catch (error) {
      // The chosen theme still applies when browser storage is unavailable.
    }
  });

  systemTheme.addEventListener("change", (event) => {
    let storedTheme;
    try {
      storedTheme = localStorage.getItem("academic-home-theme");
    } catch (error) {
      storedTheme = null;
    }
    if (storedTheme !== "light" && storedTheme !== "dark") {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  const navigationLinks = Array.from(document.querySelectorAll(".section-nav a"));
  const sections = navigationLinks.map((link) => document.querySelector(link.hash));

  function updateCurrentSection() {
    const navigationOffset = document.querySelector(".site-header").offsetHeight + 55;
    let activeSection = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= navigationOffset) {
        activeSection = section;
      }
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      activeSection = sections[sections.length - 1];
    }
    for (const link of navigationLinks) {
      if (link.hash === `#${activeSection.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  let scrollUpdatePending = false;
  window.addEventListener("scroll", () => {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    window.requestAnimationFrame(() => {
      updateCurrentSection();
      scrollUpdatePending = false;
    });
  }, { passive: true });
  window.addEventListener("resize", updateCurrentSection);
  updateCurrentSection();

  const bibtex = document.querySelector("#aquapoint-bibtex");
  const bibtexLink = document.querySelector(".bibtex-link");
  bibtexLink.setAttribute("aria-expanded", String(bibtex.open));
  bibtexLink.addEventListener("click", (event) => {
    event.preventDefault();
    bibtex.open = !bibtex.open;
    if (bibtex.open) bibtex.querySelector("summary").focus();
  });
  bibtex.addEventListener("toggle", () => {
    bibtexLink.setAttribute("aria-expanded", String(bibtex.open));
  });

  if (window.location.hash === "#aquapoint-bibtex") bibtex.open = true;

  const copyButton = document.querySelector(".copy-citation");
  const copyStatus = document.querySelector(".copy-status");
  const citation = document.querySelector("#aquapoint-citation");
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(citation.textContent.trim());
      copyStatus.textContent = "Citation copied.";
    } catch (error) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy.";
    }
  });

  const visitorMap = document.querySelector(".visitor-map");

  function fitVisitorMap() {
    const widget = visitorMap.querySelector("#mapmyvisitors-widget");
    if (!widget || !widget.offsetWidth) return;
    const scale = Math.min(1, visitorMap.clientWidth / widget.offsetWidth);
    widget.style.transform = `translateX(-50%) scale(${scale})`;
    visitorMap.style.height = `${widget.offsetHeight * scale}px`;
  }

  new ResizeObserver(fitVisitorMap).observe(visitorMap);
  new MutationObserver(fitVisitorMap).observe(visitorMap, {
    childList: true,
    subtree: true,
  });
  fitVisitorMap();
})();
