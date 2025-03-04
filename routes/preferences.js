const express = require("express");
const router = express.Router();
const Preference = require("../models/preferences");

// Route pour récupérer les préférences d'un utilisateur
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const preference = await Preference.findOne({ username });

    if (!preference) {
      return res.status(200).json({
        success: true,
        preferences: {
          plus: [],
          moins: [],
          blackList: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      preferences: preference.preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route pour sauvegarder les préférences d'un utilisateur
router.post("/", async (req, res) => {
  try {
    const { username, preferences } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    // Vérifier si l'utilisateur a déjà des préférences
    let existingPreference = await Preference.findOne({ username });

    if (existingPreference) {
      // Mettre à jour les préférences existantes
      existingPreference.preferences = preferences;
      existingPreference.updatedAt = Date.now();
      await existingPreference.save();
    } else {
      // Créer de nouvelles préférences
      const preference = new Preference({
        username,
        preferences,
      });
      await preference.save();
    }

    res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
