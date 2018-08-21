const express = require('express');
const morgan = require('morgan');
const chalk = require('chalk');

const PORT = process.env.PORT || 8080;

const app = express();
app.use(morgan('common'));

app.get('/api/*', (req, res, next) => {
    res.json({Message: "GET request to /"});
});

app.listen(PORT, () => {
    console.log(`fStopandGo API is listening on port: ${chalk.green(PORT)}`);
});

module.exports = { app };