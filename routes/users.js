const express = require('express');
const bcrypt = require('bcryptjs');
const uid2 = require('uid2');
const fetch = require('node-fetch');

const User = require('../models/users');
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
        street: `${data.numvoieinsee || ""} ${data.typvoieinsee || ""} ${data.libvoieinsee || ""}`.trim(),
        postalCode: data.codepostalinsee || "N/A",
        city: data.villeinsee || "N/A",
        country: data.paysinsee || "N/A"
    }
});

// Route pour récupérer les infos d'une entreprise via son SIRET
router.get('/siret/:siret', async (req, res) => {
    try {
        const { siret } = req.params;

        if (siret.length !== 14 || isNaN(siret)) {
            return res.status(400).json({ message: "Le SIRET doit contenir 14 chiffres valides." });
        }

        const response = await fetch(`${API_BASE_URL}/entreprise/${siret}/infoslegales`, {
            method: 'GET',
            headers: {
                'X-Authorization': `socapi ${API_KEY}`
            }
        });

        if (!response.ok) throw new Error('SIRET introuvable');

        const data = await response.json();
        const companyInfo = formatCompanyInfo(data.infolegales);

        res.json(companyInfo);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des informations.", error: error.message });
    }
});


// Route pour la création d'un compte utilisateur
router.post('/register', async (req, res) => {
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

        if (role === 'studio' && (!companyInfo || !companyInfo.address)) {
            return res.status(400).json({ message: 'Address is required for studios.' });
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
        
        console.log('fun check')
        if (role === 'studio' && companyInfo) {
            const formattedCompany = companyInfo.address ? companyInfo : formatCompanyInfo(companyInfo);
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
                address: formattedCompany.address
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
    console.log(error)
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

module.exports = router;
