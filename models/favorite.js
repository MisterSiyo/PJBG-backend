const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  favorites: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Favorite = mongoose.model("Favorites", favoriteSchema);

module.exports = Favorite;
