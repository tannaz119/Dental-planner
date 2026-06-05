document.addEventListener('DOMContentLoaded', () => {
    console.log("Dental Planner Pro: Interactivity Active");

    // ۱. مدیریت منوی پایین (Navigation)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // حذف حالت فعال از بقیه
            navItems.forEach(i => i.classList.remove('active'));
            // فعال کردن آیتم کلیک شده
            this.classList.add('active');
            
            // نمایش پیام تستی (بعداً اینجا صفحات عوض می‌شوند)
            const pageName = this.querySelector('span').textContent;
            console.log(`Navigating to: ${pageName}`);
            
            // افکت لرزش ملایم برای آیفون (Haptic Feedback simulation)
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        });
    });

    // ۲. مدیریت اقدامات سریع (Quick Actions)
    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(action => {
        action.addEventListener('click', function() {
            const actionName = this.querySelector('span').textContent;
            alert(`Opening: ${actionName}`); // فعلاً یک الرت برای تست
        });
    });

    // ۳. مدیریت چک‌باکس تسک‌ها (تکمیل مطالعه)
    const taskList = document.getElementById('task-list-container');
    if (taskList) {
        taskList.addEventListener('click', (e) => {
            const checkCircle = e.target.closest('.check-circle');
            if (checkCircle) {
                const card = checkCircle.closest('.task-card');
                checkCircle.style.background = checkCircle.style.background ? '' : 'var(--accent-teal)';
                card.style.opacity = card.style.opacity === '0.5' ? '1' : '0.5';
            }
        });
    }

    // ۴. لود کردن داده‌ها (دیتای پیش‌فرض + تلاش برای JSON)
    initApp();
});

async function initApp() {
    const defaultTasks = [
        { title: "Read: Ch. 4 Finish Lines", subtitle: "Shillingburg - Finish Lines", meta: "65%" },
        { title: "Watch: Border Molding", subtitle: "Prosthodontic Procedures", meta: "30m" },
        { title: "Review: Key Points", subtitle: "Quick Review", meta: "10m" }
    ];

    renderTasks(defaultTasks);

    try {
        const response = await fetch('./assets/Study/Books/book_list.json');
        if (response.ok) {
            const data = await response.json();
            if(data && data.length > 0) updateBookUI(data[0]);
        }
    } catch (err) {
        console.log("Note: Running on default data. Upload JSON to populate real data.");
    }
}

function renderTasks(tasks) {
    const container = document.getElementById('task-list-container');
    if (!container) return;
    container.innerHTML = tasks.map(task => `
        <div class="task-card" style="cursor: pointer;">
            <div class="check-circle"></div>
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.subtitle}</p>
            </div>
            <div class="task-meta">${task.meta}</div>
        </div>
    `).join('');
}

function updateBookUI(book) {
    const titleEl = document.getElementById('book-title');
    if (titleEl) titleEl.textContent = book.title || "No Title";
}
