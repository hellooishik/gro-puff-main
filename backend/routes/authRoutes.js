const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    getUsers,
    getUserById,
    updateUser,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').put(protect, updateUserProfile);
router.get('/me', protect, getMe);

// Admin routes
router.route('/').get(protect, admin, getUsers);
router.route('/:id').get(protect, admin, getUserById).put(protect, admin, updateUser);

module.exports = router;
