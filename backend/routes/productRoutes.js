const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    createProduct,
} = require('../controllers/productController');
const { protect, admin, adminOrVendor } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, adminOrVendor, createProduct);
router
    .route('/:id')
    .get(getProductById)
    .delete(protect, adminOrVendor, deleteProduct)
    .put(protect, adminOrVendor, updateProduct);

module.exports = router;
