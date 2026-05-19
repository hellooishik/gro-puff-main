const twilio = require('twilio');

/**
 * Initialize Twilio Client securely using environment variables.
 * Do not hardcode credentials in source code.
 */
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

let twilioClient = null;

if (accountSid && authToken) {
    try {
        twilioClient = twilio(accountSid, authToken);
        console.log('[Twilio] Client initialized successfully.');
    } catch (error) {
        console.error('[Twilio] Error initializing client:', error);
    }
} else {
    console.warn('[Twilio] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN. Twilio is not initialized.');
}

const getTwilioClient = () => {
    return twilioClient;
};

const getTwilioPhoneNumber = () => {
    return process.env.TWILIO_PHONE_NUMBER;
};

module.exports = {
    getTwilioClient,
    getTwilioPhoneNumber
};
