const express = require('express');
const router = express.Router();
const {
    getSmsSettings,
    updateSmsSettings,
    getSmsTemplates,
    updateSmsTemplate,
    getSmsLogs
} = require('../controllers/smsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/settings')
    .get(protect, admin, getSmsSettings)
    .put(protect, admin, updateSmsSettings);

router.route('/templates')
    .get(protect, admin, getSmsTemplates);

router.route('/templates/:id')
    .put(protect, admin, updateSmsTemplate);

router.route('/logs')
    .get(protect, admin, getSmsLogs);

module.exports = router;
