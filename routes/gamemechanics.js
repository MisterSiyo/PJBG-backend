const express = require('express');
const router = express.Router();
const GameMechanic = require('../models/gameMechanics'); 

// Route pour récupérer la liste de tous les game mechanics
router.get('/all', async (req, res) => {
  try {
    const mechanics = await GameMechanic.find({});
    if (!mechanics || mechanics.length === 0) {
      return res.json({ result: false, message: 'No game mechanics found' });
    }
    res.json({ result: true, types: mechanics }); 
  } catch (error) {
    console.error('Erreur route GET /all (gameMechanics):', error);
    res.status(500).json({ result: false, message: error.message });
  }
});

module.exports = router;
