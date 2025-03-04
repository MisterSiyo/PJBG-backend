const express = require("express");
const router = express.Router();
const Favorite = require("../models/favorite");

// Récupérer les favoris d'un utilisateur
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const favorites = await Favorite.find({ username });

    // Extraire uniquement les styles de jeux
    const gameStyles = favorites.map((favorite) => favorite.gameStyle);

    res.status(200).json({
      success: true,
      favorites: gameStyles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Ajouter un favori
router.post("/", async (req, res) => {
  try {
    const { username, gameStyle } = req.body;

    // Vérifier si le favori existe déjà
    let existingFavorite = await Favorite.findOne({ username, gameStyle });
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "This style is already in your favorites",
      });
    }

    const favorite = await Favorite.create({ username, gameStyle });
    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Supprimer un favori
router.delete("/:username/:gameStyle", async (req, res) => {
  try {
    const { username, gameStyle } = req.params;
    await Favorite.findOneAndDelete({ username, gameStyle });

    res.status(200).json({
      success: true,
      message: "Favorite removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Mettre à jour tous les favoris d'un utilisateur
router.post("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { gameStyle } = req.body;

    // Supprimer tous les favoris existants de l'utilisateur
    await Favorite.deleteMany({ username });

    // Si gameStyle est un tableau, ajouter chaque style comme favori
    if (Array.isArray(gameStyle)) {
      const favorites = [];

      // Créer un nouveau document pour chaque style de jeu
      for (const style of gameStyle) {
        const favorite = await Favorite.create({ username, gameStyle: style });
        favorites.push(favorite);
      }

      return res.status(201).json({
        success: true,
        data: favorites,
      });
    }

    res.status(400).json({
      success: false,
      message: "gameStyle must be an array",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
