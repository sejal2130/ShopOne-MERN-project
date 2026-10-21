
const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from backend/.env");
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  });

  const connection = mongoose.connection;

  if (!connection.db) {
    throw new Error("MongoDB connected without a database handle.");
  }

  console.log("MongoDB Connected:", connection.host);
  console.log("Database Name:", connection.name);

  await connection.db.collection("connectiontests").updateOne(
    { _id: "shopone-test" },
    {
      $set: {
        message: "ShopNest database is working",
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  console.log("ShopNest test document created successfully.");
}

module.exports = connectDB;
