const express = require('express');
const router = express.Router();
require('../models/connection');
const GameMechanic = require('../models/gameMechanics');
const Pledge = require('../models/pledges');
const accountRoutes = require('./account'); // Import des routes

// Utilisation des routes
router.use('/account', accountRoutes);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'Bienvenue sur la page d\'accueil de l\'API' });
});

// route pour récupérer toutes les gameMechanics et les pledges pour le composant Game Creation
router.get('/characteristics', async (req, res) => {
  try {
    const gameMechanics = await GameMechanic.find({});
    const pledges = await Pledge.find({});

    if (gameMechanics.length == 0 || pledges.length == 0) {
      return res.json({ result: false, message: "no data to Show, please insert a coin" });
    }

    res.json({ result: true, gameMechanics, pledges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, message: "Internal Server Error" });
  }
});

// route pour récupérer toutes les gameMechanics de type "genre" de jeu vidéo
router.get('/genres', async (req, res) => {

  try {
    const genres = await GameMechanic.find({GMType: "genre"});
    return res.status(200).json({result: true, genres})



  } catch(error) {
    res.status(400).json({result: false, message: 'error on checking genres'})
  }


})

module.exports = router;