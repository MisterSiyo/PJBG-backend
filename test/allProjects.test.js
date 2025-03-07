// Importation des modules nécessaires
const request = require('supertest'); // Permet d'envoyer des requêtes HTTP à l'application Express
const app = require('../app'); // Importe l'application Express
const mongoose = require('mongoose'); // Permet d'interagir avec MongoDB
const Project = require('../models/projects'); // Importe le modèle de projet


// Début du test de la route GET /get/project/all
describe('GET /projects/get/all', () => {
    
    // Avant d'exécuter les tests, on vérifie si des projets existent déjà, sinon on en ajoute
    beforeAll(async () => {
        const count = await Project.countDocuments(); // Vérifie s'il y a déjà des projets
        if (count === 0) {
            // Si aucun projet, on en ajoute 2 pour éviter un test sur une base vide
            await Project.create([
                {
                    title: "Test Project 1",
                    pageURL: "test-project-1",
                    pitch: "test-project-1",
                    detail: { description:"blabla",pledges: [], gameMechanics: [] }, // Détails du projet
                    histories: [], // Historique du projet
                    user: new mongoose.Types.ObjectId(), // ID fictif d'un utilisateur
                },
                {
                    title: "Test Project 2",
                    pageURL: "test-project-2",
                    pitch: "test-project-2",
                    detail: { description:"blablablabalbla",pledges: [], gameMechanics: [] },
                    histories: [],
                    user: new mongoose.Types.ObjectId(),
                }
            ]);
        }
    });


    // Après tous les tests, on ferme la connexion à la base de données
    afterAll(async () => {
        await mongoose.connection.close();
    });


    // Test principal : récupérer tous les projets
    it('devrait renvoyer tous les projets', async () => {
        // Envoie une requête GET à la route testée
        const res = await request(app).get('/projects/get/all');

        // Vérifie que la réponse a un statut 200 (succès)
        expect(res.statusCode).toBe(200);

        // Vérifie que la réponse contient result: true
        expect(res.body.result).toBe(true);

        // Vérifie que la réponse contient un tableau de projets
        expect(res.body.projectsData).toBeInstanceOf(Array);

        // Vérifie qu'au moins un projet est présent
        expect(res.body.projectsData.length).toBeGreaterThan(0);

        // Vérifie que chaque projet a bien un champ "title"
        expect(res.body.projectsData[0]).toHaveProperty('title');
    });
});
