exports.PORT = process.env.PORT || 8080;
exports.CLIENT_ORIGIN = 'https://fstopandgo.herokuapp.com';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/fstopandgo';
exports.TESTING_DATABASE_URL = process.env.TESTING_DATABASE_URL || 'mongodb://localhost/testingDB';
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';