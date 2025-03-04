const express = require("express");
const router = express.Router();
const Favorite = require("../models/favorite");

// Route pour récupérer les favoris d'un utilisateur
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const favorite = await Favorite.findOne({ username });

    if (!favorite) {
      return res.status(200).json({
        success: true,
        favorites: [],
      });
    }

    res.status(200).json({
      success: true,
      favorites: favorite.favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route pour sauvegarder ou mettre à jour les favoris d'un utilisateur
router.post("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        message: "preferences must be an array",
      });
    }

    // Utiliser findOneAndUpdate avec upsert:true pour créer ou mettre à jour
    await Favorite.findOneAndUpdate(
      { username },
      {
        username,
        favorites: preferences,
        updatedAt: Date.now(),
      },
      {
        upsert: true, // Créer le document s'il n'existe pas
        new: true, // Retourner le document mis à jour
      }
    );

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
