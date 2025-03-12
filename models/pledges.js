const mongoose = require('mongoose');

const pledgeSchema = new mongoose.Schema( // le schéma des différentes contributions que nous proposons, le créateur d'un projet pourra choisir sur chaque niveau de contribution celui qu'il souhaite voir proposer pour les financeurs
    {
        pledgeId: {
            type: Number,
            required: [true, 'id required'],
            unique: true,
        },
        contributionLevel: {
            type: Number,
            required: [true, 'level required'],
        },
        rewards: {
            type: [String],
            required: true,
        },
    }
);

const Pledge = mongoose.model('Pledges', pledgeSchema);

module.exports = Pledge;