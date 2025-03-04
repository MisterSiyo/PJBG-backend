const mongoose = require('mongoose');

const gameMechanicSchema = new mongoose.Schema( // les champs en commentaires sont des prospects pour plus tard, les laisser en commentaires pour le projet
    {
        name: {
            type: String,
            required: [true, 'name of mechanic required'],
            trim: true,
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
            required: [true, 'description is required'],
            minlength: [6, 'please describe more'],
        },
    }
);

const GameMechanic = mongoose.model('gameMechanics', gameMechanicSchema);

module.exports = GameMechanic;