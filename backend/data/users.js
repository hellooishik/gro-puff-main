const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by model if using create/save, but insertMany bypasses hooks? Yes, insertMany bypasses pre-save hooks usually.
        // For seeder, we might need to pre-hash or use a loop.
        // Or just store plain text and rely on manual hashing in seeder if model logic isn't used.
        // Actually, let's fix the seeder logic to use create or hash manually.
        // For simplicity in data file, we keep plain text, and handle hashing in seeder or just store hashed here?
        // Let's store hashed here to be safe if insertMany is used.
        // Wait, bcrypt is async.
        // Better: change seeder to use User.create() in a loop or fix data.
        // For now, I'll put a placeholder hash for 'password123'.
        // Hash for '123456': $2a$10$3/2.D.X/2.
        // Hash for 'password123' (approx): $2y$10$ ...
        // Let's rely on seeder doing the right thing or Use Create.
        // I'll update seeder.js to use User.create() inside a Promise.all or for loop, OR just manually hash here.
        isAdmin: true,
        role: 'admin'
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isAdmin: false,
        role: 'customer'
    },
    {
        name: 'Delivery Partner',
        email: 'driver@example.com',
        password: 'password123',
        role: 'delivery'
    }
];

module.exports = users;
