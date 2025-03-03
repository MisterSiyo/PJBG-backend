const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  preferences: {
    plus: {
      type: Array,
      default: [],
    },
    moins: {
      type: Array,
      default: [],
    },
    blackList: {
      type: Array,
      default: [],
    },
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

const Preference = mongoose.model("Preferences", preferenceSchema);

module.exports = Preference;
