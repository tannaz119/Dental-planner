document.addEventListener('DOMContentLoaded', () => {
    console.log("Dental Planner Pro Loaded");
    
    // ۱. داده‌های فرضی برای نمایش اولیه (اگر فایل JSON نبود صفحه خالی نماند)
    const defaultTasks = [
        { title: "Read: Ch. 4 Finish Lines", subtitle: "Shillingburg - Finish Lines", meta: "65%", icon: "book" },
        { title: "Watch: Border Molding", subtitle: "Prosthodontic Procedures", meta: "30m", icon: "video" },
        { title: "Review: Key Points", subtitle: "Quick Review", meta: "10m", icon: "redo" }
    ];

    renderTasks(defaultTasks);

    // ۲. تلاش برای گرفتن داده‌های واقعی از GitHub
    fetchData();
});

function renderTasks(tasks) {
    const container = document.getElementById('task-list-container');
    if (!container) return;
    
    container.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div class="check-circle"></div>
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.subtitle}</p>
            </div>
            <div class="task-meta">${task.meta}</div>
        </div>
    `).join('');
}

async function fetchData() {
    try {
        // مسیر را با دقت تنظیم کنید (نسبت به فایل index.html)
        const response = await fetch('./assets/Study/Books/book_list.json');
        if (response.ok) {
            const data = await response.json();
            updateBookUI(data[0]); // فرض بر اینکه اولین کتاب در لیست نمایش داده شود
        }
    } catch (error) {
        console.warn("Using default data. JSON files not found.");
    }
}

function updateBookUI(book) {
    if (document.getElementById('book-title')) {
        document.getElementById('book-title').textContent = book.title;
        document.getElementById('book-chapter').textContent = book.currentChapter;
        // در صورت وجود تصویر:
        // document.getElementById('current-book-img').src = book.coverImage;
    }
}
