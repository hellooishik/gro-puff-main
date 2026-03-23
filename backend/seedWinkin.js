const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');

dotenv.config();
connectDB();

const categories = [
    { name: 'Snacks', icon: '🍿', description: 'Chips, popcorn, and quick bites' },
    { name: 'Drinks', icon: '🥤', description: 'Sodas, juices, and water' },
    { name: 'Alcohol', icon: '🍺', description: 'Beers, wines, and spirits' },
    { name: 'Grocery', icon: '🥑', description: 'Everyday essentials and fresh produce' },
    { name: 'Cleaning', icon: '🧼', description: 'Household cleaning supplies' },
    { name: 'Ice Cream', icon: '🍦', description: 'Frozen treats and desserts' },
    { name: 'Bakery', icon: '🥐', description: 'Fresh bread, croissants, and pastries' },
    { name: 'Beauty', icon: '💄', description: 'Cosmetics and personal care' }
];

const mockProducts = [
    { cat: 'Snacks', items: [{ name: 'Doritos Nacho Cheese', price: 3.50, brand: 'Doritos' }, { name: 'Pringles Original', price: 2.99, brand: 'Pringles' }]},
    { cat: 'Drinks', items: [{ name: 'Coca-Cola 2L', price: 2.50, brand: 'Coca-Cola' }, { name: 'Orange Juice 1L', price: 3.00, brand: 'Tropicana' }]},
    { cat: 'Alcohol', items: [{ name: 'Heineken 6-Pack', price: 8.99, brand: 'Heineken' }, { name: 'Smirnoff Vodka 70cl', price: 15.00, brand: 'Smirnoff' }]},
    { cat: 'Grocery', items: [{ name: 'Fresh Avocados (Count 3)', price: 4.50, brand: 'Fresh Produce' }, { name: 'Organic Bananas Bunch', price: 1.99, brand: 'Fresh Produce' }]},
    { cat: 'Cleaning', items: [{ name: 'Fairy Liquid Lemon', price: 1.50, brand: 'Fairy' }, { name: 'Bleach Multi-Purpose', price: 2.20, brand: 'Domestos' }]},
    { cat: 'Ice Cream', items: [{ name: 'Ben & Jerry Cookie Dough', price: 5.50, brand: 'Ben & Jerry' }, { name: 'Magnum Classic (4 Pack)', price: 4.99, brand: 'Magnum' }]},
    { cat: 'Bakery', items: [{ name: 'Fresh Butter Croissant', price: 1.20, brand: 'Bakery Fresh' }, { name: 'Sliced White Bread', price: 1.50, brand: 'Hovis' }]},
    { cat: 'Beauty', items: [{ name: 'ChapStick Classic', price: 1.99, brand: 'ChapStick' }, { name: 'Revlon Super Lustrous Lipstick', price: 7.50, brand: 'Revlon' }]}
];

const seedData = async () => {
    try {
        console.log('Fetching Admin User...');
        const adminUser = await User.findOne({ role: 'admin' });
        const userId = adminUser ? adminUser._id : null;
        
        if (!userId) {
            console.error('No admin user found! Cannot seed products requiring a user reference.');
            const anyUser = await User.findOne({});
            if (!anyUser) {
                process.exit(1);
            }
        }
        
        const finalUserId = userId || (await User.findOne({}))._id;

        console.log('Clearing old categories...');
        await Category.deleteMany();
        console.log('Inserting requested categories...');
        await Category.insertMany(categories);
        console.log('Categories inserted!');

        console.log('Clearing old products...');
        await Product.deleteMany();
        console.log('Injecting fresh mock products...');
        
        const productsToInsert = [];
        for (const data of mockProducts) {
            for (const item of data.items) {
                productsToInsert.push({
                    name: item.name,
                    price: item.price,
                    brand: item.brand,
                    category: data.cat,
                    image: 'https://via.placeholder.com/300x300.png?text=' + encodeURIComponent(item.name),
                    description: 'Premium absolute quality ' + item.name + ' delivered right to your door.',
                    countInStock: 50,
                    numOrders: Math.floor(Math.random() * 50), // Randomize trending ranking
                    user: finalUserId
                });
            }
        }
        
        await Product.insertMany(productsToInsert);
        console.log('Successfully injected Products! Script complete.');
        process.exit();
    } catch (error) {
        console.error('Error with import:', error);
        process.exit(1);
    }
}

seedData();
