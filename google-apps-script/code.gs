/**
 * Simran Verma Portfolio
 * Google Apps Script backend
 *
 * Setup:
 * 1. Create a Google Spreadsheet.
 * 2. Open Extensions > Apps Script.
 * 3. Paste this code into the Apps Script editor.
 * 4. Save and deploy as a web app.
 *
 * IMPORTANT:
 * This is an initial submission endpoint, not a complete
 * secure admin API. Do not expose private responses through
 * a public endpoint.
 */

const SHEET_NAME = "Responses";


/**
 * Returns the configured spreadsheet worksheet.
 */
function getResponsesSheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (!spreadsheet) {
        throw new Error(
            "No spreadsheet is connected to this script."
        );
    }

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    // Add headings when the worksheet is empty.
    if (sheet.getLastRow() === 0) {
        sheet.appendRow([
            "Name",
            "Email",
            "Message",
            "Timestamp"
        ]);
    }

    return sheet;
}


/**
 * Basic health-check endpoint.
 */
function doGet() {
    return ContentService
        .createTextOutput(
            JSON.stringify({
                success: true,
                message: "Portfolio contact endpoint is available."
            })
        )
        .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Accepts a JSON contact submission and appends it to the sheet.
 */
function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) {
            throw new Error("No submission data was provided.");
        }

        const data = JSON.parse(e.postData.contents);

        const name = String(data.name || "").trim();
        const email = String(data.email || "").trim();
        const message = String(data.message || "").trim();

        if (!name || !email || !message) {
            throw new Error("Name, email, and message are required.");
        }

        if (
            name.length > 100 ||
            email.length > 254 ||
            message.length > 3000
        ) {
            throw new Error("One or more fields are too long.");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Please provide a valid email address.");
        }

        const sheet = getResponsesSheet();

        sheet.appendRow([
            safeCellText(name),
            safeCellText(email),
            safeCellText(message),
            new Date()
        ]);

        return jsonResponse({
            success: true,
            message: "Your message has been received."
        });

    } catch (error) {
        console.error(error);

        return jsonResponse({
            success: false,
            message: "The submission could not be processed."
        });
    }
}


/**
 * Prevent user-provided values beginning with spreadsheet
 * formula characters from being interpreted as formulas.
 */
function safeCellText(value) {
    const text = String(value);

    if (/^[=+\-@]/.test(text)) {
        return "'" + text;
    }

    return text;
}


/**
 * Builds a JSON response.
 */
function jsonResponse(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}