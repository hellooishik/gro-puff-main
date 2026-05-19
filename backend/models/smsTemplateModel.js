const mongoose = require('mongoose');

const smsTemplateSchema = mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true, // e.g. 'order_placed_customer', 'order_placed_admin', 'order_delivered'
        },
        name: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SmsTemplate', smsTemplateSchema);
