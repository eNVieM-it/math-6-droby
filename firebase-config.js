/**
 * Налаштування підключення до Firebase Firestore (хмарна база для збору робіт)
 * та PIN-коду вчителя.
 *
 * Як підключити безкоштовну базу Firebase за 3 хвилини — дивіться у файлі README.md.
 * Якщо залишити apiKey порожнім (""), сторінка працюватиме в локальному режимі
 * (відповіді зберігаються у браузері та як резервний .json файл для завантаження).
 */

window.GOSHA_CONFIG = {
    // Ідентифікатор контрольної роботи (змінюйте для нових контрольних, щоб очистити старий журнал)
    TEST_ID: "gosha-math6-droby-v1",

    // Вставте сюди налаштування вашого проєкту Firebase (Project Settings -> Your apps -> Web):
    FIREBASE_CONFIG: {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    },

    // PIN-код за замовчуванням для доступу до teacher.html: 2026
    // Щоб змінити PIN, відкрийте консоль браузера на teacher.html та викличте
    // hashTeacherPin("ваш_новий_пін") або просто вкажіть новий рядок у CUSTOM_TEACHER_PIN нижче
    // (увага: якщо репозиторій GitHub публічний, краще використовувати лише HASH або тримати teacher.html локально на ПК).
    TEACHER_PIN_HASH: "5ed5758d"
};
