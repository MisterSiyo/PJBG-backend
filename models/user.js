const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    username: {
      type: String,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    picture: {
      type: String,
    },
    authType: {
      type: String,
      enum: ["local", "google", "reddit"],
      default: "local",
    },
    password: {
      type: String,
      required: function () {
        return this.authType === "local";
      },
    },
    token: {
      type: String,
    },
    role: {
      type: String,
      enum: ["patron", "studio", "admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    followedProjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    createdProjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    fundedProjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    appliedProjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    developpedProjects: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    userFavorites: {
      favorites: {
        type: [String],
        default: [],
      },
      favoritesPlus: {
        type: [String],
        default: [],
      },
      favoritesMinus: {
        type: [String],
        default: [],
      },
      blackList: {
        type: [String],
        default: [],
      },
    },
    studio: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Méthode pour ne pas renvoyer le mot de passe dans les réponses
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
