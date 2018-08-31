const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	email: { type: String, required: false}
	}, 
	{timestamps: true}
);

userSchema.methods.serialize = function() {
	return {
		id: this._id,
		username: this.username,
		email: this.email,
		createdAt: this.createdAt
	};
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = { User };