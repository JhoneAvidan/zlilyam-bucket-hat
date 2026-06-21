/****************************************************************
 *  כובעי סוף שנה — Google Apps Script backend (Code.gs)
 *
 *  Acts as the backend for the static GitHub Pages survey.
 *  - doPost: appends / updates a row in the Sheet
 *  - doGet : returns all current entries as JSON
 *
 *  One row per child (id is unique). Re-submitting the same id
 *  UPDATES the existing row instead of adding a duplicate.
 ****************************************************************/

// Name of the tab/sheet that stores responses. Created automatically.
var SHEET_NAME = 'Responses';

// Column order written to the sheet (also the header row).
var HEADERS = ['id', 'he', 'en', 'corrected', 'finalName', 'spellingCorrect', 'hatSize', 'timestamp', 'updatedAt'];

/**
 * Returns the responses sheet, creating it + header row if needed.
 */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * GET — return all entries as a JSON array.
 * The page calls this on load to mark already-filled children.
 */
function doGet(e) {
  var out = [];
  try {
    var sheet = getSheet_();
    var values = sheet.getDataRange().getValues();
    // values[0] is the header row
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0] && row[0] !== 0) continue; // skip empty rows
      var obj = {};
      for (var c = 0; c < HEADERS.length; c++) {
        obj[HEADERS[c]] = row[c];
      }
      out.push(obj);
    }
  } catch (err) {
    return jsonOut_({ error: String(err) });
  }
  return jsonOut_(out);
}

/**
 * POST — append a new row, or update the existing row for this id.
 * Body is plain-text JSON (text/plain avoids a CORS preflight).
 */
function doPost(e) {
  // Lock so two parents submitting at once can't corrupt rows.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (lockErr) {
    return jsonOut_({ ok: false, error: 'busy, try again' });
  }

  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    var now = new Date();

    var rowValues = [
      data.id,
      data.he || '',
      data.en || '',
      data.corrected || '',
      data.finalName || data.he || '',
      data.spellingCorrect === false ? false : true,
      data.hatSize || '',
      data.timestamp || now.toISOString(),
      now.toISOString()
    ];

    // Look for an existing row with this id (column 1).
    var ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
    var foundRow = -1;
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(data.id)) {
        foundRow = i + 2; // +2: skip header + 0-index
        break;
      }
    }

    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    return jsonOut_({ ok: true, id: data.id, updated: foundRow > 0 });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: return a value as JSON.
 * (Apps Script Web Apps can't set custom CORS headers, but a simple
 *  GET/POST with a text/plain body works cross-origin from the page.)
 */
function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
