// ملف main.js للدوال المشتركة

// دالة لتحميل البيانات عند فتح الصفحة
function loadData() {
    // يمكن إضافة أي كود مشترك هنا
}

// دالة لعرض رسائل الخطأ
function showError(message) {
    alert(message);
}

// دالة للتحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// دالة للتحقق من صحة كلمة المرور
function validatePassword(password) {
    return password.length >= 6;
}

// دالة للتحقق من تسجيل الدخول
function checkAuth() {
    google.script.run.withSuccessHandler(function(isLoggedIn) {
        if (!isLoggedIn && !['login.html', 'register.html', 'index.html'].includes(window.location.pathname.split('/').pop())) {
            window.location.href = 'login.html';
        }
    }).checkUserAuth();
}

// تنفيذ الدوال عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function() {
    loadData();
    checkAuth();
});
