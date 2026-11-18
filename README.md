# 🦀 Контрольна робота з математики (6 клас) — «Множення і ділення дробів»

Проєкт розділено на дві незалежні сторінки, щоб учні мали доступ **лише до свого тесту** і не могли відкрити панель вчителя або підглянути ключі відповідей у коді:

- `index.html` — **сторінка учня** (примусовий повноекранний режим, фіксація перемикання вкладок/втрати фокусу, обов'язкове фото зошита, перевірка відповідей за хешами).
- `teacher.html` — **панель вчителя** (захищена PIN-кодом, містить ключ відповідей, перегляд фото зошитів, античіт-журнал з точним часом кожного порушення та експорт у CSV).
- `firebase-config.js` — спільний файл налаштувань хмарної бази Firebase та хешу PIN-коду вчителя.

---

## 1. Як уберегти панель вчителя від учнів

1. **Учням надсилайте лише посилання на `index.html`** (наприклад: `https://eNVieM-it.github.io/math-6-test/`). На самій сторінці учня **немає жодної кнопки чи посилання** на панель вчителя.
2. **Варіант А (найбезпечніший):** не завантажуйте `teacher.html` у публічний GitHub-репозиторій взагалі — додайте `teacher.html` у `.gitignore` або просто **відкривайте `teacher.html` локально зі свого комп'ютера** (подвійний клік по файлу). Якщо підключено Firebase, він однаково отримуватиме всі роботи учнів у реальному часі!
3. **Варіант Б:** якщо `teacher.html` лежить на GitHub Pages, обов'язково **змініть PIN-код за замовчуванням (`2026`)**:
   - Відкрийте `teacher.html`, введіть `2026`.
   - Натисніть **«Змінити PIN-код вчителя»**, введіть свій секретний код, скопіюйте згенерований `TEACHER_PIN_HASH` і вставте його у `firebase-config.js`.

---

## 2. Підключення хмарної бази Firebase (щоб роботи учнів приходили вам наживо)

> ⚠️ Без підключення Firebase сторінка GitHub Pages є статичною, тому учні зможуть здати роботу лише у вигляді файлу `.json` (кнопка «Завантажити файл роботи» з'явиться автоматично), який потім можна імпортувати в `teacher.html` через кнопку **«Імпорт .json»**.
> Щоб усе приходило **автоматично наживо**, налаштуйте безкоштовний Firebase за 3 хвилини:

1. Перейдіть на [console.firebase.google.com](https://console.firebase.google.com) → **Create a project**.
2. У меню зліва відкрийте **Build → Authentication → Sign-in method** → увімкніть **Anonymous**.
3. Відкрийте **Build → Firestore Database → Create database** (режим Production або Test).
4. У вкладці **Rules** у Firestore вставте такі правила (учні можуть лише **створювати** нові роботи, але **не можуть читати** чужі роботи):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /artifacts/{testId}/public/data/test_submissions/{docId} {
         allow create: if request.auth != null;
         allow read, delete: if request.auth != null;
       }
     }
   }
   ```
5. У **Project Settings (шестерня) → Your apps → Web (`</>`)** скопіюйте `firebaseConfig` та вставте значення у файл `firebase-config.js`.

---

## 3. Публікація на GitHub Pages

```bash
git init
git add index.html firebase-config.js README.md
# (За бажанням додайте teacher.html, або відкривайте його лише локально на своєму ПК)
git commit -m "Add 6th grade fractions test with fullscreen & anti-cheat"
git branch -M main
git remote add origin https://github.com/eNVieM-it/<НАЗВА_РЕПОЗИТОРІЮ>.git
git push -u origin main
```

У налаштуваннях репозиторію на GitHub відкрийте **Settings → Pages → Source: Deploy from a branch (`main` / `/ (root)`)**. За 1–2 хвилини тест буде доступний за посиланням `https://enviem-it.github.io/<НАЗВА_РЕПОЗИТОРІЮ>/`.
