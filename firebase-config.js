/**
 * Налаштування збереження робіт учнів (Google Диск / Таблиці або Firebase)
 * та PIN-коду панелі вчителя.
 */

window.GOSHA_CONFIG = {
    // Ідентифікатор контрольної роботи (змінюйте для нових контрольних, щоб очистити старий журнал)
    TEST_ID: "gosha-math6-droby-v1",

    // 1. GOOGLE ДИСК + GOOGLE ТАБЛИЦЯ (рекомендовано):
    // Вставте сюди URL веб-додатку Google Apps Script (https://script.google.com/macros/s/.../exec)
    APPS_SCRIPT_URL: "",

    // 2. АБО FIREBASE FIRESTORE (необов'язково, якщо використовуєте Google Диск вище):
    FIREBASE_CONFIG: {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    },

    // PIN-код за замовчуванням для доступу до teacher.html: 2026
    TEACHER_PIN_HASH: "5ed5758d"
};
