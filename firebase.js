
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCv-FFvFl5WbSmpgM98spxcrGiR3KmQkMk",
    authDomain: "exiledsoulstudio.firebaseapp.com",
    projectId: "exiledsoulstudio",
    storageBucket: "exiledsoulstudio.firebasestorage.app",
    messagingSenderId: "642770637697",
    appId: "1:642770637697:web:c05682554fe0c696570e80",
    measurementId: "G-BLT7B8X6CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

export { db, auth };
