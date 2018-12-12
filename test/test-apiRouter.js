'use strict';

require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
const faker = require('faker');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');

const { TESTING_DATABASE_URL, JWT_SECRET } = require('../config');
const { app, runServer, closeServer } = require('../server');
const { User } = require('../models/User');
const { Shoot } = require('../models/Shoot');

const expect = chai.expect;
chai.use(chaiHttp);

//Create fake data to seed test DB
function generateUser() {
	return {
		username: faker.internet.userName(),
		password: faker.internet.password(),
		email: faker.internet.email()
	};
}

function seedUserData() {
	console.info(chalk.dim('Seeding User Data...'));
	let seedData = [];
	for(let i = 0; i <= 10; i++){
		seedData.push(generateUser());
	}

	return User.insertMany(seedData);
}

function generateGearList() {
	let fakeGear = [];
	for(let i = 0; i<4; i++){
		fakeGear.push(faker.random.word());
	}
	return fakeGear;
};

function generateShoot(username) {
	return {
		title: faker.hacker.phrase(),
		location: faker.address.city(),
		description: faker.lorem.paragraph(),
		owner: username,
		gearList: generateGearList()
	};
}

function seedShootData() {
	console.info(chalk.dim('Seeding Shoot Data...'));
	let seedData = [];
	for(let i = 0; i <= 10; i++){
		seedData.push(generateShoot(`user${i}`));
	}
	return Shoot.insertMany(seedData);
};

function getToken(username){
	const token = jwt.sign(
		{user:{username}}, 
		JWT_SECRET, 
		{algorithm: 'HS256', subject: username, expiresIn: '7d'}
	);
	return token;
}

function tearDownDatabase(){
	console.warn(chalk.dim('Tearing down test db...'));
	mongoose.connection.dropDatabase();
}

// CRUD Testing for Users
describe(chalk.bold.green('= = = CRUD Testing for Users = = ='), function() {
	const username = 'testUser8';
	const password = 'testUser8PW';
	const token = getToken(username);

	before(function(){
		return runServer(TESTING_DATABASE_URL);
	});

	beforeEach(function(){
		return seedUserData()
		.then(User.hashPassword(password))
		.then(password => User.create({
			username,
			password
		}))
	});

	afterEach(function(){
		return User.deleteMany({})
		.then(tearDownDatabase());
	});

	after(function(){
		return closeServer();
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('GET Specific User from /api/users/:id'), function() {
		it('Should return the specified user', function(){
			let specUser;
			return User.find({username: 'testUser8'})
			.then(function(_user){
				specUser = _user;
				console.log(chalk.cyan(JSON.stringify(specUser, null, 4)));
				return chai.request(app)
				.get(`/api/users/${specUser.id}`)
				.set('authorization', `Bearer ${token}`)
			}).then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body.id).to.equal(specUser.id);
				expect(res.body.username).to.equal(specUser.username);
				expect(res.body.email).to.equal(specUser.email);
			});
		});
	});

	describe(chalk.green('POST Request to /api/users'), function() {
		it('Should create a new user', function(){
			const newUser = generateUser();
			return chai.request(app)
			.post('/api/users')
			.send(newUser)
			.then(function(res){
				newUser.id = res.body.id;
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.have.keys('id', 'username', 'email', 'createdAt');
				expect(res.body).to.not.have.any.keys('password');
				expect(res.body.username).to.equal(newUser.username);
				expect(res.body.email).to.equal(newUser.email);
				expect(res.body.createdAt).not.to.be.null;
				return User.findById(newUser.id);
			}).then(function(user){
				expect(user.id).to.equal(newUser.id);
				expect(user.username).to.equal(newUser.username);
				expect(user.email).to.equal(newUser.email);
				expect(user.createdAt).not.to.be.null;
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('PUT Request to /api/users/:id'), function(){
		it('Should update the specified fields for the specified user', function(){
			const updatePayload = {
				username: 'putRequest',
				email: 'put@request.com'
			}
			return User.findOne({}).then(function(user){
				updatePayload.id = user.id;
				return chai.request(app)
				.put(`/api/users/${updatePayload.id}`)
				.set('authorization', `Bearer ${token}`)
				.send(updatePayload)
			}).then(function(res){
				expect(res).to.have.status(204);
				return User.findById(updatePayload.id);
			}).then(function(user){
				expect(user.username).to.equal(updatePayload.username);
				expect(user.email).to.equal(updatePayload.email);
				expect(user).to.be.an('object');
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('DELETE Request to /api/users/:id'), function(){
		it('Should delete the specified user', function(){
			let userToDelete;
			return User.findOne({}).then(function(user){
				userToDelete = user;
				return chai.request(app)
				.delete(`/api/users/${userToDelete.id}`)
				.set('authorization', `Bearer ${token}`);
			}).then(function(res){
				expect(res).to.have.status(200);
				return User.findById(userToDelete.id);
			}).then(function(user){
				expect(user).to.be.null;
			});
		});
	});
});

describe(chalk.bold.green('= = = CRUD Testing for Shoots = = ='), function(){
	const username = 'testUser8';
	const password = 'testUser8PW';
	const token = getToken(username);
	
	before(function(){
		return runServer(TESTING_DATABASE_URL);
	});

	beforeEach(function(){
		return seedShootData()
		.then(User.hashPassword(password))
		.then(password => User.create({
			username,
			password
		}));
	});

	afterEach(function(){
		return Shoot.deleteMany({})
		.then(tearDownDatabase());
	});

	after(function(){
		return closeServer();
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id	
	describe.skip(chalk.green('GET All Shoots from /api/shoots'), function(){
		it('Should return all the shoots', function(){
			let res;
			return chai.request(app)
			.get('/api/shoots')
			.set('authorization', `Bearer ${token}`)
			.then(function(_res){
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.noContent).to.be.false;
				return Shoot.countDocuments();
			}).then(function(count){
				expect(res.body).to.have.lengthOf(count);
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('GET specific shoot from /api/shoots/:id'), function(){
		it('Should return the specified shoot', function(){
			let randomShoot;

			return Shoot.findOne({}).then(function(shoot){
				randomShoot = shoot;
				return chai.request(app)
				.get(`/api/shoots/${randomShoot.id}`)
				.set('authorization', `Bearer ${token}`)
			}).then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body.title).to.equal(randomShoot.title);
				expect(res.body.description).to.equal(randomShoot.description);
				expect(res.body.location).to.equal(randomShoot.location);
				expect(res.body.gearList[0]).to.equal(randomShoot.gearList[0]);
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('GET All Shoots from Specific Owner from /api/shoots?owner=:userId'), function(){
		it('Should return all shoots from the specified owner', function(){
			let shootsByUser2;
			
			return Shoot.find({owner: 'user2'}).then(function(shoot){
				shootsByUser2 = shoot;
				return chai.request(app)
				.get('/api/shoots?owner=user2')
				.set('authorization', `Bearer ${token}`)
			}).then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(JSON.parse(res.text)).to.have.length(1);
				expect(res.body.id).to.equal(shootsByUser2.id);
				expect(res.body.title).to.equal(shootsByUser2.title);
				expect(res.body.location).to.equal(shootsByUser2.location);
				expect(res.body.description).to.equal(shootsByUser2.description);
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires owner made with req.user.id
	describe.skip(chalk.green('POST to /api/shoots'), function(){
		it('Should create a new shoot', function(){
			const newShoot = generateShoot('testUser8');

			return chai.request(app)
			.post('/api/shoots')
			.set('authorization', `Bearer ${token}`)
			.send(newShoot)
			.then(function(res){
				newShoot.id = res.body.id;
				newShoot.owner = res.body.owner;
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.have.keys('id','owner','title','location','description','gearList','createdAt');
				expect(res.body.title).to.equal(newShoot.title);
				expect(res.body.location).to.equal(newShoot.location);
				expect(res.body.description).to.equal(newShoot.description);
				return Shoot.findById(newShoot.id)
			}).then(function(shoot){
				expect(shoot.id).to.equal(newShoot.id);
				expect(shoot.owner).to.equal(newShoot.owner);
				expect(shoot.title).to.equal(newShoot.title);
				expect(shoot.location).to.equal(newShoot.location);
				expect(shoot.description).to.equal(newShoot.description);
				expect(shoot.createdAt).not.to.be.null;
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('PUT request to /api/shoots/:id'), function(){
		it('Should update specified fields for specified shoot', function(){
			const updatePayload = {
				title: 'Sunset Photos',
				location: 'Hurricane Ridge Visitors Center'
			};

			return Shoot.findOne({}).then(function(shoot){
				updatePayload.id = shoot.id;
				return chai.request(app)
				.put(`/api/shoots/${updatePayload.id}`)
				.set('authorization', `Bearer ${token}`)
				.send(updatePayload)
			}).then(function(res){
				expect(res).to.have.status(204);
				return Shoot.findById(updatePayload.id)
			}).then(function(shoot){
				expect(shoot.title).to.equal(updatePayload.title);
				expect(shoot.location).to.equal(updatePayload.location);
				expect(shoot).to.be.an('object');
				expect(shoot.description).not.to.be.null;
			});
		});
	});

	//TODO: How to create req object? (superagent?); Requires validation with req.user.id
	describe.skip(chalk.green('DELETE request to /api/shoots/:id'), function(){
		it('Should delete the specified shoot', function(){
			let shootToDelete;
			return Shoot.findOne({}).then(function(shoot){
				shootToDelete = shoot;
				return chai.request(app)
				.delete(`/api/shoots/${shootToDelete.id}`)
				.set('authorization', `Bearer ${token}`)
			}).then(function(res){
				expect(res).to.have.status(200);
				return Shoot.findById(shootToDelete.id)
			}).then(function(shoot){
				expect(shoot).to.be.null;
			});
		});
	});
});