/**
 * MASTERS POOL - Google Apps Script
 * 
 * Google Sheet "Entries" tab headers (Row 1):
 * Timestamp | Email | FirstName | LastName | TeamName | Pick1 | Pick2 | Pick3 | Pick4 | Pick5 | Pick6 | WinningScore | Locked
 *
 * "Config" tab:
 * A1: LockTime   B1: 2026-04-05T07:29:00-05:00
 * A2: Tournament  B2: Valero Texas Open 2026
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    
    var lockTime = new Date(configSheet.getRange("B1").getValue());
    var now = new Date();
    
    if (now >= lockTime && data.action !== "read") {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: "Entries are locked."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "submit") {
      var allData = sheet.getDataRange().getValues();
      var existingRow = -1;
      for (var i = 1; i < allData.length; i++) {
        if (allData[i][1] === data.email) { existingRow = i + 1; break; }
      }
      
      var picks = data.picks || [];
      var row = [
        new Date(),
        data.email,
        data.firstName || "",
        data.lastName || "",
        data.teamName,
        picks[0] || "", picks[1] || "", picks[2] || "",
        picks[3] || "", picks[4] || "", picks[5] || "",
        data.winningScore,
        false
      ];
      
      if (existingRow > 0) {
        sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
        return ContentService.createTextOutput(JSON.stringify({
          success: true, message: "Entry updated", action: "updated"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        sheet.appendRow(row);
        return ContentService.createTextOutput(JSON.stringify({
          success: true, message: "Entry created", action: "created"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: "Unknown action"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    var data = sheet.getDataRange().getValues();
    
    var lockTime = new Date(configSheet.getRange("B1").getValue());
    var tournament = configSheet.getRange("B2").getValue();
    var now = new Date();
    var isLocked = now >= lockTime;
    
    var entries = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[1]) continue; // skip empty rows
      entries.push({
        email: maskEmail(row[1]),
        firstName: row[2] || "",
        lastName: row[3] || "",
        fullName: ((row[2] || "") + " " + (row[3] || "")).trim(),
        teamName: row[4],
        picks: [row[5], row[6], row[7], row[8], row[9], row[10]],
        winningScore: row[11],
      });
    }
    
    var requestEmail = e.parameter ? e.parameter.email : null;
    var userEntry = null;
    if (requestEmail) {
      for (var j = 1; j < data.length; j++) {
        if (data[j][1] === requestEmail) {
          userEntry = {
            email: data[j][1],
            firstName: data[j][2] || "",
            lastName: data[j][3] || "",
            teamName: data[j][4],
            picks: [data[j][5], data[j][6], data[j][7], data[j][8], data[j][9], data[j][10]],
            winningScore: data[j][11],
          };
          break;
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tournament: tournament,
      isLocked: isLocked,
      lockTime: lockTime.toISOString(),
      entries: entries,
      userEntry: userEntry,
      totalEntries: entries.length,
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function maskEmail(email) {
  if (!email) return "";
  var parts = email.split("@");
  return parts[0].charAt(0) + "***@" + parts[1];
}
