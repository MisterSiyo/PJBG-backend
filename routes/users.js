const express = require("express");
const bcrypt = require("bcryptjs");
const uid2 = require("uid2");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const router = express.Router();

const API_BASE_URL = "https://api.societe.com/api/v1";
const API_KEY = process.env.CLE_API_SOCIETE;

// Fonction de formatage des données d'une entreprise
const formatCompanyInfo = (data) => ({
  siret: data.siretsiegeformat || "N/A",
  siren: data.sirenformat || "N/A",
  companyName: data.denoinsee || "N/A",
  numtva: data.numtva || "N/A",
  naf: data.nafinsee ? `${data.nafinsee} - ${data.naflibinsee}` : "N/A",
  rcs: data.rcs || "N/A",
  greffe: data.nomgreffe ? `${data.nomgreffe} (${data.codegreffe})` : "N/A",
  capital: data.capital ? `${data.capital} ${data.libdevise}` : "N/A",
  status: data.catjurlibinsee || "N/A",
  address: {
    street: `${data.numvoieinsee || ""} ${data.typvoieinsee || ""} ${
      data.libvoieinsee || ""
    }`.trim(),
    postalCode: data.codepostalinsee || "N/A",
    city: data.villeinsee || "N/A",
    country: data.paysinsee || "N/A",
  },
});

// Route pour récupérer les infos d'une entreprise via son SIRET
router.get("/siret/:siret", async (req, res) => {
  try {
    const { siret } = req.params;

    if (siret.length !== 14 || isNaN(siret)) {
      return res
        .status(400)
        .json({ message: "Le SIRET doit contenir 14 chiffres valides." });
    }

    const response = await fetch(
      `${API_BASE_URL}/entreprise/${siret}/infoslegales`,
      {
        method: "GET",
        headers: {
          "X-Authorization": `socapi ${API_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error("SIRET introuvable");

    const data = await response.json();
    const companyInfo = formatCompanyInfo(data.infolegales);

    res.json(companyInfo);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des informations.",
      error: error.message,
    });
  }
});

// Route pour la création d'un compte utilisateur
router.post("/register", async (req, res) => {
  // console.log("Received body:", req.body);
  const { username, email, password, role, companyInfo } = req.body;

  if (role !== "patron" && role !== "studio") {
    return res
      .status(400)
      .json({ message: "The role must be 'patron' or 'studio'" });
  }

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "This email is already in use." });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ message: "This username is already in use." });
    }

    if (role === "studio" && (!companyInfo || !companyInfo.address)) {
      return res
        .status(400)
        .json({ message: "Siret is required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uid2(32);

    const newUserData = {
      username,
      email,
      password: hashedPassword,
      token,
      role,
      followedProjects: [],
      createdProjects: [],
      fundedProjects: [],
      userFavorites: {
        favorites: [],
        favoritesPlus: [],
        favoritesMinus: [],
        blackList: [],
      },
    };

    console.log("fun check");
    if (role === "studio" && companyInfo) {
      const formattedCompany = companyInfo.address
        ? companyInfo
        : formatCompanyInfo(companyInfo);
      newUserData.studio = formattedCompany;

      newUserData.studio = {
        siret: formattedCompany.siret,
        siren: formattedCompany.siren,
        companyName: formattedCompany.companyName,
        numtva: formattedCompany.numtva,
        naf: formattedCompany.naf,
        rcs: formattedCompany.rcs,
        greffe: formattedCompany.greffe,
        capital: formattedCompany.capital,
        status: formattedCompany.status,
        address: formattedCompany.address,
      };
    }

    const newUser = new User(newUserData);

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      token,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Route pour la connexion d'un utilisateur
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res
        .status(400)
        .json({ message: "Missing field: email/username or password" });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      message: "Connection successful",
      token: user.token,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      name: user.name,
      surname: user.surname,
      description: user.description,
      address: user.address,
      studio: user.studio,
      socialLinks: user.socialLinks,
      followedProjects: user.followedProjects,
      createdProjects: user.createdProjects,
      fundedProjects: user.fundedProjects,
      appliedProjects: user.appliedProjects,
      developpedProjects: user.developpedProjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Route pour récupérer les favoris d'un utilisateur
router.get("/favorites/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Si l'utilisateur n'a pas encore de favoris, initialiser un objet vide
    if (!user.userFavorites) {
      user.userFavorites = {
        favorites: [],
        favoritesPlus: [],
        favoritesMinus: [],
        blackList: [],
      };
      await user.save();
    }

    res.status(200).json({
      success: true,
      favorites: user.userFavorites.favorites || [],
      favoritesPlus: user.userFavorites.favoritesPlus || [],
      favoritesMinus: user.userFavorites.favoritesMinus || [],
      blackList: user.userFavorites.blackList || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route pour sauvegarder ou mettre à jour les favoris d'un utilisateur
router.post("/favorites/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { favorites, favoritesPlus, favoritesMinus, blackList } = req.body;

    // Vérifier que les données sont des tableaux si elles sont fournies
    if (favorites && !Array.isArray(favorites)) {
      return res.status(400).json({
        success: false,
        message: "favorites must be an array",
      });
    }

    if (favoritesPlus && !Array.isArray(favoritesPlus)) {
      return res.status(400).json({
        success: false,
        message: "favoritesPlus must be an array",
      });
    }

    if (favoritesMinus && !Array.isArray(favoritesMinus)) {
      return res.status(400).json({
        success: false,
        message: "favoritesMinus must be an array",
      });
    }

    if (blackList && !Array.isArray(blackList)) {
      return res.status(400).json({
        success: false,
        message: "blackList must be an array",
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialiser userFavorites s'il n'existe pas
    if (!user.userFavorites) {
      user.userFavorites = {};
    }

    // Mettre à jour les champs fournis
    if (favorites !== undefined) user.userFavorites.favorites = favorites;
    if (favoritesPlus !== undefined)
      user.userFavorites.favoritesPlus = favoritesPlus;
    if (favoritesMinus !== undefined)
      user.userFavorites.favoritesMinus = favoritesMinus;
    if (blackList !== undefined) user.userFavorites.blackList = blackList;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Favorites saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route pour l'authentification Google
router.post("/google-auth", async (req, res) => {
  try {
    const { googleId, email, name, firstName, lastName, picture } = req.body;

    if (!googleId || !email) {
      return res
        .status(400)
        .json({ error: "Les données Google sont incomplètes" });
    }

    // Rechercher l'utilisateur par son ID Google
    let user = await User.findOne({ googleId });

    // Si l'utilisateur n'existe pas, le créer
    if (!user) {
      // Générer un nom d'utilisateur unique basé sur l'email ou le nom
      const baseUsername = email.split("@")[0] || firstName || "user";
      let username = baseUsername;
      let counter = 1;

      // Vérifier si le nom d'utilisateur existe déjà
      let usernameExists = await User.findOne({ username });

      // Si le nom d'utilisateur existe, ajouter un numéro jusqu'à ce qu'il soit unique
      while (usernameExists) {
        username = `${baseUsername}${counter}`;
        counter++;
        usernameExists = await User.findOne({ username });
      }

      user = new User({
        googleId,
        email,
        username, // Ajouter le nom d'utilisateur unique
        name,
        firstName,
        lastName,
        picture,
        authType: "google",
      });
      await user.save();
      console.log("Nouvel utilisateur Google créé:", email);
    } else {
      // Mettre à jour les informations de l'utilisateur existant
      user.email = email;
      user.name = name || user.name;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.picture = picture || user.picture;

      await user.save();
      console.log("Utilisateur Google existant mis à jour:", email);
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Renvoyer les informations utilisateur et le token
    res.status(200).json({ // !!!!                                    A CORRRIGER CECI N EST PAS CONFORME PROTECTION ET RENVOIT AUSSI UNE ERREUR FORCEMENT
      message:
        user.createdAt === user.updatedAt
          ? "Utilisateur créé"
          : "Utilisateur connecté",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur d'authentification Google:", error);
    res.status(500).json({ error: "Erreur lors de l'authentification" });
  }
});

// Route pour gérer l'authentification Reddit
router.post("/reddit-auth", async (req, res) => {
  try {
    const { userData, redditToken } = req.body;

    if (!userData || !userData.username) {
      return res
        .status(400)
        .json({ success: false, message: "Données utilisateur manquantes" });
    }

    // Vérifier si l'utilisateur existe déjà (par username car Reddit ne fournit pas d'email)
    let user = await User.findOne({ username: userData.username });

    if (!user) {
      // Créer un nouveau token pour l'utilisateur
      const token = jwt.sign(
        { username: userData.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Créer un nouvel utilisateur
      user = new User({
        username: userData.username,
        email: userData.email,
        authType: "reddit",
        name: userData.name,
        picture: userData.picture,
        role: userData.role,
        token: token,
        // Pas de mot de passe pour les utilisateurs Reddit
      });

      await user.save();
    } else {
      // Mettre à jour le token de l'utilisateur existant
      user.token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Mettre à jour les informations si nécessaire
      user.picture = userData.picture || user.picture;
      user.lastLogin = new Date();

      await user.save();
    }

    // Retourner les informations utilisateur et le token
    return res.status(200).json({ // !!!!                                    A CORRRIGER CECI N EST PAS CONFORME PROTECTION ET RENVOIT AUSSI UNE ERREUR FORCEMENT
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
      },
      token: user.token,
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification Reddit:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Route pour récupérer l'utilisateur connecté
router.get("/me", async (req, res) => {
  try {
    // Récupérer le token depuis les cookies ou les headers
    const token =
      req.cookies.auth_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur
    const user = await User.findOne({
      $or: [{ username: decoded.username }, { _id: decoded.userId }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Renvoyer les informations utilisateur
    return res.status(200).json({ // !!!!                                    A CORRRIGER CECI N EST PAS CONFORME PROTECTION ET RENVOIT AUSSI UNE ERREUR FORCEMENT
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
