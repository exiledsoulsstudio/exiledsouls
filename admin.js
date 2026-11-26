import { db, auth } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";


// ================= COMMON =================

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showMessage(element, message, color = "") {
    if (!element) return;

    element.textContent = message;

    if (color) {
        element.style.color = color;
    }
}


// ================= LOGIN =================

const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showMessage(loginMessage, "Enter email and password.", "red");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "LOGGING IN...";

    showMessage(loginMessage, "");

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("LOGIN ERROR:", error.code, error.message);

        showMessage(loginMessage, error.code || error.message, "red");
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "LOGIN";
    }
});


// ================= LOGOUT =================

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
    }
});


// ================= NAVIGATION =================

document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".nav button").forEach(btn => {
            btn.classList.remove("active");
        });

        document.querySelectorAll(".section").forEach(section => {
            section.classList.remove("active");
        });

        button.classList.add("active");

        const section = document.getElementById(button.dataset.section);

        if (section) {
            section.classList.add("active");
        }
    });
});



// ==================================================
// ====================== NOVELS =====================
// ==================================================

const novelForm = document.getElementById("novelForm");
const novelList = document.getElementById("novelList");
const novelMessage = document.getElementById("novelMessage");

const novelId = document.getElementById("novelId");
const novelTitle = document.getElementById("novelTitle");
const novelAuthor = document.getElementById("novelAuthor");
const novelType = document.getElementById("novelType");
const genreContainer = document.getElementById("genreContainer");
const novelGenre = document.getElementById("novelGenre");
const novelStatus = document.getElementById("novelStatus");

const novelDescription = document.getElementById("novelDescription");
const novelInstagram = document.getElementById("novelInstagram");
const novelCover = document.getElementById("novelCover");
const novelLink = document.getElementById("novelLink");

const novelSubmit = document.getElementById("novelSubmit");
const novelCancel = document.getElementById("novelCancel");

function updateGenreVisibility() {
    const isNovel = novelType.value === "Novel";

    genreContainer.hidden = !isNovel;
    novelGenre.required = isNovel;

    if (!isNovel) {
        novelGenre.value = "";
    }
}

novelType.addEventListener("change", updateGenreVisibility);
// LOAD NOVELS

async function loadNovels() {
    novelList.innerHTML = "<p class='empty'>Loading novels...</p>";

    try {
        const snapshot = await getDocs(collection(db, "novels"));

        if (snapshot.empty) {
            novelList.innerHTML = "<p class='empty'>No novels found.</p>";
            return;
        }

        novelList.innerHTML = snapshot.docs.map(item => {
            const data = item.data();

            return `
                <article class="item">

                    ${data.cover ? `
                        <img
                            src="${escapeHTML(data.cover)}"
                            alt="Novel Cover"
                            style="width:120px; border-radius:10px; margin-bottom:12px;"
                        >
                    ` : ""}

                    <h3>${escapeHTML(data.title || "Untitled")}</h3>

                    <p>Author: ${escapeHTML(data.author || "")}</p>
                    <p>Genre: ${escapeHTML(data.genre || "")}</p>
                    <p>Writing Type: ${escapeHTML(data.type || "Not saved")}</p>
                    <p>Status: ${escapeHTML(data.status || "")}</p>

                    <p>
                        Description:
                        ${escapeHTML(data.description || "No description added.")}
                    </p>

                    <p>
                        Instagram:
                        ${escapeHTML(data.instagram || "Not added")}
                    </p>

                    ${data.link ? `
                        <p>
                            <a href="${escapeHTML(data.link)}"
                               target="_blank"
                               rel="noopener noreferrer">
                                READ NOVEL
                            </a>
                        </p>
                    ` : ""}

                    <div class="actions">
                        <button class="edit-btn"
                            data-edit-novel="${item.id}">
                            EDIT
                        </button>

                        <button class="delete-btn"
                            data-delete-novel="${item.id}">
                            DELETE
                        </button>
                    </div>

                </article>
            `;
        }).join("");


        // EDIT NOVEL

        novelList.querySelectorAll("[data-edit-novel]").forEach(button => {
            button.addEventListener("click", () => {
                const selected = snapshot.docs.find(
                    item => item.id === button.dataset.editNovel
                );

                if (!selected) return;

                const data = selected.data();

                novelId.value = selected.id;
                novelTitle.value = data.title || "";
                novelAuthor.value = data.author || "";
                novelGenre.value = data.genre || "";
                novelStatus.value = data.status || "";

                novelDescription.value = data.description || "";
                novelInstagram.value = data.instagram || "";
                novelCover.value = data.cover || "";
                novelLink.value = data.link || "";

                novelSubmit.textContent = "UPDATE NOVEL";
                novelCancel.hidden = false;

                novelForm.scrollIntoView({ behavior: "smooth" });
            });
        });


        // DELETE NOVEL

        novelList.querySelectorAll("[data-delete-novel]").forEach(button => {
            button.addEventListener("click", async () => {
                const id = button.dataset.deleteNovel;

                if (!confirm("Are you sure you want to delete this novel?")) {
                    return;
                }

                try {
                    await deleteDoc(doc(db, "novels", id));

                    showMessage(
                        novelMessage,
                        "Novel deleted successfully!",
                        "green"
                    );

                    await loadNovels();
                } catch (error) {
                    console.error("DELETE NOVEL ERROR:", error);

                    showMessage(
                        novelMessage,
                        "Failed to delete: " + error.message,
                        "red"
                    );
                }
            });
        });

    } catch (error) {
        console.error("LOAD NOVELS ERROR:", error);

        novelList.innerHTML = `
            <p class="empty">Failed to load novels.</p>
        `;
    }
}


// ADD / UPDATE NOVEL

novelForm.addEventListener("submit", async event => {
    event.preventDefault();

    showMessage(novelMessage, "Saving novel...");

    const novelData = {
        title: novelTitle.value.trim(),
        author: novelAuthor.value.trim(),
        genre: novelGenre.value.trim(),
        type: novelType.value,
        status: novelStatus.value,
        description: novelDescription.value.trim(),
        instagram: novelInstagram.value.trim(),
        cover: novelCover.value.trim(),
        link: novelLink.value.trim()
    };

    try {
        if (novelId.value) {
            await updateDoc(
                doc(db, "novels", novelId.value),
                novelData
            );

            showMessage(novelMessage, "Novel updated successfully!", "green");
        } else {
            await addDoc(
                collection(db, "novels"),
                novelData
            );

            showMessage(novelMessage, "Novel added successfully!", "green");
        }

        resetNovelForm();
        await loadNovels();

    } catch (error) {
        console.error("SAVE NOVEL ERROR:", error);

        showMessage(
            novelMessage,
            "Failed to save: " + error.message,
            "red"
        );
    }
});


// CANCEL NOVEL EDIT

novelCancel.addEventListener("click", resetNovelForm);


// RESET NOVEL FORM

function resetNovelForm() {
    novelForm.reset();
    novelId.value = "";

    novelSubmit.textContent = "ADD NOVEL";
    novelCancel.hidden = true;
}


 // ==================================================
 // ===================== SEGMENTS ====================
 // ==================================================

const segmentForm = document.getElementById("segmentForm");
const segmentList = document.getElementById("segmentList");
const segmentMessage = document.getElementById("segmentMessage");

const segmentId = document.getElementById("segmentId");
const segmentNumber = document.getElementById("segmentNumber");
const segmentLabel = document.getElementById("segmentLabel");
const segmentTitle = document.getElementById("segmentTitle");
const segmentDescription = document.getElementById("segmentDescription");

// NEW PHOTO AND PDF FIELDS
const segmentPhoto = document.getElementById("segmentPhoto");
const segmentPdf = document.getElementById("segmentPdf");

const segmentSubmit = document.getElementById("segmentSubmit");
const segmentCancel = document.getElementById("segmentCancel");


// LOAD SEGMENTS

async function loadSegments() {
    segmentList.innerHTML = "<p class='empty'>Loading segments...</p>";

    try {
        const snapshot = await getDocs(collection(db, "segments"));

        if (snapshot.empty) {
            segmentList.innerHTML = "<p class='empty'>No segments found.</p>";
            return;
        }

        segmentList.innerHTML = snapshot.docs.map(item => {
            const data = item.data();

            return `
                <article class="item">

                    ${data.segmentPhoto ? `
                        <img
                            src="${escapeHTML(data.segmentPhoto)}"
                            alt="Segment Photo"
                            style="width:100%; max-width:220px; border-radius:12px; margin-bottom:12px;"
                        >
                    ` : ""}

                    <h3>${escapeHTML(data.segmentTitle || data.title || "Untitled")}</h3>

                    <p>Number: ${escapeHTML(data.segmentNumber || "")}</p>
                    <p>Label: ${escapeHTML(data.segmentLabel || "")}</p>

                    <p>
                        Description:
                        ${escapeHTML(data.segmentDescription || "")}
                    </p>

                    ${data.segmentPdf ? `
                        <p>
                            <a
                                href="${escapeHTML(data.segmentPdf)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                DOWNLOAD PDF
                            </a>
                        </p>
                    ` : ""}

                    <div class="actions">

                        <button
                            class="edit-btn"
                            data-edit-segment="${item.id}"
                        >
                            EDIT
                        </button>

                        <button
                            class="delete-btn"
                            data-delete-segment="${item.id}"
                        >
                            DELETE
                        </button>

                    </div>

                </article>
            `;
        }).join("");


        // EDIT SEGMENT

        segmentList.querySelectorAll("[data-edit-segment]").forEach(button => {
            button.addEventListener("click", () => {

                const selected = snapshot.docs.find(
                    item => item.id === button.dataset.editSegment
                );

                if (!selected) return;

                const data = selected.data();

                segmentId.value = selected.id;
                segmentNumber.value = data.segmentNumber || "";
                segmentLabel.value = data.segmentLabel || "";
                segmentTitle.value = data.segmentTitle || data.title || "";
                segmentDescription.value = data.segmentDescription || "";

                // NEW FIELDS
                segmentPhoto.value = data.segmentPhoto || "";
                segmentPdf.value = data.segmentPdf || "";

                segmentSubmit.textContent = "UPDATE SEGMENT";
                segmentCancel.hidden = false;

                segmentForm.scrollIntoView({
                    behavior: "smooth"
                });
            });
        });


        // DELETE SEGMENT

        segmentList.querySelectorAll("[data-delete-segment]").forEach(button => {
            button.addEventListener("click", async () => {

                const id = button.dataset.deleteSegment;

                if (!confirm("Are you sure you want to delete this segment?")) {
                    return;
                }

                try {
                    await deleteDoc(doc(db, "segments", id));

                    showMessage(
                        segmentMessage,
                        "Segment deleted successfully!",
                        "green"
                    );

                    await loadSegments();

                } catch (error) {
                    console.error("DELETE SEGMENT ERROR:", error);

                    showMessage(
                        segmentMessage,
                        "Failed to delete: " + error.message,
                        "red"
                    );
                }
            });
        });

    } catch (error) {
        console.error("LOAD SEGMENTS ERROR:", error);

        segmentList.innerHTML = `
            <p class="empty">Failed to load segments.</p>
        `;
    }
}


// ADD / UPDATE SEGMENT

segmentForm.addEventListener("submit", async event => {
    event.preventDefault();

    showMessage(segmentMessage, "Saving segment...");

    const segmentData = {
        segmentNumber: segmentNumber.value.trim(),
        segmentLabel: segmentLabel.value.trim(),
        segmentTitle: segmentTitle.value.trim(),
        segmentDescription: segmentDescription.value.trim(),

        // NEW PHOTO AND PDF DATA
        segmentPhoto: segmentPhoto.value.trim(),
        segmentPdf: segmentPdf.value.trim()
    };

    try {
        if (segmentId.value) {

            await updateDoc(
                doc(db, "segments", segmentId.value),
                segmentData
            );

            showMessage(
                segmentMessage,
                "Segment updated successfully!",
                "green"
            );

        } else {

            await addDoc(
                collection(db, "segments"),
                segmentData
            );

            showMessage(
                segmentMessage,
                "Segment added successfully!",
                "green"
            );
        }

        resetSegmentForm();
        await loadSegments();

    } catch (error) {
        console.error("SAVE SEGMENT ERROR:", error);

        showMessage(
            segmentMessage,
            "Failed to save: " + error.message,
            "red"
        );
    }
});


// CANCEL SEGMENT EDIT

segmentCancel.addEventListener("click", resetSegmentForm);


// RESET SEGMENT FORM

function resetSegmentForm() {
    segmentForm.reset();
    segmentId.value = "";

    segmentSubmit.textContent = "ADD SEGMENT";
    segmentCancel.hidden = true;
}



// ==================================================
// ====================== REVIEWS ====================
// ==================================================

const reviewList = document.getElementById("reviewList");
const reviewMessage = document.getElementById("reviewMessage");
const refreshReviews = document.getElementById("refreshReviews");


// LOAD REVIEWS

async function loadReviews() {
    reviewList.innerHTML = "<p class='empty'>Loading reviews...</p>";

    try {
        const snapshot = await getDocs(collection(db, "reviews"));

        if (snapshot.empty) {
            reviewList.innerHTML = "<p class='empty'>No reviews yet.</p>";
            return;
        }

        reviewList.innerHTML = snapshot.docs.map(item => {
            const data = item.data();

            return `
                <article class="item">
                    <h3>${escapeHTML(data.name || data.username || "Anonymous")}</h3>

                    <p>Novel: ${escapeHTML(data.novel || data.novelTitle || "")}</p>
                    <p>Rating: ${escapeHTML(data.rating || "Not rated")}</p>

                    <p>
                        Review:
                        ${escapeHTML(data.review || data.message || data.comment || "")}
                    </p>

                    <div class="actions">
                        <button class="delete-btn"
                            data-delete-review="${item.id}">
                            DELETE REVIEW
                        </button>
                    </div>
                </article>
            `;
        }).join("");


        // DELETE REVIEW

        reviewList.querySelectorAll("[data-delete-review]").forEach(button => {
            button.addEventListener("click", async () => {
                const id = button.dataset.deleteReview;

                if (!confirm("Delete this review?")) {
                    return;
                }

                try {
                    await deleteDoc(doc(db, "reviews", id));

                    showMessage(
                        reviewMessage,
                        "Review deleted successfully!",
                        "green"
                    );

                    await loadReviews();
                } catch (error) {
                    console.error("DELETE REVIEW ERROR:", error);

                    showMessage(
                        reviewMessage,
                        "Failed to delete: " + error.message,
                        "red"
                    );
                }
            });
        });

    } catch (error) {
        console.error("LOAD REVIEWS ERROR:", error);

        reviewList.innerHTML = `
            <p class="empty">Failed to load reviews.</p>
        `;
    }
}


// REFRESH REVIEWS

refreshReviews.addEventListener("click", loadReviews);

/* ================= AUTHORS ================= */

const authorForm = document.getElementById("authorForm");
const authorList = document.getElementById("authorList");
const authorMessage = document.getElementById("authorMessage");

const authorId = document.getElementById("authorId");
const authorName = document.getElementById("authorName");
const authorInstagram = document.getElementById("authorInstagram");
const authorPhoto = document.getElementById("authorPhoto");
const authorBio = document.getElementById("authorBio");

const authorSubmit = document.getElementById("authorSubmit");
const authorCancel = document.getElementById("authorCancel");


function normalizeInstagram(value) {
    let username = value.trim();

    username = username
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
        .replace(/^@/, "")
        .replace(/\/.*$/, "")
        .replace(/[?#].*$/, "");

    return username
        ? `https://www.instagram.com/${username}/`
        : "";
}


async function loadAuthors() {
    authorList.innerHTML = "<p class='empty'>Loading authors...</p>";

    try {
        const snapshot = await getDocs(collection(db, "authors"));

        if (snapshot.empty) {
            authorList.innerHTML =
                "<p class='empty'>No authors added yet.</p>";
            return;
        }

        authorList.innerHTML = snapshot.docs.map(item => {
            const data = item.data();

            return `
                <article class="item">
                    ${data.photo ? `
                        <img
                            src="${escapeHTML(data.photo)}"
                            alt="${escapeHTML(data.name || "Author")}"
                            style="width:100px;height:100px;object-fit:cover;border-radius:50%;margin-bottom:12px;"
                        >
                    ` : ""}

                    <h3>${escapeHTML(data.name || "Unnamed Author")}</h3>

                    <p>${escapeHTML(data.bio || "No bio added.")}</p>

                    <p>
                        <a
                            href="${escapeHTML(data.instagram || "#")}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            INSTAGRAM ↗
                        </a>
                    </p>

                    <div class="actions">
                        <button
                            class="edit-btn"
                            data-edit-author="${item.id}"
                        >
                            EDIT
                        </button>

                        <button
                            class="delete-btn"
                            data-delete-author="${item.id}"
                        >
                            DELETE
                        </button>
                    </div>
                </article>
            `;
        }).join("");


        // EDIT AUTHOR
        authorList.querySelectorAll("[data-edit-author]")
            .forEach(button => {
                button.addEventListener("click", () => {
                    const selected = snapshot.docs.find(
                        item => item.id === button.dataset.editAuthor
                    );

                    if (!selected) return;

                    const data = selected.data();

                    authorId.value = selected.id;
                    authorName.value = data.name || "";
                    authorInstagram.value = data.instagram || "";
                    authorPhoto.value = data.photo || "";
                    authorBio.value = data.bio || "";

                    authorSubmit.textContent = "UPDATE AUTHOR";
                    authorCancel.hidden = false;

                    authorForm.scrollIntoView({
                        behavior: "smooth"
                    });
                });
            });


        // DELETE AUTHOR
        authorList.querySelectorAll("[data-delete-author]")
            .forEach(button => {
                button.addEventListener("click", async () => {
                    const id = button.dataset.deleteAuthor;

                    if (!confirm("Delete this author profile?")) return;

                    try {
                        await deleteDoc(doc(db, "authors", id));

                        showMessage(
                            authorMessage,
                            "Author deleted successfully!",
                            "green"
                        );

                        await loadAuthors();
                    } catch (error) {
                        console.error(error);

                        showMessage(
                            authorMessage,
                            "Delete failed: " + error.message,
                            "red"
                        );
                    }
                });
            });

    } catch (error) {
        console.error("LOAD AUTHORS ERROR:", error);

        authorList.innerHTML =
            "<p class='empty'>Could not load authors.</p>";
    }
}


// ADD / UPDATE AUTHOR
authorForm.addEventListener("submit", async event => {
    event.preventDefault();

    const instagram = normalizeInstagram(authorInstagram.value);

    if (!instagram) {
        showMessage(authorMessage, "Enter a valid Instagram ID.", "red");
        return;
    }

    const authorData = {
        name: authorName.value.trim(),
        instagram,
        photo: authorPhoto.value.trim(),
        bio: authorBio.value.trim()
    };

    try {
        if (authorId.value) {
            await updateDoc(
                doc(db, "authors", authorId.value),
                authorData
            );

            showMessage(authorMessage, "Author updated!", "green");
        } else {
            await addDoc(collection(db, "authors"), authorData);

            showMessage(authorMessage, "Author added!", "green");
        }

        resetAuthorForm();
        await loadAuthors();

    } catch (error) {
        console.error("SAVE AUTHOR ERROR:", error);

        showMessage(
            authorMessage,
            "Save failed: " + error.message,
            "red"
        );
    }
});


authorCancel.addEventListener("click", resetAuthorForm);


function resetAuthorForm() {
    authorForm.reset();
    authorId.value = "";

    authorSubmit.textContent = "ADD AUTHOR";
    authorCancel.hidden = true;
}


// Load authors after admin login
const previousAuthListener = onAuthStateChanged;

// Add this inside your existing onAuthStateChanged(user) block:
// loadAuthors();
 // ================= AUTH STATE =================

onAuthStateChanged(auth, user => {
    const loginBox = document.getElementById("loginBox");
    const dashboard = document.getElementById("dashboard");

    if (user) {
        loginBox.style.display = "none";
        dashboard.style.display = "block";

        loadNovels();
        loadSegments();
        loadReviews();
    } else {
        loginBox.style.display = "block";
        dashboard.style.display = "none";
    }
});
