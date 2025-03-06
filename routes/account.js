const express = require('express'); // Importation de la librairie Express pour la gestion des routes HTTP
const router = express.Router(); // Création d'un routeur Express pour définir les routes
const User = require('../models/users'); // Importation du modèle "User" pour interagir avec la base de données (MongoDB)
const authenticate = require('../middlewares/authenticate'); // Middleware d'authentification pour vérifier les utilisateurs



// Route pour afficher les informations du compte utilisateur

router.get('/', async(req, res) => {  // Route GET pour récupérer les informations d'un utilisateur
    const token = req.body  // Extraction du token d'authentification dans le corps de la requête
    try {
        // Recherche de l'utilisateur par son token, et peuplement des données nécessaires
        const user = await User.findOne({token})  // Recherche un utilisateur correspondant au token
            .select("email phone name surname description address socialLinks userFavorites fundedProjects followedProjects createdProjects -_id")  // Sélection des champs à retourner (sans l'ID)
            .populate('fundedProjects')  // Remplissage des projets financés associés à l'utilisateur
            .populate('followedProjects')  // Remplissage des projets suivis associés à l'utilisateur
            .populate('createdProjects');  // Remplissage des projets créés par l'utilisateur
            res.json({result: true, user});  // Si l'utilisateur est trouvé, on renvoie ses informations en réponse avec un statut "result" égal à true
    }
    catch(error){
        res.status(400).json(error);  // En cas d'erreur lors de la récupération de l'utilisateur, on renvoie une erreur avec le code HTTP 400
    }
});



// Route pour mettre à jour les informations du compte utilisateur

router.put('/', (req, res) => {  // Route PUT pour mettre à jour les informations d'un utilisateur

    console.log(req.body)
    const { token, email, phone, name, surname, description, address, socialLinks, userFavorites, fundedProjects, followedProjects, createdProjects } = req.body;  // Déstructuration des champs reçus dans la requête

    // Met à jour les informations de l'utilisateur en fonction du token
    User.findOneAndUpdate({token}, {email, phone, name, surname, description, address, socialLinks, userFavorites, fundedProjects, followedProjects, createdProjects}, { new: true })  // Recherche un utilisateur avec le token et met à jour ses informations
        .then(updatedUser => {  // Si la mise à jour réussit, renvoie l'utilisateur mis à jour
            if (!updatedUser) {  // Si aucun utilisateur n'est trouvé, renvoie une erreur 404
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(updatedUser);  // Renvoie l'utilisateur mis à jour dans la réponse
        })
        .catch(err => {  // Si une erreur survient lors de la mise à jour, on la renvoie dans la réponse
            res.status(400).json(err);  // En cas d'erreur, renvoie l'erreur avec le code HTTP 400
        });
});

module.exports = router;  // Exporte le routeur pour qu'il puisse être utilisé dans d'autres fichiers
