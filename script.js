document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initForms();
    loadData();
});

/* ---------------- NAVIGATION ---------------- */

function initNavigation() {
    const pages = document.querySelectorAll(".page");
    const navButtons = document.querySelectorAll("[data-page]");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            const target = btn.dataset.page;

            pages.forEach(p => p.style.display = "none");

            const page = document.getElementById(target);
            if (page) page.style.display = "block";

            navButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

        });
    });
}

/* ---------------- MODALS ---------------- */

function openModal(id) {
    document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

document.addEventListener("click", e => {

    if (e.target.dataset.open) {
        openModal(e.target.dataset.open);
    }

    if (e.target.dataset.close) {
        closeModal(e.target.dataset.close);
    }

});

/* ---------------- STORAGE ---------------- */

function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* ---------------- NOTES ---------------- */

function initForms() {

    const noteForm = document.getElementById("noteForm");

    if (noteForm) {

        noteForm.addEventListener("submit", e => {
            e.preventDefault();

            const text = noteForm.querySelector("textarea").value;

            const notes = getData("notes");

            notes.push({
                id: Date.now(),
                text
            });

            saveData("notes", notes);

            noteForm.reset();
            closeModal("noteModal");

            renderNotes();
        });

    }

    const sessionForm = document.getElementById("sessionForm");

    if (sessionForm) {

        sessionForm.addEventListener("submit", e => {

            e.preventDefault();

            const date = sessionForm.querySelector("[name=date]").value;
            const time = sessionForm.querySelector("[name=time]").value;
            const duration = sessionForm.querySelector("[name=duration]").value;
            const topic = sessionForm.querySelector("[name=topic]").value;

            const sessions = getData("sessions");

            sessions.push({
                id: Date.now(),
                date,
                time,
                duration,
                topic
            });

            saveData("sessions", sessions);

            sessionForm.reset();
            closeModal("sessionModal");

            renderSessions();
        });
    }

    const caseForm = document.getElementById("caseForm");

    if (caseForm) {

        caseForm.addEventListener("submit", e => {

            e.preventDefault();

            const type = caseForm.querySelector("[name=type]").value;

            const cases = getData("cases");

            cases.push({
                id: Date.now(),
                type
            });

            saveData("cases", cases);

            caseForm.reset();
            closeModal("caseModal");

            renderCases();
        });
    }

}

/* ---------------- RENDER ---------------- */

function loadData() {
    renderNotes();
    renderSessions();
    renderCases();
}

function renderNotes() {

    const list = document.getElementById("notesList");
    if (!list) return;

    const notes = getData("notes");

    list.innerHTML = "";

    notes.forEach(n => {

        const el = document.createElement("div");
        el.className = "card";
        el.textContent = n.text;

        list.appendChild(el);
    });

}

function renderSessions() {

    const list = document.getElementById("sessionList");
    if (!list) return;

    const sessions = getData("sessions");

    list.innerHTML = "";

    sessions.forEach(s => {

        const el = document.createElement("div");
        el.className = "card";

        el.innerHTML =
            "<strong>" + s.topic + "</strong><br>" +
            s.date + " " + s.time + " • " + s.duration + " min";

        list.appendChild(el);

    });

}

function renderCases() {

    const list = document.getElementById("caseList");
    if (!list) return;

    const cases = getData("cases");

    list.innerHTML = "";

    cases.forEach(c => {

        const el = document.createElement("div");
        el.className = "card";
        el.textContent = c.type;

        list.appendChild(el);

    });

}
