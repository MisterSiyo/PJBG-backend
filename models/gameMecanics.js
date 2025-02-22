const mongoose = require('mongoose');

const gameMecanicSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'name of mecanic required'],
            trim: true,
        },
        imageURL: {
            type: String,
            default: '', // !!! définir une image bidon en default
            validator : function(d) {
                return  /http\:\/\/.+/.test(d);
            },
            message: props => `${props.value} n'est pas une URL valide`
        },
        description: {
            type: String,
            required: [true, 'description is required'],
            minlength: [6, 'please describe more'],
        },
    }
);

const GameMecanic = mongoose.model('GameMecanic', gameMecanicSchema);

module.exports = GameMecanic;