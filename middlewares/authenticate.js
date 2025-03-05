const jwt = require('jsonwebtoken');  // Pour vérifier le token

// Middleware d'authentification
const authenticate = (req, res, next) => {
    // Récupérer le token depuis les headers de la requête (Authorization: Bearer <token>)
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Vérifier le token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded;  // Décoder et ajouter l'utilisateur à la requête
        next();  // Passer à la prochaine fonction (ici, la route du controller)
    });
};

module.exports = authenticate;
