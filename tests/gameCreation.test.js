const request = require('supertest');
const app = require('./app');

it('POST /projects/', async () => {
    const res = await request(app).post('/projects').send({
        token : "CxDdB2k-UdvckTDWJqqel4XuU27mgLLC",
        title: "La petite maison dans la prairie - The Survival Horror Game",
        pitch: "tout est dans le titre",
        description: "je répète : tout est dit",
        goal: 10000,
        pledges: [],
        gameMechanics: []
    })

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true)
})