document.addEventListener("DOMContentLoaded", () => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  const navigationEntries = performance.getEntriesByType
    ? performance.getEntriesByType("navigation")
    : [];
  const legacyNavigationType =
    typeof performance.navigation !== "undefined" ? performance.navigation.type : undefined;
  const isReload =
    (navigationEntries.length > 0 && navigationEntries[0].type === "reload") ||
    legacyNavigationType === 1;

  if (isReload && window.location.hash) {
    const { pathname, search } = window.location;
    history.replaceState(null, "", `${pathname}${search}`);
  }

  scrollToTop();

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      scrollToTop();
    }
  });

  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".site-nav__toggle");
  const navLinks = document.querySelectorAll(".site-nav__list a");

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (nav.classList.contains("open")) {
          nav.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
          document.body.classList.remove("nav-open");
        }
      });
    });
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -80px",
        threshold: 0.15,
      }
    );

    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => observer.observe(el));
  } else {
    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => el.classList.add("is-visible"));
  }

  const sliders = document.querySelectorAll("[data-slider]");
  sliders.forEach((slider) => {
    const range = slider.querySelector(".before-after__slider");
    const afterImage = slider.querySelector(".before-after__image.after");
    const divider = slider.querySelector(".before-after__divider");

    if (!range || !afterImage || !divider) return;

    const update = (value) => {
      const percent = Number(value);
      afterImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      divider.style.left = `${percent}%`;
    };

    range.addEventListener("input", (event) => {
      update(event.target.value);
    });

    update(range.value);
  });

  const lazyImages = document.querySelectorAll("img[loading='lazy']");
  if ("IntersectionObserver" in window && lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const dataSrc = img.getAttribute("data-src");
            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.01,
      }
    );

    lazyImages.forEach((img) => imageObserver.observe(img));
  }

  const areaSearchForm = document.querySelector(".area-search");
  const areaSearchInput = document.querySelector("#area-search-input");
  const areaRows = Array.from(document.querySelectorAll("[data-area-row]"));
  const areaStatus = document.querySelector(".area-search__status");
  const areaEmpty = document.querySelector(".area-search__empty");
  const areaClear = document.querySelector(".area-search__clear");

  if (areaSearchForm) {
    areaSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  if (areaSearchInput && areaRows.length > 0) {
    const totalCount = areaRows.length;

    const updateStatus = (matches, keyword) => {
      if (!areaStatus) return;
      areaStatus.textContent =
        keyword && keyword.length > 0
          ? `${matches}件の都府県が見つかりました。`
          : `${totalCount}件の都府県が表示されています。`;
    };

    const filterRows = () => {
      const keyword = areaSearchInput.value.trim().toLowerCase();
      let matchCount = 0;

      areaRows.forEach((row) => {
        const haystack = (row.dataset.search || "").toLowerCase();
        const isMatch = keyword === "" || haystack.includes(keyword);
        row.hidden = !isMatch;
        if (isMatch) {
          matchCount += 1;
        }
      });

      updateStatus(matchCount, keyword);

      if (areaEmpty) {
        areaEmpty.hidden = keyword === "" || matchCount > 0;
      }
    };

    areaSearchInput.addEventListener("input", filterRows);

    if (areaClear) {
      areaClear.addEventListener("click", () => {
        areaSearchInput.value = "";
        areaSearchInput.focus();
        filterRows();
      });
    }

    filterRows();
  }
});

