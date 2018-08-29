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
	console.info(chalk.cyan('Seeding User Data...'));
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

function generateShoots() {
	return {
		title: faker.hacker.phrase(),
		location: faker.address.city(),
		description: faker.lorem.paragraph(),
		gearList: generateGearList()
	}
}

function seedShootData() {
	console.info(chalk.cyan('Seeding Shoot Data...'));
	let seedData = [];
	for(i = 0; i <= 10; i++){
		seedData.push(generateShoots);
	}
	return Shoot.insertMany(seedData);
};

//TODO: Add this to incorporate JWT testing
// function getToken(username){}

function tearDownDatabase(){
	console.warn(chalk.red('Tearing down test database.'));
	mongoose.connection.dropDatabase();
}

// CRUD Testing for Users
describe('CRUD Testing for Users', function() {
	before(function(){
		return runServer(TESTING_DATABASE_URL);
	});

	beforeEach(function(){
		return seedUserData();
	});

	afterEach(function(){
		return User.remove({})
		.then(tearDownDatabase());
	});

	after(function(){
		return closeServer();
	});

	describe('GET Request to /api/users', function(){
		it('Should return all the users', function(){
			let res;

			return chai.request(app)
			.get('/api/users')
			.then(function(_res){
				res = _res;
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.noContent).to.be.false;
				return User.count();
			})
			.then(function(count){
				expect(res.body).to.have.lengthOf(count);
			});
		});

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
});