const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    gameStyle: {
      type: String,
      required: [true, "Game style is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Créer un index composé pour éviter les doublons
favoriteSchema.index({ username: 1, gameStyle: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
