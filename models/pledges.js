const mongoose = require('mongoose');

const rewardSchema = mongoose.Schema({
    rewardId: String,
    rewards: [String],
   });

const pledgeSchema = new mongoose.Schema(
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
        rewardType: {
            type: String,
            required: [true, 'type is required']
        },
        rewards: {
            type: [rewardSchema],
            required: true,
        },
        imageURL: {
            type: String,
            default: '', // !!! définir une image bidon en default
            validator : function(d) {
                return  /http\:\/\/.+/.test(d);
            },
            message: props => `${props.value} n'est pas une URL valide`
        },
    }
);

const Pledge = mongoose.model('Pledge', pledgeSchema);

module.exports = Pledge;