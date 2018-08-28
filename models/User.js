const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
// const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	email: { type: String, required: false},
	created: { type: Date, default: Date.now }
});

userSchema.methods.serialize = function() {
	return {
		id: this._id,
		username: this.username,
		email: this.email,
		created: this.dateCreated
	};
};

// userSchema.methods.validatePassword = function(password) {
// 	return bcrypt.compare(password, this.password);
// };

// userSchema.methods.hashPassword = function(password) {
// 	return bcrypt.hash(password, 10);
// };

const User = mongoose.model('User', userSchema);

module.exports = { User };