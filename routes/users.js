const express = require('express');
const bcrypt = require('bcryptjs');
const uid2 = require('uid2');
const router = express.Router();
require("../models/connection");
const User = require('../models/users');


// Route pour la création d'un compte utilisateur
router.post('/register', async (req, res) => {
    const { username, email, password, role, socialLinks } = req.body;

    if (role !== 'patron' && role !== 'studio') { // Vérifie que le rôle est bien intégré
        return res.status(400).send('Le rôle doit être "patron" ou "studio"');
    }

    try {
        if (!username || !email || !password) { // Vérifie que tous les champs sont remplis
            return res.status(400).json({ error: 'Champ.s manquant.s' });
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Vérifie que l'email est valide (format)
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email invalide' });
        }

        const existingUserByEmail = await User.findOne({ email }); // Vérifie si l'email n'est pas déjà utilisé
        if (existingUserByEmail) { 
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const existingUserByUsername = await User.findOne({ username }); // Vérifie si le username n'est pas déjà utilisé
        if (existingUserByUsername) { 
            return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10); // Hash du mot de passe

        const token = uid2(32);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            token,
            role,
            address:{
                street: "135 rue Exemple", 
                postalCode: "75015", 
                city: "Paris",
                country: "France"
                },
            socialLinks: socialLinks || {}, 
        });

        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès', token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});


// Route pour la connexion d'un utilisateur
router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Vérifie que l'utilisateur a bien rempli au moins l'email OU le username et le mot de passe
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Champ manquant : email/username ou password" });
        }

        let user;

        // Recherche dans le BDD de l'utilisateur soit par email, soit par username
        if (email) {
            user = await User.findOne({ email });
        } else if (username) {
            user = await User.findOne({ username });
        }

        // Si aucun utilisateur n'est trouvé, renvoie une erreur en fonction de l'identifiant utilisé
        if (!user) {
            return res.status(400).json({ message: "Utilisateur non trouvé" });
        }
        
        // Vérifie si le MDP est reconnu
        const isMatch = await bcrypt.compare(password, user.password); 
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }
        
         // Si tout va bien, génère le token et renvoie les informations de l'utilisateur - Réponse de connexion réussie
        res.status(200).json({ 
            message: 'Connexion réussie', 
            token: user.token, 
            username: user.username,
            role: user.role,
            followedProjects: user.followedProjects,
            createdProjects: user.createdProjects,
            fundedProjects: user.fundedProjects,
            preferences: user.preferences,
            secondChoices: user.secondChoices,
            restrictions: user.restrictions,
            appliedProjects: user.appliedProjects,
            developpedProjects: user.developpedProjects
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;