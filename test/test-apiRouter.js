const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
const faker = require('faker');
const chalk = require('chalk');

const { TESTING_DATABASE_URL } = require('../config');
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

function generateShoot() {
	return {
		title: faker.hacker.phrase(),
		location: faker.address.city(),
		description: faker.lorem.paragraph(),
		gearList: generateGearList()
	}
}

function seedShootData() {
	console.info(chalk.dim('Seeding Shoot Data...'));
	let seedData = [];
	for(i = 0; i <= 10; i++){
		seedData.push(generateShoot);
	}
	return Shoot.insertMany(seedData);
};

//TODO: Add this to incorporate JWT testing
// function getToken(username){}

function tearDownDatabase(){
	console.warn(chalk.dim('Tearing down test db...'));
	mongoose.connection.dropDatabase();
}

// CRUD Testing for Users
describe(chalk.bold.green('CRUD Testing for Users'), function() {
	before(function(){
		return runServer(TESTING_DATABASE_URL);
	});

	beforeEach(function(){
		return seedUserData();
	});

	afterEach(function(){
		return User.deleteMany({})
		.then(tearDownDatabase());
	});

	after(function(){
		return closeServer();
	});

	describe(chalk.green('GET Request to /api/users'), function(){
		it('Should return all the users', function(){
			let res;
			return chai.request(app)
			.get('/api/users')
			.then(function(_res){
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.noContent).to.be.false;
				return User.countDocuments();
			})
			.then(function(count){
				expect(res.body).to.have.lengthOf(count);
			});
		});
	});

	describe(chalk.green('GET Request to /api/users/:id'), function() {
		it('Should return the specified user', function(){
			let randomUser;
			return User.findOne({})
			.then(function(_user){
				randomUser = _user;
				return chai.request(app)
				.get(`/api/users/${randomUser.id}`)
			}).then(function(res){
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body.id).to.equal(randomUser.id);
				expect(res.body.username).to.equal(randomUser.username);
				expect(res.body.email).to.equal(randomUser.email);
			});
		});
	});

	describe(chalk.green('POST Request to /api/users'), function() {
		it('Should create a new user', function(){
			let newUser = generateUser();
			return chai.request(app)
			.post('/api/users')
			.send(newUser)
			.then(function(res){
				newUser.id = res.body.id;
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.have.keys('id', 'username', 'email', 'createdAt');
				expect(res.body).to.not.have.any.keys('password');
				expect(res.body.id).not.to.be.null;
				expect(res.body.username).to.equal(newUser.username);
				expect(res.body.email).to.equal(newUser.email);
				expect(res.body.createdAt).not.to.be.null;
				return User.findById(newUser.id);
			})
			.then(function(user){
				expect(user.id).to.equal(newUser.id);
				expect(user.username).to.equal(newUser.username);
				expect(user.email).to.equal(newUser.email);
				expect(user.createdAt).not.to.be.null;
			});
		});
	});

	describe(chalk.green('PUT Request to /api/users/:id'), function(){
		it('Should update the specified fields for the specified user', function(){
			const updatePayload = {
				username: 'putRequest',
				email: 'put@request.com'
			}

			return User.findOne({}).then(function(user){
				updatePayload.id = user.id;
				return chai.request(app)
				.put(`/api/users/${updatePayload.id}`)
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
});