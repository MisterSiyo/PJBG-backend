var express = require('express');
var router = express.Router();
const Project = require('../models/projects');
const User = require('../models/users');

// route qui envoie le catalogue complet au front-end 
router.get('/all', async (req, res) => { // !!!! attention, je n'ai pas filtré par catégories de user, donc à voir ou on fait ça, front ou back
    try {
        const projectsData = await Project.find({});
        res.status(200).json({result: true, message: 'here are your results', projectsData});
        
    } catch (error) {
        res.status(403).json({result: false, message: 'no data to show', error});
    }
});

// route qui permet de donner les data d'un seul projet pour afficher la page d'un projet
router.get('/:query', async (req, res) => {
    try {
        const project = await Project.findOne({pageURL: req.params.query});
        res.json({result: true, messsage: 'here is your project page', project})

    } catch (error) {
        res.status(403).json({result: false, message: 'no project of this name', error})
    }
});

// route qui permet de créer un projet en base de données
router.post('/', async (req, res) => { 
    try {
        const {token, title, pitch, description, goal} = req.body; // !!! gameMechanics et pledges à rajouter
        const user = await User.findOne({token});
        if (!user) {
            return res.status(404).json({result: false, error: 'user not found'})
        }
        const spaces = / /g
        const pageURL = title.trim().replace(spaces, '-')

        const newProject = new Project({
            title: title.trim(),
            pageURL,
            imageURL: '', // lien vers la photo du profil du créateur
            pitch,
            detail: {
                description,
                // gameMechanics,
                // pledges,
            },
            histories: [{
                historyType: 'news',
                message: "Congratulations on creating your project !",
                date: new Date(),
                userPosting: '67c4af41be22386c87867dba'
            }],
            progressions: [],
            stages: [],
            goal,
            user : user._id,
        });
        await newProject.save();
        const newCreatedProject = await Project.find({title: title.trim()}).populate('user').populate('histories.userPosting')
        res.json({result: true, message: 'project created with success', newCreatedProject})
    } catch (error) {
        res.json({result: false, message: 'Oops, something went wrong', error})
    }
});

// les routes ci-dessous sont en cours de création, ne pas toucher svp !!!!

// route qui permet à un user de contribuer financièrement à un projet
// router.post('/backing', (req, res) => {

//     const {projectId, userContributing, pledgeChosen} = req.body;
//     let nextId = null;
//     let isPledgePayed = true; // c'est ici (à la place de mon forcing de true) qu'il faudra faire un appel API à la banque pour vérifier leur OK
//     Project.find({projectId}).then(data => {
//         nextId = data.progressions.length +1;
//     })
    
//     Project.updateOne({projectId}, {progressions: {
//         contributionId: nextId,
//         userContributing,
//         pledgeChosen,
//         isPledgePayed,
//     }}).then(data => {

//         if (data && data.isPledgePayed) {
//             res.json({result: true, message: 'you just backed a very cool project, congrats', data})
//         } else if (data && !data.isPledgePayed) {
//             res.json({result: false, error: 'Oops, payment did not pass, please retry later'}) // ce chemin là n'arrivera jamais pour le moment, mais il est déjà posé pour plus tard
//         } else {
//             res.json({result: false, error: 'Oops, something went wrong'})
//         }
//     })
// });

// route qui permet de poster un message dans le chat du projet

// router.post('/message', async (req, res) => {

//     try {

//         const {projectId, userPosting, message} = req.body;

//         const updateMessage = await Project.updateOne({projectId}, 
//             {$push: {
//                 histories: {
//                     historyType: "chatMessage", 
//                     message, 
//                     date: new Date(), 
//                     userPosting
//                     }
//                 }
//             }
//         )
//         if (updateMessage) {
//             res.json({result: true, message: 'here is your message', updateMessage});
//         }

//     } catch (error) {
//         res.status(403).json({result: false, message: 'cant touch this', error})
//     }
// })



module.exports = router;
