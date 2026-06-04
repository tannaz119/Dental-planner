document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const themeSelect = document.getElementById('theme-select');

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme + '-mode');
        if (themeSelect) themeSelect.value = savedTheme;
        themeToggleBtn.textContent = savedTheme === 'light' ? '☀️' : '🌙';
    } else {
        // Default to dark mode if no theme saved
        body.classList.add('dark-mode');
        if (themeSelect) themeSelect.value = 'dark';
        themeToggleBtn.textContent = '🌙';
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });

    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            setTheme(e.target.value);
        });
    }

    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggleBtn.textContent = '☀️';
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeToggleBtn.textContent = '🌙';
        }
        localStorage.setItem('theme', theme);
        if (themeSelect) themeSelect.value = theme;
    }

    // Language Toggle
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
        // Load language from localStorage
        const savedLang = localStorage.getItem('language') || 'fa'; // Default to Persian
        setLanguage(savedLang);
    }

    function setLanguage(lang) {
        if (langSelect) langSelect.value = lang;
        if (lang === 'en') {
            body.setAttribute('lang', 'en');
            document.documentElement.setAttribute('dir', 'ltr');
            // Apply English translations or adjustments here
            // For now, we'll just change the dir and lang attributes
        } else {
            body.setAttribute('lang', 'fa');
            document.documentElement.setAttribute('dir', 'rtl');
        }
        localStorage.setItem('language', lang);
    }


    // Initialize Application State
    loadState();
    loadLibrary();
    setupPlanner();
    loadCases();
    initializeSketchpad();

    // Event Listeners for Navigation
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            scrollToSection(targetId);
            // Highlight active link
            document.querySelectorAll('nav ul li a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

     // Tab functionality for Library
    document.querySelectorAll('.library-tabs button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // Deactivate all tabs and content
            document.querySelectorAll('.library-tabs button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Activate clicked tab and its content
            button.classList.add('active');
            document.getElementById(tabId + '-section').classList.add('active');
        });
    });

     // Enable scrolling to sections on load if hash is present
    if (window.location.hash) {
        scrollToSection(window.location.hash);
         // Highlight the corresponding nav link
        const link = document.querySelector(`nav ul li a[href="${window.location.hash}"]`);
        if (link) {
            document.querySelectorAll('nav ul li a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    }

});

function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- State Management (localStorage) ---
function saveState() {
    const appState = {
        theme: localStorage.getItem('theme') || 'dark',
        language: localStorage.getItem('language') || 'fa',
        // Add other state variables like current week, progress etc.
        currentWeekOffset: currentWeekOffset, // Assuming currentWeekOffset is managed elsewhere
        studyLog: getTodayLog(), // Save today's log
        cases: Array.from(appData.cases.values()), // Save cases
        plannerSessions: appData.plannerSessions
    };
    localStorage.setItem('dentalPlannerState', JSON.stringify(appState));
}

function loadState() {
    const savedState = localStorage.getItem('dentalPlannerState');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.theme) setTheme(state.theme);
        if (state.language) setLanguage(state.language);
        if (state.currentWeekOffset !== undefined) currentWeekOffset = state.currentWeekOffset;
        if (state.studyLog) {
            appData.todayLog = state.studyLog;
            renderTodayLog();
        }
        if (state.cases) {
            appData.cases = new Map(state.cases.map(c => [c.id, c]));
            loadCases();
        }
         if (state.plannerSessions) {
            appData.plannerSessions = state.plannerSessions;
             setupPlanner(); // Re-render planner
        }
    }
     // Initialize appData with default empty structures if not loaded
     if (!appData.cases) appData.cases = new Map();
     if (!appData.plannerSessions) appData.plannerSessions = {};
     if (!appData.todayLog) appData.todayLog = [];
}

function backupData() {
     const dataToBackup = {
        theme: localStorage.getItem('theme'),
        language: localStorage.getItem('language'),
        currentWeekOffset: currentWeekOffset,
        studyLog: appData.todayLog,
        cases: Array.from(appData.cases.values()),
        plannerSessions: appData.plannerSessions,
        // Add any other data you want to backup
    };
    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const restoredState = JSON.parse(e.target.result);
            if (restoredState.theme) setTheme(restoredState.theme);
            if (restoredState.language) setLanguage(restoredState.language);
            if (restoredState.currentWeekOffset !== undefined) currentWeekOffset = restoredState.currentWeekOffset;
            if (restoredState.studyLog) {
                 appData.todayLog = restoredState.studyLog;
                 renderTodayLog();
            }
            if (restoredState.cases) {
                appData.cases = new Map(restoredState.cases.map(c => [c.id, c]));
                loadCases();
            }
            if (restoredState.plannerSessions) {
                 appData.plannerSessions = restoredState.plannerSessions;
                 setupPlanner(); // Re-render planner
            }
            alert('بازیابی اطلاعات با موفقیت انجام شد!');
             // Optional: Reload the page to fully apply changes
             // window.location.reload();
        } catch (error) {
            alert('خطا در بازیابی اطلاعات: ' + error.message);
        }
    };
    reader.readAsText(file);
}


// --- Data Store ---
let appData = {
    books: [],
    articles: [],
    coreConcepts: [],
    feaTopics: [],
    designLabIdeas: [],
    cases: new Map(), // Using Map for easier case management by ID
    plannerSessions: {}, // { date: [{ id, time, duration, topic, resource }, ...], ... }
    todayLog: [], // [{ id, time, duration, topic, resource }, ...]
    currentStreak: 0,
    lastStudyDate: null,
    overallProgress: 0,
    nextStudySession: null
};

let currentWeekOffset = 0; // 0 for current week, -1 for previous, 1 for next

// --- Utility Functions ---
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseMarkdown(mdContent) {
    // Basic markdown parsing to HTML. For a real app, use a library like 'marked' or 'showdown'
    let html = mdContent
        .replace(/^### (.*$)/gim, '<h3>$1</h3>') // Headers h3
        .replace(/^## (.*$)/gim, '<h2>$1</h2>') // Headers h2
        .replace(/^# (.*$)/gim, '<h1>$1</h1>') // Headers h1
        .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>') // Blockquotes
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // Bold
        .replace(/\*(.*)\*/gim, '<em>$1</em>') // Italic
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1">') // Images
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>') // Links
        .replace(/^\s*[-*+]\s+(.*)$/gim, '<li>$1</li>') // Unordered lists
        .replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>') // Ordered lists
        .replace(/^-{3,}/gim, '<hr/>'); // Horizontal rules

    // Wrap list items in <ul> or <ol> - very basic, needs refinement
    if (html.includes('<li>')) {
        html = html.replace(/(<li>.*<\/li>)/g, (match) => {
             // Check if it's an ordered list based on content or previous markdown
            if (match.includes('list-ol')) return `<ol class="list-ol">${match}</ol>`;
             return `<ul class="list-ul">${match}</ul>`;
        });
         // Clean up potential nested list issues or single list items
         html = html.replace(/<ul class="list-ul"><\/ul>/g, '');
         html = html.replace(/<ol class="list-ol"><\/ol>/g, '');
    }

    // Handle code blocks (basic)
    html = html.replace(/
```(.*?)
```/gis, '<pre><code class="language-$1">$2</code></pre>'); // This needs proper regex for multiline code blocks
     // For now, let's assume code blocks are handled by a library or simple cases
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>'); // Inline code


    // Paragraphs - ensure lines are wrapped in <p> tags unless they are list items, headers, etc.
    // This part is tricky and often requires a dedicated library. A simple approach:
    const lines = html.split('\n');
    let processedHtml = '';
    let inParagraph = false;
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('<') || trimmedLine.startsWith('</li>') || trimmedLine.startsWith('</ul>') || trimmedLine.startsWith('</ol>')) {
            if (inParagraph) {
                processedHtml += '</p>';
                inParagraph = false;
            }
            processedHtml += line + '\n';
        } else {
            if (!inParagraph) {
                processedHtml += '<p>';
                inParagraph = true;
            }
            processedHtml += line.replace(/\n/g, '<br/>'); // Replace newlines within a logical paragraph line
        }
    }
     if (inParagraph) {
         processedHtml += '</p>';
     }
     html = processedHtml.trim();


    return html;
}

// --- Library Loading ---
async function loadLibrary() {
    // Load Books
    try {
        const response = await fetch('assets/Study/Books/book_list.json');
        if (!response.ok) throw new Error('book_list.json not found or inaccessible');
        appData.books = await response.json();
        renderLibraryList('books', appData.books, 'books-list', 'assets/Study/Books/');
    } catch (error) {
        console.error("Error loading books:", error);
        document.getElementById('books-list').innerHTML = '<p>خطا در بارگذاری کتاب‌ها. لطفاً مطمئن شوید فایل `assets/Study/Books/book_list.json` وجود دارد.</p>';
    }

    // Load Articles
    try {
        // Assuming articles are listed in a JSON file
        const response = await fetch('assets/Articles/article_index.json');
         if (!response.ok) throw new Error('article_index.json not found or inaccessible');
        appData.articles = await response.json(); // [{id, title, author, date, filePath}, ...]
        renderLibraryList('articles', appData.articles, 'articles-list', 'assets/Articles/');
    } catch (error) {
        console.error("Error loading articles:", error);
        document.getElementById('articles-list').innerHTML = '<p>خطا در بارگذاری مقالات. لطفاً فایل `assets/Articles/article_index.json` را بررسی کنید.</p>';
    }

    // Load Core Concepts
    try {
        // Assume files in assets/Study/Core Concepts/ are markdown files
        // We need to dynamically fetch them or have an index file
        const response = await fetch('assets/Study/Core Concepts/index.json'); // Assuming an index file
        if (!response.ok) throw new Error('Core Concepts index not found');
        const conceptsIndex = await response.json(); // [{ filePath: "Implant Biomechanics.md", title: "Implant Biomechanics"}, ...]
        appData.coreConcepts = conceptsIndex;
        renderLibraryList('core-concepts', appData.coreConcepts, 'core-concepts-list', 'assets/Study/Core Concepts/');
    } catch (error) {
        console.error("Error loading core concepts:", error);
        document.getElementById('core-concepts-list').innerHTML = '<p>خطا در بارگذاری مفاهیم کلیدی.</p>';
    }

     // Load FEA Topics
     try {
        const response = await fetch('assets/FEA/index.json'); // Assuming an index file
        if (!response.ok) throw new Error('FEA index not found');
        const feaIndex = await response.json(); // [{ filePath: "Finite Element Analysis.md", title: "Finite Element Analysis"}, ...]
        appData.feaTopics = feaIndex;
        renderLibraryList('fea', appData.feaTopics, 'fea-list', 'assets/FEA/');
    } catch (error) {
        console.error("Error loading FEA topics:", error);
        document.getElementById('fea-list').innerHTML = '<p>خطا در بارگذاری مباحث FEA.</p>';
    }

    // Load Design Lab Ideas
     try {
        const response = await fetch('assets/Design Lab/index.json'); // Assuming an index file
        if (!response.ok) throw new Error('Design Lab index not found');
        const designLabIndex = await response.json(); // [{ filePath: "Locking Implant Concept.md", title: "Locking Implant Concept"}, ...]
        appData.designLabIdeas = designLabIndex;
        renderLibraryList('design-lab', appData.designLabIdeas, 'design-lab-list', 'assets/Design Lab/');
    } catch (error) {
        console.error("Error loading Design Lab ideas:", error);
        document.getElementById('design-lab-list').innerHTML = '<p>خطا در بارگذاری ایده‌های آزمایشگاه طراحی.</p>';
    }
}

function renderLibraryList(type, items, listElementId, basePath = '') {
    const listElement = document.getElementById(listElementId);
    if (!listElement) {
        console.error(`List element with ID "${listElementId}" not found.`);
        return;
    }
    listElement.innerHTML = ''; // Clear previous content

    if (items.length === 0) {
        listElement.innerHTML = '<p>موردی یافت نشد.</p>';
        return;
    }

    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('library-item');
        itemDiv.dataset.type = type;
        // Ensure item.filePath exists and is used correctly
        const fullPath = basePath + (item.filePath || item.title.replace(/\s+/g, '_') + '.md'); // Fallback path generation
        itemDiv.dataset.filePath = fullPath;
         // Use item.id if available, otherwise use title for unique identification
        itemDiv.dataset.itemId = item.id || item.title;

        // Basic display, could be more sophisticated
        let content = `<h4>${item.title}</h4>`;
        if (item.author) content += `<p>نویسنده: ${item.author}</p>`;
        if (item.date) content += `<p>تاریخ: ${item.date}</p>`;
        if (item.description) content += `<p>${item.description}</p>`; // For concepts etc.

        itemDiv.innerHTML = content;
        itemDiv.addEventListener('click', () => openViewItemModal(item.title, fullPath, type, item.id));
        listElement.appendChild(itemDiv);
    });
}

async function fetchMarkdownContent(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
             console.error(`Failed to fetch ${filePath}. Status: ${response.status}`);
             // Try to find it in the vault structure if direct fetch fails
             // This requires knowing the structure or having an index
             return `<p>خطا در بارگیری محتوا از ${filePath}. فایل یافت نشد یا دسترسی ممکن نیست.</p>`;
        }
        const text = await response.text();
        return parseMarkdown(text); // Use the basic markdown parser
    } catch (error) {
        console.error(`Error fetching markdown content from ${filePath}:`, error);
        return `<p>خطا در بارگیری محتوا: ${error.message}</p>`;
    }
}

// --- Modals ---
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Clear modal content on close if necessary
    clearModalForms(modalId);
}

function clearModalForms(modalId) {
     if (modalId === 'add-note-modal') {
          document.getElementById('note-text').value = '';
     } else if (modalId === 'add-session-modal') {
          document.getElementById('session-date').value = '';
          document.getElementById('session-time').value = '';
          document.getElementById('session-duration').value = '';
          document.getElementById('session-topic').value = '';
          document.getElementById('session-resource').value = '';
     } else if (modalId === 'add-case-modal') {
          document.getElementById('case-title').value = '';
          document.getElementById('case-patient-code').value = '';
          document.getElementById('case-date').value = '';
          document.getElementById('case-type').value = 'fixed-prostho';
          document.getElementById('case-problem').value = '';
          document.getElementById('case-findings').value = '';
          document.getElementById('case-diagnosis').value = '';
          document.getElementById('case-treatment-plan').value = '';
          document.getElementById('case-outcome').value = '';
          document.getElementById('case-images').value = null; // Clear file input
          document.getElementById('case-image-preview').innerHTML = '';
          clearSketchpad(); // Clear sketchpad canvas
          document.getElementById('case-notes').value = '';
     }
}


function openViewItemModal(title, filePath, type, itemId = null) {
    const modal = document.getElementById('view-item-modal');
    const modalTitleEl = document.getElementById('view-item-title');
    const modalBodyEl = document.getElementById('view-item-body');

    modalTitleEl.textContent = title;
    modalBodyEl.innerHTML = '<p>در حال بارگیری...</p>'; // Loading indicator

    fetchMarkdownContent(filePath).then(htmlContent => {
        modalBodyEl.innerHTML = htmlContent;

        // Make images responsive within the modal
        modalBodyEl.querySelectorAll('img').forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.margin = '15px auto';
        });

        // Make tables responsive
         modalBodyEl.querySelectorAll('table').forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.style.overflowX = 'auto';
            wrapper.style.maxWidth = '100%';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });

        // Add click listeners to library items inside the modal body if any
        modalBodyEl.querySelectorAll('.library-item').forEach(item => {
            item.addEventListener('click', () => {
                const itemTitle = item.querySelector('h4').textContent;
                const itemPath = item.dataset.filePath;
                const itemType = item.dataset.type;
                openViewItemModal(itemTitle, itemPath, itemType);
            });
        });

         // Handle notes and sketchpad specific to the item being viewed
        setupViewItemInteraction(itemId || title, type); // Pass a unique identifier

    }).catch(error => {
        modalBodyEl.innerHTML = `<p>خطا در بارگیری محتوا: ${error.message}</p>`;
    });

    modal.style.display = 'block';
}

function setupViewItemInteraction(itemId, itemType) {
    const notesTextarea = document.querySelector('#view-item-notes textarea');
    const notesSaveBtn = document.querySelector('#view-item-notes button');
    const sketchpadSection = document.getElementById('view-item-sketchpad-section');
    const sketchpadCanvas = sketchpadSection.querySelector('canvas');
    const sketchpadCtx = sketchpadCanvas.getContext('2d');

    // Load existing notes
    const savedNotes = localStorage.getItem(`notes_${itemId}`);
    if (notesTextarea) {
        notesTextarea.value = savedNotes || '';
        notesTextarea.oninput = () => {
            localStorage.setItem(`notes_${itemId}`, notesTextarea.value);
        };
    }

    // Initialize Sketchpad for this item
    if (sketchpadCanvas) {
        // Set canvas dimensions based on modal size or a fixed reasonable size
        sketchpadCanvas.width = sketchpadCanvas.clientWidth;
        sketchpadCanvas.height = 200; // Fixed height for sketchpad

        let isDrawing = false;
        let lastX = 0, lastY = 0;
        let currentColor = '#000000';
        let currentThickness = 4;

        // Load sketchpad settings from localStorage for this item
        const savedSketchData = localStorage.getItem(`sketch_${itemId}`);
        const savedSketchColor = localStorage.getItem(`sketch_color_${itemId}`) || '#000000';
        const savedSketchThickness = localStorage.getItem(`sketch_thickness_${itemId}`) || '4';

        if (savedSketchData) {
            const img = new Image();
            img.onload = () => {
                sketchpadCtx.drawImage(img, 0, 0);
            };
            img.src = savedSketchData;
        }
        if (sketchpadSection.querySelector('#view-item-sketchpad-color')) {
             sketchpadSection.querySelector('#view-item-sketchpad-color').value = savedSketchColor;
             sketchpadCtx.strokeStyle = savedSketchColor;
        }
         if (sketchpadSection.querySelector('#view-item-sketchpad-thickness')) {
            sketchpadSection.querySelector('#view-item-sketchpad-thickness').value = savedSketchThickness;
             sketchpadCtx.lineWidth = savedSketchThickness;
        }

        sketchpadCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        });
        sketchpadCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            sketchpadCtx.strokeStyle = currentColor;
            sketchpadCtx.lineWidth = currentThickness;
            sketchpadCtx.lineCap = 'round';
            sketchpadCtx.beginPath();
            sketchpadCtx.moveTo(lastX, lastY);
            sketchpadCtx.lineTo(e.offsetX, e.offsetY);
            sketchpadCtx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        });
        sketchpadCanvas.addEventListener('mouseup', () => {
            isDrawing = false;
            // Save the current canvas state
            localStorage.setItem(`sketch_${itemId}`, sketchpadCanvas.toDataURL());
        });
        sketchpadCanvas.addEventListener('mouseout', () => {
            isDrawing = false;
        });

        // Control panel for sketchpad
        const colorPicker = sketchpadSection.querySelector('#view-item-sketchpad-color');
        const thicknessSlider = sketchpadSection.querySelector('#view-item-sketchpad-thickness');

        if (colorPicker) {
             colorPicker.addEventListener('input', (e) => {
                currentColor = e.target.value;
                 localStorage.setItem(`sketch_color_${itemId}`, currentColor);
            });
        }
        if (thicknessSlider) {
             thicknessSlider.addEventListener('input', (e) => {
                currentThickness = e.target.value;
                 localStorage.setItem(`sketch_thickness_${itemId}`, currentThickness);
            });
        }

         // Ensure sketchpad controls are linked to current values
         if (colorPicker) colorPicker.value = currentColor;
         if (thicknessSlider) thicknessSlider.value = currentThickness;


        sketchpadSection.style.display = 'block'; // Show sketchpad section
    } else {
        if (sketchpadSection) sketchpadSection.style.display = 'none'; // Hide if canvas not found
    }

    // Save sketchpad changes when modal is closed or on mouseup
     document.querySelector('#view-item-modal .close-button').addEventListener('click', () => {
         if (sketchpadCanvas && !isDrawing) { // Save only if not actively drawing
             localStorage.setItem(`sketch_${itemId}`, sketchpadCanvas.toDataURL());
         }
     });
}

function clearViewItemSketchpad() {
    const sketchpadCanvas = document.querySelector('#view-item-modal #view-item-sketchpad-section canvas');
    if (sketchpadCanvas) {
        const ctx = sketchpadCanvas.getContext('2d');
        ctx.clearRect(0, 0, sketchpadCanvas.width, sketchpadCanvas.height);
        // Remove saved sketch data from localStorage
        const itemId = document.getElementById('view-item-title').dataset.itemId; // Assuming itemId is stored here
        localStorage.removeItem(`sketch_${itemId}`);
    }
}


// --- Dashboard Functions ---
function updateDashboard() {
    updateStreak();
    updateProgress();
    updateUpcomingSession();
}

function updateStreak() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const lastStudyDateStr = localStorage.getItem('lastStudyDate');
    const studyLog = getTodayLog(); // Get today's log for current streak calculation

    let currentStreak = 0;
    if (lastStudyDateStr) {
        const lastStudyDate = new Date(lastStudyDateStr);
        lastStudyDate.setHours(0, 0, 0, 0);

        // Calculate streak based on consecutive days with logged sessions
        let currentDate = new Date(today);
        while (currentDate >= lastStudyDate) {
            const dateKey = formatDate(currentDate);
            const sessionsOnDate = appData.plannerSessions[dateKey] || [];
             const todayLogSessions = (dateKey === formatDate(today)) ? getTodayLog() : [];
             const allSessionsOnDate = [...sessionsOnDate, ...todayLogSessions];

            if (allSessionsOnDate.length > 0) {
                 // If today has sessions, streak continues
                 if (formatDate(currentDate) === formatDate(today)) {
                     currentStreak++;
                 } else {
                    // For past days, check if they had sessions
                     let hasSession = false;
                     // Check against plannerSessions for past days
                     if (appData.plannerSessions[dateKey] && appData.plannerSessions[dateKey].length > 0) {
                         hasSession = true;
                     }
                     if (hasSession) {
                         currentStreak++;
                     } else {
                         // If a past day had no sessions, the streak breaks
                         break;
                     }
                 }

            } else {
                // If no sessions logged on this date, the streak breaks
                 // Exception: if today is the only day with no sessions, streak continues from previous day
                 if (formatDate(currentDate) !== formatDate(today)) {
                    break;
                 }
            }
            currentDate.setDate(currentDate.getDate() - 1);
        }
    }

     // Special case: If today has sessions, the streak is at least 1
    if (studyLog.length > 0 && currentStreak === 0 && lastStudyDateStr === null) {
         currentStreak = 1; // First day of study
    } else if (studyLog.length > 0 && currentStreak === 0 && lastStudyDateStr !== null && formatDate(today) !== new Date(lastStudyDateStr).toISOString().split('T')[0]) {
         // If last study date was in the past but today has sessions and it's not consecutive
         // This logic might need refinement based on exact definition of streak
         // Let's assume if today has sessions, streak starts from today if not consecutive
         const lastDate = new Date(lastStudyDateStr);
         const diffTime = Math.abs(today - lastDate);
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         if (diffDays > 1) {
             currentStreak = 1; // Start new streak if gap > 1 day
         } else if (diffDays === 1) {
             currentStreak = 1; // Consecutive if gap is 1 day
         }
    }

     // Ensure streak doesn't exceed current date count if calculated backwards
    const todayTimestamp = today.getTime();
    const lastStudyTimestamp = lastStudyDateStr ? new Date(lastStudyDateStr).getTime() : todayTimestamp;
    const daysDifference = Math.round((todayTimestamp - lastStudyTimestamp) / (1000 * 60 * 60 * 24));

    if (currentStreak > daysDifference + 1 && daysDifference >= 0) { // +1 because today counts if sessions exist
         // This is a safeguard, logic might need adjustment
        // currentStreak = Math.max(1, daysDifference + 1); // Ensure at least 1 if today has sessions
    }


    localStorage.setItem('currentStreak', currentStreak);
    document.getElementById('streak-count').textContent = currentStreak;

     // Update lastStudyDate if today has sessions
    if (studyLog.length > 0) {
        localStorage.setItem('lastStudyDate', formatDate(today));
    }
}

function updateProgress() {
    // Calculate overall progress based on completed sessions or other metrics
    // For now, a placeholder calculation
    let totalSessionsPlanned = 0;
    let totalSessionsCompleted = 0;

    // Count sessions from planner
    Object.values(appData.plannerSessions).forEach(sessions => {
        totalSessionsPlanned += sessions.length;
    });

    // Count today's logged sessions
    totalSessionsCompleted += appData.todayLog.length;

    // Add completed sessions from previous days logged in plannerSessions
    const todayStr = formatDate(new Date());
    Object.keys(appData.plannerSessions).forEach(dateKey => {
        if (dateKey < todayStr) {
             totalSessionsCompleted += appData.plannerSessions[dateKey].length;
        }
    });

    // Ensure we don't count today's planned sessions twice if already logged
    // A better approach might be to have a 'completed' flag on sessions

    // Simple progress: percentage of logged sessions vs planned sessions
    let progress = 0;
    if (totalSessionsPlanned > 0) {
        // This calculation is simplistic. A better metric might involve time spent or specific goals.
        // For now, let's use completed logs count vs planned count.
         // Need a way to mark planner sessions as completed in appData.plannerSessions
         // Let's assume today's log represents completed sessions for simplicity
         progress = Math.min(100, (totalSessionsCompleted / totalSessionsPlanned) * 100);
         if (isNaN(progress)) progress = 0;

    } else {
        progress = 0; // No sessions planned, no progress
    }


    appData.overallProgress = progress;
    const progressBar = document.getElementById('overall-progress-bar');
    const progressText = document.getElementById('overall-progress-text');
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress.toFixed(1)}%`;
}

function updateUpcomingSession() {
    const today = new Date();
    const todayStr = formatDate(today);
    const todaySessions = appData.plannerSessions[todayStr] || [];
    const todayLogged = getTodayLog();

    let upcoming = null;

    // Find the earliest upcoming session in the planner for today
    if (todaySessions.length > 0) {
         const plannedToday = todaySessions
            .filter(session => !todayLogged.some(logged => logged.id === session.id)) // Filter out already logged sessions
             .sort((a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`)); // Sort by time

        if (plannedToday.length > 0) {
            upcoming = plannedToday[0];
        }
    }

    // If no planned sessions left for today, find the earliest for tomorrow
    if (!upcoming) {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);
        const tomorrowSessions = appData.plannerSessions[tomorrowStr] || [];
        if (tomorrowSessions.length > 0) {
             upcoming = tomorrowSessions.sort((a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`))[0];
        }
    }

    const nextSessionEl = document.getElementById('next-study-session');
    if (upcoming) {
        nextSessionEl.textContent = `(${upcoming.time}) ${upcoming.topic || 'موضوع نامشخص'}${upcoming.resource ? ` - ${upcoming.resource}` : ''}`;
         appData.nextStudySession = upcoming; // Store for potential further use
    } else {
        nextSessionEl.textContent = 'هنوز جلسه‌ای برنامه‌ریزی نشده';
         app-Data.nextStudySession = null;
    }
}

// --- Planner Functions ---
let currentWeekOffset = 0; // 0 = current week, -1 = previous week, etc.

function setupPlanner() {
    const weekSelect = document.getElementById('week-select');
    if (!weekSelect) return;

    // Populate week selection dropdown (optional, can just use next/prev buttons)
    // For now, just ensure buttons work
    updatePlannerNavigation();
    renderPlannerWeek(currentWeekOffset);

     // Initial render of today's log
     renderTodayLog();
}

function updatePlannerNavigation() {
     const weekSelect = document.getElementById('week-select');
     if (!weekSelect) return;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7)); // Start of the week (Sunday)

    const weekSelectLabel = `هفته ${currentWeekOffset === 0 ? 'فعلی' : currentWeekOffset > 0 ? `بعدی (${currentWeekOffset})` : `گذشته (${Math.abs(currentWeekOffset)})`}`;
    // Update label or options if using a select element
}


function getWeekStartDate(offset) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek + (offset * 7)); // Set to the Sunday of the target week
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

function renderPlannerWeek(offset) {
    const startDate = getWeekStartDate(offset);
    const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

    // Clear previous week's schedule
    document.querySelectorAll('.session-list').forEach(list => list.innerHTML = '');

    // Render sessions for each day of the week
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateKey = formatDate(currentDate);
        const dayName = daysOfWeek[i];

        const dayColumn = document.querySelector(`.session-list[data-day="${dayName}"]`);
        if (!dayColumn) continue;

        const sessions = appData.plannerSessions[dateKey] || [];

        // Sort sessions by time
        sessions.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

        sessions.forEach(session => {
            const sessionDiv = document.createElement('div');
            sessionDiv.classList.add('study-session');
            sessionDiv.dataset.sessionId = session.id;
            sessionDiv.dataset.sessionDate = dateKey;
            sessionDiv.innerHTML = `
                <strong>${session.time}</strong> - ${session.duration} دقیقه<br/>
                <em>${session.topic || 'بدون موضوع'}</em>
                ${session.resource ? `<br/><small>(${session.resource})</small>` : ''}
            `;
            sessionDiv.onclick = () => viewSessionDetails(session.id, dateKey);
            dayColumn.appendChild(sessionDiv);
        });
    }
     updatePlannerNavigation(); // Update navigation elements if needed
}

function prevWeek() {
    currentWeekOffset--;
    renderPlannerWeek(currentWeekOffset);
    updateStreak(); // Recalculate streak as dates change
    updateProgress();
}

function nextWeek() {
    currentWeekOffset++;
    renderPlannerWeek(currentWeekOffset);
    updateStreak(); // Recalculate streak as dates change
    updateProgress();
}

function addStudySession() {
    const dateInput = document.getElementById('session-date');
    const timeInput = document.getElementById('session-time');
    const durationInput = document.getElementById('session-duration');
    const topicInput = document.getElementById('session-topic');
    const resourceInput = document.getElementById('session-resource');

    const date = dateInput.value;
    const time = timeInput.value;
    const duration = parseInt(durationInput.value);
    const topic = topicInput.value.trim();
    const resource = resourceInput.value.trim();

    if (!date || !time || isNaN(duration) || duration < 10) {
        alert('لطفاً تاریخ، زمان و مدت زمان جلسه (حداقل ۱۰ دقیقه) را به درستی وارد کنید.');
        return;
    }

     const newSession = {
        id: generateId(),
        date: date,
        time: time,
        duration: duration,
        topic: topic,
        resource: resource,
        isCompleted: false // New sessions are not completed by default
    };

     const dateKey = formatDate(new Date(date)); // Normalize date format

    if (!appData.plannerSessions[dateKey]) {
        appData.plannerSessions[dateKey] = [];
    }
    appData.plannerSessions[dateKey].push(newSession);

    // Save changes
    saveState();
    renderPlannerWeek(currentWeekOffset); // Re-render the current week
    updateUpcomingSession(); // Update the dashboard widget
    alert('جلسه مطالعه با موفقیت اضافه شد.');
    closeModal('add-session-modal');
}

function viewSessionDetails(sessionId, dateKey) {
    const sessions = appData.plannerSessions[dateKey] || [];
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
        alert('جلسه یافت نشد!');
        return;
    }

    // Display details in a modal or alert
    // For now, let's use alert, but a modal is better for UI
    let message = `زمان: ${session.time}\nمدت: ${session.duration} دقیقه\nموضوع: ${session.topic || 'نامشخص'}`;
    if (session.resource) message += `\nمنبع: ${session.resource}`;
    message += `\nوضعیت: ${session.isCompleted ? 'انجام شده' : 'برنامه‌ریزی شده'}`;

    alert(message);

    // Optionally, allow marking as complete or editing here
    // Example: Add a button to mark as complete if not already
    // if (!session.isCompleted) {
    //     // Code to add a "Mark as Complete" button/action
    // }
}

// --- Today's Log Functions ---
function logSessionCompletion(session) {
    // Check if the session is already logged today to avoid duplicates
     const todayKey = formatDate(new Date());
     const exists = appData.todayLog.some(log => log.id === session.id && log.date === todayKey);

    if (!exists) {
        const logEntry = {
            id: session.id, // Keep original session ID
            date: todayKey,
            time: session.time,
            duration: session.duration,
            topic: session.topic,
            resource: session.resource
        };
        appData.todayLog.push(logEntry);
         // Mark the session in plannerSessions as completed (if applicable)
         if (appData.plannerSessions[session.date]) {
             const plannerSession = appData.plannerSessions[session.date].find(s => s.id === session.id);
             if (plannerSession) plannerSession.isCompleted = true;
         }

        saveState();
        renderTodayLog();
        updateProgress(); // Update progress after logging
        updateStreak(); // Update streak after logging
        updateUpcomingSession(); // Update upcoming session display
    }
}

function renderTodayLog() {
    const logList = document.getElementById('today-log-list');
    if (!logList) return;
    logList.innerHTML = ''; // Clear existing log

    const todayKey = formatDate(new Date());
    const sessionsLoggedToday = appData.todayLog.filter(log => log.date === todayKey);

    if (sessionsLoggedToday.length === 0) {
        logList.innerHTML = '<li>هنوز هیچ جلسه‌ای امروز ثبت نشده است.</li>';
    } else {
        sessionsLoggedToday.forEach(log => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${log.time}</strong> (${log.duration} دقیقه): ${log.topic || 'بدون موضوع'}
                ${log.resource ? `<br/><small>منبع: ${log.resource}</small>` : ''}
            `;
            logList.appendChild(li);
        });
    }
}

function getTodayLog() {
     const todayKey = formatDate(new Date());
     return appData.todayLog.filter(log => log.date === todayKey);
}

// --- Case Management Functions ---
function saveCase() {
    const id = generateId();
    const title = document.getElementById('case-title').value.trim();
    const patientCode = document.getElementById('case-patient-code').value.trim();
    const date = document.getElementById('case-date').value;
    const type = document.getElementById('case-type').value;
    const problem = document.getElementById('case-problem').value.trim();
    const findings = document.getElementById('case-findings').value.trim();
    const diagnosis = document.getElementById('case-diagnosis').value.trim();
    const treatmentPlan = document.getElementById('case-treatment-plan').value.trim();
    const outcome = document.getElementById('case-outcome').value.trim();
    const notes = document.getElementById('case-notes').value.trim();
     const images = Array.from(document.getElementById('case-images').files); // FileList
     const sketchDataUrl = getSketchpadDataUrl('case-sketchpad'); // Get sketchpad data URL


    if (!title || !date || !type) {
        alert('لطفاً عنوان، تاریخ و نوع کیس را وارد کنید.');
        return;
    }

    // Handle images - In a real PWA, you'd save these to IndexedDB or use FileSystem API
    // For now, we'll just store placeholders or maybe base64 data if small
    const imageUrls = [];
    // This part needs robust handling for PWA storage
    // For now, let's simulate by just noting that images were selected

    const newCase = {
        id, title, patientCode, date, type, problem, findings, diagnosis, treatmentPlan, outcome, notes, sketchDataUrl, imageUrls,
        // Add timestamp for sorting etc.
        timestamp: new Date().toISOString()
    };

    appData.cases.set(id, newCase);
    saveState(); // Save cases
    loadCases(); // Refresh the case list display
    closeModal('add-case-modal');
    alert('کیس بالینی با موفقیت ذخیره شد.');
}

function loadCases() {
    const caseLibrary = document.getElementById('case-library');
    if (!caseLibrary) return;
    caseLibrary.innerHTML = ''; // Clear existing list

    if (appData.cases.size === 0) {
        caseLibrary.innerHTML = '<p>هنوز هیچ کیس بالینی ثبت نشده است.</p>';
        return;
    }

    // Sort cases by date (descending)
    const sortedCases = Array.from(appData.cases.values()).sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedCases.forEach(caseItem => {
        const caseDiv = document.createElement('div');
        caseDiv.classList.add('case-item');
        caseDiv.dataset.caseId = caseItem.id;
        caseDiv.innerHTML = `
            <h4>${caseItem.title}</h4>
            <p><strong>تاریخ:</strong> ${caseItem.date}</p>
            <p><strong>نوع:</strong> ${caseItem.type}</p>
             <p><strong>کد بیمار:</strong> ${caseItem.patientCode || 'ثبت نشده'}</p>
        `;
        caseDiv.onclick = () => openCaseViewModal(caseItem.id);
        caseLibrary.appendChild(caseDiv);
    });
}

function openCaseViewModal(caseId) {
    const caseItem = appData.cases.get(caseId);
    if (!caseItem) {
        alert('کیس یافت نشد!');
        return;
    }

    // Populate the view-item-modal with case details
     const modalTitleEl = document.getElementById('view-item-title');
     modalTitleEl.textContent = `مشاهده کیس: ${caseItem.title}`;
     modalTitleEl.dataset.caseId = caseId; // Store case ID for notes/sketchpad saving

    const modalBodyEl = document.getElementById('view-item-body');
    modalBodyEl.innerHTML = `
        <div><strong>تاریخ:</strong> ${caseItem.date}</div>
        <div><strong>نوع:</strong> ${caseItem.type}</div>
        ${caseItem.patientCode ? `<div><strong>کد بیمار:</strong> ${caseItem.patientCode}</div>` : ''}
        <div class="case-detail-section">
            <strong>مشکل بیمار:</strong> <p>${caseItem.problem.replace(/\n/g, '<br>')}</p>
        </div>
         <div class="case-detail-section">
            <strong>یافته‌های بالینی:</strong> <p>${caseItem.findings.replace(/\n/g, '<br>')}</p>
        </div>
         <div class="case-detail-section">
            <strong>تشخیص:</strong> <p>${caseItem.diagnosis.replace(/\n/g, '<br>')}</p>
        </div>
         <div class="case-detail-section">
            <strong>طرح درمان:</strong> <p>${caseItem.treatmentPlan.replace(/\n/g, '<br>')}</p>
        </div>
         <div class="case-detail-section">
            <strong>نتیجه درمان:</strong> <p>${caseItem.outcome.replace(/\n/g, '<br>')}</p>
        </div>
        ${caseItem.imageUrl && caseItem.imageUrl.length > 0 ? `
            <div class="case-images-section">
                <strong>تصاویر:</strong>
                <div id="case-view-images">
                    <!-- Images would be displayed here -->
                </div>
            </div>
        ` : ''}
        <div class="case-detail-section">
             <strong>یادداشت‌های اضافی:</strong> <p>${caseItem.notes.replace(/\n/g, '<br>')}</p>
        </div>
    `;

    // Handle sketchpad display
    const sketchpadSection = document.getElementById('view-item-sketchpad-section');
    const sketchpadCanvas = sketchpadSection.querySelector('canvas');
    if (caseItem.sketchDataUrl && sketchpadCanvas) {
        const ctx = sketchpadCanvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            // Resize canvas to image dimensions or fit within constraints
            sketchpadCanvas.width = Math.min(img.width, sketchpadCanvas.clientWidth); // Fit to modal width
            sketchpadCanvas.height = img.height * (sketchpadCanvas.clientWidth / img.width); // Maintain aspect ratio
            ctx.drawImage(img, 0, 0, sketchpadCanvas.width, sketchpadCanvas.height);
        };
        img.src = caseItem.sketchDataUrl;

         // Ensure controls are linked to the loaded sketchpad data and item ID
        setupViewItemInteraction(caseId, 'case'); // Setup notes and sketchpad for this case
         sketchpadSection.style.display = 'block';
    } else {
         if (sketchpadSection) sketchpadSection.style.display = 'none';
    }

    // Make sure notes textarea and save button are linked to the current case ID
    const notesTextarea = document.querySelector('#view-item-notes textarea');
    if (notesTextarea) {
        const savedNotes = localStorage.getItem(`notes_case_${caseId}`);
        notesTextarea.value = savedNotes || caseItem.notes.replace(/\n/g, '<br>'); // Load saved notes or original notes
         notesTextarea.oninput = () => {
             localStorage.setItem(`notes_case_${caseId}`, notesTextarea.value);
         };
    }

    // Update modal title's dataset for saving notes/sketch
    modalTitleEl.dataset.itemId = `case_${caseId}`;


    openModal('view-item-modal');
}


// --- Sketchpad Initialization ---
let sketchpadCanvas, sketchpadCtx, currentSketchItemId, isDrawing, lastX, lastY, currentColor, currentThickness;
let sketchpadColorPicker, sketchpadThicknessSlider;

function initializeSketchpad() {
    // Main sketchpad for adding new cases
    sketchpadCanvas = document.getElementById('case-sketchpad');
    if (sketchpadCanvas) {
        sketchpadCtx = sketchpadCanvas.getContext('2d');
        // Adjust canvas size to fit its container, or set a fixed size
        sketchpadCanvas.width = sketchpadCanvas.clientWidth;
        sketchpadCanvas.height = 200; // Default height

         // Initialize controls
         sketchpadColorPicker = document.getElementById('sketchpad-color');
         sketchpadThicknessSlider = document.getElementById('sketchpad-thickness');

         if (sketchpadColorPicker) sketchpadColorPicker.addEventListener('input', (e) => currentColor = e.target.value);
         if (sketchpadThicknessSlider) sketchpadThicknessSlider.addEventListener('input', (e) => currentThickness = e.target.value);

        // Event listeners for drawing
        sketchpadCanvas.addEventListener('mousedown', handleMouseDown);
        sketchpadCanvas.addEventListener('mousemove', handleMouseMove);
        sketchpadCanvas.addEventListener('mouseup', handleMouseUp);
        sketchpadCanvas.addEventListener('mouseout', () => isDrawing = false);

         // Set initial values
         currentColor = sketchpadColorPicker ? sketchpadColorPicker.value : '#000000';
         currentThickness = sketchpadThicknessSlider ? parseInt(sketchpadThicknessSlider.value) : 4;
    }
}

function handleMouseDown(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
     currentColor = sketchpadColorPicker ? sketchpadColorPicker.value : '#000000';
     currentThickness = sketchpadThicknessSlider ? parseInt(sketchpadThicknessSlider.value) : 4;
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    sketchpadCtx.strokeStyle = currentColor;
    sketchpadCtx.lineWidth = currentThickness;
    sketchpadCtx.lineCap = 'round';
    sketchpadCtx.beginPath();
    sketchpadCtx.moveTo(lastX, lastY);
    sketchpadCtx.lineTo(e.offsetX, e.offsetY);
    sketchpadCtx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function handleMouseUp() {
    isDrawing = false;
     // Save sketchpad state if it's associated with a case being saved
     if (currentSketchItemId) {
         const sketchDataUrl = sketchpadCanvas.toDataURL();
         // We should link this data to the item being edited/added
         // For now, it's saved when the case is saved
     }
}

function clearSketchpad() {
    if (sketchpadCanvas) {
        sketchpadCtx.clearRect(0, 0, sketchpadCanvas.width, sketchpadCanvas.height);
         // Reset controls if needed
         if(sketchpadColorPicker) sketchpadColorPicker.value = '#000000';
         if(sketchpadThicknessSlider) sketchpadThicknessSlider.value = '4';
         currentColor = '#000000';
         currentThickness = 4;
    }
}

// Function to get data URL from sketchpad, used when saving items like cases
function getSketchpadDataUrl(canvasId) {
     const canvas = document.getElementById(canvasId);
     if (canvas) {
         return canvas.toDataURL();
     }
     return null;
}


// --- Initial Setup ---
// All initializations are now inside DOMContentLoaded listener
