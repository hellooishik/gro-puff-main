const asyncHandler = require('express-async-handler');
const Settings = require('../models/settingsModel');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({});
    if (!settings) {
        settings = await Settings.create({
            giftPackingRate: 2.00,
            promotionalOffers: ['£10 OFF Your First Order!', 'Spend £20 Get Free Milk!']
        });
    }
    res.json(settings);
});

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const { giftPackingRate, promotionalOffers } = req.body;

    let settings = await Settings.findOne({});

    if (!settings) {
        settings = new Settings({});
    }

    settings.giftPackingRate = giftPackingRate !== undefined ? giftPackingRate : settings.giftPackingRate;
    settings.promotionalOffers = promotionalOffers !== undefined ? promotionalOffers : settings.promotionalOffers;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

module.exports = {
    getSettings,
    updateSettings,
};
