
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

async function loadNovels() {
  try {
    const snapshot = await getDocs(collection(db, "novels"));

    snapshot.forEach((doc) => {
      console.log(doc.data());
    });
  } catch (error) {
    console.error("Firebase error:", error);
  }
}

loadNovels();
