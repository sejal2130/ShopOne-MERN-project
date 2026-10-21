const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Default login credentials
    const users = [
      {
        name: 'ShopNest Admin',
        email: 'admin@shopnest.com',
        password: 'Admin123!',
        isAdmin: true,
      },
      {
        name: 'ShopNest Customer',
        email: 'customer@shopnest.com',
        password: 'Customer123!',
        isAdmin: false,
      },
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await User.findOneAndUpdate(
        { email: userData.email },
        {
          $set: {
            name: userData.name,
            password: hashedPassword,
            isAdmin: userData.isAdmin,
          },
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    // Sample products
    const products = [
      {
        name: 'Nike Air Max Shoes',
        description: 'Comfortable everyday sports shoes.',
        price: 2499,
        category: 'Footwear',
        stock: 20,
        imageUrl: 'https://placehold.co/600x600?text=Nike+Shoes',
      },
      {
        name: 'Classic Cotton T-Shirt',
        description: 'Soft cotton T-shirt for everyday wear.',
        price: 799,
        category: 'Clothing',
        stock: 50,
        imageUrl: 'https://placehold.co/600x600?text=T-Shirt',
      },
      {
        name: 'Wireless Headphones',
        description: 'Wireless headphones for music and calls.',
        price: 1999,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://placehold.co/600x600?text=Headphones',
      },
      {
        name: 'Smart Watch',
        description: 'Smart watch with fitness tracking features.',
        price: 2999,
        category: 'Electronics',
        stock: 12,
        imageUrl: 'https://placehold.co/600x600?text=Smart+Watch',
      },
    ];

    // Insert sample products only if the collection is empty.
    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      await Product.insertMany(products);
      console.log('Sample products inserted.');
    } else {
      console.log(
        `Products already exist (${productCount}). Skipping product seeding.`
      );
    }

    console.log('\nSeed completed successfully.');
    console.log('Admin: admin@shopnest.com / Admin123!');
    console.log('Customer: customer@shopnest.com / Customer123!');

    process.exitCode = 0;
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  }
};

seedData();