const mongoose = require('mongoose');

const adressSchema = new mongoose.Schema(
    { 
        street: { type: String, required: true }, 
        postalCode: { type: String, required: true }, 
        city: { type: String, required: true }, 
        country: { type: String, required: true } 
    },
)

const socialLinksSchema = new mongoose.Schema(
        {
            platform: { 
                type: String, 
                enum: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'GitHub'], // Prédéfinis pour éviter les fautes
            },
                url: { type: String}
            }
)

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        token: {
            type: String,
            required: true,
        },
        role: { 
            type: String, 
            enum: ['user', 'studio'], // Se renseigne automatiquement en focntion de la création de compte
            required: true,
        },
        socialLinks: [
            socialLinksSchema
        ],
         address: [
            adressSchema
         ],
         fundedProjects: [ // Liste des projets financés par l'utilisateur
            {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Project'
            }
        ],
        followedProjects: [ // Liste des projets que l'utilisateur suit (mais n'a pas forcément financé)
            {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Project'
            }
        ],
        createdProjects: [ // Liste des projets créés par l'utilisateur (il a financé et créé)
        {type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project'}
        ],
},
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
