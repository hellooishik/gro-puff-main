const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema(
    {
        giftPackingRate: {
            type: Number,
            required: true,
            default: 2.00,
        },
        promotionalOffers: {
            type: [String],
            required: true,
            default: ['£10 OFF Your First Order!', 'Spend £20 Get Free Milk!'],
        },
    },
    {
        timestamps: true,
    }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
