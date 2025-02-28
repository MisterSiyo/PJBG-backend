const mongoose = require('mongoose');

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
            type: [String],
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

const Pledge = mongoose.model('Pledges', pledgeSchema);

module.exports = Pledge;