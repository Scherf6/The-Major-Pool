/**
 * MASTERS POOL - Google Apps Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet with these columns in Row 1:
 *    Timestamp | Email | TeamName | Pick1 | Pick2 | Pick3 | Pick4 | Pick5 | Pick6 | WinningScore | Locked
 * 2. Go to Extensions > Apps Script
 * 3. Paste this entire script
 * 4. Click Deploy > New Deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the deployment URL and paste it into your React app's GOOGLE_SCRIPT_URL config
 * 
 * The sheet will also need a second tab called "Config" with:
 *    Row 1: LockTime | <ISO datetime string, e.g. 2026-04-09T07:59:00-04:00>
 *    Row 2: Tournament | Masters 2026
 */

// Handle POST requests (new entries & updates)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    
    // Check if entries are locked
    const lockTime = new Date(configSheet.getRange("B1").getValue());
    const now = new Date();
    
    if (now >= lockTime && data.action !== "read") {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Entries are locked. The tournament has started."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "submit") {
      // Check if email already exists
      const emails = sheet.getRange("B2:B" + sheet.getLastRow()).getValues().flat();
      const existingRow = emails.indexOf(data.email);
      
      if (existingRow !== -1) {
        // Update existing entry
        const row = existingRow + 2; // +2 for header and 0-index
        sheet.getRange(row, 1).setValue(new Date());
        sheet.getRange(row, 3).setValue(data.teamName);
        sheet.getRange(row, 4, 1, 6).setValues([[
          data.picks[0], data.picks[1], data.picks[2],
          data.picks[3], data.picks[4], data.picks[5]
        ]]);
        sheet.getRange(row, 10).setValue(data.winningScore);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Entry updated",
          action: "updated"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // New entry
        sheet.appendRow([
          new Date(),
          data.email,
          data.teamName,
          data.picks[0], data.picks[1], data.picks[2],
          data.picks[3], data.picks[4], data.picks[5],
          data.winningScore,
          false // not locked
        ]);
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: "Entry created",
          action: "created"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: "Unknown action"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (read entries for leaderboard)
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    const data = sheet.getDataRange().getValues();
    
    const lockTime = new Date(configSheet.getRange("B1").getValue());
    const tournament = configSheet.getRange("B2").getValue();
    const now = new Date();
    const isLocked = now >= lockTime;
    
    // Skip header row
    const entries = data.slice(1).map(row => ({
      email: maskEmail(row[1]),
      teamName: row[2],
      picks: [row[3], row[4], row[5], row[6], row[7], row[8]],
      winningScore: row[9],
    }));
    
    // If requesting with email param, return full entry for that user
    const requestEmail = e.parameter.email;
    let userEntry = null;
    if (requestEmail) {
      const fullData = data.slice(1).find(row => row[1] === requestEmail);
      if (fullData) {
        userEntry = {
          email: fullData[1],
          teamName: fullData[2],
          picks: [fullData[3], fullData[4], fullData[5], fullData[6], fullData[7], fullData[8]],
          winningScore: fullData[9],
        };
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
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Mask email for public display
function maskEmail(email) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  return user.charAt(0) + "***@" + domain;
}

/**
 * LOCK ENTRIES - Run this manually or set a time-based trigger
 * Goes through all entries and marks them as locked
 */
function lockAllEntries() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const range = sheet.getRange(2, 11, lastRow - 1, 1); // Column K = Locked
    const values = range.getValues().map(() => [true]);
    range.setValues(values);
  }
  Logger.log("All entries locked at " + new Date());
}
