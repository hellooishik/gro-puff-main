const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Fix: Use correct relative path since we run it from the root folder
const User = require('./models/userModel');

dotenv.config();

const seedVendor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        await User.deleteOne({ email: 'vendor@winkin.com' });

        const vendor = new User({
            name: 'Winkin MegaFarm',
            email: 'vendor@winkin.com',
            password: 'password', // will be hashed by pre-save
            username: 'winkin_vendor',
            phone: '555-000-FARM',
            role: 'vendor'
        });

        await vendor.save();
        console.log('Test vendor created successfully! email: vendor@winkin.com / password: password');
        process.exit();
    } catch (error) {
        console.error('Error seeding vendor:', error);
        process.exit(1);
    }
};

seedVendor();
