
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const grid = document.getElementById("novelGrid");
const searchInput = document.getElementById("searchInput");

let novels = [];
let currentFilter = "all";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function setupSidebar() {
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.remove("open");
    });
  });
}

function renderNovels() {
  const search = searchInput.value.trim().toLowerCase();

  const filtered = novels.filter(novel => {
    const genre = novel.genre.toLowerCase();

    const matchesFilter =
      currentFilter === "all" ||
      genre.includes(currentFilter.toLowerCase());

    const matchesSearch =
      novel.title.toLowerCase().includes(search) ||
      novel.author.toLowerCase().includes(search) ||
      genre.includes(search);

    return matchesFilter && matchesSearch;
  });

  if (!filtered.length) {
    grid.innerHTML = '<p class="empty-message">No stories found.</p>';
    return;
  }

  grid.innerHTML = filtered.map(novel => `
    <article class="novel-card">
      <a class="novel-card-link" href="novel.html?id=${encodeURIComponent(novel.id)}">
        ${
          novel.cover
            ? `<img class="novel-cover" src="${escapeHTML(novel.cover)}" alt="${escapeHTML(novel.title)} cover" loading="lazy">`
            : `<div class="cover-placeholder">${escapeHTML(novel.title)}</div>`
        }

        <div class="novel-info">
          <small>${escapeHTML(novel.genre)} · ${escapeHTML(novel.status)}</small>
          <h3>${escapeHTML(novel.title)}</h3>
          <p>By ${escapeHTML(novel.author)}</p>
          <p class="card-rating">DISCOVER STORY ↗</p>
        </div>
      </a>
    </article>
  `).join("");
}

async function loadNovels() {
  try {
    const snapshot = await getDocs(collection(db, "novels"));

    novels = snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        title: String(data.title || data.Title || ""),
        author: String(data.author || data.Author || "Unknown author"),
        genre: String(data.genre || data.Genre || "Fiction"),
        status: String(data.status || data.Status || "Published"),
        description: String(data.description || ""),
        cover: String(data.cover || ""),
        link: String(data.link || ""),
        instagram: String(data.instagram || "")
      };
    }).filter(novel => novel.title);

    renderNovels();

  } catch (error) {
    console.error("Novel loading error:", error);
    grid.innerHTML = '<p class="empty-message">Unable to load novels.</p>';
  }
}

searchInput?.addEventListener("input", renderNovels);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".filter.active")?.classList.remove("active");
    button.classList.add("active");
    currentFilter = button.dataset.filter || "all";
    renderNovels();
  });
});

setupSidebar();
loadNovels();
