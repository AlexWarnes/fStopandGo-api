const express = require('express');
const morgan = require('morgan');
const chalk = require('chalk');
const cors = require('cors');
const { PORT, CLIENT_ORIGIN } = require('./config');

const app = express();
app.use(morgan('common'));
app.use(cors({origin: CLIENT_ORIGIN}));

app.get('/api/*', (req, res, next) => {
    res.json({Message: "GET request to /"});
});

app.listen(PORT, () => {
    console.log(`fStopandGo API is listening on port: ${chalk.green(PORT)}`);
});

module.exports = { app };