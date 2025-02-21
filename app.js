const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const pjbgDB = require ('./models/connection')


dotenv.config();
const app = express();
pjbgDB();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
