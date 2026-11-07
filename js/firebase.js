import { initializeApp } from
"https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDdB3sKlyK2UbqN2fkN9GBkfKJ_V9Ea-KY",
    authDomain: "todo-app-bk2026.firebaseapp.com",
    projectId: "todo-app-bk2026",
    storageBucket: "todo-app-bk2026.firebasestorage.app",
    messagingSenderId: "320002591437",
    appId: "1:2f86c76c524b4df4283784"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);