/**
 * MASTERS POOL 2026 - Google Apps Script
 * 
 * Entries tab headers (Row 1):
 * Timestamp | Email | FirstName | LastName | TeamName | Pick1 | Pick2 | Pick3 | Pick4 | Pick5 | Pick6 | WinningScore | Locked
 *
 * Config tab:
 * A1: LockTime    B1: 2026-04-09T07:59:00-04:00
 * A2: Tournament   B2: Masters 2026
 * A3: EspnId       B3: 401703504
 */

/**
 * RUN THIS FIRST to grant permissions.
 * Select "testPermissions" in the dropdown above, then click Run.
 */
function testPermissions() {
  var url = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard";
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var json = JSON.parse(response.getContentText());
  Logger.log("ESPN API works. Event: " + (json.events ? json.events[0].name : "none"));
  Logger.log("Test complete - permissions granted.");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    
    var lockTime = new Date(configSheet.getRange("B1").getValue());
    var now = new Date();
    
    if (now >= lockTime && data.action !== "read") {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: "Entries are locked. The tournament has started."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === "submit") {
      var allData = sheet.getDataRange().getValues();
      var existingRow = -1;
      var emailCount = 0;
      for (var i = 1; i < allData.length; i++) {
        if (allData[i][1] === data.email) {
          emailCount++;
          if (allData[i][4] === data.teamName) {
            existingRow = i + 1;
          }
        }
      }
      
      // Block if already has 2 entries and this isn't an update
      if (emailCount >= 2 && existingRow < 0) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false, error: "Maximum 2 entries per email."
        })).setMimeType(ContentService.MimeType.JSON);
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
    var mode = (e && e.parameter) ? e.parameter.mode : null;
    
    if (mode === "scores") {
      return getEspnLeaderboard(e);
    }
    
    // GET-based submit (more reliable than POST for Apps Script)
    if (mode === "submit") {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
      var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
      var lockTime = new Date(configSheet.getRange("B1").getValue());
      var now = new Date();
      
      if (now >= lockTime) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false, error: "Entries are locked. The tournament has started."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var p = e.parameter;
      var submitEmail = p.email || "";
      var submitTeamName = p.teamName || "";
      var allData = sheet.getDataRange().getValues();
      var existingRow = -1;
      var emailCount = 0;
      
      for (var si = 1; si < allData.length; si++) {
        if (allData[si][1] === submitEmail) {
          emailCount++;
          // Match by email AND team name for updates
          if (allData[si][4] === submitTeamName) {
            existingRow = si + 1;
          }
        }
      }
      
      // Block if already has 2 entries and this isn't an update
      if (emailCount >= 2 && existingRow < 0) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false, error: "Maximum 2 entries per email. Edit an existing entry instead."
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      var row = [
        new Date(),
        submitEmail,
        p.firstName || "",
        p.lastName || "",
        p.teamName || "",
        p.pick1 || "", p.pick2 || "", p.pick3 || "",
        p.pick4 || "", p.pick5 || "", p.pick6 || "",
        Number(p.winningScore) || -12,
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
      if (!row[1]) continue;
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
    
    var requestEmail = (e && e.parameter) ? e.parameter.email : null;
    var userEntry = null;
    var userEntries = [];
    if (requestEmail) {
      for (var j = 1; j < data.length; j++) {
        if (data[j][1] === requestEmail) {
          var ue = {
            email: data[j][1],
            firstName: data[j][2] || "",
            lastName: data[j][3] || "",
            teamName: data[j][4],
            picks: [data[j][5], data[j][6], data[j][7], data[j][8], data[j][9], data[j][10]],
            winningScore: data[j][11],
          };
          userEntries.push(ue);
          if (!userEntry) userEntry = ue; // backward compat
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
      userEntries: userEntries,
      totalEntries: entries.length,
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getEspnLeaderboard(e) {
  try {
    var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
    var espnId = (e && e.parameter && e.parameter.espnId)
      ? e.parameter.espnId
      : (configSheet.getRange("B3").getValue() || "401703504");
    
    var url = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?event=" + espnId;
    var season = (e && e.parameter && e.parameter.season) ? e.parameter.season : null;
    if (season) url += "&season=" + season;
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var json = JSON.parse(response.getContentText());
    
    var event = json.events && json.events[0];
    
    // If no event found, retry with current year season parameter
    if (!event && !season) {
      var currentYear = new Date().getFullYear();
      var retryUrl = url + "&season=" + currentYear;
      var retryResponse = UrlFetchApp.fetch(retryUrl, { muteHttpExceptions: true });
      var retryJson = JSON.parse(retryResponse.getContentText());
      event = retryJson.events && retryJson.events[0];
      if (event) json = retryJson;
    }
    
    // Final fallback: fetch current tournament (no event ID)
    if (!event) {
      var fallbackUrl = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard";
      var fallbackResponse = UrlFetchApp.fetch(fallbackUrl, { muteHttpExceptions: true });
      var fallbackJson = JSON.parse(fallbackResponse.getContentText());
      event = fallbackJson.events && fallbackJson.events[0];
      if (event) json = fallbackJson;
    }
    
    if (!event) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false, error: "No event found for that tournament ID"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var competition = event.competitions && event.competitions[0];
    var competitors = competition ? competition.competitors || [] : [];
    var status = competition ? competition.status : null;
    
    var golfers = [];
    for (var i = 0; i < competitors.length; i++) {
      var c = competitors[i];
      var athlete = c.athlete || {};
      var rounds = [];
      var linescores = c.linescores || [];
      for (var r = 0; r < linescores.length; r++) {
        rounds.push({ score: linescores[r].value, displayValue: linescores[r].displayValue });
      }
      
      var scoreVal = 0;
      var scoreDisplay = "E";
      if (c.score) {
        scoreVal = c.score.value || 0;
        scoreDisplay = c.score.displayValue || "E";
      }
      
      var pos = "";
      var thru = 0;
      var stateDesc = "";
      var isCut = false;
      if (c.status) {
        pos = c.status.position ? c.status.position.displayName : "";
        thru = c.status.thru || 0;
        stateDesc = c.status.type ? c.status.type.description : "";
        isCut = c.status.type ? c.status.type.id === "3" : false;
      }
      
      var today = "";
      if (c.statistics && c.statistics.length > 0) {
        today = c.statistics[0].displayValue || "";
      }
      
      golfers.push({
        id: athlete.id || "",
        name: athlete.displayName || "",
        firstName: athlete.firstName || "",
        lastName: athlete.lastName || "",
        position: pos,
        score: scoreDisplay,
        scoreValue: scoreVal,
        today: today,
        thru: thru,
        state: stateDesc,
        rounds: rounds,
        isCut: isCut,
      });
    }
    
    golfers.sort(function(a, b) {
      return a.scoreValue - b.scoreValue;
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      tournament: event.name || "Masters Tournament",
      status: status ? (status.type ? status.type.description : "Unknown") : "Unknown",
      round: status ? (status.period || 0) : 0,
      golfers: golfers,
      lastUpdated: new Date().toISOString(),
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
