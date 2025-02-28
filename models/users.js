const mongoose = require('mongoose');

// Schéma pour les adresses (=sous document de user)
const adressSchema = new mongoose.Schema(
    { 
        street: { type: String, required: true }, 
        postalCode: { type: String, required: true }, 
        city: { type: String, required: true }, 
        country: { type: String, required: true } 
    },
)

// Schéma pour les réseaux sociaux (=sous document de user)
const socialLinksSchema = new mongoose.Schema(
        {
            platform: { 
                type: String, 
                enum: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'GitHub'], // Prédéfinis pour éviter les fautes
            },
                url: { type: String}
            }
)

// Schéma pour les personne de contact du studio (=sous document de user)
const contactPersonSchema = new mongoose.Schema(
    { 
        name: { type: String, required: true }, 
        surname: { type: String, required: true }, 
        email: { type: String, required: true }, 
        phone: { type: String, required: true } 
    },
)

// Schéma pour les managers du studio (=sous document de user)
const contactManagerSchema = new mongoose.Schema(
    { 
        name: { type: String, required: true }, 
        surname: { type: String, required: true }, 
        email: { type: String, required: true }, 
        phone: { type: String, required: true } 
    },
)
 // Liste des projets que l'utilisateur suit (mais n'a pas forcément financé) (=sous document de user)
const fundedProjectsSchema = new mongoose.Schema(
    {
      project: 
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'projects',
        },
      pledgeChosen: 
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'pledges',
        },
    }
)

// Schéma des infos spécifiques aux studios (=sous document de user)
const studioSchema = new mongoose.Schema(
    {
        siret:{
            type: String,
            required: true,  
            unique: true,
        },
        webSite: {
            type: String,
            required: true, 
            unique: true,
        },
        companyName: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        brand: { 
            type: String
        }, 
        subBrand: { 
            type: String
        }, 
        contactPerson: [
           contactPersonSchema
        ],
        contactManager: [
            contactManagerSchema
        ],
        chosenProjects: [ // Liste des projets auquels le studio à postulé
            {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'projects'
            }
        ],
        developedProjects: [ // Liste des projets dévelopés / en cours de developpement par le studio
            {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'projects'
            }
        ],
        followedProjects: [ // Liste des projets que le studio suit sans forcément les avoir pris en charge pour dev
            {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'projects'
            }
        ],
}
);

// Schéma des users (= studios + backers)
const userSchema  = new mongoose.Schema(
    {
        studio: studioSchema,
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
            enum: ['backers', 'studio'], // Se renseigne automatiquement en focntion de la création de compte
            required: true,
        },
        socialLinks: [
            socialLinksSchema
        ],
        name: {
            type: String,
            required: true,
            unique: true,
        },
        surname: {
            type: String,
            required: true,
            unique: true,
        },
        address: [
            adressSchema
         ],
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        preferences: // Genre de jeux préférés
        [ 
             {
              type: mongoose.Schema.Types.ObjectId, 
              ref: 'gameMechanics'
             }
        ],
        secondChoices: // Genre de jeux aimés (second choix)
        [ 
            {
             type: mongoose.Schema.Types.ObjectId, 
             ref: 'gameMechanics'
            }
        ],
        restrictions: // Genre de jeux à bannir
        [ 
            {
             type: mongoose.Schema.Types.ObjectId, 
             ref: 'gameMechanics'
            }
       ],
        fundedProjects: fundedProjectsSchema, // Liste des projets financé par l'utilisateur
        followedProjects: [ // Liste des projets que l'utilisateur suit (mais n'a pas forcément financé)
            {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'projects'
            }
        ],
        createdProjects: [ // Liste des projets créés par l'utilisateur (qu'il a financé et créé)
        {type: mongoose.Schema.Types.ObjectId, 
        ref: 'projects'}
        ],
},
    { timestamps: true }
);


// Vérification : studioInfo obligatoire si role = "studio"
userSchema.pre('save', function (next) {
    if (this.role === 'studio' && !this.studioInfo) {
        return next(new Error('Les studios doivent avoir un studioInfo rempli.'));
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = { User};