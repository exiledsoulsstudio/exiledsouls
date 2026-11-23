
import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ===============================
// HTML SECURITY HELPER
// ===============================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}


// ===============================
// SIDEBAR
// ===============================

function setupSidebar() {
  const toggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  toggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      sidebar?.classList.remove("open");
    });
  });
}


// ===============================
// FEATURED NOVELS
// ===============================

const featuredGrid = document.getElementById("featuredNovels");

async function loadFeaturedNovels() {
  if (!featuredGrid) return;

  try {
    const snapshot = await getDocs(collection(db, "novels"));

    const novels = snapshot.docs.slice(0, 4);

    if (!novels.length) {
      featuredGrid.innerHTML =
        '<p class="empty-message">No novels published yet.</p>';
      return;
    }

    featuredGrid.innerHTML = novels.map(doc => {
      const novel = doc.data();

      return `
        <article class="novel-card">

          <a class="novel-card-link"
             href="novel.html?id=${encodeURIComponent(doc.id)}">

            ${
              novel.cover
                ? `<img
                    class="novel-cover"
                    src="${escapeHTML(novel.cover)}"
                    alt="${escapeHTML(novel.title)} cover"
                    loading="lazy">`
                : `<div class="cover-placeholder">
                    ${escapeHTML(novel.title)}
                  </div>`
            }

            <div class="novel-info">

              <small>
                ${escapeHTML(novel.genre)}
                ·
                ${escapeHTML(novel.status)}
              </small>

              <h3>${escapeHTML(novel.title)}</h3>

              <p>By ${escapeHTML(novel.author)}</p>

              <p class="card-rating">
                DISCOVER STORY ↗
              </p>

            </div>

          </a>

        </article>
      `;
    }).join("");

  } catch (error) {
    console.error("Featured novels error:", error);

    featuredGrid.innerHTML =
      '<p class="empty-message">Could not load novels.</p>';
  }
}


// ===============================
// AUTHORS
// ===============================

const authorsContainer =
  document.getElementById("authorsContainer");

async function loadAuthors() {
  if (!authorsContainer) return;

  try {
    const snapshot = await getDocs(
      collection(db, "authors")
    );

    if (snapshot.empty) {
      authorsContainer.innerHTML =
        '<p class="empty-message">No authors added yet.</p>';
      return;
    }

    authorsContainer.innerHTML = snapshot.docs.map(doc => {
      const author = doc.data();

      const name = escapeHTML(
        author.name || "Author"
      );

      const bio = escapeHTML(
        author.bio || ""
      );

      const photo = author.photo
        ? escapeHTML(author.photo)
        : "";

      const initial = escapeHTML(
        (author.name || "A")
          .charAt(0)
          .toUpperCase()
      );


      // Instagram URL validation

      let instagramLink = "";

      try {
        const url = new URL(
          author.instagram || ""
        );

        if (
          url.protocol === "https:" &&
          (
            url.hostname === "instagram.com" ||
            url.hostname === "www.instagram.com"
          )
        ) {
          instagramLink = url.href;
        }

      } catch {
        instagramLink = "";
      }


      return `
        <article class="author-card">

          ${
            photo
              ? `<img
                  class="author-photo"
                  src="${photo}"
                  alt="${name}"
                  loading="lazy">`

              : `<div class="author-initial">
                  ${initial}
                </div>`
          }

          <div class="author-details">

            <p class="eyebrow">
              FEATURED AUTHOR
            </p>

            <h3>${name}</h3>

            <p>${bio}</p>

          </div>

          ${
            instagramLink
              ? `<a
                  href="${escapeHTML(instagramLink)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-link">
                  VIEW PROFILE ↗
                </a>`

              : ""
          }

        </article>
      `;

    }).join("");

  } catch (error) {
    console.error("Authors loading error:", error);

    authorsContainer.innerHTML =
      '<p class="empty-message">Could not load authors.</p>';
  }
}


// ===============================
// RUN FUNCTIONS
// ===============================

setupSidebar();

loadFeaturedNovels();

loadAuthors();
