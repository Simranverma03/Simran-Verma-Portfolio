"use strict";

/* =================================
   CONFIGURATION
================================= */

// This password is only for a local demonstration.
// It is NOT secure authentication for a public website.
const DEMO_ADMIN_PASSWORD = "admin123";

const RESPONSES_KEY = "simranPortfolioResponses";
const THEME_KEY = "simranPortfolioTheme";


/* =================================
   ELEMENT REFERENCES
================================= */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const adminStatus = document.getElementById("adminStatus");

const adminDashboard = document.getElementById("adminDashboard");
const logoutButton = document.getElementById("logoutButton");
const responsesList = document.getElementById("responsesList");
const responseCount = document.getElementById("responseCount");

const themeToggle = document.getElementById("themeToggle");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");


/* =================================
   STATUS MESSAGES
================================= */

function setStatus(element, message, type = "") {
    element.textContent = message;
    element.className = "form-status";

    if (type) {
        element.classList.add(type);
    }
}


/* =================================
   LOCAL STORAGE FUNCTIONS
================================= */

function getResponses() {
    try {
        const storedData = localStorage.getItem(RESPONSES_KEY);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        return Array.isArray(parsedData) ? parsedData : [];

    } catch (error) {
        console.error("Unable to read stored responses:", error);
        return [];
    }
}


function saveResponses(responses) {
    try {
        localStorage.setItem(
            RESPONSES_KEY,
            JSON.stringify(responses)
        );

        return true;

    } catch (error) {
        console.error("Unable to save responses:", error);
        return false;
    }
}


/* =================================
   CONTACT FORM
================================= */

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
        setStatus(
            formStatus,
            "Please complete all fields.",
            "error"
        );

        return;
    }

    if (
        name.length > 100 ||
        email.length > 254 ||
        message.length > 3000
    ) {
        setStatus(
            formStatus,
            "One or more fields exceed the allowed length.",
            "error"
        );

        return;
    }

    const newResponse = {
        id: createResponseId(),
        name: name,
        email: email,
        message: message,
        timestamp: new Date().toISOString()
    };

    const responses = getResponses();

    responses.push(newResponse);

    if (!saveResponses(responses)) {
        setStatus(
            formStatus,
            "The response could not be saved in this browser. Please check browser storage.",
            "error"
        );

        return;
    }

    contactForm.reset();

    setStatus(
        formStatus,
        "Thank you! Your message has been saved in this browser.",
        "success"
    );

    // Update the dashboard if it is already open.
    if (!adminDashboard.hidden) {
        renderResponses();
    }
});


function createResponseId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}


/* =================================
   ADMIN DEMO LOGIN
================================= */

adminLoginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (adminPassword.value !== DEMO_ADMIN_PASSWORD) {
        setStatus(
            adminStatus,
            "Incorrect demo password. Please try again.",
            "error"
        );

        return;
    }

    adminPassword.value = "";

    adminLoginForm.hidden = true;
    adminDashboard.hidden = false;

    setStatus(
        adminStatus,
        "Demo login successful.",
        "success"
    );

    renderResponses();
});


/* =================================
   DISPLAY SAVED RESPONSES
================================= */

function renderResponses() {
    responsesList.replaceChildren();

    const responses = getResponses();

    responseCount.textContent =
        responses.length === 1
            ? "1 response saved"
            : responses.length + " responses saved";

    if (responses.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.textContent =
            "No contact form responses have been saved yet.";

        responsesList.appendChild(emptyMessage);

        return;
    }

    responses.slice().reverse().forEach(function (response) {
        const card = document.createElement("article");
        card.className = "response-card";

        const name = document.createElement("h4");
        name.textContent = response.name || "Unnamed";

        const email = document.createElement("p");
        email.textContent = "Email: " + (response.email || "");

        const message = document.createElement("p");
        message.textContent = "Message: " + (response.message || "");

        const timestamp = document.createElement("time");

        const date = new Date(response.timestamp);

        if (!Number.isNaN(date.getTime())) {
            timestamp.dateTime = date.toISOString();
            timestamp.textContent =
                "Received: " + date.toLocaleString();
        } else {
            timestamp.textContent = "Received: Unknown date";
        }

        card.append(
            name,
            email,
            message,
            timestamp
        );

        responsesList.appendChild(card);
    });
}


/* =================================
   ADMIN LOGOUT
================================= */

logoutButton.addEventListener("click", function () {
    adminDashboard.hidden = true;
    adminLoginForm.hidden = false;

    responsesList.replaceChildren();
    responseCount.textContent = "";

    setStatus(
        adminStatus,
        "You have logged out of the demo dashboard.",
        ""
    );
});


/* =================================
   LIGHT / DARK THEME
================================= */

function applyTheme(theme) {
    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    themeToggle.textContent = isDark ? "☀" : "☾";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );
}


function initializeTheme() {
    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(THEME_KEY) || "light";
    } catch (error) {
        console.warn("Theme preference could not be loaded.");
    }

    applyTheme(savedTheme);
}


themeToggle.addEventListener("click", function () {
    const isDark = document.body.classList.contains("dark-mode");

    const nextTheme = isDark ? "light" : "dark";

    applyTheme(nextTheme);

    try {
        localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {
        console.warn("Theme preference could not be saved.");
    }
});


/* =================================
   MOBILE NAVIGATION
================================= */

menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.textContent = isOpen ? "✕" : "☰";
});


navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("open");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.textContent = "☰";
    });
});


/* =================================
   FOOTER YEAR
================================= */

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


/* =================================
   INITIALIZE
================================= */

initializeTheme();