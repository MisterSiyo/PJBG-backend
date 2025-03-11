const mongoose = require('mongoose');

// les quatres sous documents que constituent chaque document 
// de la collection Projects :
//  (detail, history, progression, stage)

// détaille le projet avec la description, les mécaniques de jeu et les pledges
const detailSchema = mongoose.Schema({
    description: {
        type: String,
        required: [true, 'a description is required for your project']
    },
    gameMechanics: [{type: mongoose.Schema.Types.ObjectId, ref: 'gameMecanics'}],
    pledges: [{type: mongoose.Schema.Types.ObjectId, ref: 'pledges'}],
   });

// !!! attention, ci-dessous il faudra peut être passer en mode Pusher ?!
// gère le 'chat/forum' entre backers et un feed news (automatisé par script, posté par le compte du staff)
const historySchema = mongoose.Schema({
    historyType: String,
    message: String,
    date: Date,
    userPosting: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
   });

// gère les subscriptions au fur et à mesure
const progressionSchema = mongoose.Schema({
   contributionId: Number,
   userContributing: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
   pledgeChosen: {type: mongoose.Schema.Types.ObjectId, ref: 'pledges'},
    isPledgePayed: Boolean,
   });

   const updateSchema = mongoose.Schema({
    category: String, 
    contentUpdate: String },
    {timestamps: true},
   )

// gère l'historique du développement du projet
const stageSchema = mongoose.Schema({
    stageId: Number,
    title: {
        type: String,
        required: [true, 'a title is required for your update']
    },
    monthUpdate: {
        type: String,
        required: [true, 'a content is required for your update']
    },
    update: [updateSchema],
    roadmapUpdate: {
        type: String,
    }, 
    closingNotes: String, 
    imagesURL: [{
        type: String,
        default: '', // !!! définir une image bidon en default
        validator : function(d) {
            return  /http\:\/\/.+/.test(d);
        },
        message: props => `${props.value} n'est pas une URL valide`
    }],
   },
   { timestamps: true }
);
// project.studiosPreVote =>
const studioPreVoteSchema = mongoose.Schema({
    studio: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    votes : [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
    winner: {type: Boolean, default : false}
})

// la collection ci-dessous

const projectSchema = new mongoose.Schema(
    {   
        projectId: Number,
        title: {
            type: String,
            required: [true, 'a name is required for your project']
        },
        pageURL: {
            type: String,
            required: [true, 'url required']
        },
        imageURL: {
            type: [String],
            required: false,
            default: '', // !!! définir une image bidon en default
            validator : function(d) {
                return  /http\:\/\/.+/.test(d);
            },
            message: props => `${props.value} n'est pas une URL valide`
        },
        pitch: {
            type: String,
            required: [true, 'a pitch is required for your project']
        },

        // nested documents ci-dessous 
        detail: detailSchema,
        histories: [historySchema],
        progressions: [progressionSchema],
        stages: [stageSchema],


        goal: {
            type: Number,
            default: 123456789, // !!! a voir ensemble si on en met une, et laquelle
            required: false, // !!! a voir ensemble
        },

        // Booléens de typage pour le front (affichage, fonctionnalités possibles...)

        isVisible: {
            type: Boolean,
            default: false,
        },
        isChosen: {
            type: Boolean,
            default: false,
        },
        isValidatedByStaff: {
            type: Boolean,
            default: false,
        },

        // 3 Dates importantes (création gérée par le timeStamp Mongoose) :

        // Publication : après validation du staff suite à la création par un user (date d'apparition dans le "catalogue")
        dateOfPublication: {
            type: Date,
            required: false,
            default: null
        },

        // Choix par le premier (ou seul) studio : lance le timer de compétition
        dateOfChoosing: {
            type: Date,
            required: false,
            default: null
        },

        // Validation (deuxieme et plus importante) par le staff du studio en charge du projet : lance le mode développement
        dateOfValidation: {
            type: Date,
            required: false,
            default: null
        },

        // la liste de tous les studios ayant souhaité prendre en main le projet
        studiosPreVote: [studioPreVoteSchema],
        studioValidated: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},

        // le user ayant créé le projet
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
    },
    { timestamps: true }
);

const Project = mongoose.model('projects', projectSchema);

module.exports = Project;