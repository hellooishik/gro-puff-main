const mongoose = require('mongoose');

const smsSettingsSchema = mongoose.Schema(
    {
        provider: {
            type: String,
            required: true,
            default: 'The SMS Works',
            enum: ['The SMS Works', 'Vonage', 'Twilio', 'Mock'],
        },
        apiKey: {
            type: String,
            default: '',
        },
        apiSecret: {
            type: String,
            default: '',
        },
        senderId: {
            type: String,
            required: true,
            default: 'Winkin',
        },
        adminPhone: {
            type: String,
            default: '',
            description: 'Phone number to receive admin notifications'
        },
        isEnabled: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SmsSettings', smsSettingsSchema);
