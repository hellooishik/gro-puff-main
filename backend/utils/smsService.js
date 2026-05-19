const SmsLog = require('../models/smsLogModel');
const SmsTemplate = require('../models/smsTemplateModel');
const SmsSettings = require('../models/smsSettingsModel');

/**
 * Replace placeholders in template with actual data
 */
const compileTemplate = (templateBody, data) => {
    let compiled = templateBody;
    for (const key in data) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        compiled = compiled.replace(regex, data[key]);
    }
    return compiled;
};

/**
 * Queue an SMS message for processing
 * @param {string} eventId - Template ID (e.g., 'order_placed', 'order_delivered')
 * @param {string} phone - Target phone number
 * @param {object} templateData - Data to replace placeholders
 * @param {string} orderId - Optional order reference
 */
const queueSms = async (eventId, phone, templateData = {}, orderId = null) => {
    try {
        // Check if settings allow sending
        const settings = await SmsSettings.findOne();
        if (!settings || !settings.isEnabled) {
            console.log(`[SMS] System disabled. Skipping SMS for event: ${eventId}`);
            return;
        }

        // Fetch template
        const template = await SmsTemplate.findOne({ eventId });
        if (!template) {
            console.log(`[SMS] No template found for event: ${eventId}`);
            return;
        }

        if (!template.isEnabled) {
            console.log(`[SMS] Template disabled for event: ${eventId}`);
            return;
        }

        if (!phone) {
            console.log(`[SMS] No phone number provided for event: ${eventId}`);
            return;
        }

        // Compile body
        const body = compileTemplate(template.body, templateData);

        // Deduplication check: Avoid sending exact same message to same phone for same order within 5 minutes
        if (orderId) {
            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existingLog = await SmsLog.findOne({
                eventId,
                orderId,
                phone,
                createdAt: { $gte: fiveMinsAgo }
            });

            if (existingLog) {
                console.log(`[SMS] Deduplication caught identical recent SMS for order ${orderId}`);
                return;
            }
        }

        // Create log entry (Queue)
        const log = new SmsLog({
            phone,
            body,
            eventId,
            orderId,
            status: 'pending',
            retryCount: 0
        });

        await log.save();
        console.log(`[SMS] Queued message to ${phone} for event ${eventId}`);
    } catch (error) {
        console.error('[SMS] Error queueing SMS:', error);
    }
};

module.exports = {
    queueSms,
};
