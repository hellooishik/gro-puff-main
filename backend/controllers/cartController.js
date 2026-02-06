const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        res.json(cart.cartItems);
    } else {
        res.json([]);
    }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        // Check if product already exists in cart
        const itemIndex = cart.cartItems.findIndex(p => p.product.toString() === productId);

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.cartItems[itemIndex].qty = qty;
        } else {
            // Product does not exist in cart, add new item
            cart.cartItems.push({
                product: productId,
                name: product.name,
                image: product.image,
                price: product.price,
                qty,
            });
        }
        cart = await cart.save();
        res.status(201).json(cart.cartItems);
    } else {
        // Check if cart exists for user, if not create new
        const newCart = await Cart.create({
            user: req.user._id,
            cartItems: [{
                product: productId,
                name: product.name,
                image: product.image,
                price: product.price,
                qty,
            }],
        });
        res.status(201).json(newCart.cartItems);
    }
});

// @desc    Remove item from cart
// @route   POST /api/cart/remove
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);
        await cart.save();
        res.json(cart.cartItems);
    } else {
        res.status(404);
        throw new Error('Cart not found');
    }
});

module.exports = {
    getCart,
    addToCart,
    removeFromCart
};
