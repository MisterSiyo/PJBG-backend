var express = require('express');
var router = express.Router();
const Project = require('../models/projects');
const User = require('../models/users');
const Pledge = require('../models/pledges');


router.post('/update/:id', async (req, res) => {
    // On récupère "token" (et plus "userAccount") pour éviter la confusion
    const { title, category, content, roadmapUpdate, communityEngagement, closingNotes, token } = req.body;
  
    try {
      // On retrouve le studio grâce au token
      const studio = await User.findOne({ token });
  
      if (!studio || studio.role !== "studio") {
        return res.status(403).json({ message: "Unauthorized. Only studios can post updates." });
      }
  
      // On retrouve le projet
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }
  
      // On crée l'objet "stage" à pusher
      const newUpdate = {
        stageId: (project.stages?.length || 0) + 1,
        title,
        category,
        content,
        roadmapUpdate,
        communityEngagement,
        closingNotes,
        imagesURL: []
        // pas besoin de stocker "token" dans le stage lui-même, sauf cas particulier
      };
  
      await project.updateOne({ $push: { stages: newUpdate } });
  
      res.status(200).json({ message: "Update added successfully!", project });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  

// route qui envoie le catalogue complet au front-end 
router.get('/get/all', async (req, res) => { // !!!! attention, je n'ai pas filtré par catégories de user, donc à voir ou on fait ça, front ou back
    try {
        const projectsData = await Project.find({})
        .select('-__v')
        .populate({
            path:'user',
            select: 'username role followedProjects fundedProjects -_id'
        })
        .populate({
            path: 'detail.pledges', 
            model: 'Pledges',
            select: '-_id'
        })
        .populate({
            path: 'detail.gameMechanics', 
            model: 'gameMechanics',
            select: '-_id'
        })
        .populate({
            path: 'histories.userPosting',
            select: 'username role'
        })
        .populate({
            path: 'progressions.userContributing',
            model: 'users',
            select: 'username -_id'
        })
        .populate({
            path: 'progressions.pledgeChosen',
            model: 'Pledges',
        })
        ;
        res.status(200).json({result: true, message: 'here are your results', projectsData});
        
    } catch (error) {
        res.status(403).json({result: false, message: 'no data to show', error});
    }
});

// route qui permet de donner les data d'un seul projet pour afficher la page d'un projet
router.get('/:query', async (req, res) => {
    try {
        const project = await Project.findOne({pageURL: req.params.query})
        .select('-__v')
        .populate({
            path:'user',
            select: 'username description role followedProjects fundedProjects -_id'
        })
        .populate({
            path: 'detail.pledges', 
            model: 'Pledges',
            select: '-_id'
        })
        .populate({
            path: 'detail.gameMechanics', 
            model: 'gameMechanics',
            select: '-_id'
        })
        .populate({
            path: 'histories.userPosting',
            select: 'username role'
        })
        .populate({
            path: 'studiosPreVote',
            model: 'users',
            select: 'studio.companyName studio.description'
        })
        .populate({
            path: 'studioValidated',
            model: 'users',
            select: 'studio.companyName studio.description'
        })
        .populate({
            path: 'progressions.userContributing',
            model: 'users',
            select: 'username -_id'
        })
        .populate({
            path: 'progressions.pledgeChosen',
            model: 'Pledges',
        })
        ;

        if (!project) {

            return res.status(404).json({result: false, message: "No Project Found"})
        }

        await project.populate({
                path: 'user.fundedProjects.project',
                model: 'projects',
                select: 'title'
        })

        await project.populate({
            path: 'user.followedProjects.project',
            model: 'projects',
            select: 'title'
    })


    let layoutType = "default";
        if (project.isChosen && project.isValidatedByStaff) {
            layoutType = "validated";
        }

        res.json({
            result: true,
            message: 'Here is your project page',
            project: {
                ...project.toObject(),
                layoutType  // On ajoute ce champ au frontend
            }
        });

    } catch (error) {
        console.log(error)
        res.status(403).json({result: false, message: 'no project of this name', error})
    }
});

// route qui permet de créer un projet en base de données
router.post('/', async (req, res) => { 
    try {
        const {token, title, pitch, description, goal, pledges, gameMechanics} = req.body; // !!! gameMechanics et pledges à rajouter
        const user = await User.findOne({token});
        if (!user) {
            return res.status(404).json({result: false, error: 'cant touch this'})
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
                gameMechanics,
                pledges,
            },
            histories: [{
                historyType: 'news',
                message: "Congratulations on creating your project !",
                date: new Date(),
                userPosting: '67cff4179d0f465cf51b6cc2'
            }],
            progressions: [],
            stages: [],
            goal,
            user : user._id,
        });
        await newProject.save();
        const newCreatedProject = await Project.findOne({title: title.trim()})
        .select('-__v')
        .populate({
            path:'user',
            select: 'username role followedProjects fundedProjects -_id'
        })
        .populate({
            path: 'detail.pledges', 
            model: 'Pledges',
            select: '-_id'
        })
        .populate({
            path: 'detail.gameMechanics', 
            model: 'gameMechanics',
            select: '-_id'
        })
        .populate({
            path: 'histories.userPosting',
            select: 'username role'
        });

        await User.findOneAndUpdate({token}, {
            $push: {createdProjects: newCreatedProject._id}
        })
        
        res.json({result: true, message: 'project created with success', newCreatedProject})
    } catch (error) {
        res.json({result: false, message: 'Oops, something went wrong', error})
    }
});

// project.studiosPrevote
// Route pour qu'un patron qui a financé (et/ou crée) un projet puisse voter pour un studio ayant postulé à ce projet (1 vote par projet par patron)
router.post('/vote', async (req, res) => {
    try {
        // Récupération des données du corps de la requête
        const { token, projectId, studioId } = req.body;

        // Vérification de l'utilisateur via le token
        const user = await User.findOne({ token });
        if (!user) {
            return res.json({ result: false, message: 'Utilisateur User not found' });
        }

        // Vérification que l'utilisateur est un patron
        if (user.role !== 'patron') {
            return res.json({ result: false, message: 'Only patrons can vote' });
        }

        // Récupération du projet
        const project = await Project.findById(projectId);
        if (!project) {
            return res.json({ result: false, message: 'Project not found' });
        }

        // Vérification si l'utilisateur a financé ou créé le projet
        const hasFunded = project.progressions.some(progress => progress.userContributing.toString() === user._id.toString());
        const hasCreated = project.user.toString() === user._id.toString();

        if (!hasFunded && !hasCreated) {
            return res.json({ result: false, message: 'You can only vote if you funded or created this project' });
        }

        // Vérification si le studio existe dans les studios intéressés
        const studioPreVote = project.studiosPreVote.find(studio => studio.studio.toString() === studioId);
        if (!studioPreVote) {
            return res.json({ result: false, message: 'Studio not found in interested studios' });
        }

        // Vérification si l'utilisateur a déjà voté pour ce projet
        const existingVote = studioPreVote.votes.includes(user._id);
        if (existingVote) {
            return res.json({ result: false, message: 'You have already voted' });
        }

        // Ajout du vote
        studioPreVote.votes.push(user._id);

        // Sauvegarde du projet mis à jour
        await project.save();

        // Ajout d'un message dans l'historique du projet
        project.histories.push({
            userPosting: user._id,
            message: `${user.username} voted for the studio ${user.studio.companyName}`,
            date: new Date()
        });

        await project.save();

        return res.json({ result: true, message: `You voted for the studio${studioId}` });
    } catch (error) {
        console.error(error);
        return res.json({ result: false, message: 'Error processing request' });
    }
});




// les routes ci-dessous sont en cours de création, ne pas toucher svp !!!!

// route qui permet à un user de contribuer financièrement à un projet
router.put('/backing', async (req, res) => {

    const {projectId, token, pledgeId} = req.body;
    let isPledgePayed = true; // c'est ici (à la place de mon forcing de true) qu'il faudra faire un appel API à la banque pour vérifier leur OK
    try {
        const userContributing = (await User.findOne({token}))._id;
        const nextId = (await Project.findById(projectId)).progressions.length +1;
        const pledgeChosen = (await Pledge.findOne({pledgeId}))._id;
        const project = await Project.findByIdAndUpdate(projectId,
            {$push: {progressions: {
            contributionId: nextId,
            userContributing,
            pledgeChosen,
            isPledgePayed,
        }}})
        const check = await User.findByIdAndUpdate(userContributing, {
            $push: {fundedProjects: {
                project: projectId,
                pledgeChosen
            }}
        })
        res.json({result: true, project, check})
    }
    catch (error) {
        res.status(403).json({result : false, error})
    }
})

// route qui permet de poster un message dans le chat du projet

router.post('/messages/:query', async (req, res) => {

    const pageURL = req.params.query;
    const {token, message} = req.body;
    console.log( 'voici mes datas : ', pageURL, token, message)
    try {
        const projectId = (await Project.findOne({pageURL}))._id;
        const userPosting = (await User.findOne({token}))._id;
        const updateMessage = await Project.findByIdAndUpdate(projectId, 
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
            const i = (await Project.findById(projectId)).histories.length -1;
            const updatedMessage = (await Project.findById(projectId).populate({path: "histories.userPosting", model: "users", select: "username role -_id"})).histories[i];
            res.json({result: true, message: 'here is your message', updatedMessage});
        }

    } catch (error) {
        res.status(403).json({result: false, message: 'cant touch this', error})
    }
})

router.put('/dev', async (req, res) => {

    const {projectId, token} = req.body;

    try {

        const user = await User.findOne({token});

        if (user.role !== 'studio') {
            return res.json({result: false, message: 'authorization denied'})
        }

        const projectUpdated = await Project.findByIdAndUpdate(projectId, { isChosen: true,
            $push: { studiosPreVote: user._id
        }})

        await User.findOneAndUpdate({token}, {
            $push: {"studio.chosenProjects": projectId
            }
        }, {new: true}

        
    )

    if (projectUpdated.studiosPreVote.length > 1) {
        res.json({result: true, projectUpdated})    
    } else {

        await Project.findByIdAndUpdate(projectId, {dateOfChoosing: new Date()})


        res.json({result: true, projectUpdated})
    }
       

    } catch (error) {
        res.status(400).json({result: false, error})
    }
})

router.put('/validate', async (req, res) => {

    const {projectId, userId} = req.body;

    try {

        await Project.findByIdAndUpdate(projectId, {
        studioValidated: userId, isValidatedByStaff: true, dateOfValidation : new Date(),
    });

    await User.findByIdAndUpdate(userId, {
        $push: {'studio.developedProjects': projectId 
        }
    }, {new: true});

    res.json({result: true});

    } catch (error) {
        res.status(400).json({result: false, error})
    }



})

module.exports = router;