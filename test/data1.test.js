// Charger les variables d'environnement du fichier .env
require("dotenv").config();

const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/projects");

// Augmenter le timeout global pour Jest
jest.setTimeout(30000);

// Fonction utilitaire pour vérifier si MongoDB est connecté
const isConnected = () => mongoose.connection.readyState === 1;

describe("Projects API Endpoints", () => {
  let testProject;

  // Configuration de la connexion à MongoDB avant tous les tests
  beforeAll(async () => {
    try {
      const uri = process.env.MONGO_URI;
      console.log(
        `Connexion à MongoDB avec l'URI: ${
          uri ? uri.substring(0, 20) + "..." : "undefined"
        }`
      );

      // En cas d'URI indéfinie, essayer une alternative
      if (!uri) {
        throw new Error(
          "MONGO_URI est undefined dans le fichier .env. Vérifiez que le fichier .env est correctement chargé."
        );
      }

      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // Augmente le timeout de sélection du serveur
        connectTimeoutMS: 10000, // Augmente le timeout de connexion
      });

      console.log(
        `État de la connexion MongoDB: ${mongoose.connection.readyState}`
      );
      console.log("MongoDB connecté avec succès!");
    } catch (error) {
      console.error("Erreur de connexion à MongoDB:", error);
      throw error;
    }
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    if (isConnected()) {
      try {
        await mongoose.connection.close();
        console.log("Connexion MongoDB fermée avec succès");
      } catch (error) {
        console.error("Erreur lors de la fermeture de la connexion:", error);
      }
    }
  });

  // Nettoyage après chaque test
  afterEach(async () => {
    if (testProject && testProject._id) {
      try {
        await Project.findByIdAndDelete(testProject._id);
        console.log(`Projet de test supprimé: ${testProject._id}`);
        testProject = null;
      } catch (error) {
        console.error(
          "Erreur lors de la suppression du projet de test:",
          error
        );
      }
    }
  });

  describe("GET /projects/:query", () => {
    it("devrait retourner un projet lorsqu'il est trouvé", async () => {
      expect(isConnected()).toBe(true);

      // Création du projet pour ce test
      try {
        testProject = await Project.create({
          title: "Test Project",
          pageURL: "test-project",
          pitch: "big games big gains",
          goal: 1000,
          detail: {
            description: "The one and only project",
          },
          histories: [],
          progressions: [],
        });

        console.log(`Projet créé avec succès: ${testProject._id}`);

        const project = await Project.findOne({ pageURL: "test-project" });
        expect(project).toBeDefined();
        expect(project.title).toBe("Test Project");
      } catch (error) {
        console.error("Erreur dans le test 'projet trouvé':", error);
        throw error;
      }
    });

    it("devrait retourner null lorsqu'un projet n'existe pas", async () => {
      expect(isConnected()).toBe(true);

      try {
        // S'assurer qu'aucun projet avec cette URL n'existe
        await Project.deleteMany({ pageURL: "non-existent-project" });

        const nonExistentProject = await Project.findOne({
          pageURL: "non-existent-project",
        });

        expect(nonExistentProject).toBeNull();
      } catch (error) {
        console.error("Erreur dans le test 'projet non trouvé':", error);
        throw error;
      }
    });
  });
});
