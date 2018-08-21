const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');

const should = chai.should();
chai.use(chaiHttp);

//placeholder test
describe('API', function(){
	it('Should respond status 200 with JSON on GET requests', function(){
		return chai.request(app)
			.get('/api/test')
			.then(function(res){
				res.should.have.status(200);
				res.should.be.json;
			});
	});
});