const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

const shootSchema = mongoose.Schema({
    title: { type: String, required: true },
    owner: {type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false },
    gearList: {type: Array, required: false }
    }, 
    {timestamps: true}
);

shootSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        owner: this.owner,
        location: this.location,
        description: this.description,
        gearList: this.gearList,
        createdAt: this.createdAt
    };
};

const Shoot = mongoose.model('Shoot', shootSchema);

module.exports = { Shoot };