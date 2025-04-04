const mongoose = require("mongoose");

// Schéma pour les adresses (=sous document de user)
const adressSchema = new mongoose.Schema({
  streetNumber: { type: String },
  street: { type: String },
  postalCode: { type: String },
  city: { type: String },
  country: { type: String },
});

// Schéma pour les réseaux sociaux (=sous document de user)
const socialLinksSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube", "GitHub"], // Prédéfinis pour éviter les fautes
  },
  url: { type: String },
});

// Schéma pour les personne de contact du studio (=sous document de user)
const contactPersonSchema = new mongoose.Schema({
  name: { type: String },
  surname: { type: String },
  email: { type: String },
  phone: { type: String },
});

// Schéma pour les managers du studio (=sous document de user)
const contactManagerSchema = new mongoose.Schema({
  name: { type: String },
  surname: { type: String },
  email: { type: String },
  phone: { type: String },
});
// Liste des projets que l'utilisateur suit (mais n'a pas forcément financé) (=sous document de user)
const fundedProjectsSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
  },
  pledgeChosen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pledges",
  },
});

// Schéma pour les favoris de l'utilisateur
const userFavoritesSchema = new mongoose.Schema({
  favorites: {
    type: Array,
    default: [],
  },
  favoritesPlus: {
    type: Array,
    default: [],
  },
  favoritesMinus: {
    type: Array,
    default: [],
  },
  blackList: {
    type: Array,
    default: [],
  },
});

// Schéma des infos spécifiques aux studios (=sous document de user)
const studioSchema = new mongoose.Schema({
  siret: {
    type: String,
  },
  siren: {
    type: String,
  },
  companyName: {
    type: String,
  },
  numtva: {
    type: String,
  },
  naf: {
    type: String,
  },
  rcs: {
    type: String,
  },
  greffe: {
    type: String,
  },
  capital: {
    type: String,
  },
  status: {
    type: String,
  },
  webSite: {
    type: String,
  },
  description: {
    type: String,
  },
  brand: {
    type: String,
  },
  subBrand: {
    type: String,
  },
  contactPerson: contactPersonSchema,
  contactManager: contactManagerSchema,

  address: {
    streetNumber: { type: String },
    street: { type: String },
    postalCode: { type: String },
    city: { type: String },
    country: { type: String },
  },

  chosenProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
  developedProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
});

// Schéma des users (= studios + backers)
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    picture: {
      type: String,
    },
    authType: {
      type: String,
      enum: ["local", "google", "reddit"],
      default: "local",
    },
    studio: studioSchema,
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authType === "local";
      },
    },
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patron", "studio"], // Se renseigne automatiquement en focntion de la création de compte
      required: true,
      default: "patron",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    socialLinks: [socialLinksSchema],
    name: {
      type: String,
    },
    surname: {
      type: String,
    },
    address: adressSchema,
    phone: {
      type: String,
    },
    description: {
      type: String,
    },
    fundedProjects: [fundedProjectsSchema], // Liste des projets financé par l'utilisateur
    followedProjects: [
      // Liste des projets que l'utilisateur suit (mais n'a pas forcément financé)
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
      },
    ],
    createdProjects: [
      // Liste des projets créés par l'utilisateur (qu'il a financé et créé)
      { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
    ],
    userFavorites: userFavoritesSchema, // Favoris de l'utilisateur
  },
  { timestamps: true }
);

// Vérification : studioInfo obligatoire si role = "studio"
userSchema.pre("save", function (next) {
  if (this.role === "studio" && !this.studio) {
    return next(new Error("Les studios doivent avoir un studioInfo rempli."));
  }
  next();
});

const User = mongoose.model("users", userSchema);

module.exports = User;
