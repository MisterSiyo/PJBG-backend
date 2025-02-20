const express = require('express');
const bcrypt = require('bcryptjs');
const uid2 = require('uid2');
const User = require('../models/users');

const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
  
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }
     
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const token = uid2(32);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            token, 
        });

        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès', token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        res.status(200).json({ message: 'Connexion réussie', token: user.token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

module.exports = router;
