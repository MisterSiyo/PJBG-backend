var express = require('express');
var router = express.Router();
const Project = require('../models/projects');

// route qui envoie le catalogue complet au front-end 
router.get('/all', async res => { // !!!! attention, je n'ai pas filtré par catégories de user, donc à voir ou on fait ça, front ou back
    try {
        const projectsData = await Project.find('');
        if (projectsData) {
            res.json({result: true, message: 'here are your results', projectsData});
        }
    } catch (error) {
        res.status(403).json({result: false, message: 'no data to show', error});
    }
});

// route qui permet de donner les data d'un seul projet pour afficher la page d'un projet
router.get(`/:projectName`, async (req, res) => {
    try {

        const title = req.params.projectName;

        const project = await Project.find({title});
        if (project) {
            res.json({result: true, messsage: 'here is your project page', project})
        }
    } catch (error) {
        res.status(403).json({result: false, message: 'no project of this name', error})
    }
})

// route qui permet de créer un projet en base de données
router.post('/', async (req, res) => { 
    try {
        const {userId, title, pitch, description, goal, gameMechanics, pledges } = req.body; // !!! pledges à réfléchir ou changer
        const nextId = (await Project.find('')).length +1; // chercher le nombre de projets déjà créés pour assigner le bon id au suivant
        const newProject = new Project({
            projectId: nextId,
            title,
            imageURL: '', // lien vers la photo du profil du créateur
            pitch,
            detail: {
                description,
                gameMechanics,
                pledges,
            },
            histories: [],
            progressions: [],
            stages: [{
                stageId: 1, // premier stage, initalisant le projet en mode dev, affiché que lorsque les triggers sont déclenchés
                title: 'Welcome !', 
                content: 'Congratulations on your project !', 
                imagesURL: '', // vide à la créa
            }],
            goal,
            studiosPreVote: [''], // vide à la créa
            studioValidated: '', // vide à la créa
            userId,
        });
        await newProject.save();
    
        const newCreatedProject = await Project.find({projectId: nextId});
        res.json({result: true, message: 'project created with success', newCreatedProject})
    } catch (error) {
        res.json({result: false, message: 'Oops, something went wrong', error})
    }
});

// route qui permet à un user de contribuer financièrement à un projet
router.post('/backing', (req, res) => {

    const {projectId, userContributing, pledgeChosen} = req.body;
    let nextId = null;
    let isPledgePayed = true; // c'est ici (à la place de mon forcing de true) qu'il faudra faire un appel API à la banque pour vérifier leur OK
    Project.find({projectId}).then(data => {
        nextId = data.progressions.length +1;
    })
    
    Project.updateOne({projectId}, {progressions: {
        contributionId: nextId,
        userContributing,
        pledgeChosen,
        isPledgePayed,
    }}).then(data => {

        if (data && data.isPledgePayed) {
            res.json({result: true, message: 'you just backed a very cool project, congrats', data})
        } else if (data && !data.isPledgePayed) {
            res.json({result: false, error: 'Oops, payment did not pass, please retry later'}) // ce chemin là n'arrivera jamais pour le moment, mais il est déjà posé pour plus tard
        } else {
            res.json({result: false, error: 'Oops, something went wrong'})
        }
    })
});

// route qui permet de poster un message dans le chat du projet

router.post('/message', async (req, res) => {

    try {

        const {projectId, userPosting, message} = req.body;

        const updateMessage = await Project.updateOne({projectId}, 
            {$push: {
                histories: {
                    historyType: "chatMessage", 
                    message, 
                    date: new Date(), 
                    userPosting
                    }
                }
            }
        )
        if (updateMessage) {
            res.json({result: true, message: 'here is your message', updateMessage});
        }

    } catch (error) {
        res.status(403).json({result: false, message: 'cant touch this', error})
    }
})



module.exports = router;
