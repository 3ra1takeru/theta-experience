const SHEET_NAMES = {
    EVENTS: 'Events',
    REGISTRATIONS: 'Registrations',
    FEEDBACK: 'Feedback',
    INSTRUCTOR: 'Instructor'
};

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    const lock = LockService.getScriptLock();
    // Wait up to 30 seconds for other concurrent executions to finish.
    lock.tryLock(30000);

    try {
        const params = e.parameter;
        const action = params.action;

        // For POST requests, the body is in e.postData.contents
        let body = {};
        if (e.postData && e.postData.contents) {
            try {
                body = JSON.parse(e.postData.contents);
            } catch (err) {
                // If it's not JSON, might be raw post data, but we mandate JSON in this API
                console.error("Failed to parse JSON body", err);
            }
        }

        // Dispatch based on action
        let result;
        switch (action) {
            case 'getEvents':
                result = getEvents();
                break;
            case 'createEvent':
                result = createEvent(body);
                break;
            case 'updateEventStatus':
                result = updateEventStatus(body);
                break;
            case 'deleteEvent':
                result = deleteEvent(body);
                break;

            case 'getRegistrations':
                result = getRegistrations();
                break;
            case 'createRegistration':
                result = createRegistration(body);
                break;
            case 'updateRegistrationStatus': // For future use
                result = updateRegistrationStatus(body);
                break;

            case 'getFeedback':
                result = getFeedback();
                break;
            case 'submitFeedback':
                result = submitFeedback(body);
                break;
            case 'approveFeedback':
                result = setFeedbackApproval(body, true);
                break;
            case 'unapproveFeedback':
                result = setFeedbackApproval(body, false);
                break;
            case 'deleteFeedback':
                result = deleteFeedback(body);
                break;

            case 'getInstructor':
                result = getInstructor();
                break;
            case 'updateInstructor':
                result = updateInstructor(body);
                break;

            default:
                // Verification endpoint
                result = { status: 'success', message: 'API is running' };
        }

        return createResponse(result);

    } catch (err) {
        return createResponse({ error: err.toString() });
    } finally {
        lock.releaseLock();
    }
}

// --- Events ---
function getEvents() {
    return getSheetData(SHEET_NAMES.EVENTS);
}

function createEvent(data) {
    if (!data.title || !data.date) throw new Error("Missing required fields");

    const id = 'evt-' + new Date().getTime();
    const newEvent = {
        id: id,
        title: data.title,
        description: data.description || '',
        date: data.date,
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        type: data.type || 'Zoom',
        location: data.location || '',
        capacity: data.capacity || 5,
        price: data.price || 0,
        status: 'upcoming'
    };

    addToSheet(SHEET_NAMES.EVENTS, newEvent);

    // Sync to Google Calendar
    try {
        const calendar = CalendarApp.getDefaultCalendar();
        const startDateTime = new Date(newEvent.date.split('T')[0] + 'T' + newEvent.startTime + ':00');
        const endDateTime = new Date(newEvent.date.split('T')[0] + 'T' + newEvent.endTime + ':00');

        if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
            calendar.createEvent(newEvent.title, startDateTime, endDateTime, {
                description: newEvent.description,
                location: newEvent.type === '対面' ? newEvent.location : 'Zoom'
            });
        }
    } catch (e) {
        console.error("Calendar Sync Failed: " + e.toString());
        // Don't fail the API call just because calendar sync failed
    }

    return newEvent;
}

function updateEventStatus(data) {
    return updateRow(SHEET_NAMES.EVENTS, 'id', data.id, { status: data.status });
}

function deleteEvent(data) {
    return deleteRow(SHEET_NAMES.EVENTS, 'id', data.id);
}

// --- Registrations ---
function getRegistrations() {
    return getSheetData(SHEET_NAMES.REGISTRATIONS);
}

function createRegistration(data) {
    const id = 'reg-' + new Date().getTime();
    const newReg = {
        id: id,
        eventId: data.eventId,
        applicantName: data.applicantName,
        email: data.email,
        phone: data.phone,
        registeredAt: new Date().toISOString(),
        status: 'confirmed',
        surveySent: false,
        prefecture: data.prefecture || '',
        dob: data.dob || '',
        paymentMethod: data.paymentMethod || ''
    };
    addToSheet(SHEET_NAMES.REGISTRATIONS, newReg);
    return newReg;
}

// --- Feedback ---
function getFeedback() {
    return getSheetData(SHEET_NAMES.FEEDBACK);
}

function submitFeedback(data) {
    const id = 'fb-' + new Date().getTime();
    const newFb = {
        id: id,
        eventId: data.eventId,
        authorName: data.authorName,
        rating: data.rating,
        comment: data.comment,
        isApproved: false,
        createdAt: new Date().toISOString()
    };
    addToSheet(SHEET_NAMES.FEEDBACK, newFb);
    return newFb;
}

function setFeedbackApproval(data, isApproved) {
    return updateRow(SHEET_NAMES.FEEDBACK, 'id', data.id, { isApproved: isApproved });
}

function deleteFeedback(data) {
    return deleteRow(SHEET_NAMES.FEEDBACK, 'id', data.id);
}

// --- Instructor ---
function getInstructor() {
    const data = getSheetData(SHEET_NAMES.INSTRUCTOR);
    // Return the first row or default
    if (data.length > 0) return data[0];
    return {
        name: '未来少年タケル',
        title: 'ThetaHealing® Certified Instructor',
        introduction: 'Default Introduction',
        imageUrl: ''
    };
}

function updateInstructor(data) {
    const sheet = getSheet(SHEET_NAMES.INSTRUCTOR);
    // Clear existing and write new
    if (sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    const newData = {
        name: data.name,
        title: data.title,
        introduction: data.introduction,
        imageUrl: data.imageUrl
    };

    addToSheet(SHEET_NAMES.INSTRUCTOR, newData);
    return newData;
}


// --- Helpers ---

function getSheet(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        // Initialize headers if new
        let headers = [];
        if (name === SHEET_NAMES.EVENTS) headers = ['id', 'title', 'description', 'date', 'startTime', 'endTime', 'type', 'location', 'capacity', 'price', 'status'];
        if (name === SHEET_NAMES.REGISTRATIONS) headers = ['id', 'eventId', 'applicantName', 'email', 'phone', 'registeredAt', 'status', 'surveySent', 'prefecture', 'dob', 'paymentMethod'];
        if (name === SHEET_NAMES.FEEDBACK) headers = ['id', 'eventId', 'authorName', 'rating', 'comment', 'isApproved', 'createdAt'];
        if (name === SHEET_NAMES.INSTRUCTOR) headers = ['name', 'title', 'introduction', 'imageUrl'];

        if (headers.length > 0) sheet.appendRow(headers);
    }
    return sheet;
}

function getSheetData(name) {
    const sheet = getSheet(name);
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];

    const headers = rows[0];
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        data.push(obj);
    }
    return data;
}

function addToSheet(name, obj) {
    const sheet = getSheet(name);
    const headers = sheet.getDataRange().getValues()[0];
    const row = [];
    for (let header of headers) {
        // Convert boolean to string or keep as is? specialized handling if needed
        row.push(obj[header] !== undefined ? obj[header] : '');
    }
    sheet.appendRow(row);
}

function updateRow(name, keyField, keyValue, updateObj) {
    const sheet = getSheet(name);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyIndex = headers.indexOf(keyField);

    if (keyIndex === -1) throw new Error("Key field not found");

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][keyIndex]) === String(keyValue)) {
            // Row found, update fields
            for (let key in updateObj) {
                let colIndex = headers.indexOf(key);
                if (colIndex !== -1) {
                    // setValue is 1-indexed for rows and cols
                    // getRange(row, col).setValue()
                    // row is i + 1
                    // col is colIndex + 1
                    sheet.getRange(i + 1, colIndex + 1).setValue(updateObj[key]);
                }
            }
            return { success: true };
        }
    }
    return { error: "Item not found" };
}

function deleteRow(name, keyField, keyValue) {
    const sheet = getSheet(name);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const keyIndex = headers.indexOf(keyField);

    if (keyIndex === -1) throw new Error("Key field not found");

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][keyIndex]) === String(keyValue)) {
            sheet.deleteRow(i + 1);
            return { success: true };
        }
    }
    return { error: "Item not found" };
}

function createResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
