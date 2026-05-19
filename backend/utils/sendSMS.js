const { getTwilioClient, getTwilioPhoneNumber } = require('../services/twilioService');

// In-memory queue to handle concurrent SMS requests without hitting rate limits
const smsQueue = [];
let isProcessingQueue = false;

/**
 * Validates basic phone number structure before sending.
 * Requires E.164 format (e.g. +447123456789)
 */
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};

/**
 * Process the queue items sequentially.
 */
const processQueue = async () => {
    if (isProcessingQueue || smsQueue.length === 0) return;
    isProcessingQueue = true;

    while (smsQueue.length > 0) {
        const item = smsQueue.shift();
        await executeSend(item);
        // Basic rate limit spacing (1 second between messages)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    isProcessingQueue = false;
};

/**
 * Executes the SMS sending with retry logic.
 */
const executeSend = async ({ phone, message, retryCount, maxRetries }) => {
    const client = getTwilioClient();
    const fromPhone = getTwilioPhoneNumber();

    if (!client || !fromPhone) {
        console.warn(`[SMS Service] Twilio client not configured. Cannot send SMS to ${phone}.`);
        return;
    }

    try {
        const response = await client.messages.create({
            body: message,
            from: fromPhone,
            to: phone
        });
        console.log(`[SMS Service] Success: SMS sent to ${phone}. SID: ${response.sid}`);
    } catch (error) {
        console.error(`[SMS Service] Error sending SMS to ${phone}: ${error.message}`);
        
        if (retryCount < maxRetries) {
            console.log(`[SMS Service] Retrying SMS to ${phone} (Attempt ${retryCount + 1} of ${maxRetries})`);
            // Add back to queue with incremented retry count
            smsQueue.push({ phone, message, retryCount: retryCount + 1, maxRetries });
        } else {
            console.error(`[SMS Service] Max retries reached. Failed to send SMS to ${phone}.`);
        }
    }
};

/**
 * Main export function to trigger an SMS.
 * @param {string} phone - Target phone number in E.164 format.
 * @param {string} message - The content of the SMS.
 */
const sendSMS = async (phone, message) => {
    if (!phone || !message) {
        console.error('[SMS Service] Phone number and message are required.');
        return;
    }

    if (!isValidPhoneNumber(phone)) {
        console.error(`[SMS Service] Invalid phone number format: ${phone}. Must be E.164 format.`);
        return;
    }

    // Add to queue
    smsQueue.push({ phone, message, retryCount: 0, maxRetries: 3 });
    
    // Trigger queue processing asynchronously
    processQueue();
};

module.exports = { sendSMS };
