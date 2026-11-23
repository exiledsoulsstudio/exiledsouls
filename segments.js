
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const grid = document.getElementById("segmentsGrid");


// SAFE HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// SIDEBAR
document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.remove("open");
    });
});


// LOAD SEGMENTS
async function loadSegments() {

    try {
        const snapshot = await getDocs(collection(db, "segments"));

        if (snapshot.empty) {
            grid.innerHTML = `
                <p class="empty-message">
                    No segments published yet.
                </p>
            `;
            return;
        }

        grid.innerHTML = snapshot.docs.map((doc, index) => {

            const data = doc.data();

            const number =
                data.segmentNumber ||
                String(index + 1).padStart(2, "0");

            const title =
                data.segmentTitle ||
                data.title ||
                "Untitled segment";

            const label =
                data.segmentLabel ||
                "FROM OUR STUDIO";

            const description =
                data.segmentDescription || "";

            // NEW PHOTO AND PDF FIELDS
            const photo = data.segmentPhoto || "";
            const pdf = data.segmentPdf || "";

            return `
                <article class="segment-card">

                    <span class="segment-number">
                        ${escapeHTML(number)}
                    </span>

                    ${photo ? `
                        <div class="segment-image-wrapper">
                            <img
                                class="segment-photo"
                                src="${escapeHTML(photo)}"
                                alt="${escapeHTML(title)}"
                                loading="lazy"
                            >
                        </div>
                    ` : ""}

                    <div class="segment-card-content">

                        <p class="segment-label">
                            ${escapeHTML(label)}
                        </p>

                        <h3>
                            ${escapeHTML(title)}
                        </h3>

                        <p class="segment-description">
                            ${escapeHTML(description)}
                        </p>

                        ${pdf ? `
                            <a
                                class="segment-download-btn"
                                href="${escapeHTML(pdf)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                DOWNLOAD PDF ↗
                            </a>
                        ` : ""}

                    </div>

                </article>
            `;

        }).join("");

    } catch (error) {

        console.error("Segments loading error:", error);

        grid.innerHTML = `
            <p class="empty-message">
                Unable to load segments.
            </p>
        `;
    }
}

loadSegments();
