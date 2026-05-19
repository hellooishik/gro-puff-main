const SmsLog = require('../models/smsLogModel');
const SmsSettings = require('../models/smsSettingsModel');

const MAX_RETRIES = 3;

/**
 * Send SMS using The SMS Works (or fallback to Mock)
 */
const sendSmsViaProvider = async (settings, phone, body) => {
    if (settings.provider === 'Mock' || !settings.apiKey) {
        console.log(`[SMS MOCK] Sending to ${phone}: "${body}" (Sender: ${settings.senderId})`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'Mock sent successfully' };
    }

    if (settings.provider === 'The SMS Works') {
        try {
            const response = await fetch('https://api.thesmsworks.co.uk/v1/message/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': settings.apiKey, // SMS Works uses API key as token
                },
                body: JSON.stringify({
                    sender: settings.senderId,
                    destination: phone,
                    content: body
                })
            });

            const data = await response.json();
            
            if (response.ok && data.messageid) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Unknown error from The SMS Works' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Vonage / Nexmo support
    if (settings.provider === 'Vonage') {
        try {
            const response = await fetch('https://rest.nexmo.com/sms/json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    api_key: settings.apiKey,
                    api_secret: settings.apiSecret,
                    to: phone,
                    from: settings.senderId,
                    text: body
                }).toString()
            });

            const data = await response.json();
            
            if (data.messages && data.messages[0].status === "0") {
                return { success: true, data };
            } else {
                return { success: false, error: data.messages ? data.messages[0]['error-text'] : 'Unknown error from Vonage' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Default to mock if provider not fully implemented
    console.log(`[SMS MOCK Fallback] Sending to ${phone}: "${body}"`);
    return { success: true, message: 'Mock fallback sent successfully' };
};

/**
 * Process pending SMS queue
 */
const processQueue = async () => {
    try {
        const settings = await SmsSettings.findOne();
        if (!settings || !settings.isEnabled) {
            return;
        }

        // Find pending messages or messages that failed but haven't reached max retries
        const pendingLogs = await SmsLog.find({
            status: { $in: ['pending', 'failed'] },
            retryCount: { $lt: MAX_RETRIES }
        }).sort({ createdAt: 1 }).limit(10); // Process 10 at a time

        if (pendingLogs.length === 0) return;

        for (const log of pendingLogs) {
            // Increment retry count immediately
            log.retryCount += 1;
            
            const result = await sendSmsViaProvider(settings, log.phone, log.body);

            if (result.success) {
                log.status = 'sent';
                log.providerResponse = result.data || result.message;
                log.errorMessage = '';
                console.log(`[SMS Worker] Successfully sent SMS to ${log.phone}`);
            } else {
                log.status = 'failed';
                log.errorMessage = result.error;
                log.providerResponse = result.data || {};
                console.error(`[SMS Worker] Failed to send SMS to ${log.phone}: ${result.error}`);
            }

            await log.save();
        }

    } catch (error) {
        console.error('[SMS Worker] Error processing queue:', error);
    }
};

/**
 * Initialize background worker
 */
const startSmsWorker = () => {
    console.log('[SMS Worker] Starting background queue processor (interval: 30s)');
    setInterval(processQueue, 30000); // Run every 30 seconds
};

module.exports = {
    startSmsWorker
};
