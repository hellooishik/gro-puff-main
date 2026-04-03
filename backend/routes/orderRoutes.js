const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    getVendorSales,
    cancelOrder,
    updateOrderToPaid
} = require('../controllers/orderController');
const { protect, admin, adminOrVendor } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/vendor-sales').get(protect, adminOrVendor, getVendorSales);
router.route('/my').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);

module.exports = router;
