const mongoose = require('mongoose');

const gameMechanicSchema = new mongoose.Schema( // les champs en commentaires sont des prospects pour plus tard, les laisser en commentaires pour le projet
    {
        name: {
            type: String,
        },
        // imageURL: {
        //     type: String,
        //     default: '', // !!! définir une image bidon en default
        //     validator : function(d) {
        //         return  /http\:\/\/.+/.test(d);
        //     },
        //     message: props => `${props.value} n'est pas une URL valide`
        // },
        description: {
            type: String,
        },
    }
);

const GameMechanic = mongoose.model('gameMechanics', gameMechanicSchema);

module.exports = GameMechanic;