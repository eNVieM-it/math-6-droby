/**
 * Google Apps Script для прийому контрольних робіт (6 клас, Краб Гоша)
 * на Google Диск та в Google Таблицю.
 *
 * Як розгорнути:
 * 1. Відкрийте https://script.google.com -> Новий проєкт.
 * 2. Вставте весь цей код замість шаблонного.
 * 3. Натисніть "Розгорнути" (Deploy) -> "Нове розгортання" (New deployment).
 * 4. Тип: "Веб-додаток" (Web app).
 *    - Виконувати як: "Я" (Me)
 *    - Хто має доступ: "Усі" (Anyone)
 * 5. Надайте дозволи на доступ до Google Диску та Google Таблиць.
 * 6. Скопіюйте URL веб-додатку (https://script.google.com/macros/s/.../exec)
 *    та вставте його в APPS_SCRIPT_URL у файлі firebase-config.js.
 */

const ROOT_FOLDER_NAME = 'Контрольна_6клас_Дроби_Краб_Гоша';
const SHEET_NAME = 'Відомість_6клас_Дроби';
const TEACHER_PIN_HASH = '5ed5758d'; // хеш для 2026 (оновіть, якщо змінили PIN)

function getOrCreateRootFolder() {
  const folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(ROOT_FOLDER_NAME);
}

function getOrCreateSpreadsheet(rootFolder) {
  const files = rootFolder.getFilesByName(SHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create(SHEET_NAME);
  const ssFile = DriveApp.getFileById(ss.getId());
  ssFile.moveTo(rootFolder);

  const sheet = ss.getSheets()[0];
  sheet.setName('Результати');
  sheet.appendRow([
    'Час здачі',
    'Учень',
    'Оцінка (з 12)',
    'Основні бали',
    'Бонус',
    'Перемикань вкладки',
    'Втрат фокусу',
    'Виходів з повноекрану',
    'Поза тестом (сек)',
    '1а', '1б', '1в', '1г', '1д', '1е', 'Завд.2', 'Завд.3', 'Завд.4', 'Завд.5', 'Бонус m',
    'Папка з фото (Google Drive)',
    'Журнал активності',
    'JSON_DATA'
  ]);
  sheet.setFrozenRows(1);
  return ss;
}

function sanitizeFilename(name) {
  return String(name || 'uchen')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim()
    .slice(0, 60);
}

function saveBase64Photo(folder, dataUrl, index) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const ext = mimeType.includes('png') ? 'png' : 'jpg';
  const bytes = Utilities.base64Decode(match[2]);
  const blob = Utilities.newBlob(bytes, mimeType, `zoshyt_${index + 1}.${ext}`);
  const file = folder.createFile(blob);
  return {
    id: file.getId(),
    name: file.getName(),
    url: file.getUrl()
  };
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const rootFolder = getOrCreateRootFolder();
    const ss = getOrCreateSpreadsheet(rootFolder);
    const sheet = ss.getSheets()[0];

    const timeTag = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const safeName = sanitizeFilename(payload.studentName);
    const studentFolder = rootFolder.createFolder(`${safeName}_${timeTag}`);

    const savedPhotos = [];
    const photos = Array.isArray(payload.photos) ? payload.photos : [];
    for (let i = 0; i < photos.length; i++) {
      const saved = saveBase64Photo(studentFolder, photos[i], i);
      if (saved) savedPhotos.push(saved);
    }

    const ac = payload.antiCheat || {};
    const r = payload.results || {};
    const eventsText = Array.isArray(ac.events) && ac.events.length
      ? ac.events.map(ev => `${ev.time} - ${ev.detail}`).join(' | ')
      : 'Порушень не зафіксовано';

    // Зберігаємо компактну копію без base64, але з посиланнями на фото в Google Drive
    const compactRecord = {
      studentName: payload.studentName,
      baseScore: payload.baseScore,
      bonusScore: payload.bonusScore,
      finalGrade12: payload.finalGrade12,
      submittedAt: payload.submittedAt,
      timestampMs: payload.timestampMs,
      results: payload.results,
      antiCheat: payload.antiCheat,
      driveFolderUrl: studentFolder.getUrl(),
      drivePhotos: savedPhotos
    };

    studentFolder.createFile(
      'robota_zvit.json',
      JSON.stringify(compactRecord, null, 2),
      MimeType.PLAIN_TEXT
    );

    sheet.appendRow([
      payload.submittedAt || timeTag,
      payload.studentName || '',
      payload.finalGrade12 || 0,
      payload.baseScore || 0,
      payload.bonusScore || 0,
      ac.tabSwitchCount || 0,
      ac.focusLossCount || 0,
      ac.fullscreenExitCount || 0,
      ac.totalAwaySeconds || 0,
      r.q1a ? r.q1a.userStr : '',
      r.q1b ? r.q1b.userStr : '',
      r.q1v ? r.q1v.userStr : '',
      r.q1g ? r.q1g.userStr : '',
      r.q1d ? r.q1d.userStr : '',
      r.q1e ? r.q1e.userStr : '',
      r.q2 ? r.q2.userStr : '',
      r.q3 ? r.q3.userStr : '',
      r.q4 ? r.q4.userStr : '',
      r.q5 ? r.q5.userStr : '',
      r.bonus ? r.bonus.userStr : '',
      studentFolder.getUrl(),
      eventsText,
      JSON.stringify(compactRecord)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        folderUrl: studentFolder.getUrl(),
        sheetUrl: ss.getUrl(),
        photoCount: savedPhotos.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    if (params.pinHash !== TEACHER_PIN_HASH) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (params.photoId) {
      const file = DriveApp.getFileById(params.photoId);
      const blob = file.getBlob();
      const b64 = Utilities.base64Encode(blob.getBytes());
      const dataUrl = `data:${blob.getContentType()};base64,${b64}`;
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, dataUrl }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rootFolder = getOrCreateRootFolder();
    const ss = getOrCreateSpreadsheet(rootFolder);
    const sheet = ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    const submissions = [];

    if (lastRow > 1) {
      const jsonColValues = sheet.getRange(2, 23, lastRow - 1, 1).getValues();
      for (let i = 0; i < jsonColValues.length; i++) {
        const raw = jsonColValues[i][0];
        if (raw) {
          try {
            submissions.push(JSON.parse(raw));
          } catch (ignore) {}
        }
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        sheetUrl: ss.getUrl(),
        folderUrl: rootFolder.getUrl(),
        submissions
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
