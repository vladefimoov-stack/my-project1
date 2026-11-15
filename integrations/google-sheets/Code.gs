/**
 * Kalm — order form → Google Sheets
 *
 * 1. Paste this file into Extensions → Apps Script of your order spreadsheet.
 * 2. Replace SECRET below with the same value as GOOGLE_SHEETS_SECRET in Vercel.
 * 3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * 4. Put the web app URL into GOOGLE_SHEETS_WEBHOOK_URL in Vercel and redeploy.
 */
const SECRET = "PASTE_THE_SECRET_HERE";
const SHEET_NAME = "Užsakymai";
const HEADERS = ["Data ir laikas", "Užsakymo nr.", "Vardas", "El. paštas", "Telefonas", "Šalis", "Kiekis", "Suma, €", "Kalba", "Būsena", "Pastabos"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return json({ ok: false, error: "unauthorized" });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
        sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
      // ignore a repeated submission of the same order number
      const last = sheet.getLastRow();
      if (last > 1) {
        const refs = sheet.getRange(2, 2, last - 1, 1).getValues().flat();
        if (refs.indexOf(data.reference) !== -1) return json({ ok: true, duplicate: true });
      }
      sheet.appendRow([
        new Date(data.submittedAt),
        data.reference,
        clean(data.name),
        clean(data.email),
        clean(data.phone),
        clean(data.country),
        data.quantity,
        data.total,
        data.locale,
        "Naujas",
        "",
      ]);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// stop spreadsheet formula injection ("=", "+", "-", "@" at the start of a value)
function clean(v) {
  const s = String(v == null ? "" : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
