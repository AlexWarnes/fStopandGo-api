
require('dotenv').config();
const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
const express = require('express');
const morgan = require('morgan');
const chalk = require('chalk');
const cors = require('cors');

const { PORT, CLIENT_ORIGIN, DATABASE_URL } = require('./config');
const { router: apiRouter } = require('./routes/apiRouter');
const { router: authRouter } = require('./routes/authRouter');

const app = express();
app.use(morgan('common'));
app.use(cors({origin: CLIENT_ORIGIN}));
app.use('/api', apiRouter)
app.use('/auth', authRouter);

let server;

function runServer(dbURL, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbURL, {useNewUrlParser: true}, err => {
            if(err) {
                return reject(err);
            }
            server = app.listen(port, ()=> {
                console.log(`fStopandGo API is listening on port: ${chalk.green(PORT)}`);
                resolve(); 
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
};

function closeServer() {
    mongoose.disconnect().then(()=> {
        return new Promise((resolve, reject)=> {
            console.log('closing server');
            server.close(err => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
};

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };