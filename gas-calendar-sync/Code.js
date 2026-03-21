const SHEET_NAMES = {
    EVENTS: 'Events',
    REGISTRATIONS: 'Registrations',
    FEEDBACK: 'Feedback',
    INSTRUCTOR: 'Instructor',
    SETTINGS: 'Settings'
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
            case 'updateEvent':
                result = updateEvent(body);
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
            case 'updateRegistrationStatus':
                result = updateRegistrationStatus(body);
                break;
            case 'deleteRegistration':
                result = deleteRegistration(body);
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

            case 'getPaymentSettings':
                result = getPaymentSettings();
                break;
            case 'savePaymentSettings':
                result = savePaymentSettings(body);
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
        status: 'upcoming',
        prefecture: data.prefecture || '',
        address: data.address || '',
        mapUrl: data.mapUrl || ''
    };

    addToSheet(SHEET_NAMES.EVENTS, newEvent);

    // Sync to Google Calendar
    try {
        const calendar = CalendarApp.getDefaultCalendar();
        const startDateTime = new Date(newEvent.date.split('T')[0] + 'T' + newEvent.startTime + ':00');
        const endDateTime = new Date(newEvent.date.split('T')[0] + 'T' + newEvent.endTime + ':00');

        if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
            let titlePrefix = '';
            let location = newEvent.location;

            if (newEvent.type === 'Zoom') {
                titlePrefix = '[Zoom] ';
                location = 'Zoom';
            } else if (newEvent.type === '対面') {
                const pref = newEvent.prefecture || '現地';
                titlePrefix = `[${pref}] `;
                // Combine address and location name for Calendar location field
                location = `${newEvent.address || ''} ${newEvent.location || ''}`.trim();
            }

            const calendarTitle = titlePrefix + newEvent.title;
            const description = newEvent.description +
                (newEvent.mapUrl ? `\n\nGoogle Map: ${newEvent.mapUrl}` : '');

            calendar.createEvent(calendarTitle, startDateTime, endDateTime, {
                description: description,
                location: location
            });
        }
    } catch (e) {
        console.error("Calendar Sync Failed: " + e.toString());
        // Don't fail the API call just because calendar sync failed
    }

    return newEvent;
}

function updateEvent(data) {
    if (!data.id) throw new Error("Missing event ID");

    // Fields allowed to update
    const updateData = {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        location: data.location,
        capacity: data.capacity,
        price: data.price,
        prefecture: data.prefecture,
        address: data.address,
        mapUrl: data.mapUrl
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key =>
        (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]
    );

    return updateRow(SHEET_NAMES.EVENTS, 'id', data.id, updateData);
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

    // Send Confirmation Email
    try {
        const events = getEvents();
        const event = events.find(e => e.id === data.eventId);
        if (event) {
            sendConfirmationEmail(newReg, event);
        }
    } catch (e) {
        console.error("Failed to send email: " + e.toString());
    }

    return newReg;
}

function updateRegistrationStatus(data) {
    return updateRow(SHEET_NAMES.REGISTRATIONS, 'id', data.id, { status: data.status });
}

function deleteRegistration(data) {
    return deleteRow(SHEET_NAMES.REGISTRATIONS, 'id', data.id);
}

function sendConfirmationEmail(reg, event) {
    const paymentSettings = getPaymentSettings();

    let subject = `【予約完了】${event.title} へのお申し込みありがとうございます`;
    let body = `${reg.applicantName} 様\n\n` +
        `この度は「${event.title}」にお申し込みいただき、誠にありがとうございます。\n` +
        `以下の内容で予約を承りました。\n\n` +
        `■ご予約内容\n` +
        `イベント名: ${event.title}\n` +
        `日時: ${event.date.split('T')[0]} ${event.startTime} - ${event.endTime}\n` +
        `場所: ${event.type === 'Zoom' ? 'オンライン (Zoom)' : event.location}\n` +
        `参加費: ¥${Number(event.price).toLocaleString()}\n\n`;

    if (event.type === 'Zoom') {
        body += `■Zoom情報\n` +
            `Zoom ID : 9501470716\n` +
            `Password : vi31Wu\n\n` +
            `▼参加URL\n` +
            `https://us06web.zoom.us/j/9501470716?pwd=mF47KuwekItW9yiUPfMlhnTI4OExji.1\n\n`;
    }

    body += `■お支払いについて\n`;

    if (reg.paymentMethod === 'paypal') {
        body += `PayPalにてお支払いが完了しております。\n当日お会いできるのを楽しみにしております。\n`;
    } else if (reg.paymentMethod === 'bank_transfer') {
        body += `以下の口座へのお振込みをお願いいたします。\n\n` +
            `銀行名: ${paymentSettings.bankName}\n` +
            `支店名: ${paymentSettings.bankBranch}\n` +
            `口座番号: ${paymentSettings.bankAccount}\n` +
            `名義人: ${paymentSettings.bankAccountName}\n\n` +
            `※お振込み手数料はお客様負担となります。ご了承ください。\n`;
    } else if (reg.paymentMethod === 'paypay') {
        body += `以下のPayPay ID宛に送金をお願いいたします。\n\n` +
            `PayPay ID: ${paymentSettings.paypayId}\n\n` +
            `※送金時はメッセージにお名前をご記入ください。\n`;
    } else {
        body += `当日現地にてお支払い、または別途ご案内いたします。\n`;
    }

    body += `\n------------------------------------------------\n` +
        `未来少年タケル公式LINE\n` +
        `お問い合わせ: https://lin.ee/rquRPlF\n` +
        `------------------------------------------------\n`;

    GmailApp.sendEmail(reg.email, subject, body);
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
        createdAt: new Date().toISOString(),
        gender: data.gender || '',
        ageGroup: data.ageGroup || '',
        occupation: data.occupation || '',
        prefecture: data.prefecture || ''
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

// --- Settings ---
function getPaymentSettings() {
    const data = getSheetData(SHEET_NAMES.SETTINGS);
    // Convert array of [{key, value}] to object
    const settings = {
        bankName: '',
        bankBranch: '',
        bankAccount: '',
        bankAccountName: '',
        paypayId: ''
    };

    data.forEach(item => {
        if (settings.hasOwnProperty(item.key)) {
            settings[item.key] = item.value;
        }
    });

    return settings;
}

function savePaymentSettings(data) {
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    const existingData = sheet.getDataRange().getValues();
    const headers = existingData[0]; // key, value

    // Simple approach: Clear and rewrite, or update row by row.
    // Given it's small, let's just ensure we have rows for each key.

    const updates = {
        bankName: data.bankName || '',
        bankBranch: data.bankBranch || '',
        bankAccount: data.bankAccount || '',
        bankAccountName: data.bankAccountName || '',
        paypayId: data.paypayId || ''
    };

    // Helper to update or append
    const updateOrAppend = (key, value) => {
        const rows = sheet.getDataRange().getValues();
        let found = false;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][0] === key) {
                sheet.getRange(i + 1, 2).setValue(value);
                found = true;
                break;
            }
        }
        if (!found) {
            sheet.appendRow([key, value]);
        }
    };

    Object.keys(updates).forEach(key => {
        updateOrAppend(key, updates[key]);
    });

    return updates;
}


// --- Helpers ---

function getSheet(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        // Initialize headers if new
        let headers = [];
        if (name === SHEET_NAMES.EVENTS) headers = ['id', 'title', 'description', 'date', 'startTime', 'endTime', 'type', 'location', 'capacity', 'price', 'status', 'prefecture', 'address', 'mapUrl'];
        if (name === SHEET_NAMES.REGISTRATIONS) headers = ['id', 'eventId', 'applicantName', 'email', 'phone', 'registeredAt', 'status', 'surveySent', 'prefecture', 'dob', 'paymentMethod'];
        if (name === SHEET_NAMES.FEEDBACK) headers = ['id', 'eventId', 'authorName', 'rating', 'comment', 'isApproved', 'createdAt', 'gender', 'ageGroup', 'occupation', 'prefecture'];
        if (name === SHEET_NAMES.INSTRUCTOR) headers = ['name', 'title', 'introduction', 'imageUrl'];
        if (name === SHEET_NAMES.SETTINGS) headers = ['key', 'value'];

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
