
/**
 * Receive POST request from Admin panel and create Google Calendar event.
 */
function doPost(e) {
    try {
        // 1. Parse Data
        var data;
        if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else {
            return createResponse({ error: "No data received" }, 400);
        }

        // 2. Validate
        if (!data.title || !data.startTime || !data.endTime) {
            return createResponse({ error: "Missing required fields (title, startTime, endTime)" }, 400);
        }

        // 3. Create Event
        var calendar = CalendarApp.getDefaultCalendar();

        // Parse times
        var start = new Date(data.startTime);
        var end = new Date(data.endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return createResponse({ error: "Invalid date format" }, 400);
        }

        var options = {
            description: data.description || "",
            location: data.location || ""
        };

        var event = calendar.createEvent(data.title, start, end, options);

        // 4. Return Success
        return createResponse({
            success: true,
            eventId: event.getId(),
            message: "Event created successfully"
        });

    } catch (err) {
        return createResponse({ error: err.toString() }, 500);
    }
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions(e) {
    return createResponse({ status: "check" });
}

/**
 * Handle GET to verify deployment
 */
function doGet(e) {
    return createResponse({ status: "running", message: "GAS Calendar Sync Service is Running!" });
}

/**
 * Helper to create JSON response with CORS headers
 */
function createResponse(data, code) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
