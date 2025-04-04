var express = require('express');
var router = express.Router();
const Project = require('../models/projects');
const User = require('../models/users');
const Pledge = require('../models/pledges');

// route pour ajouter une update à la roadmap studio du développement d'un projet (update par mois)
router.post('/update/:id', async (req, res) => {
    // On récupère "token" (et plus "userAccount") pour éviter la confusion
    const { title, update, monthUpdate, roadmapUpdate, closingNotes, token } = req.body;
  
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
        monthUpdate,
        update,
        roadmapUpdate,
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
            path: 'studiosPreVote.studio',
            model: 'users',
            select: 'studio.companyName studio.description'
        })
        .populate({
            path: 'studiosPreVote.votes',
            model: 'users',
            select: 'username -_id'
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

// route qui récupère par ID toutes les données d'un projet (utilisée par les project Cards surtout 
// car dans le store redux on ne garde que les ID des projets, pas leurs datas complètes)
// ça nous permet de limiter le dataflow de ce qu'on garde en store. Car il faut éviter trop d'appels à notre back
// mais aussi limiter la data transportée et rechargée à chaque construction de composant.
router.get('/byId/:projectId', async (req, res) => {
    const projectId = req.params.projectId;

    try {
        const project = await Project.findById(projectId)
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
            path: 'studiosPreVote.studio',
            model: 'users',
            select: 'studio.companyName studio.description'
        })
        .populate({
            path: 'studiosPreVote.votes',
            model: 'users',
            select: 'username -_id'
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


// Route pour qu'un patron qui a financé (et/ou crée) un projet puisse voter pour un studio ayant postulé à ce projet (1 vote par projet par patron)
// le vote est dynamique et peut se faire changer à l'envie.
router.post('/vote', async (req, res) => {
    try {
        // Récupération des données du corps de la requête
        const { token, projectId, studioId } = req.body;

        // Vérification de l'utilisateur via le token
        const user = await User.findOne({ token });
        if (!user) {
            return res.json({ result: false, message: 'User not found' });
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
        const hasFunded = project.progressions.some(progress => 
            progress.userContributing && progress.userContributing.toString() === user._id.toString()
        );
        const hasCreated = project.user.toString() === user._id.toString();

        if (!hasFunded && !hasCreated) {
            return res.json({ result: false, message: 'You can only vote if you funded or created this project' });
        }

        // Vérification si le studio existe dans les studios intéressés
        const studioIndex = project.studiosPreVote.findIndex(studio => 
             studio.studio?.toString() === studioId
        );
        
        if (studioIndex === -1) {
            return res.json({ result: false, message: 'Studio not found in interested studios' });
        }

        // Récupérer les informations du studio
        const studioObj = await User.findById(studioId).select('studio.companyName');
        if (!studioObj) {
            return res.json({ result: false, message: 'Studio information not found' });
        }

        let hasVoted = false;

        for (let i=0; i< project.studiosPreVote.length; i++) {
            project.studiosPreVote[i].votes.includes(user._id) ? hasVoted = true : null
        }

        // const existVote = project.studiosPreVote.map(studio => studio.votes.filter(vote => vote == user._id))
        const existVoteForSameStudio = project.studiosPreVote[studioIndex].votes.some(voteId => voteId && voteId.toString() === user._id.toString())

        if (existVoteForSameStudio) {
            return res.json({ result: false, message: 'You have already voted for this studio' });
        }

        if (hasVoted) {
    
            const previousVoteIndex = project.studiosPreVote.findIndex(studio => 
                studio.votes.includes(user._id)
            );
       
            const updatedProject = await Project.findByIdAndUpdate(
                projectId,
                {
                    $pull: { [`studiosPreVote.${previousVoteIndex}.votes`]: user._id },
                    $push: { [`studiosPreVote.${studioIndex}.votes`]: user._id }
                }
            );
        
            if (!updatedProject) {
                return res.json({ result: false, message: 'Failed to update votes' });
            }
            
            // return res.json({result: true})
        } else {
    
            await Project.findByIdAndUpdate(
                projectId,
                { $push: { [`studiosPreVote.${studioIndex}.votes`]: user._id } }
            );
            // return res.json({result: true})
            
        }

        // Ajout d'un message dans l'historique du projet
        project.histories.push({
            historyType: 'vote',
            userPosting: user._id,
            message: `${user.username} voted for the studio ${studioObj.studio ? studioObj.studio.companyName : 'Unknown'}`,
            date: new Date()
        });

        await project.save();

        return res.json({ result: true, message: `You voted for the studio successfully!` });
    } catch (error) {
        console.error(error);
        return res.json({ result: false, message: 'Error processing request', error: error.message });
    }
});


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
        const newChecks = (await User.findById(userContributing)).fundedProjects;

        res.json({result: true, project, check, newChecks})
    }
    catch (error) {
        res.status(403).json({result : false, error})
    }
})

// route qui permet de poster un message dans le chat du projet
router.post('/messages/:query', async (req, res) => {

    const pageURL = req.params.query;
    const {token, message} = req.body;

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

// route qui permet à un studio de postuler sur un projet, rentrant dans la liste des studiosPreVotes de la collection Project
router.put('/dev', async (req, res) => {

    const {projectId, token} = req.body;

    try {

        const user = await User.findOne({token});

        if (user.role !== 'studio') {
            return res.json({result: false, message: 'authorization denied'})
        }

        const isAlreadyDev = await Project.findOne({_id: projectId, "studiosPreVote.studio": user._id})
        
        if (isAlreadyDev) {
            res.json({result: false, message: 'you already develop this project'})
        }

        const projectUpdated = await Project.findByIdAndUpdate(projectId, { isChosen: true,
            $push: { studiosPreVote: {
                studio: user._id,
                votes: [],
                winner: false,
            }
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

// route exclusive au backend, utilisée seulement par le biais de thunderclient pour valider un projet et le passer en mode 'ProjectValidated'
// ce qui correspond à un projet en développement
router.put('/validate', async (req, res) => {

    const {projectId, userId} = req.body;

    try {

        await Project.findByIdAndUpdate(projectId, {
        studioValidated: userId, isValidatedByStaff: true, dateOfValidation : new Date(), isVisible: false,
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