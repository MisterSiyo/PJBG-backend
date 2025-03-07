const request = require('supertest');
const app = require('../app'); // Importer l'application Express
const mongoose = require('mongoose');
const Project = require('../models/projects');
const User = require('../models/users');
const Pledge = require('../models/pledges');

describe('Projects API Endpoints', () => {
    let user, project, pledge, token;

    beforeAll(async () => {

        user = await User.create({
            username: "testUser",
            email: "test@example.com",
            password: "hashedPassword",
            token: "testToken",
            role: "patron",
        });

        pledge = await Pledge.create({
            pledgeId: 100,
            contributionLevel: 50,
            rewards: ["Exclusive skin"]
        });

        project = await Project.create({
            title: "Test Project",
            pageURL: "test-project",
            pitch : 'big games big gains',
            goal: 1000,
            detail: { description:'The one and only project', pledges: [pledge._id] },
            histories: [],
            progressions: [],
            user: user._id
        });
        token = user.token;
    });

    it('should allow a user to back a project', async () => {
        const response = await request(app)
            .put('/projects/backing')
            .send({
                projectId: project._id,
                token: token,
                pledgeId: pledge.pledgeId
            });

        expect(response.status).toBe(200);
        expect(response.body.result).toBe(true);

        const updatedProject = await Project.findById(project._id);
        expect(updatedProject.progressions.length).toBe(1);
        expect(updatedProject.progressions[0].userContributing.toString()).toBe(user._id.toString());
        expect(updatedProject.progressions[0].pledgeChosen.toString()).toBe(pledge._id.toString());
    });

    it('should return 403 if the token is invalid', async () => {
        const response = await request(app)
            .put('/projects/backing')
            .send({
                projectId: project._id,
                token: "invalidToken",
                pledgeId: pledge.pledgeId
            });

        expect(response.status).toBe(403);
        expect(response.body.result).toBe(false);
    });

    it('should allow a user to send a message in the project chat', async () => {
        const response = await request(app)
            .post(`/projects/messages/${project.pageURL}`)
            .send({
                token: token,
                message: "Hello, this is a test message!"
            });

        expect(response.status).toBe(200);
        expect(response.body.result).toBe(true);

        const updatedProject = await Project.findById(project._id);
        expect(updatedProject.histories.length).toBe(1);
        expect(updatedProject.histories[0].message).toBe("Hello, this is a test message!");
        expect(updatedProject.histories[0].userPosting.toString()).toBe(user._id.toString());
    });

    it('should return 403 if the token is invalid', async () => {
        const response = await request(app)
            .post(`/projects/messages/${project.pageURL}`)
            .send({
                token: "invalidToken",
                message: "This should not work"
            });

        expect(response.status).toBe(403);
        expect(response.body.result).toBe(false);

    });
});


