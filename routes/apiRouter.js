const express = require('express');
const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const faker = require('faker');
const chalk = require('chalk');

const { User } = require('../models/User');
const { Shoot } = require('../models/Shoot');

const router = express.Router();

//Temporary routes to get fake user & shoot JSON
router.get('/fakeusers', (req, res, next) => {
    const fakeUsers = () => {
        let users = []
        
        for(let i = 0; i<4; i++) {
            users.push({
                username: faker.internet.userName(),
                password: faker.internet.password(),
                email: faker.internet.email()
            });
        }
        return users;
    }
    res.json(fakeUsers());
});
router.get('/fakeshoots', (req, res, next) => {
    const fakeGearList = () => {
        let fakeGear = [];
    
        for(let i = 0; i<4; i++){
            fakeGear.push(faker.random.word());
        }
        return fakeGear;
    };
    const fakePhotoshoots = () => {
        let fakeShoots = []
        
        for(let i = 0; i<4; i++) {
            fakeShoots.push({
                title: faker.hacker.phrase(),
                location: faker.address.city(),
                description: faker.lorem.paragraph(),
                gearList: fakeGearList()
            });
        }
        return fakeShoots;
    }
    res.json(fakePhotoshoots());
});

//All routes go through /api

router.get('/users', (req, res, next) => {
    User.find().then(data => {
        res.status(200)
        .json(data.map(user => user.serialize()));
    }).catch(err => {
        console.error(chalk.red(err));
        res.status(500).json({message: 'Internal server error'});
    }); 
});

router.get('/users/:id', (req, res, next) => {
    User.findById(req.params.id).then(user => {
        res.status(200)
        .json(user.serialize());
    }).catch(err => {
        console.error(err)
        res.status(500).json({message: 'Internal server error'});
    });
});

router.get('/shoots', (req, res, next) => {
    Shoot.find().then(data => {
        res.status(200)
        .json(data.map(shoot => shoot.serialize()));
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

router.get('/shoots/:id', (req, res, next) => {
    Shoot.findById(req.params.id).then(shoot => {
        res.status(200)
        .json(shoot.serialize());
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});


router.post('/users', jsonParser, (req, res, next) => {
    const requiredFields = ['username', 'password'];
	const missingField = requiredFields.find(field => !(field in req.body));
	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}

	const stringFields = ['username', 'password'];
	const nonStringField = stringFields.find(field => {
        field in req.body && typeof req.body[field] !== 'string'
    });
    if (nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

	const explicityTrimmedFields = ['username', 'password'];
	const nonTrimmedField = explicityTrimmedFields.find(field => {
        req.body[field].trim() !== req.body[field]
    });
    if (nonTrimmedField) {
        return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Cannot start or end with whitespace',
        location: nonTrimmedField
        });
    }

	const sizedFields = {
		username: { min: 1 },
        password: { min: 8, max: 72 } // bcrypt truncates after 72 characters
    };
	const tooSmallField = Object.keys(sizedFields).find(field => {
        //TODO: This length validation isn't working
		req.body[field].trim().length < sizedFields[field].min
	});
	const tooLargeField = Object.keys(sizedFields).find(field => {
		'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
    });

    console.log(chalk.red('TOO SMALL FIELD: ' + tooSmallField))

    if (tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField
                ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
                : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    User.hashPassword(req.body.password).then(hash => {
        User.create({
            username: req.body.username,
            password: hash,
            email: req.body.email
        }).then(user => {
            res.status(201)
            .json(user.serialize());
        }).catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    })
    
});

router.post('/shoots', jsonParser, (req, res, next) => {
    Shoot.create({
        title: req.body.title,
        owner: 'To-Do Passport: req.user.id',
        location: req.body.location,
        description: req.body.description,
        gearList: req.body.gearList
    }).then(shoot => {
        res.status(201)
        .json(shoot.serialize());
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

router.put('/users/:id', jsonParser, (req, res, next) => {
    if (req.params.id !== req.body.id) {
        const message = chalk.red(`Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`);
        console.error(message);
        return res.status(400)
        .json({error: message});
    }
    
    const updatePayload = {};
    const updateableFields = ['username', 'password', 'email'];

    updateableFields.forEach(field => {
        if (field in req.body) {
            updatePayload[field] = req.body[field];
        }
    });

    User.findByIdAndUpdate(req.body.id, {$set: updatePayload}, {new: true}, function(err, user){console.log(chalk.cyan(user))})
    .then(user => {
        //TODO: Figure out callback to return the updated user
        res.status(204).end();
    }).catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

router.put('/shoots/:id', jsonParser, (req, res, next) => {
    //TODO this exact same validation is repeated four times, so make it into a validation function
    if (req.params.id !== req.body.id) {
        const message = chalk.red(`Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`);
        console.error(message);
        return res.status(400)
        .json({error: message});
    }

    updatePayload = {};
    updateableFields = ['title', 'location', 'description', 'gearList'];
    updateableFields.forEach(field => {
        if(field in req.body){
            updatePayload[field] = req.body[field];
        }
    });

    Shoot.findByIdAndUpdate(req.body.id, {$set: updatePayload}, {new: true}, function(err, shoot){console.log(chalk.cyan(shoot))}).then(shoot => {
        //TODO: Figure out callback to return the updated user
        res.status(204).end();
    }).catch(err => {
        console.error(err)
        .json({message: 'Internal server error'});
    });
});

router.delete('/users/:id', (req, res, next) => {
    // TODO: Once passport is used, access req.user.id for validation
    // if (req.params.id !== req.user.id) {
    //     const message = chalk.red(`You cannot delete other users.`);
    //     console.error(message);
    //     return res.status(403)
    //     .json({error: message});
    // };

    User.findByIdAndDelete(req.params.id)
        .then(res.status(200).end())
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/shoots/:id', (req, res, next) => {
    // TODO: Once passport is used, access req.user.id to ensure user is owner of the shoot for validation
    // Shoot.findById(req.params.id).select('owner').then(shoot => {
    //     if (shoot.owner !== req.user.id) {
    //     const message = chalk.red(`You cannot delete someone else's shoot.`);
    //     console.error(message);
    //     return res.status(403)
    //     .json({error: message});   

    Shoot.findByIdAndDelete(req.params.id)
        .then(res.status(200).end())
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
});

router.use('*', (req, res, next) => {
	res.status(404).json({message: 'Not Found'});
});

module.exports = { router }