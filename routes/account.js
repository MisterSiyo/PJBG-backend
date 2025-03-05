const express = require('express');
const router = express.Router();
const User = require('../models/users');
const authenticate = require('../middlewares/authenticate'); // Middleware d'authentification

// Route pour obtenir les informations du compte utilisateur
router.get('/', (req, res) => {
    const userId = req.user._id;

    // Recherche de l'utilisateur par son ID et peuplement des données nécessaires
    User.findById(userId)
        .populate('preferences') // Remplir les préférences de l'utilisateur
        .populate('secondChoices') // Remplir les choix secondaires
        .populate('restrictions') // Remplir les genres de jeux à bannir
        .populate('fundedProjects.project') // Remplir les projets financés
        .populate('createdProjects') // Remplir les projets créés
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user); // Répondre avec les informations de l'utilisateur
        })
        .catch(err => {
            res.status(400).json(err); // En cas d'erreur, on renvoie l'erreur
        });
});

// Route pour mettre à jour les informations du compte utilisateur
router.put('/', (req, res) => {
    const userId = req.user._id;
    const { email, phone, description, address, socialLinks, preferences, secondChoices, restrictions } = req.body;

    // Met à jour les informations de l'utilisateur
    User.findByIdAndUpdate(userId, {
        email, phone, description, address, socialLinks, preferences, secondChoices, restrictions
    }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(updatedUser); // Répondre avec les informations mises à jour de l'utilisateur
        })
        .catch(err => {
            res.status(400).json(err); // En cas d'erreur, on renvoie l'erreur
        });
});

module.exports = router;
