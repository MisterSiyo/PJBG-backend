const express = require("express");
const router = express.Router();
const Preference = require("../models/preferences");

router.post("/", async (req, res) => {
  try {
    const { userId, preferences } = req.body;

    // Vérifier si l'utilisateur a déjà des préférences
    let existingPreference = await Preference.findOne({ userId });

    if (existingPreference) {
      // Mettre à jour les préférences existantes
      existingPreference.preferences = preferences;
      existingPreference.updatedAt = Date.now();
      await existingPreference.save();
    } else {
      // Créer de nouvelles préférences
      const preference = new Preference({ userId, preferences });
      await preference.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Préférences sauvegardées" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route pour récupérer les préférences d'un utilisateur
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const preference = await Preference.findOne({ userId });

    if (!preference) {
      return res
        .status(404)
        .json({ success: false, message: "Préférences non trouvées" });
    }

    res
      .status(200)
      .json({ success: true, preferences: preference.preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
