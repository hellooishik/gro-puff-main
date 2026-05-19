const asyncHandler = require('express-async-handler');
const SmsSettings = require('../models/smsSettingsModel');
const SmsTemplate = require('../models/smsTemplateModel');
const SmsLog = require('../models/smsLogModel');

// @desc    Get SMS Settings
// @route   GET /api/sms/settings
// @access  Private/Admin
const getSmsSettings = asyncHandler(async (req, res) => {
    let settings = await SmsSettings.findOne();
    if (!settings) {
        settings = await SmsSettings.create({});
    }
    res.json(settings);
});

// @desc    Update SMS Settings
// @route   PUT /api/sms/settings
// @access  Private/Admin
const updateSmsSettings = asyncHandler(async (req, res) => {
    let settings = await SmsSettings.findOne();
    if (!settings) {
        settings = new SmsSettings();
    }

    const { provider, apiKey, apiSecret, senderId, adminPhone, isEnabled } = req.body;

    settings.provider = provider || settings.provider;
    settings.apiKey = apiKey !== undefined ? apiKey : settings.apiKey;
    settings.apiSecret = apiSecret !== undefined ? apiSecret : settings.apiSecret;
    settings.senderId = senderId || settings.senderId;
    settings.adminPhone = adminPhone !== undefined ? adminPhone : settings.adminPhone;
    settings.isEnabled = isEnabled !== undefined ? isEnabled : settings.isEnabled;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

// @desc    Get all SMS Templates
// @route   GET /api/sms/templates
// @access  Private/Admin
const getSmsTemplates = asyncHandler(async (req, res) => {
    let templates = await SmsTemplate.find({});
    
    // Seed default templates if empty
    if (templates.length === 0) {
        const defaultTemplates = [
            { eventId: 'order_placed_customer', name: 'Customer - Order Placed', body: 'Hi {{customer_name}}, your Winkin order #{{order_id}} worth £{{order_amount}} has been confirmed successfully. Estimated delivery: {{delivery_time}}.' },
            { eventId: 'order_placed_admin', name: 'Admin - New Order', body: 'New Winkin order received. Order #{{order_id}} | £{{order_amount}} | {{payment_method}} | Customer: {{customer_name}}' },
            { eventId: 'order_out_for_delivery', name: 'Customer - Out for Delivery', body: 'Hi {{customer_name}}, your Winkin order #{{order_id}} is out for delivery and will arrive shortly!' },
            { eventId: 'order_delivered', name: 'Customer - Delivered', body: 'Hi {{customer_name}}, your Winkin order #{{order_id}} has been delivered. Enjoy!' },
            { eventId: 'order_cancelled', name: 'Customer - Cancelled', body: 'Hi {{customer_name}}, your Winkin order #{{order_id}} has been cancelled.' }
        ];
        templates = await SmsTemplate.insertMany(defaultTemplates);
    }
    
    res.json(templates);
});

// @desc    Update an SMS Template
// @route   PUT /api/sms/templates/:id
// @access  Private/Admin
const updateSmsTemplate = asyncHandler(async (req, res) => {
    const template = await SmsTemplate.findById(req.params.id);

    if (template) {
        template.body = req.body.body || template.body;
        template.isEnabled = req.body.isEnabled !== undefined ? req.body.isEnabled : template.isEnabled;
        
        const updatedTemplate = await template.save();
        res.json(updatedTemplate);
    } else {
        res.status(404);
        throw new Error('Template not found');
    }
});

// @desc    Get SMS Logs
// @route   GET /api/sms/logs
// @access  Private/Admin
const getSmsLogs = asyncHandler(async (req, res) => {
    const logs = await SmsLog.find({}).sort({ createdAt: -1 }).limit(100);
    res.json(logs);
});

module.exports = {
    getSmsSettings,
    updateSmsSettings,
    getSmsTemplates,
    updateSmsTemplate,
    getSmsLogs
};
