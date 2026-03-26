const express = require('express');
const router = express.Router();
const {
    getCoupons,
    verifyCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCoupons)
    .post(protect, admin, createCoupon);

router.get('/verify/:code', protect, verifyCoupon);

router.route('/:id')
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

module.exports = router;
