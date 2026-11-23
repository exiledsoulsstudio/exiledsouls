
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const details = document.getElementById("novelDetails");
const reviewsList = document.getElementById("reviewsList");
const reviewSummary = document.getElementById("reviewSummary");
const reviewForm = document.getElementById("reviewForm");
const feedback = document.getElementById("reviewFeedback");

const novelId = new URLSearchParams(location.search).get("id");
let currentNovel = null;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

document.getElementById("menuToggle")?.addEventListener("click", () => {
  document.getElementById("sidebar")?.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("open");
  });
});

async function loadNovel() {
  if (!novelId) {
    details.innerHTML = '<p class="empty-message">Novel not found. Please return to the library.</p>';
    return;
  }

  try {
    const snapshot = await getDoc(doc(db, "novels", novelId));

    if (!snapshot.exists()) {
      details.innerHTML = '<p class="empty-message">This novel does not exist.</p>';
      return;
    }

    currentNovel = { id: snapshot.id, ...snapshot.data() };

    const novel = currentNovel;

    document.title = `${novel.title || "Novel"} | Exiled Souls Studio`;

    details.innerHTML = `
      <div>
        ${
          novel.cover
            ? `<img class="detail-cover" src="${escapeHTML(novel.cover)}" alt="${escapeHTML(novel.title)} cover">`
            : `<div class="cover-placeholder">${escapeHTML(novel.title)}</div>`
        }
      </div>

      <div>
        <p class="eyebrow">A STORY FROM OUR COLLECTION</p>
        <h1 class="detail-title">${escapeHTML(novel.title || "Untitled")}</h1>
        <p class="detail-author">Written by ${escapeHTML(novel.author || "Unknown author")}</p>

        <p class="detail-meta">
          ${escapeHTML(novel.genre || "Fiction")} ·
          ${escapeHTML(novel.status || "Published")}
        </p>

        <p class="detail-description">${escapeHTML(novel.description || "No description available yet.")}</p>

        <div class="detail-actions">
          ${
            novel.link
              ? `<a class="primary-button" href="${escapeHTML(novel.link)}" target="_blank" rel="noopener noreferrer">READ NOVEL ↗</a>`
              : `<span class="secondary-button">READING LINK COMING SOON</span>`
          }

          ${
            novel.instagram
              ? `<a class="secondary-button" href="${escapeHTML(novel.instagram)}" target="_blank" rel="noopener noreferrer">AUTHOR'S INSTAGRAM ↗</a>`
              : ""
          }
        </div>
      </div>
    `;

    await loadReviews(novel.title);

  } catch (error) {
    console.error("Novel detail error:", error);
    details.innerHTML = '<p class="empty-message">Could not load this novel.</p>';
  }
}

async function loadReviews(novelTitle) {
  try {
    const snapshot = await getDocs(collection(db, "reviews"));

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(review => {
      const title = review.novel || review.novelTitle || "";
      return title.toLowerCase() === novelTitle.toLowerCase();
    });

    const ratings = reviews
      .map(review => Number(review.rating))
      .filter(rating => rating >= 1 && rating <= 5);

    const average = ratings.length
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    reviewSummary.textContent = ratings.length
      ? `★ ${average.toFixed(1)} / 5 · ${ratings.length} rating(s)`
      : "No ratings yet. Be the first reader to review!";

    reviewsList.innerHTML = reviews.length
      ? reviews.map(review => `
          <article class="review-item">
            <small>${"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))} · ${escapeHTML(review.name || review.username || "Reader")}</small>
            <p>${escapeHTML(review.review || review.message || review.comment || "")}</p>
          </article>
        `).join("")
      : '<p class="empty-message">No reviews yet.</p>';

  } catch (error) {
    console.error("Review loading error:", error);
    reviewSummary.textContent = "Ratings are temporarily unavailable.";
  }
}

reviewForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentNovel) return;

  const name = document.getElementById("reviewName").value.trim();
  const rating = Number(document.getElementById("reviewRating").value);
  const message = document.getElementById("reviewMessage").value.trim();

  if (!name || !message || rating < 1 || rating > 5) {
    feedback.textContent = "Please complete all fields and choose a rating.";
    return;
  }

  try {
    feedback.textContent = "Submitting review...";

    await addDoc(collection(db, "reviews"), {
      name,
      rating,
      review: message,
      novel: currentNovel.title,
      novelTitle: currentNovel.title,
      createdAt: serverTimestamp()
    });

    reviewForm.reset();
    feedback.textContent = "Thank you! Your review has been submitted. 🌷";

    await loadReviews(currentNovel.title);

  } catch (error) {
    console.error("Review submission error:", error);
    feedback.textContent = "Could not submit review. Please try again.";
  }
});

loadNovel();
