const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');

// @desc    Fetch all coupons
// @route   GET /api/coupons
// @access  Public
const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({});
    res.json(coupons);
});

// @desc    Verify and apply a coupon
// @route   GET /api/coupons/verify/:code
// @access  Private
const verifyCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });

    if (coupon) {
        if (coupon.isActive) {
            res.json(coupon);
        } else {
            res.status(400);
            throw new Error('This coupon is no longer active.');
        }
    } else {
        res.status(404);
        throw new Error('Invalid coupon code.');
    }
});

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const { code, discount, isActive } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = new Coupon({
        code: code.toUpperCase(),
        discount,
        isActive: isActive !== undefined ? isActive : true,
        creator: req.user._id,
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const { code, discount, isActive } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.code = code ? code.toUpperCase() : coupon.code;
        coupon.discount = discount !== undefined ? discount : coupon.discount;
        coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        await coupon.deleteOne();
        res.json({ message: 'Coupon removed' });
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
});

module.exports = { getCoupons, verifyCoupon, createCoupon, updateCoupon, deleteCoupon };
