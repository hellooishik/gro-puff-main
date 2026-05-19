const mongoose = require('mongoose');

const smsLogSchema = mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        eventId: {
            type: String,
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: false,
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending',
        },
        retryCount: {
            type: Number,
            default: 0,
        },
        errorMessage: {
            type: String,
            default: '',
        },
        providerResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SmsLog', smsLogSchema);
