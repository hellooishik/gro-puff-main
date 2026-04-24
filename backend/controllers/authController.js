const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    let { name, email, password, username, phone, role } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please add email and password');
    }

    if (!name) name = email.split('@')[0];
    if (!username) username = `${name}_${Date.now().toString().slice(-4)}`;
    if (!phone) phone = 'None Provided';

    // Check if user exists (by email or username)
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email or username already exists');
    }

    // Create user
    // Role can be passed in verify (e.g. for admin creation) or defaulted.
    // Ideally admin creation shouldn't be public. For MVP, we allow role passing validation or specific logic.
    // Here we allow passing role for seeding purposes, but in production, we'd restrict it.

    const user = await User.create({
        name,
        email,
        password,
        username,
        phone,
        role: role || 'customer',
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.json({
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        phone: req.user.phone,
        role: req.user.role,
        avatar: req.user.avatar,
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name !== undefined ? req.body.name : user.name;
        user.email = req.body.email !== undefined ? req.body.email : user.email;
        user.username = req.body.username !== undefined ? req.body.username : user.username;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

        if (req.body.avatar !== undefined) {
            user.avatar = req.body.avatar;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            username: updatedUser.username,
            phone: updatedUser.phone,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/auth
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/auth/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/auth/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name !== undefined ? req.body.name : user.name;
        user.email = req.body.email !== undefined ? req.body.email : user.email;
        user.username = req.body.username !== undefined ? req.body.username : user.username;
        user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
        user.role = req.body.role || user.role;

        if (req.body.avatar !== undefined) {
            user.avatar = req.body.avatar;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            username: updatedUser.username,
            phone: updatedUser.phone,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    getUsers,
    getUserById,
    updateUser,
};
