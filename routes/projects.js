var express = require('express');
var router = express.Router();
const Project = require('../models/projects');

// route qui envoie le catalogue complet au front-end 
router.get('/', async res => { // !!!! attention, je n'ai pas filtré par catégories de user, donc à voir ou on fait ça, front ou back
    try {
        const projectsData = await Project.find('');
        if (projectsData) {
            res.json({result: true, message: 'here are your results', projectsData});
        }
    } catch (error) {
        res.status(403).json({message: 'no data to show', error});
    }
});

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
            histories: [{
                historyType: '', // vide à la créa
                message: '', // vide à la créa
                date: new Date, // vide à la créa
                userPosting: '' // vide à la créa
            }],
            progressions: [{
                contributionId: '', // vide à la créa
                userContributing: '', // vide à la créa
                pledgeChosen: '', // vide à la créa
                isPledgePayed: '', // vide à la créa
            }],
            stages: [{
                stageId: '', // vide à la créa
                title: '', // vide à la créa
                content: '', // vide à la créa
                imagesURL: '', // vide à la créa
            }],
            goal,
            studiosPreVote: [''], // vide à la créa
            studioValidated: '', // vide à la cré
            userId,
        });
        await newProject.save();
    
        const newCreatedProject = await Project.find({projectId: nextId});
        res.json({result: true, message: 'project created with success', data})
    } catch (error) {
        res.json({result: false, error: 'Oops, something went wrong'})
    }
});

// route qui permet à un user de contribuer financièrement à un projet
router.post('/backing', (req, res) => {

    const {projectId, userContributing, pledgeChosen} = req.body;
    let nextId = null;
    let isPledgePayed = true; // c'est ici (à la place de mon forcing de true) qu'il faudra faire un appel API à la banque pour vérifier leur OK
    Project.find({projectId}).then(data => {
        nextId = data.length +1;
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




module.exports = router;
