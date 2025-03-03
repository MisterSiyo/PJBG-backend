const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const pjbgDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connecté avec succès");
    console.log("📁 Database name:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Erreur de connexion à MongoDB:", error);
    process.exit(1);
  }
};

module.exports = pjbgDB;
