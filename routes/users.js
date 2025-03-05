const express = require('express');
const bcrypt = require('bcryptjs');
const uid2 = require('uid2');
const router = express.Router();
require("../models/connection");
const User = require('../models/users');

// Route pour la création d'un compte utilisateur
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (role !== 'patron' && role !== 'studio') {
        return res.status(400).json({ message: "The role must be 'patron' or 'studio'" });
    }

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    try {
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) { 
            return res.status(400).json({ message: 'This email is already in use.' });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) { 
            return res.status(400).json({ message: 'This username is already in use.' });
        }

        if (role === 'studio' && (!address || !address.street || !address.postalCode || !address.city || !address.country)) {
            return res.status(400).json({ message: 'Address is required for studios.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = uid2(32);


        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            token,
            role,
            followedProjects: [],
            createdProjects: [],
            fundedProjects: [],
            preferences: [],
            secondChoices: [],
            restrictions: [],
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'User created successfully', 
            token, 
            username: newUser.username, 
            role: newUser.role 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Route pour la connexion d'un utilisateur
router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Missing field: email/username or password" });
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
            return res.status(400).json({ message: 'Incorrect password' });
        }
        
        res.status(200).json({ 
            message: 'Connection successful', 
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
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
