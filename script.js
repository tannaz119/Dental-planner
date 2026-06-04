// بخش ابتدایی اصلاح شده برای جلوگیری از کرش کردن برنامه
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized...");

    // چک کردن وجود المان‌ها قبل از استفاده (برای جلوگیری از خطای Null)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', mode);
            themeToggle.textContent = mode === 'light' ? '🌙' : '☀️';
        });
    }

    // لود کردن تم ذخیره شده
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    // فراخوانی توابع اصلی با احتیاط
    try {
        renderDashboard();
        loadLibraryData();
    } catch (error) {
        console.error("خطا در بارگذاری اولیه:", error);
    }
});

// مثال اصلاح شده برای Fetch (این مدل را برای همه fetchها رعایت کن)
async function loadLibraryData() {
    try {
        const response = await fetch('assets/Study/Books/book_list.json');
        if (!response.ok) throw new Error('فایل پیدا نشد');
        const data = await response.json();
        // ادامه کد رندر...
    } catch (err) {
        console.warn("هشدار: دیتای کتابخانه لود نشد. چک کنید پوشه assets وجود داشته باشد.");
        const list = document.getElementById('books-list');
        if (list) list.innerHTML = "<p>در حال حاضر دیتایی موجود نیست.</p>";
    }
}
