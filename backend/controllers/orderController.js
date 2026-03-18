const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const https = require('https');
const Product = require('../models/productModel');
const sendEmail = require('../utils/sendEmail');

// Helper for Haversine
function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    var R = 3958.8;
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    let {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // 1. Haversine Distance Check
    try {
        const postcodeData = await new Promise((resolve, reject) => {
            https.get(`https://api.postcodes.io/postcodes/${encodeURIComponent(shippingAddress.postalCode)}`, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch(e) { reject(e); }
                });
            }).on('error', err => reject(err));
        });

        if (!postcodeData || !postcodeData.result) {
            res.status(400);
            throw new Error('Invalid postcode. Please enter a valid UK postcode.');
        }

        const { latitude, longitude } = postcodeData.result;
        const STORE_LAT = 51.5898;
        const STORE_LON = -0.3394;
        const distance = getDistanceFromLatLonInMiles(STORE_LAT, STORE_LON, latitude, longitude);
        
        if (distance > 1.0) {
            res.status(400);
            throw new Error('We are currently expanding. Your area will be available soon.');
        }

    } catch (error) {
        res.status(400);
        throw new Error(error.message || 'Error validating area. Please enter a valid UK postcode.');
    }

    // 2. Offer: Free Milk if itemsPrice >= 20
    if (Number(itemsPrice) >= 20) {
        const milkProduct = await Product.findOne({ name: { $regex: /milk/i } });
        if (milkProduct && !orderItems.find(x => x.isFreeItem || x.product.toString() === milkProduct._id.toString() && x.price === 0)) {
            orderItems.push({
                name: milkProduct.name,
                qty: 1,
                image: milkProduct.image,
                price: 0,
                isFreeItem: true,
                product: milkProduct._id
            });
        }
    }

    // 3. Offer: First Order Discount
    let discount = 0;
    const previousOrders = await Order.countDocuments({ 
        user: req.user._id,
        status: { $ne: 'Cancelled' }
    });

    if (previousOrders === 0) {
        discount = 10;
    }

    // 4. Recalulate Total Price
    itemsPrice = Number(itemsPrice) || 0;
    taxPrice = Number(taxPrice) || 0;
    shippingPrice = Number(shippingPrice) || 0;
    
    let calculatedTotal = (itemsPrice + taxPrice + shippingPrice) - discount;
    let totalPrice = calculatedTotal > 0 ? calculatedTotal : 0;

    const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod: paymentMethod || 'COD',
        itemsPrice,
        taxPrice,
        shippingPrice,
        discount,
        totalPrice,
        status: 'Pending',
        isPaid: false
    });

    const createdOrder = await order.save();

    // Send order confirmation email
    try {
        const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile`; // Or specific order page when ready
        const message = `
            <h2>Thank you for your order, ${req.user.name}!</h2>
            <p>Your order <strong>#${createdOrder._id}</strong> has been successfully placed.</p>
            <p><strong>Total Amount:</strong> £${createdOrder.totalPrice.toFixed(2)}</p>
            <p>We will notify you once it ships. You can view your order details <a href="${orderUrl}">here</a>.</p>
        `;
        await sendEmail({
            email: req.user.email,
            subject: `Order Confirmation - #${createdOrder._id}`,
            html: message,
        });
    } catch (error) {
        console.error('Email could not be sent:', error);
    }

    res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        // Only admin or the user who created it can view the order
        if (req.user.role === 'admin' || order.user._id.toString() === req.user._id.toString()) {
            res.json(order);
        } else {
            res.status(401);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    // Sort by createdAt desc
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    addOrderItems,
    getOrderById,
    getMyOrders,
    getOrders,
    updateOrderStatus,
};
