import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const message = document.getElementById("auth-message");

function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// REGISTRATION

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        try {

            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = result.user;

            // Create the user's Firestore profile.
            await setDoc(doc(db, "Users", user.uid), {
                email: user.email,
                createdAt: serverTimestamp()
            });

            window.location.replace("index.html");

        } catch (error) {

            showMessage(error.message);

        }

    });

}


// LOGIN

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.replace("index.html");

        } catch (error) {

            showMessage(error.message);

        }

    });

}


// PASSWORD RESET

const forgotPasswordButton = document.getElementById("forgot-password");

if (forgotPasswordButton) {

    forgotPasswordButton.addEventListener("click", async () => {

        const email = document.getElementById("login-email").value.trim();

        if (!email) {
            showMessage("Enter your email address first.");
            return;
        }

        try {

            await sendPasswordResetEmail(auth, email);

            showMessage("Password reset email sent. Check your inbox.");

        } catch (error) {

            showMessage(error.message);

        }

    });

}


// LOGOUT

const logoutButton = document.getElementById("logout");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.replace("login.html");

        } catch (error) {

            console.error("Logout error:", error);

        }

    });

}


// AUTHENTICATION STATE

onAuthStateChanged(auth, (user) => {

    const isAuthPage =
        window.location.pathname.endsWith("login.html") ||
        window.location.pathname.endsWith("register.html");

    if (user && isAuthPage) {

        window.location.replace("index.html");

    }

    if (!user && !isAuthPage) {

        window.location.replace("login.html");

    }

});