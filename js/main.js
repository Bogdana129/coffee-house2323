const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".nav__link");
const sections = document.querySelectorAll("section[id]");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

function closeMobileNav() {
  mainNav.classList.remove("is-open");
  navToggle.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Відкрити меню");
  document.body.style.overflow = "";
}

function openMobileNav() {
  mainNav.classList.add("is-open");
  navToggle.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Закрити меню");
  document.body.style.overflow = "hidden";
}

navToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.contains("is-open");
  if (isOpen) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileNav();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
    closeMobileNav();
  }
});

window.addEventListener(
  "scroll",
  () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 40);

    const scrollPos = window.scrollY + 120;
    let current = "";

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", href === current);
    });
  },
  { passive: true }
);

const menuTabs = document.querySelectorAll(".menu-tab");
const menuPanels = document.querySelectorAll(".menu-panel");

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    menuTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
    });

    menuPanels.forEach((panel) => {
      const panelId = panel.id.replace("panel-", "");
      const active = panelId === target;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  formMessage.className = "form-message";
  formMessage.textContent = "";

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !phone) {
    formMessage.classList.add("error");
    formMessage.textContent = "Будь ласка, заповніть обовʼязкові поля.";
    return;
  }

  formMessage.classList.add("success");
  formMessage.textContent = `Дякуємо, ${name}! Ми зателефонуємо вам найближчим часом.`;
  contactForm.reset();
});

const reviewForm = document.getElementById("reviewForm");
const reviewFormMessage = document.getElementById("reviewFormMessage");
const reviewsList = document.getElementById("reviewsList");
const starRating = document.getElementById("starRating");
const reviewRatingInput = document.getElementById("reviewRating");
const starButtons = starRating?.querySelectorAll(".star-rating__btn");

let selectedRating = 0;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildStarsMarkup(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < rating ? " is-filled" : "";
    return `<span class="stars__item${filled}" aria-hidden="true">★</span>`;
  }).join("");
}

function updateStarButtons(rating) {
  starButtons?.forEach((btn) => {
    const value = Number(btn.dataset.value);
    btn.classList.toggle("is-active", value <= rating);
    btn.setAttribute("aria-checked", value === rating ? "true" : "false");
  });
}

function setRating(rating) {
  selectedRating = rating;
  if (reviewRatingInput) {
    reviewRatingInput.value = String(rating);
  }
  updateStarButtons(rating);
}

starButtons?.forEach((btn) => {
  btn.setAttribute("role", "radio");
  btn.setAttribute("aria-checked", "false");

  btn.addEventListener("click", () => {
    setRating(Number(btn.dataset.value));
  });

  btn.addEventListener("mouseenter", () => {
    updateStarButtons(Number(btn.dataset.value));
  });
});

starRating?.addEventListener("mouseleave", () => {
  updateStarButtons(selectedRating);
});

starRating?.addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
    return;
  }
  e.preventDefault();
  let next = selectedRating || 1;
  if (e.key === "ArrowRight") {
    next = Math.min(5, (selectedRating || 0) + 1);
  } else if (e.key === "ArrowLeft") {
    next = Math.max(1, (selectedRating || 2) - 1);
  } else if (e.key === "Home") {
    next = 1;
  } else if (e.key === "End") {
    next = 5;
  }
  setRating(next);
  starButtons?.[next - 1]?.focus();
});

function createReviewCard(name, rating, text) {
  const article = document.createElement("article");
  article.className = "review-card review-card--new";
  const safeName = escapeHtml(name);
  const safeText = escapeHtml(text);
  article.innerHTML = `
    <div class="review-card__top">
      <div class="review-card__avatar" aria-hidden="true">${escapeHtml(getInitials(name))}</div>
      <div>
        <h3 class="review-card__name">${safeName}</h3>
        <div class="stars" role="img" aria-label="Оцінка: ${rating} з 5 зірок">
          ${buildStarsMarkup(rating)}
        </div>
      </div>
    </div>
    <blockquote class="review-card__text">«${safeText}»</blockquote>
  `;
  return article;
}

reviewForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  reviewFormMessage.className = "form-message";
  reviewFormMessage.textContent = "";

  const formData = new FormData(reviewForm);
  const name = String(formData.get("name") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const rating = Number(reviewRatingInput?.value);

  if (!name || !text) {
    reviewFormMessage.classList.add("error");
    reviewFormMessage.textContent = "Заповніть ім'я та текст відгуку.";
    return;
  }

  if (!rating || rating < 1 || rating > 5) {
    reviewFormMessage.classList.add("error");
    reviewFormMessage.textContent = "Оберіть оцінку від 1 до 5 зірок.";
    return;
  }

  const card = createReviewCard(name, rating, text);
  reviewsList?.prepend(card);

  reviewFormMessage.classList.add("success");
  reviewFormMessage.textContent = "Дякуємо! Ваш відгук опубліковано.";
  reviewForm.reset();
  setRating(0);
  starButtons?.forEach((btn) => btn.setAttribute("aria-checked", "false"));
});
