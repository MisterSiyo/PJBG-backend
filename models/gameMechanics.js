const mongoose = require('mongoose');

const gameMechanicSchema = new mongoose.Schema( // le schéma des mécaniques de jeu que nous proposons (309 documents) pour assister le créateur d'un projet de jeu vidéo
    {
        name: {
            type: String,
        },
        description: {
            type: String,
        },
        GMType: {
            type: String,
        },
        color: {
            type: String,
        },
        color2: {
            type: String,
        }
    }
);

const GameMechanic = mongoose.model('gameMechanics', gameMechanicSchema);

module.exports = GameMechanic;